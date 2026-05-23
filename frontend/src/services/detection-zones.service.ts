import { supabase } from './supabase';
import { IDetectionZone } from '../interfaces/detection-zone.interface';

type UpsertDetectionZonePayload = {
  camera_id: string;
  name?: string;
  roi_points?: any;
};

export async function getDetectionZone(cameraId: string): Promise<IDetectionZone | null> {
  try {
    const { data, error } = await supabase
      .from('detection_zones')
      .select('*')
      .eq('camera_id', cameraId)
      .maybeSingle();

    if (error) throw error;
    return data as IDetectionZone | null;
  } catch (err) {
    console.error('getDetectionZone:', err);
    throw err;
  }
}

export async function upsertDetectionZone(payload: UpsertDetectionZonePayload): Promise<IDetectionZone> {
  try {
    const { data, error } = await supabase
      .from('detection_zones')
      .upsert(payload, { onConflict: 'camera_id' })
      .select()
      .single();

    if (error) throw error;
    return data as IDetectionZone;
  } catch (err) {
    console.error('upsertDetectionZone:', err);
    throw err;
  }
}

export async function deleteDetectionZone(cameraId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('detection_zones')
      .delete()
      .eq('camera_id', cameraId);

    if (error) throw error;
  } catch (err) {
    console.error('deleteDetectionZone:', err);
    throw err;
  }
}
