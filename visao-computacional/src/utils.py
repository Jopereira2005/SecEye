"""Helpers puros: tempo, schedule e geometria."""
from datetime import datetime, timezone

import cv2


def agora_utc():
    return datetime.now(timezone.utc)


def hora_permitida(schedule):
    """
    Verifica se o horário atual está dentro dos intervalos permitidos.

    FORMATO 1 (7 arrays, um por dia da semana):
        [[["00:00","11:59"], ["12:00","23:59"]], ...]  # 7 listas

    FORMATO 2 (lista plana de intervalos, mesmo horário todos os dias):
        [["00:00","05:59"], ["19:00","23:59"], ...]

    FORMATO 3 (lista de rotinas do banco - tabela routines):
        [{"start_time": "08:00:00", "end_time": "18:00:00",
          "days_of_week": [0,1,2,3,4], "is_active": True}, ...]
        (0=Segunda, 6=Domingo — mesma convenção do Python weekday())
    """
    if not schedule:
        return True

    if not isinstance(schedule, list) or len(schedule) == 0:
        return True

    now = datetime.now()
    dia_semana = now.weekday()  # 0=Segunda, 6=Domingo
    hora_atual = now.strftime("%H:%M")

    # Formato 3: lista de rotinas do banco (tabela routines)
    # campos: hora_inicio (time), hora_fim (time), days_week (int[])
    if isinstance(schedule[0], dict) and 'hora_inicio' in schedule[0]:
        for rotina in schedule:
            days = rotina.get('days_week') or []
            if dia_semana not in days:
                continue
            ini = str(rotina.get('hora_inicio', ''))[:5]  # "HH:MM:SS" → "HH:MM"
            fim = str(rotina.get('hora_fim', ''))[:5]
            if ini and fim and ini <= hora_atual <= fim:
                return True
        return False

    if isinstance(schedule[0], list):
        if len(schedule[0]) == 2 and isinstance(schedule[0][0], str):
            # Formato 2 plano
            for intervalo in schedule:
                if not isinstance(intervalo, list) or len(intervalo) != 2:
                    continue
                ini, fim = intervalo
                if ini <= hora_atual <= fim:
                    return True
            return False

    # Formato 1: array por dia da semana
    if dia_semana >= len(schedule):
        return True

    intervals = schedule[dia_semana]
    if not intervals or not isinstance(intervals, list):
        return False

    for intervalo in intervals:
        if not isinstance(intervalo, list) or len(intervalo) != 2:
            continue
        ini, fim = intervalo
        if ini <= hora_atual <= fim:
            return True

    return False


def ponto_dentro_roi(cx, cy, roi_poly):
    return cv2.pointPolygonTest(roi_poly, (cx, cy), False) >= 0
