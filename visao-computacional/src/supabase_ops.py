"""Operações Supabase: carregamento de câmeras e transições atômicas de status."""
import threading
import time
import traceback

from . import config, state
from .utils import agora_utc


def _normalizar_camera(cam, routines_by_user=None):
    """
    Adapta um dict de câmera do schema real para os nomes usados internamente.

    Schema real:
      cameras:         rtsp_url, name, min_confidence, process_every, cooldown_seconds
      detection_zones: roi_points (1:1 com câmera)
      routines:        hora_inicio, hora_fim, days_week (por user_id, não por camera_id)
      alarms:          is_active (sem webhook_url)
    """
    # 'nome' é o alias interno; o campo real é 'name'
    cam['nome'] = cam.get('name', '')

    # Detection zones (1:1) — campo é roi_points
    zones = cam.pop('detection_zones', []) or []
    first_zone = zones[0] if zones else None
    cam['roi_points'] = first_zone.get('roi_points') if first_zone else None
    cam['detection_zone_id'] = first_zone.get('id') if first_zone else None
    cam['detection_zones'] = zones

    # Routines são por user_id, passadas como dict externo
    if routines_by_user is not None:
        uid = cam.get('user_id')
        cam['schedule'] = routines_by_user.get(uid, [])
    else:
        cam.setdefault('schedule', [])

    # Alarms — sem webhook_url no schema; apenas flag is_active
    alarms = cam.pop('alarms', []) or []
    cam['alarms'] = [a for a in alarms if a.get('is_active', True)]
    cam['trigger_url'] = None  # alarms não tem webhook_url

    return cam


def _fetch_routines_by_user():
    """Retorna dict {user_id: [routines...]} com todas as rotinas ativas."""
    try:
        res = state.supabase.table("routines").select("*").execute()
        by_user = {}
        for r in res.data:
            uid = r.get('user_id')
            if uid not in by_user:
                by_user[uid] = []
            by_user[uid].append(r)
        return by_user
    except Exception as e:
        print(f">>   [WARN] Erro ao carregar rotinas: {e}")
        return {}


def _fetch_zones_by_camera(cam_ids):
    """Retorna dict {camera_id: zone_dict} (1:1)."""
    if not cam_ids:
        return {}
    try:
        res = state.supabase.table("detection_zones").select("*").in_("camera_id", cam_ids).execute()
        return {z['camera_id']: z for z in res.data}
    except Exception as e:
        print(f">>   [WARN] Erro ao carregar detection_zones: {e}")
        return {}


def _fetch_alarms_by_camera(cam_ids):
    """Retorna dict {camera_id: [alarms...]}."""
    if not cam_ids:
        return {}
    try:
        res = state.supabase.table("alarms").select("*").in_("camera_id", cam_ids).execute()
        by_cam = {}
        for a in res.data:
            cid = a['camera_id']
            by_cam.setdefault(cid, []).append(a)
        return by_cam
    except Exception as e:
        print(f">>   [WARN] Erro ao carregar alarms: {e}")
        return {}


def carregar_cameras():
    erro_key = "carregar_cameras"

    try:
        # Câmeras ativas
        res = state.supabase.table("cameras").select("*").eq("is_active", True).execute()
        cameras_raw = res.data
        print(f">> [OK] {len(cameras_raw)} cameras ativas encontradas no banco")

        if not cameras_raw:
            state.erros_supabase[erro_key] = 0
            return []

        cam_ids = [c['id'] for c in cameras_raw]

        # Queries separadas (evita PGRST125 do nested select)
        zones_by_cam  = _fetch_zones_by_camera(cam_ids)
        alarms_by_cam = _fetch_alarms_by_camera(cam_ids)
        routines_by_user = _fetch_routines_by_user()

        cameras_validas = []
        for cam in cameras_raw:
            if not cam.get("rtsp_url"):
                print(f">>   [SKIP] Camera {cam.get('name', cam.get('id'))} sem rtsp_url")
                continue

            cid = cam['id']
            zone = zones_by_cam.get(cid)
            cam['detection_zones'] = [zone] if zone else []
            cam['alarms'] = alarms_by_cam.get(cid, [])

            cam = _normalizar_camera(cam, routines_by_user)
            cameras_validas.append(cam)

        skipped = len(cameras_raw) - len(cameras_validas)
        if skipped:
            print(f">>   [INFO] {skipped} cameras ignoradas (sem rtsp_url)")

        if erro_key in state.erros_supabase and state.erros_supabase[erro_key] > 0:
            print(">> [OK] Conexao Supabase restaurada")
        state.erros_supabase[erro_key] = 0

        return cameras_validas

    except Exception as e:
        state.erros_supabase[erro_key] = state.erros_supabase.get(erro_key, 0) + 1
        if state.erros_supabase[erro_key] == 1 or state.erros_supabase[erro_key] % 5 == 0:
            print(f">>   Erro ao carregar cameras (x{state.erros_supabase[erro_key]}): {e}")
            if state.erros_supabase[erro_key] == 1:
                print("   (tentando novamente... erros subsequentes mostrados a cada 5 tentativas)")
        return []


def carregar_camera_completa(camera_id):
    """Carrega câmera única com detection_zones, alarms e rotinas do usuário."""
    try:
        res = state.supabase.table("cameras").select("*").eq("id", str(camera_id)).execute()
        if not res.data:
            return None

        cam = res.data[0]
        cid = cam['id']

        zones_by_cam  = _fetch_zones_by_camera([cid])
        alarms_by_cam = _fetch_alarms_by_camera([cid])

        zone = zones_by_cam.get(cid)
        cam['detection_zones'] = [zone] if zone else []
        cam['alarms'] = alarms_by_cam.get(cid, [])

        routines_by_user = {}
        uid = cam.get('user_id')
        if uid:
            r_res = state.supabase.table("routines").select("*").eq("user_id", uid).execute()
            routines_by_user[uid] = r_res.data

        return _normalizar_camera(cam, routines_by_user)
    except Exception as e:
        print(f">>   Erro ao carregar camera {camera_id}: {e}")
        return None


_TEMPORARY_ERRORS = [
    '502', '503', '504', 'bad gateway', 'service unavailable',
    'timeout', 'timed out', 'connection reset', 'connection refused',
    'broken pipe', 'server disconnected', 'eof', 'network unreachable',
    'connection aborted'
]


def _is_temporary_error(err_str: str) -> bool:
    return any(x in err_str for x in _TEMPORARY_ERRORS)


def atualizar_status_async(camera_id, **fields):
    """Atualizar status em thread separada para nao travar."""
    from .webhooks import iniciar_webhook_timer, cancelar_webhook_timer

    def _update():
        erro_key = f"status_{camera_id}"
        max_retries = config.SUPABASE_RETRY_MAX
        retry_delay = config.SUPABASE_RETRY_DELAY_INITIAL

        for tentativa in range(max_retries):
            try:
                fields["updated_at"] = agora_utc().isoformat()

                state.supabase.table("cameras").update(fields).eq("id", camera_id).execute()

                if camera_id in state.camera_configs:
                    state.camera_configs[camera_id].update(fields)

                if "status" in fields:
                    state.camera_last_status_update[camera_id] = time.time()

                if "status" in fields:
                    camera_data = state.camera_configs.get(camera_id)
                    if camera_data:
                        if fields["status"] == "offline":
                            iniciar_webhook_timer(camera_id, camera_data)
                        elif fields["status"] == "online":
                            cancelar_webhook_timer(camera_id, camera_data)

                if erro_key in state.erros_supabase:
                    if state.erros_supabase[erro_key] > 0:
                        cameras_nome = state.camera_configs.get(camera_id, {}).get('nome', camera_id)
                        print(f">> [OK] Conexao Supabase restaurada para {cameras_nome}")
                    state.erros_supabase[erro_key] = 0

                return

            except Exception as e:
                erro_str = str(e).lower()
                is_temporary = _is_temporary_error(erro_str)

                if is_temporary and tentativa < max_retries - 1:
                    tentativa_num = tentativa + 1
                    cameras_nome = state.camera_configs.get(camera_id, {}).get('nome', 'Desconhecida')

                    if tentativa_num % 2 == 0 or tentativa_num == 1:
                        print(f">> [RETRY] Tentativa {tentativa_num}/{max_retries} para {cameras_nome} (aguardando {retry_delay}s)...")

                    time.sleep(retry_delay)
                    retry_delay = min(retry_delay * 2, config.SUPABASE_RETRY_DELAY_MAX)
                    continue

                state.erros_supabase[erro_key] = state.erros_supabase.get(erro_key, 0) + 1
                camera_nome = state.camera_configs.get(camera_id, {}).get('nome', 'Desconhecida')

                if state.erros_supabase[erro_key] == 1 or state.erros_supabase[erro_key] % 15 == 0:
                    tipo_erro = "temporário (network)" if is_temporary else "persistente"
                    print(f"\n>> [ERRO SUPABASE] Falha ao atualizar status: {camera_nome}")
                    print(f">>   Camera ID: {camera_id}")
                    print(f">>   Tipo: {tipo_erro}")
                    print(f">>   Tentativas feitas: {max_retries}")
                    print(f">>   Erro: {type(e).__name__}: {str(e)[:100]}")
                    if state.erros_supabase[erro_key] == 1:
                        print(">>   (próximos erros serão mostrados a cada 15 tentativas)\n")
                break

    threading.Thread(target=_update, daemon=True).start()


def set_camera_online(camera_id, camera_name="Unknown"):
    """ATOMIC: marca câmera online. Bloqueante; retorna True/False."""
    from .webhooks import cancelar_webhook_timer

    try:
        max_retries = config.SUPABASE_RETRY_MAX
        retry_delay = config.SUPABASE_RETRY_DELAY_INITIAL
        success = False
        last_error = None
        update_data = {}

        for tentativa in range(max_retries):
            try:
                update_data = {
                    "status": "online",
                    "updated_at": agora_utc().isoformat()
                }
                state.supabase.table("cameras").update(update_data).eq("id", camera_id).execute()
                success = True
                break
            except Exception as e:
                last_error = e
                if tentativa < max_retries - 1 and _is_temporary_error(str(e).lower()):
                    time.sleep(retry_delay)
                    retry_delay = min(retry_delay * 2, config.SUPABASE_RETRY_DELAY_MAX)
                    continue
                break

        if not success:
            print(f"\n>> [CRITICAL] Failed to set camera ONLINE: {camera_name} (ID: {camera_id})")
            print(f">>   Error: {last_error}")
            return False

        if camera_id in state.camera_configs:
            state.camera_configs[camera_id]["status"] = "online"
            state.camera_configs[camera_id]["updated_at"] = update_data["updated_at"]

        state.camera_last_status_update[camera_id] = time.time()

        camera_data = state.camera_configs.get(camera_id)
        if camera_data:
            cancelar_webhook_timer(camera_id, camera_data)

        erro_key = f"status_{camera_id}"
        if erro_key in state.erros_supabase:
            if state.erros_supabase[erro_key] > 0:
                print(f">> [OK] Camera {camera_name}: Supabase errors cleared")
            state.erros_supabase[erro_key] = 0

        return True

    except Exception as e:
        print(f"\n>> [CRITICAL] set_camera_online exception: {camera_name} — {e}")
        traceback.print_exc()
        return False


def set_camera_offline(camera_id, camera_name="Unknown", reason="connection_lost"):
    """ATOMIC: marca câmera offline. Bloqueante; retorna True/False."""
    from .webhooks import iniciar_webhook_timer

    try:
        if state.camera_paused_by_schedule.get(camera_id, False):
            return True

        max_retries = config.SUPABASE_RETRY_MAX
        retry_delay = config.SUPABASE_RETRY_DELAY_INITIAL
        success = False
        last_error = None
        update_data = {}

        for tentativa in range(max_retries):
            try:
                update_data = {
                    "status": "offline",
                    "updated_at": agora_utc().isoformat()
                }
                state.supabase.table("cameras").update(update_data).eq("id", camera_id).execute()
                success = True
                break
            except Exception as e:
                last_error = e
                if tentativa < max_retries - 1 and _is_temporary_error(str(e).lower()):
                    time.sleep(retry_delay)
                    retry_delay = min(retry_delay * 2, config.SUPABASE_RETRY_DELAY_MAX)
                    continue
                break

        if not success:
            print(f"\n>> [WARN] Failed to set camera OFFLINE: {camera_name} — reason: {reason}")
            print(f">>   Error: {last_error}")
            return False

        if camera_id in state.camera_configs:
            state.camera_configs[camera_id]["status"] = "offline"
            state.camera_configs[camera_id]["updated_at"] = update_data["updated_at"]

        state.camera_last_status_update[camera_id] = time.time()

        camera_data = state.camera_configs.get(camera_id)
        if camera_data:
            iniciar_webhook_timer(camera_id, camera_data)

        return True

    except Exception as e:
        print(f"\n>> [WARN] set_camera_offline exception: {camera_name} — {e}")
        traceback.print_exc()
        return False
