# 🛡️ SecEye - Ecossistema Inteligente de Segurança

> Repositório dedicado ao projeto de UPX do 5º semestre da faculdade de Engenharia da Computação | **FACENS**

O **SecEye** é um ecossistema completo de segurança patrimonial inteligente. Ele une monitoramento em tempo real, inteligência artificial para detecção de invasores e internet das coisas (IoT) para o acionamento remoto de alarmes físicos.

---

## 🏗️ Arquitetura do Sistema

O projeto foi construído seguindo uma arquitetura moderna e dividida em três pilares principais, todos integrados em tempo real através da nuvem e de protocolos de mensageria leve (MQTT):

### 1. 📱 Frontend (Aplicativo Mobile)
Desenvolvido em **React Native** (com o framework **Expo**), o aplicativo é a central de controle do usuário.
- **Autenticação:** Login e Cadastro seguros (Supabase Auth).
- **Gestão:** Controle de Perfis, Câmeras, Rotinas de Ativação e Zonas de Detecção.
- **Monitoramento:** Recebimento de alertas push em tempo real e visualização de Ocorrências e streamings de vídeo.
- **Controle Direto:** Botão de pânico e acionamento manual do alarme via MQTT.

### 2. 🧠 Visão Computacional (Backend IA)
Desenvolvido em **Python**, utiliza o poderoso modelo **YOLOv8** (otimizado para rodar em arquiteturas CPU-only) para processar o fluxo de vídeo.
- **Detecção:** Processa frames de câmeras IP, Webcams ou vídeos buscando por anomalias (pessoas em locais restritos).
- **Ação:** Ao detectar intrusos em uma câmera armada, registra uma "Ocorrência" no banco de dados e pode disparar o alarme.

### 3. 🚨 Hardware (Módulo IoT)
Firmware escrito em **C++** para placas baseadas no **ESP32**.
- **Comunicação:** Mantém conexão constante via rede Wi-Fi com um broker MQTT.
- **Atuação:** Ouve tópicos específicos de alarme. Ao receber um sinal (`1`), aciona relés que disparam sirenes físicas/luzes no ambiente local.

---

## 📂 Estrutura do Repositório

```text
SecEye/
├── frontend/                # Aplicativo Mobile (React Native / Expo)
├── visao-computacional/     # Backend de Detecção (Python / YOLOv8)
└── mqtt-alarme/             # Firmware IoT do Alarme (C++ / ESP32)
```

### Tecnologias Utilizadas
* **Mobile:** React Native, Expo, React Navigation (Router), React Query, Reanimated.
* **Inteligência Artificial:** Python, OpenCV, Ultralytics YOLOv8.
* **Backend / Nuvem:** Supabase (PostgreSQL, Auth, Storage, Realtime Subscriptions).
* **IoT / Hardware:** ESP32, PubSubClient (MQTT), Arduino IDE.

---

## 🚀 Como Executar o Projeto

Como o projeto é modular, cada parte deve ser executada de forma independente.

### 1. Executando o Aplicativo (Frontend)

Navegue até a pasta do aplicativo e inicie o ambiente de desenvolvimento:

```bash
cd frontend
npm install
npx expo start
```

*Baixe o app **Expo Go** no seu celular para ler o QR Code ou rode em um emulador Android/iOS.*

### 2. Iniciando a Visão Computacional

Recomenda-se o uso de um ambiente virtual (`venv`). Navegue até a pasta de IA:

```bash
cd visao-computacional
pip install -r requirements.txt
python main.py
```

*Observação: As instruções completas de configuração de GPU/CPU estão no README interno da pasta `visao-computacional`.*

### 3. Configurando o Alarme Físico (ESP32)

1. Abra a pasta `mqtt-alarme/seceye-alarme/` na Arduino IDE.
2. Copie o arquivo `config.h.example` para `config.h` e insira as credenciais da sua rede Wi-Fi e do seu Broker MQTT.
3. Conecte o seu ESP32 via USB e faça o upload do código (`seceye-alarme.ino`).

---

## 🔒 Variáveis de Ambiente (.env)

Para o aplicativo funcionar, você precisará conectar a sua própria instância do Supabase e do seu Broker MQTT. Crie um arquivo `.env` na pasta `frontend` contendo:

```env
EXPO_PUBLIC_SUPABASE_URL=sua_url_aqui
EXPO_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima_aqui
EXPO_PUBLIC_MQTT_BROKER=ws://seu-broker:porta/mqtt
EXPO_PUBLIC_MQTT_TOPIC=seu/topico
```

---

*Projeto acadêmico - Desenvolvido para a Faculdade de Engenharia de Sorocaba (FACENS).*
