import { supabase } from './supabase';
import { ICamera } from '../interfaces/camera.interface';
import { IDetectionZone } from '../interfaces/detection-zone.interface';

type CreateCameraPayload = {
  name: string;
  description?: string;
  severity?: 'low' | 'medium' | 'high';
  rtsp_url: string;
  min_confidence?: number;
  process_every?: number;
  cooldown_seconds?: number;
};

export async function getCameras(): Promise<ICamera[]> {
  try {
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    const user = session?.user;
    if (authError || !user) throw new Error('Usuário não autenticado');

    const { data, error } = await supabase
      .from('cameras')
      .select('*, detection_zones(*)')
      .eq('user_id', user.id)
      .neq('rtsp_url', 'deleted')
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    // Supabase retorna objeto único (1:1) ou array dependendo da FK. Vamos tratar ambos:
    return (data || []).map((d: any) => {
      let roi = undefined;
      if (d.detection_zones) {
        if (Array.isArray(d.detection_zones)) {
          roi = d.detection_zones.length > 0 ? d.detection_zones[0].roi_points : undefined;
        } else {
          roi = d.detection_zones.roi_points;
        }
      }
      return {
        ...d,
        roi_points: roi
      };
    }) as ICamera[];
  } catch (err) {
    console.error('getCameras:', err);
    throw err;
  }
}

export async function getCamera(id: string): Promise<ICamera> {
  try {
    const { data, error } = await supabase
      .from('cameras')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as ICamera;
  } catch (err) {
    console.error('getCamera:', err);
    throw err;
  }
}

export async function createCamera(payload: CreateCameraPayload): Promise<ICamera> {
  try {
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    const user = session?.user;
    if (authError || !user) throw new Error('Usuário não autenticado');

    const { data, error } = await supabase
      .from('cameras')
      .insert({ ...payload, user_id: user.id })
      .select()
      .single();

    if (error) throw error;
    return data as ICamera;
  } catch (err) {
    console.error('createCamera:', err);
    throw err;
  }
}

export async function updateCamera(id: string, payload: Partial<CreateCameraPayload>): Promise<ICamera> {
  try {
    const { data, error } = await supabase
      .from('cameras')
      .update({ ...payload, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as ICamera;
  } catch (err) {
    console.error('updateCamera:', err);
    throw err;
  }
}

export async function deleteCamera(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('cameras')
      .update({ rtsp_url: 'deleted', is_active: false })
      .eq('id', id);

    if (error) throw error;
  } catch (err) {
    console.error('deleteCamera:', err);
    throw err;
  }
}

export async function getCameraWithZone(id: string): Promise<ICamera & { detection_zone: IDetectionZone | null }> {
  try {
    const { data, error } = await supabase
      .from('cameras')
      .select('*, detection_zones(*)')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as ICamera & { detection_zone: IDetectionZone | null };
  } catch (err) {
    console.error('getCameraWithZone:', err);
    throw err;
  }
}
