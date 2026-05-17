"""Threads de monitoramento: watchdog, status sync, supervisor, guardian, auto-recovery."""
import sys
import threading
import time
import traceback
from datetime import datetime

from . import config, state
from .supabase_ops import atualizar_status_async, carregar_cameras


def watchdog_thread():
    """Monitora câmeras e reinicia as travadas."""
    from .camera_processor import processar_camera_thread

    print(">> [WATCHDOG] Sistema de monitoramento iniciado")

    while not state.parada_solicitada:
        try:
            time.sleep(config.HEALTH_CHECK_INTERVAL)

            now = time.time()
            cameras_travadas = []
            cameras_processando = 0

            for cam_id in list(state.camera_active.keys()):
                if not state.camera_active.get(cam_id, False):
                    continue

                if state.camera_paused_by_schedule.get(cam_id, False):
                    continue

                ultimo_frame = state.camera_last_frame.get(cam_id, 0)
                tempo_sem_frame = now - ultimo_frame

                if tempo_sem_frame > config.WATCHDOG_TIMEOUT:
                    camera = state.camera_configs.get(cam_id)
                    if camera:
                        cameras_travadas.append((cam_id, camera['nome'], tempo_sem_frame))
                else:
                    cameras_processando += 1

            cameras_pausadas = sum(1 for paused in state.camera_paused_by_schedule.values() if paused)
            total_cameras = len([c for c in state.camera_active.values() if c])

            if cameras_travadas or cameras_processando > 0 or cameras_pausadas > 0:
                status_parts = [f"{total_cameras} TOTAL"]
                if cameras_processando > 0:
                    status_parts.append(f"{cameras_processando} PROCESSANDO")
                if cameras_pausadas > 0:
                    status_parts.append(f"{cameras_pausadas} PAUSADAS")
                if len(cameras_travadas) > 0:
                    status_parts.append(f"{len(cameras_travadas)} TRAVADAS")
                print(f"\n>> [WATCHDOG] Status: {' | '.join(status_parts)}")

            for cam_id, nome, tempo in cameras_travadas:
                restarts = state.camera_restart_count.get(cam_id, 0)

                print(f"\n{'='*70}")
                print(f">> [WATCHDOG] [ALERT] CAMERA TRAVADA DETECTADA: {nome}")
                print(f">> Tempo sem frames: {tempo:.0f}s (limite: {config.WATCHDOG_TIMEOUT}s)")
                print(f">> Tentativa de restart: {restarts+1} (SEM LIMITE - sempre recuperando)")
                print(f">> Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

                if restarts >= 5:
                    print(f">> [WARN] PERSISTENTE: {restarts} tentativas de restart - camera pode estar com problemas de conectividade")

                print(f"{'='*70}\n")

                state.camera_active[cam_id] = False
                time.sleep(1)

                camera = state.camera_configs.get(cam_id)
                if camera:
                    state.camera_restart_count[cam_id] = restarts + 1
                    thread = threading.Thread(
                        target=processar_camera_thread,
                        args=(cam_id, camera),
                        daemon=True,
                        name=f"Camera-{nome}-Restart{restarts+1}"
                    )
                    thread.start()
                    state.camera_threads[cam_id] = thread

                    print(">> [WATCHDOG]   ✓ Thread iniciada com sucesso")
                    print(">> [WATCHDOG]   Aguardando estabilização...")

        except Exception as e:
            print(f">> [WATCHDOG]   Erro: {e}")
            traceback.print_exc()

    print(">> [WATCHDOG] Encerrado")


def status_sync_thread():
    """Sincronização periódica conservadora: só atualiza se passou 90s+ sem update."""
    print(">> [STATUS-SYNC] Sistema de sincronizacao de status iniciado (intervalo: 120s)")

    while not state.parada_solicitada:
        try:
            time.sleep(120)

            now = time.time()
            cameras_para_atualizar = []

            for cam_id in list(state.camera_active.keys()):
                if not state.camera_active.get(cam_id, False):
                    continue

                ultimo_frame = state.camera_last_frame.get(cam_id, 0)
                tempo_sem_frame = now - ultimo_frame

                if tempo_sem_frame <= config.WATCHDOG_TIMEOUT:
                    ultima_atualizacao = state.camera_last_status_update.get(cam_id, 0)
                    tempo_sem_update = now - ultima_atualizacao

                    if tempo_sem_update >= 90:
                        camera = state.camera_configs.get(cam_id)
                        if camera:
                            cameras_para_atualizar.append((cam_id, camera.get('nome', 'Sem nome')))

            if cameras_para_atualizar:
                if len(cameras_para_atualizar) <= 3:
                    for cam_id, _ in cameras_para_atualizar:
                        if not state.camera_paused_by_schedule.get(cam_id, False):
                            atualizar_status_async(cam_id, status="online")
                else:
                    print(f"\n>> [STATUS-SYNC] Sincronizando status de {len(cameras_para_atualizar)} camera(s) (sem update por 90s+)...")
                    for cam_id, nome in cameras_para_atualizar:
                        if not state.camera_paused_by_schedule.get(cam_id, False):
                            atualizar_status_async(cam_id, status="online")
                            print(f">>   ✓ {nome}")
                    print(">> [STATUS-SYNC] Sincronização concluída\n")

        except Exception as e:
            print(f">> [STATUS-SYNC]   Erro: {e}")
            traceback.print_exc()

    print(">> [STATUS-SYNC] Encerrado")


def auto_recovery_thread():
    """A cada 5 min, tenta reconectar câmeras com status='offline' no banco."""
    from .camera_processor import processar_camera_thread

    print(">> [AUTO-RECOVERY] Sistema de recuperacao automatica de cameras iniciado (intervalo: 5min)")

    while not state.parada_solicitada:
        try:
            time.sleep(300)

            print("\n>> [AUTO-RECOVERY] Verificando cameras offline no Supabase...")

            try:
                response = state.supabase.table('cameras').select('id, name, status, updated_at') \
                    .eq('is_active', True) \
                    .eq('status', 'offline') \
                    .execute()
                cameras_offline = response.data if response.data else []

                if not cameras_offline:
                    print(">> [AUTO-RECOVERY] Nenhuma camera offline encontrada")
                    continue

                print(f">> [AUTO-RECOVERY] Encontradas {len(cameras_offline)} camera(s) offline")

                for camera_offline in cameras_offline:
                    cam_id = camera_offline.get('id')
                    cam_name = camera_offline.get('name', 'Sem nome')
                    tempo_offline = camera_offline.get('updated_at')

                    thread_ativa = cam_id in state.camera_threads and state.camera_threads[cam_id].is_alive()

                    if thread_ativa:
                        print(f">> [AUTO-RECOVERY]   {cam_name}: Thread já ativa (status inconsistente)")
                        continue

                    print(f"\n{'='*70}")
                    print(f">> [AUTO-RECOVERY] Tentando reconectar: {cam_name} (ID: {cam_id})")
                    print(f">> Status: offline por {tempo_offline if tempo_offline else 'tempo desconhecido'}")
                    print(f">> Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

                    try:
                        camera_config = carregar_cameras()
                        camera_encontrada = None

                        for cfg in camera_config:
                            if cfg.get('id') == cam_id:
                                camera_encontrada = cfg
                                break

                        if not camera_encontrada:
                            print(">> [AUTO-RECOVERY]   ❌ Configuração da camera não encontrada no banco")
                            continue

                        state.camera_configs[cam_id] = camera_encontrada

                        print(">> [AUTO-RECOVERY]   ✓ Iniciando nova thread de processamento...")
                        thread = threading.Thread(
                            target=processar_camera_thread,
                            args=(cam_id, camera_encontrada),
                            daemon=True,
                            name=f"Camera-{cam_name}-Recovery"
                        )
                        thread.start()
                        state.camera_threads[cam_id] = thread
                        state.camera_active[cam_id] = True

                        print(">> [AUTO-RECOVERY]   ✓ Thread iniciada com sucesso")
                        print(">> [AUTO-RECOVERY]   Aguardando estabilização...")

                    except Exception as e:
                        print(f">> [AUTO-RECOVERY]   ❌ Erro ao reconectar: {e}")
                        traceback.print_exc()

                    print(f"{'='*70}\n")

            except Exception as e:
                print(f">> [AUTO-RECOVERY]   Erro ao consultar Supabase: {e}")
                traceback.print_exc()

        except Exception as e:
            print(f">> [AUTO-RECOVERY]   Erro geral: {e}")
            traceback.print_exc()

    print(">> [AUTO-RECOVERY] Encerrado")


def supervisor_thread():
    """Detecta travamento do loop principal (sem heartbeat > 120s)."""
    print(">> [SUPERVISOR] Thread supervisor iniciado (monitora loop principal)")

    while not state.parada_solicitada:
        try:
            time.sleep(30)

            if state.parada_solicitada:
                break

            try:
                tempo_sem_heartbeat = time.time() - state.main_loop_heartbeat
            except (NameError, TypeError):
                print(">> [SUPERVISOR] [WAIT] Aguardando inicializacao do loop principal...")
                continue

            if tempo_sem_heartbeat > 120:
                print("\n" + "="*60)
                print(">> [FAIL] [SUPERVISOR] ALERTA CRITICO!")
                print(f">> Loop principal TRAVADO ha {tempo_sem_heartbeat:.0f}s")
                print(">> Ultimo heartbeat:", datetime.fromtimestamp(state.main_loop_heartbeat).strftime('%Y-%m-%d %H:%M:%S'))
                print(">> Sistema continua tentando executar...")
                print("="*60 + "\n")

                print(">> [SUPERVISOR] [ALERT] ACAO DE EMERGENCIA: Resetando estado interno")

                try:
                    with open("supervisor_emergency.log", "a", encoding="utf-8") as f:
                        f.write(f"\n{'='*60}\n")
                        f.write(f"[EMERGENCIA SUPERVISOR] {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
                        f.write(f"Tempo sem heartbeat: {tempo_sem_heartbeat:.0f}s\n")
                        f.write(f"Threads ativas: {sum(1 for t in state.camera_threads.values() if t.is_alive())}\n")
                        f.write(f"Camera threads: {len(state.camera_threads)}\n")
                        f.write(f"\n{'='*60}\n")
                except Exception:
                    pass

                print(">> [SUPERVISOR] Stack traces de todas as threads:")
                for thread_id, frame in sys._current_frames().items():
                    print(f"\n--- Thread {thread_id} ---")
                    traceback.print_stack(frame)

                print(">> [SUPERVISOR] [WARN] Resetando heartbeat (dando mais 2 minutos)")
                state.main_loop_heartbeat = time.time()

            elif tempo_sem_heartbeat > 60:
                print(f">> [SUPERVISOR]   Heartbeat atrasado ({tempo_sem_heartbeat:.0f}s), mas ainda OK")

        except Exception as e:
            print(f">> [SUPERVISOR]   Erro no supervisor: {e}")
            traceback.print_exc()

    print(">> [SUPERVISOR] Encerrado")


def guardian_thread():
    """Dead man's switch: detecta se nenhum frame está sendo processado."""
    print(">> [GUARDIAN] Thread guardian iniciado (protecao final)")

    ultimo_check_frames = {}
    alertas_consecutivos = 0

    while not state.parada_solicitada:
        try:
            time.sleep(60)

            if state.parada_solicitada:
                break

            try:
                frames_atuais = sum(state.camera_frame_count.values())
            except (NameError, TypeError, RuntimeError):
                print(">> [GUARDIAN]   Aguardando inicializacao do sistema...")
                continue

            if not ultimo_check_frames:
                ultimo_check_frames['total'] = frames_atuais
                ultimo_check_frames['timestamp'] = time.time()
                continue

            frames_anterior = ultimo_check_frames.get('total', 0)
            tempo_desde_ultimo = time.time() - ultimo_check_frames.get('timestamp', time.time())

            if frames_atuais == frames_anterior and tempo_desde_ultimo > 120:
                alertas_consecutivos += 1

                print("\n" + "="*60)
                print(">>   [GUARDIAN] ALERTA DE TRAVAMENTO TOTAL!")
                print(f">> Nenhum frame processado em {tempo_desde_ultimo:.0f}s")
                print(f">> Frames totais: {frames_atuais} (sem mudanca)")
                print(f">> Alertas consecutivos: {alertas_consecutivos}")
                print(f">> Threads de camera: {len(state.camera_threads)}")
                print(f">> Threads ativas: {sum(1 for t in state.camera_threads.values() if t.is_alive())}")
                print("="*60)

                try:
                    with open("guardian_alerts.log", "a", encoding="utf-8") as f:
                        f.write(f"\n{'='*60}\n")
                        f.write(f"[GUARDIAN ALERT] {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
                        f.write(f"Tempo travado: {tempo_desde_ultimo:.0f}s\n")
                        f.write(f"Frames: {frames_atuais}\n")
                        f.write(f"Alertas consecutivos: {alertas_consecutivos}\n")
                        f.write(f"Threads: {sum(1 for t in state.camera_threads.values() if t.is_alive())}/{len(state.camera_threads)}\n")
                        f.write(f"\n{'='*60}\n")
                except Exception:
                    pass

                if alertas_consecutivos >= 3:
                    print(">> [GUARDIAN]     3 ALERTAS CONSECUTIVOS!")
                    print(">> [GUARDIAN] Sistema parece completamente travado")
                    print(">> [GUARDIAN] O sistema AUTO-RESTART deve reiniciar em breve...")
                    alertas_consecutivos = 0
            else:
                if alertas_consecutivos > 0:
                    print(">> [GUARDIAN]   Sistema voltou ao normal (alertas zerados)")
                alertas_consecutivos = 0

            ultimo_check_frames['total'] = frames_atuais
            ultimo_check_frames['timestamp'] = time.time()

        except Exception as e:
            print(f">> [GUARDIAN]   Erro: {e}")
            traceback.print_exc()

    print(">> [GUARDIAN] Encerrado")
