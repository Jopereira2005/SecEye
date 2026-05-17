"""Constantes de configuração lidas do ambiente e fixas no código."""
import os
from dotenv import load_dotenv

load_dotenv()

# ================== SUPABASE ==================
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_API_KEY")
WORKER_ID = int(os.getenv("WORKER_ID", "1"))

# ================== PROCESSAMENTO YOLO ==================
MIN_CONFIDENCE = 0.50
PROCESS_EVERY = 10
COOLDOWN_SECONDS = 5.0
FPS_LIMIT = 10

# ================== SISTEMA ==================
OFFLINE_TIMEOUT = 15
MAX_READ_FAILURES = 10
SHOW_FRAMES = os.getenv("SHOW_FRAMES", "false").lower() in ["true", "1", "yes"]
UPDATE_STATUS_INTERVAL = 5
HEARTBEAT_INTERVAL = 30

# ================== MONITORAMENTO ==================
WATCHDOG_TIMEOUT = 90
HEALTH_CHECK_INTERVAL = 5
MAX_RESTART_ATTEMPTS = 100
AUTO_ENABLE_TIMEOUT = 3600
MAX_CONCURRENT_STARTS = 10
NUM_UPLOAD_WORKERS = 3

# ================== WEBHOOK ERRO ==================
ERROR_WEBHOOK_INTERVAL = 1800   # 30 min
ERROR_WEBHOOK_DELAY = 300       # 5 min

# ================== SUPABASE RETRY ==================
SUPABASE_RETRY_MAX = 5
SUPABASE_RETRY_DELAY_INITIAL = 0.5
SUPABASE_RETRY_DELAY_MAX = 10
SUPABASE_TIMEOUT = 30
SUPABASE_STATUS_UPDATE_BATCH_SIZE = 10
SUPABASE_STATUS_UPDATE_BATCH_TIMEOUT = 2

# ================== ARQUIVOS ==================
PROCESS_ALIVE_FILE = "worker_alive.txt"

# ================== TRIGGERS IFTTT (FALLBACK) ==================
# Preferencialmente configure 'trigger_url' na tabela cameras do Supabase.
# Este dicionário é apenas fallback para compatibilidade.
CAMERA_TRIGGER_URLS: dict[int, str] = {}
