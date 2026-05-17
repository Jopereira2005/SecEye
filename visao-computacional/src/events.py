"""Fila e workers de upload de eventos (foto + insert no Supabase)."""
import queue
import time
from datetime import datetime, timezone

import cv2

from . import config, state


def processar_evento_worker():
    """Worker que processa eventos da fila - roda em thread dedicada."""
    while not state.parada_solicitada:
        try:
            item = state.eventos_queue.get(timeout=1)

            frame_copy = item['frame']
            camera_copy = item['camera']
            timestamp = item['timestamp']

            try:
                camera_uuid = camera_copy.get("id")
                camera_nome = camera_copy.get("nome", "Camera")
                detection_zone_id = camera_copy.get("detection_zone_id")

                if not camera_uuid:
                    print(f"   [FAIL] camera_id ausente para {camera_nome}", flush=True)
                    continue

                # Otimizar e codificar imagem
                h, w = frame_copy.shape[:2]
                frame_to_encode = frame_copy
                if w > 1280:
                    scale = 1280 / w
                    new_w = 1280
                    new_h = int(h * scale)
                    frame_to_encode = cv2.resize(frame_copy, (new_w, new_h))

                encode_param = [int(cv2.IMWRITE_JPEG_QUALITY), 90]
                success, buffer = cv2.imencode('.jpg', frame_to_encode, encode_param)

                if not success:
                    print(f"   [FAIL] Falha ao codificar {camera_nome}", flush=True)
                    continue

                image_bytes = buffer.tobytes()
                filename = f"frame_{timestamp.strftime('%Y%m%d_%H%M%S_%f')}.jpg"
                storage_path = f"camera_{camera_uuid}/{filename}"

                if not state.upload_semaphore.acquire(timeout=30):
                    print(f"   [FAIL] Timeout upload {camera_nome}", flush=True)
                    continue

                upload_time = 0.0
                imagem_url = None

                try:
                    max_retries = 3
                    retry_delay = 1
                    upload_success = False

                    for tentativa in range(max_retries):
                        try:
                            start_time = time.time()
                            state.supabase.storage.from_("occurrences").upload(
                                path=storage_path,
                                file=image_bytes,
                                file_options={"content-type": "image/jpeg"}
                            )
                            upload_time = time.time() - start_time
                            upload_success = True

                            if tentativa > 0:
                                print(f"   [OK] Upload bem-sucedido após {tentativa + 1} tentativas", flush=True)
                            break

                        except Exception as upload_error:
                            erro_str = str(upload_error)
                            is_temporary = any(x in erro_str for x in ['502', '503', 'Bad Gateway', 'timeout'])

                            if is_temporary and tentativa < max_retries - 1:
                                print(f"   [RETRY] Upload erro 502/timeout - tentativa {tentativa + 1}/{max_retries}", flush=True)
                                time.sleep(retry_delay)
                                retry_delay *= 2
                                continue
                            raise

                    if not upload_success:
                        print(f"   [FAIL] Upload falhou após {max_retries} tentativas: {camera_nome}", flush=True)
                        continue

                    project_id = config.SUPABASE_URL.split('//')[-1].split('.')[0] if config.SUPABASE_URL else "unknown"
                    imagem_url = f"https://{project_id}.supabase.co/storage/v1/object/public/occurrences/{storage_path}"

                finally:
                    state.upload_semaphore.release()

                # Insert em occurrences com retry
                max_retries = 3
                retry_delay = 1
                insert_success = False
                insert_time = 0.0

                for tentativa in range(max_retries):
                    try:
                        start_time = time.time()
                        occurrence_data = {
                            "camera_id": str(camera_uuid),
                            "event_image": imagem_url,
                        }
                        if detection_zone_id:
                            occurrence_data["detection_zone_id"] = int(detection_zone_id)

                        state.supabase.table("occurrences").insert(occurrence_data).execute()
                        insert_time = time.time() - start_time
                        insert_success = True

                        if tentativa > 0:
                            print(f"   [OK] Insert bem-sucedido após {tentativa + 1} tentativas", flush=True)
                        break

                    except Exception as insert_error:
                        erro_str = str(insert_error)
                        is_temporary = any(x in erro_str for x in ['502', '503', 'Bad Gateway', 'timeout'])

                        if is_temporary and tentativa < max_retries - 1:
                            print(f"   [RETRY] Insert erro 502/timeout - tentativa {tentativa + 1}/{max_retries}", flush=True)
                            time.sleep(retry_delay)
                            retry_delay *= 2
                            continue
                        raise

                if not insert_success:
                    print(f"   [FAIL] Insert falhou após {max_retries} tentativas: {camera_nome}", flush=True)
                    continue

                total_time = upload_time + insert_time
                state.eventos_processados += 1

                print(f"   [OK] Ocorrência salva em {total_time:.2f}s ({camera_nome})", flush=True)

            except Exception as e:
                print(f"   [FAIL] Erro processando evento {camera_nome}: {e}", flush=True)

            finally:
                state.eventos_queue.task_done()

        except queue.Empty:
            continue
        except Exception as e:
            print(f">> [WORKER] Erro: {e}", flush=True)
            time.sleep(1)


def enviar_evento(frame, camera, wait_completion=False):
    """Enfileira evento para processamento assíncrono."""
    try:
        frame_copy = frame.copy()
        camera_copy = camera.copy()
        timestamp = datetime.now(timezone.utc)

        try:
            state.eventos_queue.put({
                'frame': frame_copy,
                'camera': camera_copy,
                'timestamp': timestamp
            }, block=False)

            state.eventos_na_fila = state.eventos_queue.qsize()

            if state.eventos_na_fila > 100:
                print(f"   [WARN] ATENCAO: {state.eventos_na_fila} eventos na fila aguardando processamento", flush=True)

        except queue.Full:
            print(f"   [FAIL] FILA CHEIA! Evento perdido de {camera.get('nome')} (capacidade: 500)", flush=True)

    except Exception as e:
        print(f"   [FAIL] Erro ao enfileirar evento: {e}", flush=True)
