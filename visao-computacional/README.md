# 🔍 Detecção de Pessoas com YOLOv8

Projeto completo para detectar pessoas em imagens, vídeos e webcam usando YOLOv8.

> ⚠️ **MODO CPU-ONLY**: Este projeto foi configurado para rodar **exclusivamente na CPU** (sem GPU/CUDA)

## 🎯 Features

- ✅ Detecção de pessoas em imagens
- ✅ Detecção em vídeos
- ✅ Detecção em tempo real via webcam
- ✅ Múltiplos modelos YOLOv8 disponíveis
- ✅ Configuração flexível de confiança
- ✅ Suporte a GPU/CPU automático
- ✅ Código bem estruturado e documentado

## 📋 Estrutura do Projeto

```
eia.projetoupx/
├── src/
│   ├── __init__.py
│   ├── pessoa_detector.py    # Classe principal de detecção
│   └── utils.py              # Funções auxiliares
├── data/                     # Pasta para suas imagens/vídeos
├── models/                   # Modelos YOLO serão salvos aqui
├── outputs/                  # Resultados das detecções
├── main.py                   # Script de exemplos
├── requirements.txt          # Dependências do projeto
└── README.md                 # Este arquivo
```

## 🚀 Instalação

### Pré-requisitos

- Python 3.8+
- pip
- (Opcional) CUDA para acelerar com GPU

### Passos

1. **Clone ou baixe o projeto**

2. **Instale as dependências:**
```bash
pip install -r requirements.txt
```

3. **Crie as pastas necessárias:**
```bash
mkdir data outputs models
```

## 💻 Como Usar

### 1. Detecção em Imagem

```python
from src.pessoa_detector import PessoasDetector

# Inicializar detector
detector = PessoasDetector(model_name="yolov8m.pt", confidence=0.5)

# Detectar pessoas
img = detector.detectar_imagem("data/sua_imagem.jpg", salvar=True)
```

### 2. Detecção em Vídeo

```python
# Detectar em vídeo
detector.detectar_video("data/seu_video.mp4", salvar=True)
```

### 3. Detecção em Tempo Real (Webcam)

```python
# Detecção via webcam por 30 segundos
detector.detectar_webcam(duracao_segundos=30)
```

### 4. Executar Exemplos

```bash
python main.py
```

## 🧠 Modelos Disponíveis

| Modelo | Descrição | Velocidade | Precisão |
|--------|-----------|-----------|----------|
| **yolov8n.pt** | Nano | ⚡⚡⚡ Muito rápido | ⭐⭐ |
| **yolov8s.pt** | Small | ⚡⚡ Rápido | ⭐⭐⭐ |
| **yolov8m.pt** | Medium | ⚡ Médio | ⭐⭐⭐⭐ |
| **yolov8l.pt** | Large | 🐌 Lento | ⭐⭐⭐⭐⭐ |
| **yolov8x.pt** | Extra Large | 🐢 Muito lento | ⭐⭐⭐⭐⭐ |

**Recomendação:** Use `yolov8m.pt` para melhor balanço entre velocidade e precisão.

## ⚙️ Parâmetros Principais

### Confidence (Confiança)
- **Intervalo:** 0.0 - 1.0
- **Padrão:** 0.5
- **Maior valor:** Menos detecções, maior precisão
- **Menor valor:** Mais detecções, pode incluir falsos positivos

```python
# Aumentar confiança para menos detecções
detector = PessoasDetector(confidence=0.7)

# Diminuir confiança para mais detecções
detector = PessoasDetector(confidence=0.3)
```

## 💾 Saídas

As imagens e vídeos processados são salvos em:
- Pasta: `outputs/`
- PREFIX: `detectado_<nome_original>`

Exemplo:
- Input: `data/foto.jpg` → Output: `outputs/detectado_foto.jpg`
- Input: `data/video.mp4` → Output: `outputs/detectado_video.mp4`

## 🎨 Entendendo as Detecções

As detecções são marcadas com:
- 🟩 **Caixas verdes** = Pessoas detectadas
- 📊 **Texto** = Classe (Pessoa) + Confiança (0-1)

Exemplo: `Pessoa 0.95` = Pessoa detectada com 95% de confiança

## ⚡ Otimizações para CPU

🚨 **Este projeto está configurado para CPU-ONLY!**

### Modelos Recomendados (por velocidade)

1. **yolov8n.pt** ⚡⚡⚡ - Nano (RECOMENDADO)
   - 20-30 FPS em CPU i7
   - Melhor para webcam e tempo real

2. **yolov8s.pt** ⚡⚡ - Small
   - 10-15 FPS em CPU i7
   - Boa relação velocidade/precisão

3. **yolov8m.pt** ⚡ - Medium
   - 5-10 FPS em CPU i7
   - Mais preciso, mais lento

### ❌ EVITAR em CPU
- **yolov8l.pt** - Muito lento (< 5 FPS)
- **yolov8x.pt** - Extremamente lento (< 2 FPS)

### 💡 Dicas de Performance

```python
# 1. Use modelo Nano para webcam
detector = PessoasDetector(model_name="yolov8n.pt")

# 2. Reduza confiança para acelerar
detector = PessoasDetector(confidence=0.3)

# 3. Processe frames alternados em vídeo
frames_processados = 0
for frame in video:
    if frames_processados % 2 == 0:  # Processa cada 2º frame
        results = model(frame)
    frames_processados += 1

# 4. Reduza resolução da webcam
cap = cv2.VideoCapture(0)
cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
```

### ⏱️ Performance Esperada

| CPU | yolov8n | yolov8s | yolov8m |
|-----|---------|---------|---------|
| i5 (6 cores) | 15-20 FPS | 8-12 FPS | 3-5 FPS |
| i7 (8 cores) | 20-30 FPS | 10-15 FPS | 5-10 FPS |
| i9 (12 cores) | 30-40 FPS | 15-20 FPS | 8-12 FPS |
| Ryzen 7 | 20-30 FPS | 10-15 FPS | 5-10 FPS |

## 🔧 Troubleshooting

### Problema: "CUDA out of memory"
```python
# Use modelo menor ou CPU
detector = PessoasDetector(model_name="yolov8s.pt")
```

### Problema: Detecções muito lenta
```python
# Use modelo nano
detector = PessoasDetector(model_name="yolov8n.pt", confidence=0.6)
```

### Problema: Muitos falsos positivos
```python
# Aumente a confiança mínima
detector = PessoasDetector(confidence=0.7)
```

## 📚 Referências

- [Ultralytics YOLO Documentation](https://docs.ultralytics.com/)
- [YOLOv8 GitHub](https://github.com/ultralytics/ultralytics)
- [COCO Dataset](https://cocodataset.org/)

## 📝 License

Este projeto usa YOLOv8 que é open source sob licença AGPL-3.0.

## 🤝 Contributing

Contribuições são bem-vindas! Você pode:
- Reportar bugs
- Sugerir melhorias
- Fazer pull requests

---

**Criado com ❤️ para detecção de pessoas**
