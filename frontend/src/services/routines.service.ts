import { supabase } from './supabase';
import { IRoutine } from '../interfaces/routine.interface';

type CreateRoutinePayload = {
  description?: string;
  hora_inicio: string;
  hora_fim: string;
  repeat_type: 'once' | 'everyday' | 'weekly';
  days_week: number[];
  specific_date: string | null;
};

export async function getRoutines(): Promise<IRoutine[]> {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error('Usuário não autenticado');

    const { data, error } = await supabase
      .from('routines')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('hora_inicio', { ascending: true });

    if (error) throw error;
    return data as IRoutine[];
  } catch (err) {
    console.error('getRoutines:', err);
    throw err;
  }
}

export async function createRoutine(payload: CreateRoutinePayload): Promise<IRoutine> {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error('Usuário não autenticado');

    const normalizedPayload = {
      ...payload,
      days_week: payload.repeat_type !== 'weekly' ? [] : payload.days_week,
      specific_date: payload.repeat_type !== 'once' ? null : payload.specific_date,
      user_id: user.id,
      is_active: true,
    };

    const { data, error } = await supabase
      .from('routines')
      .insert(normalizedPayload)
      .select()
      .single();

    if (error) throw error;
    return data as IRoutine;
  } catch (err) {
    console.error('createRoutine:', err);
    throw err;
  }
}

export async function getActiveRoutines(): Promise<IRoutine[]> {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error('Usuário não autenticado');

    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5); // "HH:MM"
    const today = now.toISOString().split('T')[0];      // "YYYY-MM-DD"
    const dayOfWeek = now.getDay();                     // 0 = domingo

    const { data, error } = await supabase
      .from('routines')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .lte('hora_inicio', currentTime)
      .gte('hora_fim', currentTime);

    if (error) throw error;

    return (data as IRoutine[]).filter(routine => {
      if (routine.repeat_type === 'everyday') return true;
      if (routine.repeat_type === 'weekly') return routine.days_week.includes(dayOfWeek);
      if (routine.repeat_type === 'once') return routine.specific_date === today;
      return false;
    });
  } catch (err) {
    console.error('getActiveRoutines:', err);
    throw err;
  }
}

export async function deleteRoutine(id: number): Promise<void> {
  try {
    const { error } = await supabase
      .from('routines')
      .update({ is_active: false })
      .eq('id', id);

    if (error) throw error;
  } catch (err) {
    console.error('deleteRoutine:', err);
    throw err;
  }
}
