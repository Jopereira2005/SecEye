import { supabase } from './supabase';
import { IAlarm } from '../interfaces/alarm.interface';

export async function getAlarm(cameraId: string): Promise<IAlarm | null> {
  try {
    const { data, error } = await supabase
      .from('alarms')
      .select('*')
      .eq('camera_id', cameraId)
      .maybeSingle();

    if (error) throw error;
    return data as IAlarm | null;
  } catch (err) {
    console.error('getAlarm:', err);
    throw err;
  }
}

export async function activateAlarm(cameraId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('alarms')
      .update({ is_active: true })
      .eq('camera_id', cameraId);

    if (error) throw error;
  } catch (err) {
    console.error('activateAlarm:', err);
    throw err;
  }
}

export async function deactivateAlarm(cameraId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('alarms')
      .update({ is_active: false })
      .eq('camera_id', cameraId);

    if (error) throw error;
  } catch (err) {
    console.error('deactivateAlarm:', err);
    throw err;
  }
}
