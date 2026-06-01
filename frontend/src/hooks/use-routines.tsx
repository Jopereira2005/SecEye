import { useState, useEffect, useCallback, useMemo } from 'react';
import { useFocusEffect } from 'expo-router';
import Toast from 'react-native-toast-message';
import { supabase } from '../services/supabase';
import {
  getRoutines,
  createRoutine,
  updateRoutine,
  deleteRoutine,
} from '../services/routines.service';
import type { IRoutine } from '../interfaces/routine.interface';

export function useRoutines() {
  const [routines, setRoutines] = useState<IRoutine[]>([]);
  const [loading, setLoading] = useState(true);

  // Deriva as rotinas ativas localmente baseado apenas no toggle (is_active)
  const activeRoutines = useMemo(() => {
    return routines.filter(r => r.is_active);
  }, [routines]);

  // Recarrega todos os dados de rotinas
  const refresh = useCallback(async () => {
    try {
      const allData = await getRoutines();
      setRoutines(allData);
    } catch (err) {
      console.error('Erro ao buscar rotinas:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();

    // Recarrega quando qualquer rotina do usuário for criada/alterada/removida
    const channelId = `routines-realtime-${Date.now()}-${Math.random()}`;
    const channel = supabase
      .channel(channelId)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'routines' }, () => {
        refresh();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refresh]);

  // Recarrega as rotinas toda vez que a tela ganha foco (navegação entre abas)
  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  // Função para alternar o status de uma rotina (Toggle)
  const toggleRoutine = useCallback(async (id: number) => {
    const routine = routines.find((r) => r.id === id);
    if (!routine) return;

    try {
      // Atualização otimista local das rotinas normais
      setRoutines((prev) =>
        prev.map((r) => (r.id === id ? { ...r, is_active: !r.is_active } : r))
      );
      await updateRoutine(id, { is_active: !routine.is_active });
    } catch (error) {
      console.error('Erro ao alternar status da rotina:', error);
      Toast.show({ type: 'error', text1: 'Erro', text2: 'Não foi possível alterar o status da rotina.' });
      refresh(); // Desfaz em caso de erro
    }
  }, [routines, refresh]);

  // Função para criar ou atualizar rotina
  const saveRoutine = useCallback(async (savedRoutine: Partial<IRoutine>) => {
    try {
      if (savedRoutine.id) {
        // Otimista para edição
        setRoutines((prev) =>
          prev.map((r) => (r.id === savedRoutine.id ? { ...r, ...savedRoutine } : r))
        );
        await updateRoutine(savedRoutine.id, savedRoutine);
      } else {
        await createRoutine({
          description: savedRoutine.description || undefined,
          hora_inicio: savedRoutine.hora_inicio!,
          hora_fim: savedRoutine.hora_fim!,
          repeat_type: savedRoutine.repeat_type!,
          days_week: savedRoutine.days_week || [],
          specific_date: savedRoutine.specific_date || null,
        });
        refresh(); // Atualiza a lista imediatamente após criar
      }
      Toast.show({ type: 'success', text1: 'Sucesso', text2: 'Rotina salva com sucesso!' });
    } catch (error) {
      console.error('Erro ao salvar rotina:', error);
      Toast.show({ type: 'error', text1: 'Erro', text2: 'Não foi possível salvar a rotina.' });
      refresh();
    }
  }, [refresh]);

  // Função para excluir uma rotina
  const removeRoutine = useCallback(async (id: number) => {
    try {
      // Otimista
      setRoutines((prev) => prev.filter((r) => r.id !== id));
      await deleteRoutine(id);
      Toast.show({ type: 'success', text1: 'Sucesso', text2: 'Rotina excluída.' });
    } catch (error) {
      console.error('Erro ao excluir rotina:', error);
      Toast.show({ type: 'error', text1: 'Erro', text2: 'Não foi possível excluir a rotina.' });
      refresh();
    }
  }, [refresh]);

  return {
    routines,
    activeRoutines,
    isSystemActive: activeRoutines.length > 0,
    loading,
    refresh,
    toggleRoutine,
    saveRoutine,
    removeRoutine,
  };
}
