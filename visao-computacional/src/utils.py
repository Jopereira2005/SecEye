"""Helpers puros: tempo, schedule e geometria."""
from datetime import datetime, timezone

import cv2


def agora_utc():
    return datetime.now(timezone.utc)


def _no_intervalo(ini: str, fim: str, hora_atual: str) -> bool:
    """
    Verifica se hora_atual está dentro do intervalo [ini, fim].

    Intervalos que cruzam a meia-noite (ini > fim) são tratados como
    dois segmentos: [ini, "23:59"] ∪ ["00:00", fim].
    Ex.: ini="22:00", fim="06:00" cobre 22h–23:59 e 00:00–06h.
    """
    if ini <= fim:
        # Intervalo normal dentro do mesmo dia
        return ini <= hora_atual <= fim
    else:
        # Intervalo que atravessa a meia-noite
        return hora_atual >= ini or hora_atual <= fim


def hora_permitida(schedule):
    """
    Verifica se o horário atual está dentro dos intervalos permitidos.

    FORMATO 1 (7 arrays, um por dia da semana):
        [[["00:00","11:59"], ["12:00","23:59"]], ...]  # 7 listas

    FORMATO 2 (lista plana de intervalos):
        [["00:00","05:59"], ["19:00","23:59"], ...]

    FORMATO BANCO (tabela routines):
        repeat_type = 'once'     → verifica specific_date
        repeat_type = 'everyday' → ativo todo dia
        repeat_type = 'weekly'   → verifica days_week (0=Seg, 6=Dom)

    Rotinas com is_active=False são ignoradas.
    Suporta intervalos que cruzam a meia-noite (ex.: 22:00 → 06:00).
    """
    if not schedule:
        return False

    if not isinstance(schedule, list) or len(schedule) == 0:
        return False

    now        = datetime.now()
    dia_semana_py = now.weekday()
    dia_semana = (dia_semana_py + 1) % 7
    hora_atual = now.strftime("%H:%M")
    data_hoje  = now.strftime("%Y-%m-%d")

    # FORMATO BANCO (dicts com hora_inicio)
    if isinstance(schedule[0], dict) and 'hora_inicio' in schedule[0]:
        for rotina in schedule:
            if not rotina.get('is_active', True):
                continue

            ini = str(rotina.get('hora_inicio', ''))[:5]
            fim = str(rotina.get('hora_fim', ''))[:5]

            if not ini or not fim:
                continue

            if not _no_intervalo(ini, fim, hora_atual):
                continue

            days        = rotina.get('days_week') or []
            repeat_type = rotina.get('repeat_type', 'weekly')

            if repeat_type == 'once':
                specific_date = str(rotina.get('specific_date', ''))[:10]
                if specific_date == data_hoje:
                    return True
                continue

            if repeat_type == 'everyday':
                return True

            if repeat_type == 'weekly':
                if not days:
                    return True
                if dia_semana in days:
                    return True

        return False

    # FORMATO 2 (lista plana)
    if isinstance(schedule[0], list):
        if len(schedule[0]) == 2 and isinstance(schedule[0][0], str):
            for intervalo in schedule:
                if not isinstance(intervalo, list) or len(intervalo) != 2:
                    continue
                ini, fim = intervalo
                if _no_intervalo(ini, fim, hora_atual):
                    return True
            return False

    # FORMATO 1 (array por dia da semana)
    if dia_semana >= len(schedule):
        return True

    intervals = schedule[dia_semana]
    if not intervals or not isinstance(intervals, list):
        return False

    for intervalo in intervals:
        if not isinstance(intervalo, list) or len(intervalo) != 2:
            continue
        ini, fim = intervalo
        if _no_intervalo(ini, fim, hora_atual):
            return True

    return False


def ponto_dentro_roi(cx, cy, roi_poly):
    return cv2.pointPolygonTest(roi_poly, (cx, cy), False) >= 0
