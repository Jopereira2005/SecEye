import { supabase } from './supabase';
import { IOcurrence } from '../interfaces/ocurrence.interface';

export async function getOccurrences(cameraId: string, limit = 50): Promise<IOcurrence[]> {
  try {
    const { data, error } = await supabase
      .from('occurrences')
      .select('*')
      .eq('camera_id', cameraId)
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data as IOcurrence[];
  } catch (err) {
    console.error('getOccurrences:', err);
    throw err;
  }
}

export async function getRecentOccurrences(limit = 20): Promise<IOcurrence[]> {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error('Usuário não autenticado');

    const { data, error } = await supabase
      .from('occurrences')
      .select('*, cameras!inner(user_id)')
      .eq('cameras.user_id', user.id)
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data as IOcurrence[];
  } catch (err) {
    console.error('getRecentOccurrences:', err);
    throw err;
  }
}
