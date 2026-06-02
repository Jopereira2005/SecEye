import { useEffect } from 'react';
import { IOcurrence } from '@/interfaces/ocurrence.interface';
import { getRecentOccurrences, deleteOccurrences as deleteOccurrencesService } from '@/services/occurrences.service';
import { supabase } from '@/services/supabase';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';

export function useOccurrences() {
  const queryClient = useQueryClient();

  const { data: occurrences = [], isLoading: loading, refetch: refresh } = useQuery({
    queryKey: ['occurrences'],
    queryFn: () => getRecentOccurrences(100),
  });

  // Assinar mudanças no banco de dados
  useEffect(() => {
    const channelId = `occurrences-realtime-${Date.now()}-${Math.random()}`;
    const channel = supabase
      .channel(channelId)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'occurrences' }, () => {
        // Invalida o cache e força o React Query a buscar novos dados transparentemente
        queryClient.invalidateQueries({ queryKey: ['occurrences'] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const deleteMutation = useMutation({
    mutationFn: (ids: string[]) => deleteOccurrencesService(ids),
    onMutate: async (ids) => {
      await queryClient.cancelQueries({ queryKey: ['occurrences'] });
      const previousOccurrences = queryClient.getQueryData<IOcurrence[]>(['occurrences']);
      
      // Optimistic update
      queryClient.setQueryData<IOcurrence[]>(['occurrences'], old => 
        old ? old.filter(o => !ids.includes(o.id)) : []
      );
      
      return { previousOccurrences };
    },
    onError: (err, ids, context) => {
      console.error('Erro ao deletar occurrences:', err);
      Toast.show({ type: 'error', text1: 'Erro', text2: 'Não foi possível apagar a ocorrência.' });
      if (context?.previousOccurrences) {
        queryClient.setQueryData(['occurrences'], context.previousOccurrences);
      }
    },
    onSuccess: (data, ids) => {
      Toast.show({ type: 'success', text1: 'Sucesso', text2: ids.length > 1 ? 'Ocorrências apagadas.' : 'Ocorrência apagada.' });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['occurrences'] });
    }
  });

  const removeOccurrences = async (ids: string[]) => {
    await deleteMutation.mutateAsync(ids);
  };

  return {
    occurrences,
    loading,
    refresh,
    removeOccurrences,
  };
}
