"""Estado global compartilhado entre módulos: clientes, dicionários, locks, queues."""
import queue
import threading

import requests

from . import config

# ================== CLIENTES (inicializados em main.py) ==================
supabase = None         # supabase.Client
model = None            # ultralytics.YOLO
device = "cpu"          # "cuda:0" ou "cpu"

# ================== HTTP SESSION ==================
http_session = requests.Session()
http_session.headers.update({'Connection': 'keep-alive'})
http_session_lock = threading.Lock()

# ================== CACHES DE CÂMERAS ==================
camera_configs: dict = {}
camera_caps: dict = {}
camera_threads: dict = {}
camera_active: dict = {}
camera_last_frame: dict = {}
camera_frame_count: dict = {}
camera_restart_count: dict = {}
camera_paused_by_schedule: dict = {}
camera_disabled_since: dict = {}
camera_last_status_update: dict = {}
last_status_update: dict = {}

# ================== CONTADORES E TIMESTAMPS ==================
ultimo_envio: dict = {}
ultimo_keepalive: dict = {}
erros_supabase: dict = {}

import time as _time
ultimo_heartbeat = _time.time()
main_loop_heartbeat = _time.time()

# ================== FLAGS ==================
parada_solicitada = False
realtime_connected = False

# ================== FILA DE EVENTOS ==================
eventos_queue: queue.Queue = queue.Queue(maxsize=500)
eventos_processados = 0
eventos_na_fila = 0

# ================== WEBHOOK TIMERS ==================
webhook_timers: dict = {}
webhook_timers_lock = threading.Lock()

# ================== LOCKS / SEMAFOROS ==================
upload_semaphore = threading.Semaphore(1)
camera_last_frame_lock = threading.Lock()
camera_active_lock = threading.Lock()
camera_startup_semaphore = threading.Semaphore(config.MAX_CONCURRENT_STARTS)
