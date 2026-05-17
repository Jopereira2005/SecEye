"""
Standalone webcam person detector — sem Supabase, sem dependências externas.

Uso:
    python webcam.py                 # webcam 0, modelo yolov8n, conf 0.5
    python webcam.py --camera 1      # webcam 1
    python webcam.py --conf 0.4      # confidence mínima
    python webcam.py --model yolov8s.pt
"""
import argparse
import time

import cv2
import torch
from ultralytics import YOLO


def main():
    parser = argparse.ArgumentParser(description="Detecção de pessoas via webcam (YOLOv8)")
    parser.add_argument("--camera", type=int, default=0, help="Índice da webcam (default: 0)")
    parser.add_argument("--model", type=str, default="yolov8n.pt", help="Modelo YOLO (default: yolov8n.pt)")
    parser.add_argument("--conf", type=float, default=0.5, help="Confidence mínima 0-1 (default: 0.5)")
    parser.add_argument("--width", type=int, default=640, help="Largura do frame")
    parser.add_argument("--height", type=int, default=480, help="Altura do frame")
    args = parser.parse_args()

    print(f">> OpenCV: {cv2.__version__}")
    print(f">> CUDA disponivel: {torch.cuda.is_available()}")
    device = "cuda:0" if torch.cuda.is_available() else "cpu"
    if device == "cuda:0":
        print(f">> GPU: {torch.cuda.get_device_name(0)}")
    print(f">> Device: {device}")

    print(f">> Carregando {args.model}...")
    model = YOLO(args.model)
    model.to(device)

    print(f">> Abrindo webcam {args.camera}...")
    cap = cv2.VideoCapture(args.camera)
    if not cap.isOpened():
        print(f">> ERRO: nao foi possivel abrir a webcam {args.camera}")
        return

    cap.set(cv2.CAP_PROP_FRAME_WIDTH, args.width)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, args.height)
    cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)

    print(">> Pressione 'q' para sair")
    print(">> Pressione 's' para salvar screenshot")

    fps_t0 = time.time()
    fps_count = 0
    fps_display = 0.0

    while True:
        ok, frame = cap.read()
        if not ok or frame is None:
            print(">> Falha ao ler frame")
            break

        # Inference: classe 0 = pessoa
        results = model.predict(
            frame,
            classes=[0],
            conf=args.conf,
            verbose=False,
            device=0 if device == "cuda:0" else "cpu",
        )

        pessoas = 0
        for r in results:
            for box in r.boxes:
                pessoas += 1
                x1, y1, x2, y2 = map(int, box.xyxy[0].tolist())
                conf = float(box.conf[0])
                cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
                cv2.putText(
                    frame,
                    f"Pessoa {conf:.2f}",
                    (x1, y1 - 8),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    0.6,
                    (0, 255, 0),
                    2,
                )

        # FPS
        fps_count += 1
        elapsed = time.time() - fps_t0
        if elapsed >= 1.0:
            fps_display = fps_count / elapsed
            fps_count = 0
            fps_t0 = time.time()

        cv2.putText(
            frame,
            f"FPS: {fps_display:.1f} | Pessoas: {pessoas}",
            (10, 25),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.7,
            (0, 255, 255),
            2,
        )

        cv2.imshow("Webcam - Deteccao de Pessoas (q=sair, s=salvar)", frame)

        key = cv2.waitKey(1) & 0xFF
        if key == ord("q"):
            break
        if key == ord("s"):
            filename = f"screenshot_{int(time.time())}.jpg"
            cv2.imwrite(filename, frame)
            print(f">> Screenshot salvo: {filename}")

    cap.release()
    cv2.destroyAllWindows()
    print(">> Encerrado")


if __name__ == "__main__":
    main()
