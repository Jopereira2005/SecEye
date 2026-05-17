"""Detecta GPU/CPU, carrega YOLO e faz warm-up de CUDA."""
import torch
from ultralytics import YOLO

from . import state


def init_ai():
    """Inicializa device + modelo YOLO. Atualiza state.device e state.model."""
    print(">> Verificando CUDA...")
    print(f">> PyTorch CUDA disponivel: {torch.cuda.is_available()}")

    if torch.cuda.is_available():
        print(f">> GPU: {torch.cuda.get_device_name(0)}")
        print(f">> CUDA Version: {torch.version.cuda}")
        state.device = "cuda:0"
    else:
        print(">>   CUDA nao disponivel, usando CPU")
        state.device = "cpu"

    print(">> Carregando YOLO v8n...")
    state.model = YOLO("yolov8n.pt")
    state.model.to(state.device)

    if state.device == "cuda:0":
        print(">> Aquecendo CUDA...")
        try:
            dummy = torch.zeros(1, 3, 640, 480).to(state.device)
            _ = state.model.predict(dummy, verbose=False, device=0)
            _ = state.model.predict(dummy, verbose=False, device=0)
            print(">> [OK] CUDA aquecido (pronto para inference rapida)")
        except Exception as e:
            print(f">>   Warm-up CUDA falhou: {e}")
