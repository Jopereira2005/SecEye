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
    // Check if zone already exists for this camera
    const { data: existing, error: checkError } = await supabase
      .from('detection_zones')
      .select('id')
      .eq('camera_id', payload.camera_id)
      .maybeSingle();

    if (checkError) throw checkError;

    let result;
    if (existing && existing.id) {
      // Update
      const { data, error } = await supabase
        .from('detection_zones')
        .update(payload)
        .eq('id', existing.id)
        .select()
        .single();
      if (error) throw error;
      result = data;
    } else {
      // Insert
      const { data, error } = await supabase
        .from('detection_zones')
        .insert(payload)
        .select()
        .single();
      if (error) throw error;
      result = data;
    }

    return result as IDetectionZone;
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
