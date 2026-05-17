"""Suprime warnings e filtra prints ruidosos de libs assíncronas."""
import builtins
import logging
import warnings

logging.getLogger("asyncio").setLevel(logging.CRITICAL)
logging.getLogger("websockets").setLevel(logging.CRITICAL)
logging.getLogger("realtime").setLevel(logging.CRITICAL)
warnings.filterwarnings("ignore", category=RuntimeWarning)
warnings.filterwarnings("ignore", category=DeprecationWarning)

_original_print = print


def _print_filter(*args, **kwargs):
    msg = ' '.join(str(a) for a in args)

    if 'Task exception was never retrieved' in msg:
        return
    if 'future:' in msg and 'Task finished' in msg:
        return
    if 'realtime' in msg.lower() and ('error' in msg.lower() or 'exception' in msg.lower()):
        return

    _original_print(*args, **kwargs)


builtins.print = _print_filter
