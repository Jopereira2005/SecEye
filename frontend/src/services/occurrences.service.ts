import { supabase } from './supabase';
import { IOcurrence } from '../interfaces/ocurrence.interface';

export async function getOccurrences(cameraId: string, limit = 50): Promise<IOcurrence[]> {
  try {
    const { data, error } = await supabase
      .from('occurrences')
      .select('*, camera:cameras(*)')
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
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    const user = session?.user;
    if (authError || !user) throw new Error('Usuário não autenticado');

    const { data, error } = await supabase
      .from('occurrences')
      .select('*, camera:cameras!inner(*)')
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

export async function deleteOccurrences(ids: string[]): Promise<void> {
  try {
    const { error } = await supabase
      .from('occurrences')
      .delete()
      .in('id', ids);

    if (error) throw error;
  } catch (err) {
    console.error('deleteOccurrences:', err);
    throw err;
  }
}
