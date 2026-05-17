"""Entry point: inicializa clientes, sobe threads e roda loop principal protegido."""
# logging_setup precisa vir primeiro para silenciar warnings e instalar filtro de print
from src import logging_setup  # noqa: F401

import sys
import threading
import time
import traceback
from datetime import datetime

import cv2
from supabase import create_client

from src import config, state
from src.ai_setup import init_ai
from src.camera_processor import processar_camera_thread
from src.events import processar_evento_worker
from src.monitoring import (
    auto_recovery_thread,
    guardian_thread,
    status_sync_thread,
    supervisor_thread,
    watchdog_thread,
)
from src.realtime import cleanup_realtime, polling_fallback_thread, setup_realtime_listener
from src.shutdown import install_handlers
from src.supabase_ops import carregar_cameras


def banner_inicial():
    print(">> Verificando OpenCV...")
    print(f">> OpenCV versao: {cv2.__version__}")
    print(f">> Worker {config.WORKER_ID}")
    print(f">> Visualizacao de frames: {'ATIVADA' if config.SHOW_FRAMES else 'DESATIVADA'}")
    if config.SHOW_FRAMES:
        print(">>   Modo visualizacao ativo - Pressione 'q' para encerrar ou feche as janelas")
        print(">> Para desabilitar visualizacao: defina SHOW_FRAMES=false no .env")
    print(f">> Conectando ao Supabase: {config.SUPABASE_URL}")
    print(">>   Storage bucket: occurrences/")
    print(">>   Tabela de ocorrencias: occurrences")
    print(f">> [DEBUG] SUPABASE_KEY = {config.SUPABASE_KEY[:20] if config.SUPABASE_KEY else 'NONE'}")


def validar_credenciais():
    if not config.SUPABASE_URL or not config.SUPABASE_KEY:
        print(">> ERRO: Credenciais Supabase nao configuradas!")
        print(f">>   SUPABASE_URL: {config.SUPABASE_URL}")
        print(f">>   SUPABASE_KEY: {'OK' if config.SUPABASE_KEY else 'NAO CONFIGURADA'}")
        print(">> Verifique o arquivo .env")
        sys.exit(1)


def log_triggers_fallback():
    if config.CAMERA_TRIGGER_URLS:
        print(f">> Triggers IFTTT (dicionario fallback): {len(config.CAMERA_TRIGGER_URLS)} cameras")
        print(">> NOTA: Configure 'trigger_url' no Supabase para gestao dinamica")
        print(">> Cameras com trigger fallback:")
        for cam_id in sorted(config.CAMERA_TRIGGER_URLS.keys()):
            url = config.CAMERA_TRIGGER_URLS[cam_id]
            trigger_name = url.split("/trigger/")[1].split("/")[0] if "/trigger/" in url else "webhook"
            print(f"   - Camera ID {cam_id}: {trigger_name}")
    else:
        print(">> Triggers IFTTT: Dicionario vazio (configure 'trigger_url' no Supabase)")


def iniciar_threads_cameras(cameras):
    print(f"\n>> [INIT] Iniciando threads para {len(cameras)} cameras...")
    for camera in cameras:
        cam_id = camera["id"]
        state.camera_configs[cam_id] = camera

        thread = threading.Thread(
            target=processar_camera_thread,
            args=(cam_id, camera),
            daemon=True,
            name=f"Camera-{camera.get('nome', cam_id)}"
        )
        thread.start()
        state.camera_threads[cam_id] = thread

        print(f">> [THREAD] Iniciando processamento independente: {camera.get('nome', cam_id)} (ID: {cam_id})")

    print(f">> [OK] {len(cameras)} threads de cameras iniciadas com sucesso")


def iniciar_threads_background():
    """Sobe workers de upload + threads de monitoramento."""
    for i in range(config.NUM_UPLOAD_WORKERS):
        worker = threading.Thread(target=processar_evento_worker, daemon=True, name=f"UploadWorker-{i+1}")
        worker.start()
    print(f">> [WORKERS] {config.NUM_UPLOAD_WORKERS} workers de upload iniciados")

    threading.Thread(target=watchdog_thread, daemon=True, name="Watchdog").start()
    print(">> [WATCHDOG] Thread de monitoramento iniciada")

    threading.Thread(target=status_sync_thread, daemon=True, name="StatusSync").start()
    print(">> [STATUS-SYNC] Thread de sincronizacao de status iniciada (modo conservador - 120s)")

    threading.Thread(target=polling_fallback_thread, daemon=True, name="PollingFallback").start()
    print(">> [POLLING] Thread de fallback iniciada (updates a cada 30s)")

    threading.Thread(target=supervisor_thread, daemon=True, name="Supervisor").start()
    print(">> [SUPERVISOR] Thread supervisor do loop principal iniciada")

    threading.Thread(target=guardian_thread, daemon=True, name="Guardian").start()
    print(">> [GUARDIAN] Thread guardian (protecao final) iniciada")

    threading.Thread(target=auto_recovery_thread, daemon=True, name="AutoRecovery").start()
    print(">> [AUTO-RECOVERY] Thread de recuperacao automatica de cameras offline iniciada (verifica a cada 5min)")


def executar_loop_principal():
    """Loop principal protegido com captura de exceções e auto-recovery."""
    print("\n" + "="*60)
    print(">> [SISTEMA] Iniciando loop principal PROTEGIDO")
    print(">> MODO: NUNCA PARAR (Anti-crash ativado)")
    print("="*60 + "\n")

    while not state.parada_solicitada:
        try:
            while not state.parada_solicitada:
                state.main_loop_heartbeat = time.time()

                try:
                    with open(config.PROCESS_ALIVE_FILE, "w") as f:
                        f.write(f"ALIVE: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
                        f.write(f"Threads: {sum(1 for t in state.camera_threads.values() if t.is_alive())}/{len(state.camera_threads)}\n")
                        f.write(f"Frames: {sum(state.camera_frame_count.values())}\n")
                        f.write(f"Eventos: {state.eventos_processados}\n")
                except Exception:
                    pass

                now_hb = time.time()
                if now_hb - state.ultimo_heartbeat > config.HEARTBEAT_INTERVAL:
                    threads_ativas = sum(1 for active in state.camera_active.values() if active)
                    total_frames = sum(state.camera_frame_count.values())
                    total_restarts = sum(state.camera_restart_count.values())
                    fila_tamanho = state.eventos_queue.qsize()

                    status_msg = f">> [HEARTBEAT] {threads_ativas} cameras | {total_frames} frames | {state.eventos_processados} eventos salvos"
                    if fila_tamanho > 0:
                        status_msg += f" |   {fila_tamanho} na fila"
                    if total_restarts > 0:
                        status_msg += f" | {total_restarts} restarts"

                    ws_status = "✓ Conectado" if state.realtime_connected else "✗ Desconectado (usando polling)"
                    status_msg += f" | Realtime: {ws_status}"

                    print(f"\n{status_msg}")
                    state.ultimo_heartbeat = now_hb

                for _ in range(10):
                    if state.parada_solicitada:
                        break
                    time.sleep(0.1)

        except KeyboardInterrupt:
            print("\n" + "="*60)
            print(">> [PARADA] Interrupcao manual detectada (Ctrl+C)")
            print("="*60)
            state.parada_solicitada = True
            return

        except SystemExit as e:
            print("\n" + "="*60)
            print(">>   [BLOQUEADO] Tentativa de SystemExit interceptada!")
            print(f">> Codigo: {e}")
            print(">>   SISTEMA DE SEGURANCA NAO PODE SER ENCERRADO ASSIM")
            print(">> Use Ctrl+C para parar corretamente")
            print("="*60)
            traceback.print_exc()
            print(">>   Ignorando exit() e reiniciando em 3s...")
            time.sleep(3)
            continue

        except Exception as e:
            print("\n" + "="*60)
            print(">>   [ERRO] Loop interno encontrou erro - AUTO-RECOVERY")
            print(f">> Tipo: {type(e).__name__}")
            print(f">> Mensagem: {e}")
            print(f">> Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
            print("="*60)

            try:
                with open("emergency_errors.log", "a", encoding="utf-8") as f:
                    f.write(f"\n{'='*60}\n")
                    f.write(f"[ERRO AUTO-RECOVERY] {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
                    f.write(f"Tipo: {type(e).__name__}\n")
                    f.write(f"Mensagem: {e}\n")
                    f.write(traceback.format_exc())
                    f.write(f"\n{'='*60}\n")
            except Exception:
                pass

            traceback.print_exc()
            print(">>   Reiniciando loop em 3 segundos...")
            time.sleep(3)
            continue

        except BaseException as e:
            print("\n" + "="*60)
            print(">>     [CRITICO] BaseException capturada!")
            print(f">> Tipo: {type(e).__name__}")
            print(f">> Mensagem: {e}")
            print("="*60)
            traceback.print_exc()

            if isinstance(e, KeyboardInterrupt):
                state.parada_solicitada = True
                return

            print(">>   Sistema protegido - Reiniciando em 5s...")
            time.sleep(5)
            continue

    if not state.parada_solicitada:
        print("\n" + "="*60)
        print(">>     [BUG CRITICO] Loop externo terminou sozinho!")
        print(">> Isto NAO deveria ser possivel!")
        print(f">> Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print("="*60)
        traceback.print_stack()
        print(">>   AUTO-RESTART em 10 segundos...")
        time.sleep(10)
        executar_loop_principal()


def loop_autorestart_infinito():
    """Camada externa: auto-restart com limite de tentativas consecutivas."""
    print("\n" + "="*60)
    print(">>   SISTEMA ANTI-CRASH ATIVADO")
    print(">> MODO: LOOP INFINITO COM AUTO-RESTART")
    print(">> O codigo so para com Ctrl+C")
    print("="*60 + "\n")

    tentativas_restart = 0
    max_tentativas_consecutivas = 10

    while not state.parada_solicitada:
        try:
            tentativas_restart += 1

            if tentativas_restart > 1:
                print("\n" + "="*60)
                print(f">>   AUTO-RESTART #{tentativas_restart}")
                print(f">> Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
                print("="*60 + "\n")

            executar_loop_principal()

            if state.parada_solicitada:
                break

            print("\n" + "="*60)
            print(">>   Loop principal retornou sem parada_solicitada")
            print(">> Auto-restart em 5 segundos...")
            print("="*60)
            time.sleep(5)
            tentativas_restart = 0

        except KeyboardInterrupt:
            print("\n" + "="*60)
            print(">> [CTRL+C] Interrupcao manual confirmada")
            print("="*60)
            state.parada_solicitada = True
            break

        except BaseException as e:
            print("\n" + "="*60)
            print(f">>   [EXCECAO CAPTURADA] {type(e).__name__}")
            print(f">> Mensagem: {e}")
            print(f">> Tentativa: {tentativas_restart}")
            print("="*60)
            traceback.print_exc()

            try:
                with open("crash_recovery.log", "a", encoding="utf-8") as f:
                    f.write(f"\n{'='*60}\n")
                    f.write(f"[CRASH RECOVERY] {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
                    f.write(f"Tentativa: {tentativas_restart}\n")
                    f.write(f"Tipo: {type(e).__name__}\n")
                    f.write(f"Mensagem: {e}\n")
                    f.write(traceback.format_exc())
                    f.write(f"\n{'='*60}\n")
            except Exception:
                pass

            if isinstance(e, KeyboardInterrupt):
                state.parada_solicitada = True
                break

            if tentativas_restart >= max_tentativas_consecutivas:
                print(f">>   ALERTA: {tentativas_restart} tentativas consecutivas")
                print(">> Aguardando 60 segundos antes de continuar...")
                time.sleep(60)
                tentativas_restart = 0
            else:
                print(">>   Auto-restart em 5 segundos...")
                time.sleep(5)

            continue


def cleanup():
    """Finaliza threads e libera recursos."""
    if not state.parada_solicitada:
        return

    print("\n" + "="*60)
    print(">> [CLEANUP] Aguardando threads finalizarem...")

    for cam_id in list(state.camera_active.keys()):
        state.camera_active[cam_id] = False

    inicio_cleanup = time.time()
    while any(state.camera_active.values()) and (time.time() - inicio_cleanup) < 10:
        time.sleep(0.5)

    threads_restantes = sum(1 for t in state.camera_threads.values() if t.is_alive())
    print(f">> Threads finalizadas: {len(state.camera_threads) - threads_restantes}/{len(state.camera_threads)}")

    cleanup_realtime()

    if config.SHOW_FRAMES:
        try:
            cv2.destroyAllWindows()
            print(">> Janelas OpenCV fechadas")
        except Exception:
            pass

    print("="*60)
    print(">>   Worker encerrado com sucesso")
    print(f">> Total de frames processados: {sum(state.camera_frame_count.values())}")
    print(f">> Total de eventos salvos: {state.eventos_processados}")
    print(f">> Timestamp final: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("="*60)


def main():
    banner_inicial()
    validar_credenciais()
    log_triggers_fallback()

    # Conectar clientes
    state.supabase = create_client(config.SUPABASE_URL, config.SUPABASE_KEY)
    print(">> [REALTIME] Preparando conexao com Supabase Realtime...")
    print(">> Supabase conectado")

    # YOLO + CUDA
    init_ai()
    print(f">> Worker {config.WORKER_ID} | Device: {state.device}")

    # Signal handlers
    install_handlers()

    print("\n>>   Sistema iniciado! Modo MULTI-THREAD (cameras independentes)")
    print(">>   WATCHDOG ativo - monitoramento e auto-recuperacao habilitados")
    print(">>   SUPERVISOR ativo - detecta travamento do loop principal")
    print(f">>   FILA DE EVENTOS: {config.NUM_UPLOAD_WORKERS} workers processando uploads")
    print(">>   PROTECAO ANTI-PARADA:")
    print(">>      Double-loop failsafe")
    print(">>      Exception recovery")
    print(">>      SystemExit bloqueado")
    print(">>      Thread supervisor (alerta se loop travar)")
    print(">>      CV2 windows desabilitadas (SHOW_FRAMES=false)")
    print(">>      Signal handlers (SIGINT, SIGTERM, SIGBREAK)")
    print(f">>      Heartbeat file: {config.PROCESS_ALIVE_FILE}")
    print("=" * 60)

    # Heartbeat inicial
    try:
        with open(config.PROCESS_ALIVE_FILE, "w") as f:
            f.write(f"STARTED: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
        print(f">> [HEARTBEAT] Arquivo criado: {config.PROCESS_ALIVE_FILE}")
    except Exception as e:
        print(f">> [HEARTBEAT]   Erro ao criar arquivo: {e}")

    # Carregar câmeras iniciais
    print("\n" + "="*60)
    print(">> [INIT] Carregando cameras do banco de dados...")
    print("="*60)

    cameras_iniciais = carregar_cameras()

    if not cameras_iniciais:
        print("\n" + "="*60)
        print(">> [ERRO] NENHUMA CAMERA ENCONTRADA!")
        print(">> Verifique:")
        print(">>   1. Tabela 'cameras' existe no Supabase")
        print(">>   2. Campo 'is_active' = true")
        print(">>   3. Campo 'rtsp_url' preenchido")
        print(">>   4. Credenciais do Supabase estao corretas (service_role key)")
        print("="*60)
        print(">> Sistema sera encerrado.")
        sys.exit(1)

    iniciar_threads_cameras(cameras_iniciais)
    print("="*60 + "\n")

    # Realtime listener
    print(">> [REALTIME] Ativando sistema de notificacoes em tempo real...")
    realtime_thread = setup_realtime_listener()

    if realtime_thread:
        print(">> [REALTIME] ✓ Sistema de notificacoes ativo!")
        print(">> [REALTIME] Cameras serao gerenciadas automaticamente:")
        print(">>   - Novas cameras: iniciadas automaticamente")
        print(">>   - Updates: aplicados em tempo real")
        print(">>   - Deletes: threads encerradas automaticamente")
        print(">>   - ROI/URL: restart automatico da thread")
        print(">>   - Schedule/Trigger: atualizacao sem restart")
        print("="*60 + "\n")
    else:
        print(">> [REALTIME] ⚠ Falha ao ativar - sistema funcionara sem updates automaticos")

    print("="*60 + "\n")

    # Workers de upload + threads de monitoramento
    iniciar_threads_background()

    print("\n" + "="*60)
    print(">>   SISTEMA DE PROTECAO COMPLETO ATIVADO:")
    print(">>      Watchdog (monitora cameras)")
    print(">>      Polling Fallback (atualiza configs a cada 30s)")
    print(">>      Status Sync (sincroniza status a cada 120s)")
    print(">>      Supervisor (monitora loop principal)")
    print(">>      Guardian (dead man's switch)")
    print(">>      Auto-Recovery (verifica offline a cada 5min)")
    print(">>      Auto-restart infinito")
    print(">>      Captura de todas excecoes")
    print(">> O sistema agora e INDESTRUTIVEL!")
    print("="*60 + "\n")

    # Loop infinito principal
    loop_autorestart_infinito()

    print("\n" + "="*60)
    print(">> [AUTO-RESTART] Loop infinito finalizado")
    print("="*60)

    print("\n" + "="*60)
    if state.parada_solicitada:
        print(">> [STATUS] Parada solicitada confirmada")
    else:
        print(">>   [ANOMALIA] Saida sem parada_solicitada=True")
        print(">> Forcando parada para cleanup...")
        state.parada_solicitada = True
    print("="*60 + "\n")

    cleanup()


if __name__ == "__main__":
    main()
