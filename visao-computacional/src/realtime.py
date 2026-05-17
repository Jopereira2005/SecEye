"""Supabase Realtime WebSocket + polling fallback para mudanças nas câmeras."""
import asyncio
import json
import threading
import time
import traceback

from supabase import acreate_client

from . import config, state


def polling_fallback_thread():
    """Atualiza configurações das câmeras a cada 10-30s caso o WebSocket falhe."""
    print(">> [POLLING] Thread de fallback iniciada (atualiza a cada 10-30s)")

    while not state.parada_solicitada:
        try:
            time.sleep(10)

            if state.parada_solicitada:
                break

            if state.realtime_connected:
                time.sleep(20)
                continue

            from .supabase_ops import (
                _normalizar_camera, _fetch_routines_by_user,
                _fetch_zones_by_camera, _fetch_alarms_by_camera,
            )

            res = state.supabase.table("cameras").select("*").eq("is_active", True).execute()
            cameras_raw = res.data
            if not cameras_raw:
                continue

            cam_ids = [c['id'] for c in cameras_raw]
            zones_by_cam  = _fetch_zones_by_camera(cam_ids)
            alarms_by_cam = _fetch_alarms_by_camera(cam_ids)
            routines_by_user = _fetch_routines_by_user()

            cameras_db = {}
            for cam in cameras_raw:
                if not cam.get('rtsp_url'):
                    continue
                cid = cam['id']
                zone = zones_by_cam.get(cid)
                cam['detection_zones'] = [zone] if zone else []
                cam['alarms'] = alarms_by_cam.get(cid, [])
                cam = _normalizar_camera(cam, routines_by_user)
                cameras_db[cid] = cam

            for cam_id in list(state.camera_configs.keys()):
                if cam_id not in cameras_db:
                    continue

                config_antiga = state.camera_configs[cam_id]
                config_nova = cameras_db[cam_id]

                sched_antigo = json.dumps(config_antiga.get('schedule', []), sort_keys=True)
                sched_novo = json.dumps(config_nova.get('schedule', []), sort_keys=True)

                if sched_antigo != sched_novo:
                    print(f"\n>> [POLLING] Schedule ATUALIZADO: {config_nova.get('nome', cam_id)}")
                    print(">> [POLLING]   A thread aplicará automaticamente o novo horário")
                    state.camera_configs[cam_id] = config_nova

                campos_importantes = ['trigger_url', 'nome', 'rtsp_url', 'roi_points']
                mudou = any(
                    json.dumps(config_antiga.get(c), sort_keys=True) != json.dumps(config_nova.get(c), sort_keys=True)
                    for c in campos_importantes
                )

                if mudou and sched_antigo == sched_novo:
                    print(f">> [POLLING] Config atualizada: {config_nova.get('nome', cam_id)}")
                    state.camera_configs[cam_id] = config_nova

        except Exception as e:
            if not state.parada_solicitada:
                print(f">> [POLLING] Erro no fallback: {e}")
            time.sleep(10)

    print(">> [POLLING] Thread de fallback encerrada")


def on_camera_change(payload):
    """
    Callback para mudanças na tabela cameras.

    payload = {
        'eventType': 'INSERT' | 'UPDATE' | 'DELETE',
        'new': {...},
        'old': {...}
    }
    """
    from .camera_processor import processar_camera_thread
    from .supabase_ops import carregar_camera_completa

    event_type = payload.get('eventType', '').upper()
    new_data = payload.get('new', {})
    old_data = payload.get('old', {})

    try:
        if event_type == 'INSERT':
            cam_id = new_data.get('id')
            is_active = new_data.get('is_active', False)

            if not is_active:
                return

            cam_full = carregar_camera_completa(cam_id)
            if cam_full is None or not cam_full.get('rtsp_url'):
                print(f">>   [SKIP] Camera {cam_id} sem stream_url configurado")
                return

            print(f"\n>> [REALTIME] Nova camera detectada: {cam_full['nome']}")
            state.camera_configs[cam_id] = cam_full
            thread = threading.Thread(
                target=processar_camera_thread,
                args=(cam_id, cam_full),
                daemon=True,
                name=f"Camera-{cam_full['nome']}"
            )
            thread.start()
            state.camera_threads[cam_id] = thread
            print(f">> [REALTIME] Thread iniciada: {cam_full['nome']}")

        elif event_type == 'UPDATE':
            cam_id = new_data.get('id')
            is_active_novo = new_data.get('is_active', False)

            # Caso 1: Câmera desativada
            if cam_id in state.camera_configs and not is_active_novo:
                print(f"\n>> [REALTIME] Camera desativada: {state.camera_configs[cam_id].get('nome', cam_id)}")

                if cam_id in state.camera_active:
                    state.camera_active[cam_id] = False

                if cam_id in state.camera_threads:
                    thread = state.camera_threads[cam_id]
                    if thread.is_alive():
                        thread.join(timeout=3)
                    del state.camera_threads[cam_id]

                del state.camera_configs[cam_id]
                print(">> [REALTIME] Camera removida completamente")

            # Caso 2: Câmera ativada
            elif cam_id not in state.camera_configs and is_active_novo:
                cam_full = carregar_camera_completa(cam_id)
                if cam_full is None or not cam_full.get('rtsp_url'):
                    print(f">>   [SKIP] Camera {cam_id} sem stream_url configurado")
                    return

                print(f"\n>> [REALTIME] Camera ativada: {cam_full['nome']}")
                state.camera_configs[cam_id] = cam_full
                thread = threading.Thread(
                    target=processar_camera_thread,
                    args=(cam_id, cam_full),
                    daemon=True,
                    name=f"Camera-{cam_full['nome']}"
                )
                thread.start()
                state.camera_threads[cam_id] = thread
                print(f">> [REALTIME] Thread iniciada: {cam_full['nome']}")

            # Caso 3: Câmera permanece ativa — verificar mudanças
            elif cam_id in state.camera_configs and is_active_novo:
                cam_full = carregar_camera_completa(cam_id)
                if cam_full is None:
                    return

                config_antiga = state.camera_configs[cam_id]
                precisa_restart = False

                if config_antiga.get('rtsp_url') != cam_full.get('rtsp_url'):
                    print(">> [REALTIME] stream_url mudou — restart necessário")
                    precisa_restart = True

                roi_antigo = json.dumps(config_antiga.get('roi_points'), sort_keys=True) if config_antiga.get('roi_points') else ""
                roi_novo = json.dumps(cam_full.get('roi_points'), sort_keys=True) if cam_full.get('roi_points') else ""
                if roi_antigo != roi_novo:
                    print(">> [REALTIME] roi_points mudou — restart necessário")
                    precisa_restart = True

                mudancas_runtime = []
                sched_antigo = json.dumps(config_antiga.get('schedule', []), sort_keys=True)
                sched_novo = json.dumps(cam_full.get('schedule', []), sort_keys=True)
                if sched_antigo != sched_novo:
                    mudancas_runtime.append('schedule')

                for campo in ['trigger_url', 'nome']:
                    if config_antiga.get(campo) != cam_full.get(campo):
                        mudancas_runtime.append(campo)

                if precisa_restart:
                    print(f"\n>> [REALTIME] Reiniciando {cam_full['nome']} (ROI/URL alterado)")
                    state.camera_active[cam_id] = False
                    time.sleep(1)
                    state.camera_configs[cam_id] = cam_full
                    thread = threading.Thread(
                        target=processar_camera_thread,
                        args=(cam_id, cam_full),
                        daemon=True,
                        name=f"Camera-{cam_full['nome']}-Updated"
                    )
                    thread.start()
                    state.camera_threads[cam_id] = thread
                    print(">> [REALTIME] Thread reiniciada com sucesso")

                elif mudancas_runtime:
                    state.camera_configs[cam_id] = cam_full
                    print(f"\n>> [REALTIME] Config atualizada (runtime): {cam_full['nome']}")
                    print(f">> [REALTIME]   Campos alterados: {', '.join(mudancas_runtime)}")
                    if 'schedule' in mudancas_runtime:
                        print(">> [REALTIME] Schedule atualizado! Thread aplicará em até 1 segundo.")

                else:
                    state.camera_configs[cam_id] = cam_full

        elif event_type == 'DELETE':
            cam_id = old_data.get('id')

            if cam_id in state.camera_configs:
                print(f"\n>> [REALTIME] Camera deletada: {state.camera_configs[cam_id].get('nome', cam_id)}")

                if cam_id in state.camera_active:
                    state.camera_active[cam_id] = False

                if cam_id in state.camera_threads:
                    thread = state.camera_threads[cam_id]
                    if thread.is_alive():
                        thread.join(timeout=3)
                    del state.camera_threads[cam_id]

                del state.camera_configs[cam_id]
                print(">> [REALTIME] Camera removida completamente")

    except Exception as e:
        print(f"\n>> [REALTIME] Erro ao processar evento: {e}")
        traceback.print_exc()


def on_occurrence_change(payload):
    """Callback para novas ocorrências inseridas na tabela occurrences."""
    try:
        data = payload.get('data', {})
        event_type = data.get('type', 'UNKNOWN')
        record = data.get('record', {})

        if event_type == 'INSERT':
            print(">> [REALTIME-OCORRENCIA] Nova ocorrência detectada:")
            print(f">>   Camera ID: {record.get('camera_id', 'N/A')}")
            print(f">>   Zona: {record.get('detection_zone_id', 'N/A')}")
            print(f">>   Timestamp: {record.get('created_at', 'N/A')}")

    except Exception as e:
        error_msg = str(e).lower()
        if "connection closed" not in error_msg and "timeout" not in error_msg:
            print(f">> [REALTIME-OCORRENCIA] Erro: {e}")


async def realtime_websocket_loop():
    """Loop assíncrono mantendo o Realtime conectado (com reconexão)."""
    reconnect_delay = 5
    max_reconnect_delay = 60

    def handle_postgres_change(payload):
        try:
            data = payload.get('data', {})
            event_type = data.get('type')
            record = data.get('record', {})
            old_record = data.get('old_record', {})
            commit_timestamp = data.get('commit_timestamp', '')

            evt_name = str(event_type).replace('RealtimePostgresChangesListenEvent.', '') if event_type else "UNKNOWN"
            realtime_payload = {
                "eventType": evt_name if event_type else "UNKNOWN",
                "new": record,
                "old": old_record,
                "commit_timestamp": commit_timestamp
            }

            on_camera_change(realtime_payload)

        except Exception as e:
            error_msg = str(e).lower()
            if "connection closed" not in error_msg and "timeout" not in error_msg:
                print(f">> [REALTIME] Erro ao processar evento: {e}")

    while True:
        supabase_client = None
        channel = None

        try:
            print("\n>> [REALTIME] Conectando com Supabase (biblioteca oficial)...")

            supabase_client = await acreate_client(config.SUPABASE_URL, config.SUPABASE_KEY)

            channel = supabase_client.channel('seceye-cameras')

            channel.on_postgres_changes(
                event='*',
                schema='public',
                table='cameras',
                callback=handle_postgres_change
            )

            channel.on_postgres_changes(
                event='*',
                schema='public',
                table='occurrences',
                callback=lambda payload: on_occurrence_change(payload)
            )

            try:
                await channel.subscribe()
            except Exception as sub_error:
                if "Set of Tasks" not in str(sub_error):
                    raise

            state.realtime_connected = True
            reconnect_delay = 5

            print(">> [REALTIME] Conectado via postgres_changes!")
            print(">> [REALTIME] Eventos monitorados: INSERT, UPDATE, DELETE")
            print(">> [REALTIME] Tabelas: public.cameras, public.occurrences")

            while state.realtime_connected:
                try:
                    await asyncio.sleep(30)
                except asyncio.CancelledError:
                    break

        except KeyboardInterrupt:
            print("\n>> [REALTIME] Encerrando por interrupcao")
            state.realtime_connected = False
            break

        except ValueError as e:
            if "Set of Tasks/Futures is empty" in str(e):
                pass
            else:
                print(f">> [REALTIME] ValueError: {e}")
            state.realtime_connected = False

        except Exception as e:
            print(f"\n>> [REALTIME] Erro: {e}")
            state.realtime_connected = False

        finally:
            if channel and supabase_client:
                try:
                    await supabase_client.remove_channel(channel)
                except Exception:
                    pass

        if not state.realtime_connected:
            print(f">> [REALTIME] Reconectando em {reconnect_delay}s...")
            await asyncio.sleep(reconnect_delay)
            reconnect_delay = min(reconnect_delay * 2, max_reconnect_delay)


def setup_realtime_listener():
    """Inicia thread que roda o loop asyncio do WebSocket Realtime."""

    def run_async_loop():
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)

        def exception_handler(loop, context):
            exception = context.get('exception')
            if exception:
                exc_msg = str(exception).lower()
                if any(x in exc_msg for x in ['set of tasks', 'connection closed', 'service restart']):
                    return

        loop.set_exception_handler(exception_handler)

        try:
            loop.run_until_complete(realtime_websocket_loop())
        except KeyboardInterrupt:
            print("\n>> [REALTIME] Loop interrompido")
        except Exception:
            pass
        finally:
            loop.close()

    try:
        print("\n>> [REALTIME] Iniciando listener WebSocket...")

        realtime_thread = threading.Thread(
            target=run_async_loop,
            daemon=True,
            name="RealtimeWebSocket"
        )
        realtime_thread.start()

        time.sleep(2)

        if state.realtime_connected:
            print(">> [REALTIME] Thread WebSocket iniciada com sucesso")
        else:
            print(">> [REALTIME] Aguardando conexao...")

        return realtime_thread

    except Exception as e:
        print(f">> [REALTIME] Erro ao iniciar listener: {e}")
        traceback.print_exc()
        return None


def cleanup_realtime():
    """Marca Realtime para encerrar."""
    try:
        print("\n>> [REALTIME] Encerrando listener WebSocket...")
        state.realtime_connected = False
        print(">> [REALTIME] Listener marcado para encerramento")
    except Exception as e:
        print(f">> [REALTIME] Erro ao limpar: {e}")
