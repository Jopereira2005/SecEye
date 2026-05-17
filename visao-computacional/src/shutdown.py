"""Signal handlers e cleanup de emergência."""
import atexit
import signal
from datetime import datetime

from . import state


def sinal_parada(sig, frame):
    """Handler para SIGINT/SIGTERM/SIGBREAK."""
    sinal_nome = signal.Signals(sig).name if hasattr(signal, 'Signals') else str(sig)
    print("\n" + "="*60)
    print(f">> [SINAL {sinal_nome}] Parada solicitada")
    print(f">> Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("="*60)
    state.parada_solicitada = True


def cleanup_emergencia():
    """Executado via atexit quando o processo está sendo morto."""
    try:
        with open("emergency_shutdown.log", "a", encoding="utf-8") as f:
            f.write(f"\n{'='*60}\n")
            f.write("[EMERGENCIA] Processo terminado inesperadamente\n")
            f.write(f"Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
            f.write(f"parada_solicitada: {state.parada_solicitada}\n")
            f.write(f"Threads ativas: {sum(1 for t in state.camera_threads.values() if t.is_alive())}\n")
            f.write(f"{'='*60}\n")
    except Exception:
        pass


def install_handlers():
    """Instala signal handlers e registra cleanup de emergência."""
    signal.signal(signal.SIGINT, sinal_parada)
    if hasattr(signal, 'SIGTERM'):
        signal.signal(signal.SIGTERM, sinal_parada)
    if hasattr(signal, 'SIGBREAK'):
        signal.signal(signal.SIGBREAK, sinal_parada)
    atexit.register(cleanup_emergencia)
