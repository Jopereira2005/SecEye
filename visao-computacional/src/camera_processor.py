"""Thread isolada por câmera: lê RTSP, roda YOLO, dispara eventos."""
import json
import time
import traceback
from datetime import datetime

import cv2
import numpy as np

from . import config, state
from .events import enviar_evento
from .rtsp import abrir_rtsp
from .supabase_ops import atualizar_status_async, set_camera_offline, set_camera_online
from .utils import hora_permitida, ponto_dentro_roi
from .webhooks import enviar_trigger_ifttt


def _normalizar_roi(roi_points, w, h):
    """Converte roi_points em uma lista [[x,y], ...] válida ou None."""
    try:
        if isinstance(roi_points, str):
            roi_points = json.loads(roi_points)

        if isinstance(roi_points, dict):
            if "coordinates" in roi_points:
                coords = roi_points["coordinates"]
                if isinstance(coords, list) and len(coords) > 0:
                    if isinstance(coords[0], list) and len(coords[0]) > 0:
                        if isinstance(coords[0][0], (list, tuple)):
                            roi_points = coords[0]
                        else:
                            roi_points = coords
            else:
                roi_points = None

        if roi_points and isinstance(roi_points, (list, tuple)):
            converted_points = []
            for p in roi_points:
                if isinstance(p, dict) and 'x' in p and 'y' in p:
                    px = int(float(p['x']) * w / 100.0)
                    py = int(float(p['y']) * h / 100.0)
                    converted_points.append([px, py])
                elif isinstance(p, (list, tuple)) and len(p) >= 2:
                    converted_points.append([int(float(p[0])), int(float(p[1]))])
            return converted_points if converted_points else None

        return None
    except Exception:
        raise


def processar_camera_thread(camera_id, camera_config):
    """Loop isolado de uma câmera: conecta, lê frames, roda YOLO, emite eventos."""
    cam_id = camera_id

    state.camera_startup_semaphore.acquire()
    try:
        print(f"\n>> [THREAD] Iniciando processamento independente: {camera_config['nome']} (ID: {cam_id})")

        with state.camera_last_frame_lock:
            state.camera_last_frame[cam_id] = time.time()

        cap = None
        frame_count = 0
        read_attempts = 0
        last_keepalive_check = time.time()
        last_schedule_check = None
        last_roi_check = None

        schedule_inicial = camera_config.get("schedule") or []
        hora_inicial_ok = hora_permitida(schedule_inicial)
        last_schedule_state = hora_inicial_ok

        last_known_status = None
    finally:
        state.camera_startup_semaphore.release()

    try:
        cap = abrir_rtsp(camera_config)
        if cap is None:
            print(f">> [THREAD]   Falha ao abrir camera {camera_config['nome']}")
            set_camera_offline(cam_id, camera_config['nome'], reason="startup_failure")
            last_known_status = "offline"
            state.camera_active[cam_id] = False
            return

        state.camera_active[cam_id] = True
        state.camera_paused_by_schedule[cam_id] = not hora_inicial_ok
        last_known_status = "online"
        print(f">> [THREAD]   Thread ativa para {camera_config['nome']}")

        if not hora_inicial_ok:
            now = datetime.now()
            dia_semana = now.weekday()
            hora_atual = now.strftime("%H:%M")
            print(f"\n{'='*70}")
            print(f">> [SCHEDULE] Camera INICIADA PAUSADA: {camera_config['nome']} (ID: {cam_id})")
            print(f">> [SCHEDULE] Dia: {dia_semana} (0=Seg, 6=Dom) | Hora: {hora_atual}")
            print(">> [SCHEDULE] Processamento YOLO DESATIVADO - aguardando horario permitido")
            print(f"{'='*70}\n")

        while state.camera_active.get(cam_id, False):
            try:
                camera = state.camera_configs.get(cam_id)
                if not camera:
                    print(f">> [THREAD]   Camera {camera_config['nome']} removida do banco, encerrando thread")
                    break

                # Schedule
                schedule = camera.get("schedule") or []
                schedule_str = json.dumps(schedule, sort_keys=True) if schedule else ""
                if schedule_str != last_schedule_check:
                    if last_schedule_check is not None:
                        print(f">> [THREAD]   ✓ {camera['nome']} (ID: {cam_id}): Schedule atualizado automaticamente!")
                    last_schedule_check = schedule_str

                hora_ok = hora_permitida(schedule)
                if not hora_ok:
                    state.camera_paused_by_schedule[cam_id] = True

                    if last_schedule_state:
                        now = datetime.now()
                        dia_semana = now.weekday()
                        hora_atual = now.strftime("%H:%M")
                        print(f"\n{'='*70}")
                        print(f">> [SCHEDULE] Camera PAUSADA: {camera['nome']} (ID: {cam_id})")
                        print(f">> [SCHEDULE] Dia: {dia_semana} (0=Seg, 6=Dom) | Hora: {hora_atual}")
                        print(">> [SCHEDULE] Processamento YOLO DESATIVADO ate o proximo horario permitido")
                        print(f"{'='*70}\n")
                        last_schedule_state = False

                    # Keep-alive a cada 15s mesmo pausada
                    tempo_desde_check = time.time() - last_keepalive_check
                    if tempo_desde_check >= 15:
                        try:
                            if not cap or not cap.isOpened():
                                print(f"\n{'='*70}")
                                print(">> [THREAD]   DESCONEXAO DETECTADA (camera pausada)")
                                print(f">> Camera: {camera['nome']}")
                                print(">> Motivo: Stream fechado ou invalido")
                                print(">> Tentando reconectar...")
                                print(f"{'='*70}\n")

                                cap = abrir_rtsp(camera)
                                if cap:
                                    last_known_status = "online"
                                    print(f">> [THREAD]   {camera['nome']}: Reconectado (pausada) e marcado como ONLINE")
                                else:
                                    print(f">> [THREAD]   {camera['nome']}: Falha ao reconectar (pausada)")
                            else:
                                if last_known_status != "online":
                                    if set_camera_online(cam_id, camera['nome']):
                                        last_known_status = "online"
                                        print(f">> [THREAD]   {camera['nome']}: Status corrigido para ONLINE (pausada mas conectada)")

                            last_keepalive_check = time.time()
                        except Exception as e:
                            print(f">> [THREAD]   {camera['nome']}: Erro ao verificar conexao (pausada): {e}")
                            try:
                                if cap:
                                    cap.release()
                                cap = abrir_rtsp(camera)
                                if cap and last_known_status == "offline":
                                    last_known_status = "online"
                                    print(f">> [THREAD]   {camera['nome']}: Reconectado apos erro (pausada)")
                            except Exception:
                                print(f">> [THREAD]   {camera['nome']}: Falha ao reconectar apos erro (pausada)")
                            last_keepalive_check = time.time()

                    time.sleep(1)
                    continue
                else:
                    state.camera_paused_by_schedule[cam_id] = False

                    if not last_schedule_state:
                        now = datetime.now()
                        dia_semana = now.weekday()
                        hora_atual = now.strftime("%H:%M")
                        print(f"\n{'='*70}")
                        print(f">> [SCHEDULE] Camera RETOMADA: {camera['nome']} (ID: {cam_id})")
                        print(f">> [SCHEDULE] Dia: {dia_semana} (0=Seg, 6=Dom) | Hora: {hora_atual}")
                        print(">> [SCHEDULE] Processamento YOLO ATIVADO - voltou ao horario permitido")
                        print(f"{'='*70}\n")

                        if set_camera_online(cam_id, camera['nome']):
                            last_known_status = "online"

                        last_schedule_state = True

                # Validar cap
                if not cap or not cap.isOpened():
                    print(f">> [THREAD]   Stream fechado para {camera['nome']}, tentando reconectar...")
                    if set_camera_offline(cam_id, camera['nome'], reason="stream_closed"):
                        last_known_status = "offline"
                    cap = abrir_rtsp(camera)
                    if cap:
                        last_known_status = "online"
                        print(f">> [THREAD]   {camera['nome']}: Reconectado e marcado como ONLINE")
                    else:
                        time.sleep(5)
                        continue

                # Ler frame
                try:
                    ok, frame = cap.read()
                except Exception as e:
                    print(f">> [THREAD]   Erro ao ler frame {camera['nome']}: {e}")
                    ok, frame = False, None

                if not ok or frame is None:
                    read_attempts += 1

                    if read_attempts % 5 == 0:
                        print(f">> [THREAD]   {camera['nome']}: {read_attempts} falhas de leitura consecutivas")

                    if read_attempts == 5:
                        print(f">> [THREAD]   {camera['nome']}: OFFLINE detectado (5 falhas)")
                        if set_camera_offline(cam_id, camera['nome'], reason="5_consecutive_read_failures"):
                            last_known_status = "offline"
                            print(f">> [WEBHOOK]   Timer agendado (5min): {camera['nome']}")

                    if read_attempts >= config.MAX_READ_FAILURES:
                        print(f"\n{'='*60}")
                        print(f">> [THREAD]   RECONEXAO FORCADA: {camera['nome']}")
                        print(f">> Motivo: {read_attempts} falhas consecutivas")
                        print(f">> Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
                        print(f"{'='*60}\n")

                        try:
                            cap.release()
                            time.sleep(2)
                            cap = abrir_rtsp(camera)
                            if cap:
                                read_attempts = 0
                                last_known_status = "online"
                                print(f">> [THREAD]   {camera['nome']}: Reconectado com sucesso e marcado como ONLINE")
                                print(f">> [OK] {camera['nome']}: Processamento retomado - câmera normalizada")
                            else:
                                print(f">> [THREAD]   {camera['nome']}: Falha na reconexao")
                                time.sleep(5)
                        except Exception as e:
                            print(f">> [THREAD]   Erro na reconexao de {camera['nome']}: {e}")

                    time.sleep(0.5)
                    continue

                # Frame OK
                read_attempts = 0
                frame_count += 1

                with state.camera_last_frame_lock:
                    state.camera_last_frame[cam_id] = time.time()
                state.camera_frame_count[cam_id] = frame_count

                if last_known_status != "online":
                    print(f"\n{'='*70}")
                    print(f">> [RECONEXAO] Camera normalizada: {camera['nome']} (ID: {cam_id})")
                    print(f">> Frame #{frame_count} lido com sucesso")
                    print(">> Atualizando status: offline → ONLINE (ATOMIC)")
                    print(">> Bloqueando ate confirmar: DB atualizado + Webhooks cancelados")
                    print(f"{'='*70}\n")

                    if set_camera_online(cam_id, camera['nome']):
                        last_known_status = "online"
                        print(">> [OK] Status transition confirmed: offline → ONLINE")
                    else:
                        print(">> [WARN] Status transition failed - will retry next frame")
                elif frame_count % 50 == 0:
                    atualizar_status_async(cam_id, status="online")

                # FPS / process_every (usa process_every da câmera se configurado)
                process_every = camera.get('process_every') or config.PROCESS_EVERY
                if frame_count % process_every != 0:
                    time.sleep(1.0 / config.FPS_LIMIT)
                    continue

                # Dupla checagem de schedule antes do YOLO
                if state.camera_paused_by_schedule.get(cam_id, False):
                    time.sleep(1.0 / config.FPS_LIMIT)
                    continue

                schedule_pre_yolo = camera.get("schedule") or []
                if not hora_permitida(schedule_pre_yolo):
                    state.camera_paused_by_schedule[cam_id] = True
                    time.sleep(1.0 / config.FPS_LIMIT)
                    continue

                # YOLO inference (usa min_confidence da câmera se configurado)
                min_conf = camera.get('min_confidence') or config.MIN_CONFIDENCE
                results = state.model.predict(
                    frame,
                    classes=[0],
                    conf=min_conf,
                    verbose=False,
                    device=0 if state.device == "cuda:0" else "cpu",
                    amp=True
                )

                # ROI
                roi_points = camera.get("roi_points")
                roi_str = json.dumps(roi_points, sort_keys=True) if roi_points else ""
                if roi_str != last_roi_check:
                    if last_roi_check is not None:
                        print(f">> [THREAD]   {camera['nome']}: ROI atualizado automaticamente!")
                    last_roi_check = roi_str

                h, w = frame.shape[:2]

                try:
                    roi_points = _normalizar_roi(roi_points, w, h)
                except Exception as e:
                    if frame_count % 100 == 1:
                        print(f">> [THREAD]   Erro ao processar ROI {camera['nome']}: {e}")
                    roi_points = None

                if not roi_points or len(roi_points) < 3:
                    roi_points = [[0, 0], [w, 0], [w, h], [0, h]]

                roi = np.array(roi_points, dtype=np.int32)

                pessoa_detectada = False

                for r in results:
                    for box in r.boxes:
                        coords = box.xyxy[0]
                        x1 = int(float(coords[0]))
                        y1 = int(float(coords[1]))
                        x2 = int(float(coords[2]))
                        y2 = int(float(coords[3]))
                        cx = int((x1 + x2) / 2)
                        cy = int((y1 + y2) / 2)

                        if ponto_dentro_roi(cx, cy, roi):
                            pessoa_detectada = True
                            cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 0, 255), 2)
                            cv2.putText(frame, "suspeito", (x1, y1-10),
                                        cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)

                cv2.polylines(frame, [roi], isClosed=True, color=(255, 0, 0), thickness=3)

                if config.SHOW_FRAMES:
                    try:
                        cv2.imshow(f"{camera['nome']}", frame)
                        key = cv2.waitKey(1) & 0xFF
                        if key == ord('q'):
                            print(f">> [THREAD]   Usuario pressionou 'q' na janela {camera['nome']}")
                            print(">> [THREAD]   Para parar: use Ctrl+C no terminal, nao feche janelas")
                    except Exception as e:
                        if frame_count % 100 == 1:
                            print(f">> [THREAD]   Erro visualizacao {camera['nome']}: {e} (continuando...)")

                if pessoa_detectada:
                    schedule_check = camera.get("schedule") or []
                    if not hora_permitida(schedule_check) or state.camera_paused_by_schedule.get(cam_id, False):
                        continue

                    ultimo = state.ultimo_envio.get(cam_id, 0)
                    tempo_desde_ultimo = time.time() - ultimo

                    cooldown = camera.get('cooldown_seconds') or config.COOLDOWN_SECONDS
                    if tempo_desde_ultimo >= cooldown:
                        schedule_atual = camera.get("schedule") or []
                        if not hora_permitida(schedule_atual):
                            continue

                        print(f"\n>> [THREAD-EVENTO]   Pessoa detectada: {camera['nome']}")
                        state.ultimo_envio[cam_id] = time.time()
                        enviar_trigger_ifttt(camera)
                        enviar_evento(frame, camera)

                time.sleep(1.0 / config.FPS_LIMIT)

            except Exception as e:
                print(f">> [THREAD]   Erro no loop de {camera['nome']}: {e}")
                traceback.print_exc()
                time.sleep(1)

    except Exception as e:
        print(f">> [THREAD]   Erro fatal na thread {camera_config['nome']}: {e}")
        traceback.print_exc()

    finally:
        state.camera_active[cam_id] = False
        state.camera_paused_by_schedule[cam_id] = False
        if cap:
            try:
                cap.release()
            except Exception:
                pass
        if config.SHOW_FRAMES:
            try:
                cv2.destroyAllWindows()
            except Exception:
                pass

        print(f"\n{'='*60}")
        print(f">> [THREAD]   THREAD ENCERRADA: {camera_config['nome']}")
        print(f">> Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print(f">> Frames processados: {frame_count}")
        if not state.camera_active.get(cam_id, False):
            print(">> Motivo: camera_active=False (shutdown solicitado)")
        else:
            print(">> Motivo: DESCONHECIDO (possivel erro nao capturado)")
            print(">> Stack trace:")
            traceback.print_stack()
        print(f"{'='*60}\n")
