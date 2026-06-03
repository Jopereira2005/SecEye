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
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    const user = session?.user;
    if (authError || !user) throw new Error('Usuário não autenticado');

    const { data, error } = await supabase
      .from('routines')
      .select('*')
      .eq('user_id', user.id)
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
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    const user = session?.user;
    if (authError || !user) throw new Error('Usuário não autenticado');

    const normalizedPayload = {
      ...payload,
      days_week: payload.repeat_type === 'everyday' ? [0, 1, 2, 3, 4, 5, 6] : (payload.repeat_type === 'weekly' ? payload.days_week : []),
      specific_date: payload.repeat_type !== 'once' ? null : payload.specific_date,
      user_id: user.id,
      is_active: true,
    };

    const { data, error } = await supabase
      .from('routines')
      .insert(normalizedPayload)
      .select()
      .single();

    if (error) {
      if (error.code === '23503') {
        // Se a constraint de foreign key falhar, significa que o ID do usuário não existe mais na tabela (foi deletado)
        await supabase.auth.signOut(); // Isso força o logout no app inteiro
        throw new Error('Sua conta foi excluída ou não existe mais. Faça login novamente.');
      }
      throw error;
    }
    return data as IRoutine;
  } catch (err) {
    console.error('createRoutine:', err);
    throw err;
  }
}

export async function getActiveRoutines(): Promise<IRoutine[]> {
  try {
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    const user = session?.user;
    if (authError || !user) throw new Error('Usuário não autenticado');

    const now = new Date();
    
    // Obter hora local (HH:MM)
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const currentTime = `${hours}:${minutes}`;
    
    // Obter data local (YYYY-MM-DD)
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const today = `${year}-${month}-${day}`;
    
    const dayOfWeek = now.getDay();

    const { data, error } = await supabase
      .from('routines')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true);

    if (error) throw error;

    return (data as IRoutine[]).filter(routine => {
      // Limpar os segundos (ex: "08:00:00" -> "08:00") para comparação
      const inicio = routine.hora_inicio.slice(0, 5);
      const fim = routine.hora_fim.slice(0, 5);
      
      let isTimeValid = false;
      if (inicio <= fim) {
        // Rotina no mesmo dia (ex: 08:00 às 18:00)
        isTimeValid = currentTime >= inicio && currentTime <= fim;
      } else {
        // Rotina cruza a meia-noite (ex: 22:00 às 06:00)
        isTimeValid = currentTime >= inicio || currentTime <= fim;
      }

      if (!isTimeValid) return false;

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
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (err) {
    console.error('deleteRoutine:', err);
    throw err;
  }
}

export async function updateRoutine(id: number, payload: Partial<IRoutine>): Promise<IRoutine> {
  try {
    const { data, error } = await supabase
      .from('routines')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === '23503') {
        await supabase.auth.signOut();
        throw new Error('Sua conta foi excluída ou não existe mais. Faça login novamente.');
      }
      throw error;
    }
    return data as IRoutine;
  } catch (err) {
    console.error('updateRoutine:', err);
    throw err;
  }
}
