import { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import Toast from 'react-native-toast-message';
import { supabase } from '../services/supabase';
import {
  getCameras,
  createCamera,
  updateCamera,
  deleteCamera,
} from '../services/cameras.service';
import { upsertDetectionZone } from '../services/detection-zones.service';
import type { ICamera } from '../interfaces/camera.interface';

export function useDevices() {
  const [devices, setDevices] = useState<ICamera[]>([]);
  const [loading, setLoading] = useState(true);

  // Busca todos os dispositivos no servidor
  const refresh = useCallback(async () => {
    try {
      // Por enquanto, "dispositivos" equivalem às câmeras na regra de negócios da dashboard.
      const allCameras = await getCameras();
      setDevices(allCameras);
    } catch (err) {
      console.error('Erro ao buscar dispositivos:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();

    // Inscrição Realtime no Supabase para a tabela 'cameras'
    const channelId = `cameras-realtime-${Date.now()}-${Math.random()}`;
    const channel = supabase
      .channel(channelId)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'cameras' }, () => {
        refresh(); // Atualiza a lista quando houver alterações de outros clientes ou do backend
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'detection_zones' }, () => {
        refresh(); 
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refresh]);

  // Atualiza ao ganhar foco (útil ao navegar pelas tabs)
  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  // Ligar/Desligar um dispositivo
  const toggleDeviceStatus = useCallback(async (id: string) => {
    const device = devices.find((d) => d.id === id);
    if (!device) return;

    try {
      // Otimista
      setDevices((prev) =>
        prev.map((d) => (d.id === id ? { ...d, is_active: !d.is_active } : d))
      );
      await updateCamera(id, { is_active: !device.is_active } as any); // Usamos o "as any" pois a tipagem da service pode divergir levemente
    } catch (error) {
      console.error('Erro ao alternar status do dispositivo:', error);
      Toast.show({ type: 'error', text1: 'Erro', text2: 'Não foi possível alterar o status do dispositivo.' });
      refresh();
    }
  }, [devices, refresh]);

  // Salva ou Edita um dispositivo
  const saveDevice = useCallback(async (payload: Partial<ICamera>) => {
    try {
      if (payload.id) {
        // Atualiza
        setDevices((prev) =>
          prev.map((d) => (d.id === payload.id ? { ...d, ...payload } : d))
        );
        // Salvar ROI na tabela correta ANTES da câmera para que o webhook da câmera puxe os dados finais
        if (payload.roi_points && payload.roi_points.length > 0) {
          await upsertDetectionZone({
            camera_id: payload.id,
            roi_points: payload.roi_points,
          });
        }

        await updateCamera(payload.id, {
          name: payload.name || '',
          description: payload.description || undefined,
          severity: payload.severity || undefined,
          rtsp_url: payload.rtsp_url || '',
        });
      } else {
        // Cria
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
      }
      
      // Forçar atualização total para evitar dessincronização
      await refresh();
      Toast.show({ type: 'success', text1: 'Sucesso', text2: 'Dispositivo salvo com sucesso!' });
    } catch (error) {
      console.error('Erro ao salvar dispositivo:', error);
      Toast.show({ type: 'error', text1: 'Erro', text2: 'Não foi possível salvar o dispositivo.' });
      refresh();
    }
  }, [refresh]);

  // Remove o dispositivo
  const removeDevice = useCallback(async (id: string) => {
    try {
      // Otimista
      setDevices((prev) => prev.filter((d) => d.id !== id));
      await deleteCamera(id);
      Toast.show({ type: 'success', text1: 'Sucesso', text2: 'Dispositivo excluído.' });
    } catch (error) {
      console.error('Erro ao excluir dispositivo:', error);
      Toast.show({ type: 'error', text1: 'Erro', text2: 'Não foi possível excluir o dispositivo.' });
      refresh();
    }
  }, [refresh]);

  return {
    devices,
    loading,
    refresh,
    toggleDeviceStatus,
    saveDevice,
    removeDevice,
  };
}
