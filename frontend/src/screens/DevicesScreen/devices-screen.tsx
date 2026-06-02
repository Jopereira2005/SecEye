import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Camera, BellDot, PlusCircle, PenTool } from 'lucide-react-native';
import Toast from 'react-native-toast-message';

import { styles } from './devices-screen.styles';
import { CustomColors } from '@/constants/theme';
import { Button } from '@/components/Button/button';
import { DeviceCard } from '@/components/DeviceCard/device-card';
import { DeviceModal } from '@/components/DeviceModal/device-modal';
import { CameraViewerModal } from '@/components/CameraViewer/camera-viewer-modal';
import { ICamera } from '@/interfaces/camera.interface';

import { useDevices } from '@/hooks/use-devices';

export function DevicesScreen() {
  const [activeTab, setActiveTab] = useState<'cameras' | 'alarms'>('cameras');
  
  const { devices: cameras, loading, saveDevice, removeDevice, toggleDeviceStatus } = useDevices();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingCamera, setEditingCamera] = useState<ICamera | null>(null);
  const [isViewerVisible, setIsViewerVisible] = useState(false);
  const [viewingCamera, setViewingCamera] = useState<ICamera | null>(null);

  const handleTabPress = (tab: 'cameras' | 'alarms') => {
    setActiveTab(tab);
  };

  const handleAddCamera = () => {
    setEditingCamera(null);
    setIsModalVisible(true);
  };

  const handleEditCamera = (cam: Partial<ICamera>) => {
    setEditingCamera(cam as ICamera);
    setIsModalVisible(true);
  };

  const handleViewCamera = (cam: Partial<ICamera>) => {
    setViewingCamera(cam as ICamera);
    setIsViewerVisible(true);
  };

  const handleToggleStatus = (id: string) => {
    toggleDeviceStatus(id);
  };

  const handleSaveCamera = async (device: Partial<ICamera>) => {
    await saveDevice(device);
    setIsModalVisible(false);
  };

  const handleDeleteCamera = async (id: string) => {
    await removeDevice(id);
    setIsModalVisible(false);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.pageTitle}>Dispositivos</Text>
        <Text style={styles.pageSubtitle}>
          Gerencie as câmeras e alarmes da sua residência.
        </Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'cameras' && styles.tabButtonActive]}
          onPress={() => handleTabPress('cameras')}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabText, activeTab === 'cameras' && styles.tabTextActive]}>Câmeras</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'alarms' && styles.tabButtonActive]}
          onPress={() => handleTabPress('alarms')}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabText, activeTab === 'alarms' && styles.tabTextActive]}>Alarmes</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
        {activeTab === 'cameras' ? (
          cameras.length > 0 ? (
            cameras.map(cam => (
              <DeviceCard 
                key={cam.id}
                type="camera"
                device={cam}
                onPress={() => handleViewCamera(cam)}
                onLongPress={() => handleEditCamera(cam)}
                onToggleStatus={() => handleToggleStatus(cam.id!)}
              />
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Camera size={48} color={CustomColors.grayScale} style={styles.emptyIcon} />
              <Text style={styles.emptyTitle}>Nenhuma Câmera</Text>
              <Text style={styles.emptyText}>Você ainda não adicionou nenhuma câmera. Clique no botão abaixo para começar.</Text>
            </View>
          )
        ) : (
          <View style={styles.emptyContainer}>
            <PenTool size={48} color={CustomColors.primary} style={styles.emptyIcon} />
            <Text style={styles.emptyTitle}>Em Breve</Text>
            <Text style={styles.emptyText}>
              A integração e gestão inteligente de alarmes físicos chegará em uma atualização futura.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* FAB */}
      {activeTab === 'cameras' && (
        <View style={styles.floatingButtonContainer}>
          <Button variant="gradient" containerStyle={styles.createButton} onPress={handleAddCamera}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
              <PlusCircle color={CustomColors.light} size={24} style={{ marginRight: 8 }} />
              <Text style={styles.createButtonText}>Adicionar Câmera</Text>
            </View>
          </Button>
        </View>
      )}

      {/* Modal */}
      <DeviceModal 
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onSave={handleSaveCamera}
        onDelete={handleDeleteCamera}
        device={editingCamera}
      />

      {/* Viewer Modal */}
      <CameraViewerModal
        visible={isViewerVisible}
        onClose={() => setIsViewerVisible(false)}
        camera={viewingCamera}
      />
    </View>
  );
}
