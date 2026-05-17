"""Conexão RTSP via OpenCV."""
import time
import traceback

import cv2

from .supabase_ops import atualizar_status_async, set_camera_online


def abrir_rtsp(camera):
    """Abre câmera RTSP. Retorna VideoCapture ou None."""
    if not camera.get("rtsp_url"):
        print(f">>   [ERRO] Camera {camera.get('nome', camera.get('id'))} sem rtsp_url configurado")
        return None

    url = camera["rtsp_url"]
    cam_id = camera.get("id")
    cam_name = camera.get("nome", "Sem nome")

    # Suporte webcam local: aceitar tanto int quanto string numérica ("0", "1", ...)
    if isinstance(url, str) and url.isdigit():
        url = int(url)

    print(f">> Abrindo RTSP [{cam_name} ID:{cam_id}]: {url}")
    try:
        if isinstance(url, int):
            cap = cv2.VideoCapture(url)
        else:
            cap = cv2.VideoCapture(url, cv2.CAP_FFMPEG)

        if not cap.isOpened():
            print(f">>   Falha ao abrir [{cam_name} ID:{cam_id}]: {url}")
            atualizar_status_async(camera["id"], status="offline")
            return None

        cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)
        cap.set(cv2.CAP_PROP_FPS, 30)
        cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
        cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
        cap.set(cv2.CAP_PROP_AUTOFOCUS, 0)

        print(f">> [WAIT] Aguardando primeiro frame de [{cam_name} ID:{cam_id}]...")
        for _ in range(30):
            ok, frame = cap.read()
            if ok and frame is not None:
                h, w = frame.shape[:2]
                print(f">> [OK] RTSP aberto - [{cam_name} ID:{cam_id}] (resol: {w}x{h})")
                set_camera_online(camera["id"], cam_name)
                return cap
            time.sleep(0.1)

        print(f">>   Timeout ao abrir [{cam_name} ID:{cam_id}]")
        cap.release()
        atualizar_status_async(camera["id"], status="offline")
        return None

    except Exception as e:
        print(f">>   Erro ao abrir RTSP [{cam_name} ID:{cam_id}]: {e}")
        atualizar_status_async(camera.get("id"), status="offline")
        traceback.print_exc()
        return None
