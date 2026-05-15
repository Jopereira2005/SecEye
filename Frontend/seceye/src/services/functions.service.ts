import type { Occurrence } from '../types/supabase';
import { supabase } from './supabase';

export interface GetOccurrencesResponse {
  occurrences: Occurrence[];
}

export interface DeactivateAlarmResponse {
  success: boolean;
  camera_id: string;
}

export async function getOccurrences(
  cameraId: string,
  limit?: number
): Promise<GetOccurrencesResponse> {
  try {
    const { data, error } = await supabase.functions.invoke<GetOccurrencesResponse>(
      'get-occurrences',
      {
        body: { camera_id: cameraId, limit },
      }
    );

    if (error) {
      console.error('getOccurrences error:', error);
      throw error;
    }

    return data ?? { occurrences: [] };
  } catch (error) {
    console.error('getOccurrences exception:', error);
    throw error;
  }
}

export async function deactivateAlarm(cameraId: string): Promise<DeactivateAlarmResponse> {
  try {
    const { data, error } = await supabase.functions.invoke<DeactivateAlarmResponse>(
      'deactivate-alarm',
      {
        body: { camera_id: cameraId },
      }
    );

    if (error) {
      console.error('deactivateAlarm error:', error);
      throw error;
    }

    if (!data) {
      throw new Error('Resposta vazia da edge function deactivate-alarm.');
    }

    return data;
  } catch (error) {
    console.error('deactivateAlarm exception:', error);
    throw error;
  }
}
