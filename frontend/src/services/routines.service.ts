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
