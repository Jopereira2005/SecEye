"""Triggers IFTTT (detecção de pessoa) e webhooks de alerta offline."""
import threading
from datetime import datetime, timezone

import requests

from . import config, state


def enviar_trigger_ifttt(camera):
    """Envia POST IFTTT (fire-and-forget)."""

    def _enviar_async():
        try:
            trigger_url = camera.get("trigger_url")

            if not trigger_url:
                print(f"   [INFO] Camera {camera['nome']} nao tem alarm webhook configurado", flush=True)
                return

            camera_id = camera.get("id", "N/A")
            camera_name = camera['nome']

            print("\n>> [ACIONANDO ALARM WEBHOOK]", flush=True)
            print(f"   Camera: {camera_name} (ID: {camera_id})", flush=True)

            import time
            start_time = time.time()

            safe_url = requests.utils.requote_uri(trigger_url)
            payload = {
                'camera': camera_name,
                'camera_id': str(camera_id),
                'timestamp': datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S')
            }

            with state.http_session_lock:
                resp = state.http_session.post(
                    safe_url,
                    json=payload,
                    timeout=3.0,
                    allow_redirects=False
                )

            elapsed = time.time() - start_time
            print(f"   [OK] Trigger enviado em {elapsed:.2f}s (status: {resp.status_code})", flush=True)

        except requests.Timeout:
            print("   [WARN] Trigger timeout (mas provavelmente foi enviado)", flush=True)
        except requests.RequestException as e:
            print(f"   [FAIL] Falha ao acionar trigger: {e}", flush=True)
        except Exception as e:
            print(f"   [FAIL] ERRO geral no trigger: {e}", flush=True)

    threading.Thread(target=_enviar_async, daemon=True).start()


def enviar_webhook_erro(camera_id, camera_data, status="offline"):
    """Envia POST para error_webhook_url quando câmera muda de status."""
    error_webhook_url = camera_data.get("error_webhook_url")

    if not error_webhook_url:
        return

    if state.camera_paused_by_schedule.get(camera_id, False) and status == "offline":
        return

    try:
        payload = {
            "camera_id": camera_data.get("camera_id", ""),
            "uuid": camera_id,
            "client_name": camera_data.get("client_name", ""),
            "channel": camera_data.get("channel", ""),
            "camera_name": camera_data.get("nome", ""),
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "status": status
        }

        response = state.http_session.post(error_webhook_url, json=payload, timeout=10)

        if response.status_code == 200:
            if status == "offline":
                print(f">> [WEBHOOK] [OK] Notificacao offline enviada: {camera_data.get('nome', camera_id)}")
            else:
                print(f">> [WEBHOOK] [OK] Notificacao de recuperacao enviada: {camera_data.get('nome', camera_id)}")
        else:
            print(f">> [WEBHOOK] [WARN] Webhook retornou status {response.status_code}: {camera_data.get('nome', camera_id)}")

    except Exception as e:
        print(f">> [WEBHOOK] [FAIL] Erro ao enviar webhook para {camera_data.get('nome', camera_id)}: {e}")


def iniciar_webhook_timer(camera_id, camera_data):
    """Agenda webhook de offline após 5 min, depois a cada 30 min."""
    error_webhook_url = camera_data.get("error_webhook_url")
    if not error_webhook_url:
        return

    if state.camera_paused_by_schedule.get(camera_id, False):
        return

    with state.webhook_timers_lock:
        if camera_id in state.webhook_timers:
            return

        def primeiro_envio():
            camera_atual = state.camera_configs.get(camera_id)

            if state.camera_paused_by_schedule.get(camera_id, False):
                with state.webhook_timers_lock:
                    if camera_id in state.webhook_timers:
                        del state.webhook_timers[camera_id]
                return

            if camera_atual and camera_atual.get("status") == "offline":
                enviar_webhook_erro(camera_id, camera_atual)

                def repetir_webhook():
                    with state.webhook_timers_lock:
                        if camera_id not in state.webhook_timers:
                            return

                        camera_check = state.camera_configs.get(camera_id)

                        if state.camera_paused_by_schedule.get(camera_id, False):
                            state.webhook_timers[camera_id].cancel()
                            del state.webhook_timers[camera_id]
                            print(f">> [WEBHOOK] [CANCEL] Camera pausada por schedule: {camera_check.get('nome', camera_id) if camera_check else camera_id}")
                            return

                        if camera_check and camera_check.get("status") == "offline":
                            enviar_webhook_erro(camera_id, camera_check)
                            timer = threading.Timer(config.ERROR_WEBHOOK_INTERVAL, repetir_webhook)
                            timer.daemon = True
                            timer.start()
                            state.webhook_timers[camera_id] = timer
                        else:
                            status_atual = camera_check.get("status") if camera_check else "desconhecido"
                            state.webhook_timers[camera_id].cancel()
                            del state.webhook_timers[camera_id]
                            print(f">> [WEBHOOK] [CANCEL] Timer cancelado automaticamente (status={status_atual}): {camera_check.get('nome', camera_id) if camera_check else camera_id}")

                with state.webhook_timers_lock:
                    timer = threading.Timer(config.ERROR_WEBHOOK_INTERVAL, repetir_webhook)
                    timer.daemon = True
                    timer.start()
                    state.webhook_timers[camera_id] = timer
            else:
                with state.webhook_timers_lock:
                    if camera_id in state.webhook_timers:
                        state.webhook_timers[camera_id].cancel()
                        del state.webhook_timers[camera_id]
                        print(f">> [WEBHOOK] [OK] Camera reconectou antes de 5min: {camera_data.get('nome', camera_id)}")

        timer = threading.Timer(config.ERROR_WEBHOOK_DELAY, primeiro_envio)
        timer.daemon = True
        timer.start()
        state.webhook_timers[camera_id] = timer
        print(f">> [WEBHOOK]   Timer agendado (5min): {camera_data.get('nome', camera_id)}")


def cancelar_webhook_timer(camera_id, camera_data):
    """Cancela timer de webhook quando câmera volta online."""
    with state.webhook_timers_lock:
        if camera_id in state.webhook_timers:
            state.webhook_timers[camera_id].cancel()
            del state.webhook_timers[camera_id]
            print(f">> [WEBHOOK] [OK] Timer cancelado (camera online): {camera_data.get('nome', camera_id)}")
