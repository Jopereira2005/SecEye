# 🎯 Projeto de Detecção de Pessoas com YOLOv8 - CRIADO COM SUCESSO!

> ⚠️ **OTIMIZADO PARA CPU** - Este projeto foi configurado para rodar **exclusivamente na CPU** (sem GPU/CUDA)

## ✅ Estrutura do Projeto Criada

Seu projeto foi organizado com a seguinte estrutura:

```
eia.projetoupx/
├── 📂 src/                          # Código-fonte principal
│   ├── __init__.py                  # Módulo inicializador
│   ├── pessoa_detector.py           # 🔍 Classe principal de detecção
│   ├── detector_avancado.py         # 🚀 Funcionalidades avançadas
│   └── utils.py                     # 🛠️ Funções auxiliares
│
├── 📂 data/                         # Suas imagens/vídeos
│   └── .gitkeep                     # (Coloque seus arquivos aqui)
│
├── 📂 models/                       # Modelos YOLO serão salvos aqui
│   └── .gitkeep
│
├── 📂 outputs/                      # Resultados das detecções
│   └── .gitkeep
│
├── 📄 main.py                       # Script com exemplos básicos
├── 📄 quickstart.py                 # ⚡ Comece em 2 minutos!
├── 📄 setup.py                      # 🔧 Script de instalação
├── 📄 test.py                       # ✓ Verificar instalação
├── 📄 config.py                     # ⚙️ Configurações
├── 📄 requirements.txt              # Dependências
├── 📄 README.md                     # Documentação completa
├── 📄 .gitignore                    # Git ignore rules
└── 📄 COMECE_AQUI.md                # Este arquivo
```

## 🚀 PRIMEIROS PASSOS (3 minutos)

### 1️⃣ Instale as dependências:
```bash
python -m pip install -r requirements.txt
```

### 2️⃣ Verifique a instalação:
```bash
python test.py
```

### 3️⃣ Comece com quickstart:
```bash
python quickstart.py
```

## 📚 Exemplos de Uso Rápido

### Detecção em Imagem
```python
from src.pessoa_detector import PessoasDetector

detector = PessoasDetector(model_name="yolov8m.pt", confidence=0.5)
detector.detectar_imagem("data/sua_imagem.jpg", salvar=True)
```

### Detecção em Vídeo
```python
detector = PessoasDetector(model_name="yolov8m.pt", confidence=0.5)
detector.detectar_video("data/seu_video.mp4", salvar=True)
```

### Detecção em Tempo Real (Webcam)
```python
detector = PessoasDetector(model_name="yolov8n.pt")  # Modelo mais rápido
detector.detectar_webcam(duracao_segundos=30)
```

### Com Estatísticas
```python
from src.detector_avancado import DetectorAvancado

detector = DetectorAvancado(confidence=0.6)
stats = detector.detectar_com_estatisticas("data/imagem.jpg")
print(f"Pessoas encontradas: {stats['total_pessoas']}")
print(f"Confiança média: {stats['confianca_media']:.2f}")
```

## 🧠 Modelos Disponíveis

| Modelo | Velocidade | Precisão | CPU | Uso Recomendado |
|--------|-----------|----------|-----|------------------|
| **yolov8n.pt** | ⚡⚡⚡ Rápido | ⭐⭐ | ✓ Sim | **Webcam/CPU** |
| **yolov8s.pt** | ⚡⚡ Médio | ⭐⭐⭐ | ✓ Sim | Tempo Real |
| **yolov8m.pt** | ⚡ Normal | ⭐⭐⭐⭐ | ~ Marginal | Imagens |
| **yolov8l.pt** | 🐌 Lento | ⭐⭐⭐⭐⭐ | ✗ Não | Evitar |
| **yolov8x.pt** | 🐢 Muito Lento | ⭐⭐⭐⭐⭐ | ✗ Não | Evitar |

✅ **Recomendado para CPU: `yolov8n.pt` ou `yolov8s.pt`**

## 📁 O que Fazer Agora?

### Para Imagens:
1. Coloque suas imagens em `data/`
2. Use `detector.detectar_imagem("data/seu_arquivo.jpg")`
3. Veja o resultado em `outputs/`

### Para Vídeos:
1. Coloque seu vídeo em `data/`
2. Use `detector.detectar_video("data/seu_video.mp4")`
3. Veja o resultado em `outputs/`

### Para Webcam:
1. Execute `detector.detectar_webcam()`
2. Pressione 'q' para sair

## ⚙️ Personalizar Comportamento

Edite `config.py` para mudar:
- Modelo padrão
- Confiança mínima
- Cores das caixas
- Pastas de entrada/saída
- E muito mais!

## 🆘 Ajuda

### Erro: "CUDA out of memory"
```python
# Use modelo menor
detector = PessoasDetector(model_name="yolov8n.pt")
```

### Erro: Detecção muito lenta
```python
# Use GPU (se tiver) ou modelo menor
detector = PessoasDetector(model_name="yolov8n.pt")
```

### Erro: Muitas detecções erradas
```python
# Aumente confiança
detector = PessoasDetector(confidence=0.7)
```

## 📚 Arquivos Importantes

- **README.md** - Documentação completa do projeto
- **main.py** - Exemplos de uso variados
- **quickstart.py** - Quickstart rápido
- **test.py** - Testar sua instalação
- **config.py** - Configurações personalizadas
- **src/pessoa_detector.py** - Classe principal (ler para entender)

## 🔗 Links Úteis

- [Documentação Ultralytics YOLOv8](https://docs.ultralytics.com/)
- [GitHub YOLOv8](https://github.com/ultralytics/ultralytics)
- [Tutorial de YOLO](https://docs.ultralytics.com/tasks/detect/)

## 💡 Dicas Profissionais

1. **Validação em Tempo Real:**
   - Use `yolov8n.pt` para máxima velocidade
   - Aumente `confidence` para menos falsos positivos

2. **Otimização de GPU:**
   - Aumentar `batch_size` em batch para processar múltiplas imagens

3. **Ajuste de Confiança:**
   - 0.3-0.4: Captura tudo (mais falsos positivos)
   - 0.5-0.6: Balanço (recomendado)
   - 0.7-0.8: Apenas detecções confiáveis
   - 0.9+: Apenas detecções muito confiáveis

## ✨ Próximos Passos Avançados

1. **Treinar seu próprio modelo:** Veja `train_model_example.py`
2. **Usar com banco de dados:** Salve resultados em BD
3. **Criar API REST:** Exponha as funcionalidades
4. **Integrar com aplicação web:** Crie frontend web
5. **Deploy na nuvem:** Azure, AWS, Google Cloud

---

## 🎉 Tudo Pronto!

Seu projeto está 100% configurado e pronto para usar!

```
python test.py     # Verificar
python quickstart.py # Começar
```

**Boa detecção! 🔍**
