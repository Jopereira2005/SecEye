import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabase';
import { getActiveRoutines } from '../services/routines.service';
import type { IRoutine } from '../interfaces/routine.interface';

export function useActiveRoutines() {
  const [activeRoutines, setActiveRoutines] = useState<IRoutine[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const data = await getActiveRoutines();
      setActiveRoutines(data);
    } catch {
      setActiveRoutines([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();

    // Recarrega quando qualquer rotina do usuário for criada/alterada/removida
    const channel = supabase
      .channel('active-routines-watch')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'routines' }, refresh)
      .subscribe();

    // Recarrega a cada minuto para capturar início/fim de janela de horário
    const interval = setInterval(refresh, 60_000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [refresh]);

  return {
    activeRoutines,
    isSystemActive: activeRoutines.length > 0,
    loading,
  };
}
