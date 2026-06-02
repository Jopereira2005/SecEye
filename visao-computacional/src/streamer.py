"""Servidor Flask MJPEG para enviar frames em tempo real para o App Frontend."""

import time
import logging
import cv2
import numpy as np
from flask import Flask, Response, jsonify
from flask_cors import CORS
from src import state

# Suprime logs de acesso do Flask/Werkzeug
log = logging.getLogger('werkzeug')
log.setLevel(logging.ERROR)

app = Flask(__name__)
CORS(app)  # Permite requisições do App React Native

def create_fallback_frame(text="CARREGANDO CAMERA..."):
    """Cria um frame preto com texto de aviso."""
    frame = np.zeros((360, 640, 3), dtype=np.uint8)
    # Adiciona um retangulo de borda
    cv2.rectangle(frame, (10, 10), (630, 350), (0, 0, 255), 2)
    # Adiciona o texto centralizado
    font = cv2.FONT_HERSHEY_SIMPLEX
    text_size = cv2.getTextSize(text, font, 1, 2)[0]
    text_x = (640 - text_size[0]) // 2
    text_y = (360 + text_size[1]) // 2
    cv2.putText(frame, text, (text_x, text_y), font, 1, (255, 255, 255), 2)
    _, buffer = cv2.imencode('.jpg', frame, [int(cv2.IMWRITE_JPEG_QUALITY), 60])
    return buffer.tobytes()

FALLBACK_FRAME = create_fallback_frame()

def generate_frames(camera_id: str):
    """Gera um stream infinito de bytes JPEG no formato multipart."""
    while True:
        frame_bytes = None
        
        # Pega o último frame armazenado com segurança
        with state.latest_frames_lock:
            frame_bytes = state.latest_frames.get(camera_id)
            
        if frame_bytes is None:
            # Câmera offline ou inicializando: envia o frame de fallback
            frame_bytes = FALLBACK_FRAME
            
        # Padrão MJPEG (Motion JPEG)
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
               
        # Controla o FPS maximo do stream (aumentado para 30 fps após otimização)
        time.sleep(1 / 30.0)

@app.route('/feed/<camera_id>')
def video_feed(camera_id):
    """Endpoint que o App chamará: http://<ip>:5000/feed/<camera_id>"""
    return Response(generate_frames(camera_id),
                    mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/health')
def health_check():
    """Endpoint de status."""
    return jsonify({"status": "online", "active_streams": len(state.latest_frames)})

def start_streamer_server():
    """Roda o Flask. DEVE ser chamado em uma thread de background."""
    print(">> [STREAMER] Iniciando servidor MJPEG na porta 5000...")
    # host='0.0.0.0' permite que o celular acesse via rede local
    app.run(host='0.0.0.0', port=5000, debug=False, use_reloader=False)
