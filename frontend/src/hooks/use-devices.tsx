import { useEffect, useCallback } from 'react';
import Toast from 'react-native-toast-message';
import { supabase } from '../services/supabase';
import {
  getCameras,
  createCamera,
  updateCamera,
  deleteCamera,
} from '../services/cameras.service';
import { upsertDetectionZone, deleteDetectionZone } from '../services/detection-zones.service';
import type { ICamera } from '../interfaces/camera.interface';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export function useDevices() {
  const queryClient = useQueryClient();

  const { data: devices = [], isLoading: loading, refetch: refresh } = useQuery({
    queryKey: ['devices'],
    queryFn: () => getCameras(),
  });

  useEffect(() => {
    const channelId = `cameras-realtime-${Date.now()}-${Math.random()}`;
    const channel = supabase
      .channel(channelId)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'cameras' }, () => {
        queryClient.invalidateQueries({ queryKey: ['devices'] });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'detection_zones' }, () => {
        queryClient.invalidateQueries({ queryKey: ['devices'] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  // Ligar/Desligar um dispositivo
  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      return updateCamera(id, { is_active } as any);
    },
    onMutate: async ({ id, is_active }) => {
      await queryClient.cancelQueries({ queryKey: ['devices'] });
      const previousDevices = queryClient.getQueryData<ICamera[]>(['devices']);
      
      queryClient.setQueryData<ICamera[]>(['devices'], old => 
        old ? old.map(d => (d.id === id ? { ...d, is_active } : d)) : []
      );
      
      return { previousDevices };
    },
    onError: (err, variables, context) => {
      console.error('Erro ao alternar status:', err);
      Toast.show({ type: 'error', text1: 'Erro', text2: 'Não foi possível alterar o status.' });
      if (context?.previousDevices) {
        queryClient.setQueryData(['devices'], context.previousDevices);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['devices'] });
    }
  });

  const toggleDeviceStatus = useCallback(async (id: string) => {
    const device = devices.find((d) => d.id === id);
    if (!device) return;
    await toggleStatusMutation.mutateAsync({ id, is_active: !device.is_active });
  }, [devices, toggleStatusMutation]);

  // Salva ou Edita um dispositivo
  const saveMutation = useMutation({
    mutationFn: async (payload: Partial<ICamera>) => {
      if (payload.id) {
        if (payload.roi_points && payload.roi_points.length > 0) {
          await upsertDetectionZone({
            camera_id: payload.id,
            roi_points: payload.roi_points,
          });
        } else if (payload.roi_points && payload.roi_points.length === 0) {
          try {
            await deleteDetectionZone(payload.id);
          } catch(e) {}
        }
        return updateCamera(payload.id, {
          name: payload.name || '',
          description: payload.description || undefined,
          severity: payload.severity || undefined,
          rtsp_url: payload.rtsp_url || '',
        });
      } else {
        const novaCamera = await createCamera({
          name: payload.name || 'Nova Câmera',
          description: payload.description || undefined,
          severity: payload.severity || 'low',
          rtsp_url: payload.rtsp_url || '',
        });
        if (payload.roi_points && payload.roi_points.length > 0) {
          await upsertDetectionZone({
            camera_id: novaCamera.id,
            roi_points: payload.roi_points,
          });
        }
        return novaCamera;
      }
    },
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: ['devices'] });
      const previousDevices = queryClient.getQueryData<ICamera[]>(['devices']);
      
      if (payload.id) {
        queryClient.setQueryData<ICamera[]>(['devices'], old => 
          old ? old.map(d => (d.id === payload.id ? { ...d, ...payload } : d)) : []
        );
      }
      return { previousDevices };
    },
    onError: (err, variables, context) => {
      console.error('Erro ao salvar dispositivo:', err);
      Toast.show({ type: 'error', text1: 'Erro', text2: 'Não foi possível salvar o dispositivo.' });
      if (context?.previousDevices) {
        queryClient.setQueryData(['devices'], context.previousDevices);
      }
    },
    onSuccess: () => {
      Toast.show({ type: 'success', text1: 'Sucesso', text2: 'Dispositivo salvo com sucesso!' });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['devices'] });
    }
  });

  const saveDevice = useCallback(async (payload: Partial<ICamera>) => {
    await saveMutation.mutateAsync(payload);
  }, [saveMutation]);

  // Remove o dispositivo
  const removeMutation = useMutation({
    mutationFn: (id: string) => deleteCamera(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['devices'] });
      const previousDevices = queryClient.getQueryData<ICamera[]>(['devices']);
      
      queryClient.setQueryData<ICamera[]>(['devices'], old => 
        old ? old.filter(d => d.id !== id) : []
      );
      return { previousDevices };
    },
    onError: (err, variables, context) => {
      console.error('Erro ao excluir dispositivo:', err);
      Toast.show({ type: 'error', text1: 'Erro', text2: 'Não foi possível excluir o dispositivo.' });
      if (context?.previousDevices) {
        queryClient.setQueryData(['devices'], context.previousDevices);
      }
    },
    onSuccess: () => {
      Toast.show({ type: 'success', text1: 'Sucesso', text2: 'Dispositivo excluído.' });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['devices'] });
    }
  });

  const removeDevice = useCallback(async (id: string) => {
    await removeMutation.mutateAsync(id);
  }, [removeMutation]);

  return {
    devices,
    loading,
    refresh,
    toggleDeviceStatus,
    saveDevice,
    removeDevice,
  };
}
