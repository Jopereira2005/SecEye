import { useState, useEffect, useCallback } from 'react';
import { IOcurrence } from '@/interfaces/ocurrence.interface';
import { getRecentOccurrences, deleteOccurrences as deleteOccurrencesService } from '@/services/occurrences.service';
import { supabase } from '@/services/supabase';
import { useFocusEffect } from 'expo-router';
import Toast from 'react-native-toast-message';

export function useOccurrences() {
  const [occurrences, setOccurrences] = useState<IOcurrence[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      // Buscar até 100 mais recentes para permitir filtros locais robustos
      const data = await getRecentOccurrences(100);
      setOccurrences(data);
    } catch (err) {
      console.error('Erro ao buscar occurrences:', err);
      Toast.show({ type: 'error', text1: 'Erro', text2: 'Falha ao buscar ocorrências recentes.' });
    } finally {
      setLoading(false);
    }
  }, []);

  // Forçar atualização quando a aba ganha foco
  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  useEffect(() => {
    refresh();

    // Assinar mudanças no banco de dados
    const channelId = `occurrences-realtime-${Date.now()}-${Math.random()}`;
    const channel = supabase
      .channel(channelId)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'occurrences' }, () => {
        refresh();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refresh]);

  const removeOccurrences = async (ids: string[]) => {
    try {
      // Optimistic update
      setOccurrences(prev => prev.filter(o => !ids.includes(o.id)));
      await deleteOccurrencesService(ids);
      Toast.show({ type: 'success', text1: 'Sucesso', text2: ids.length > 1 ? 'Ocorrências apagadas.' : 'Ocorrência apagada.' });
    } catch (err) {
      console.error('Erro ao deletar occurrences:', err);
      Toast.show({ type: 'error', text1: 'Erro', text2: 'Não foi possível apagar a ocorrência.' });
      // Reverter em caso de erro
      refresh();
    }
  };

  return {
    occurrences,
    loading,
    refresh,
    removeOccurrences,
  };
}
