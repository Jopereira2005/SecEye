import React from 'react';
import { View, Text, Pressable } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { Camera, BellDot, Power, ShieldAlert, AlertTriangle, CheckCircle, Wifi, WifiOff } from 'lucide-react-native';
import { CustomColors } from '@/constants/theme';
import { Button } from '@/components/Button/button';
import { styles } from './device-card.styles';
import { MjpegPlayer } from '../MjpegPlayer/mjpeg-player';
import { Image } from 'react-native';
import { ICamera } from '@/interfaces/camera.interface';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type DeviceType = 'camera' | 'alarm';

interface DeviceCardProps {
  type: DeviceType;
  device: Partial<ICamera>; // Using ICamera for now, works for mock
  onPress?: () => void;
  onLongPress?: () => void;
  onToggleStatus?: () => void;
}

export function DeviceCard({ type, device, onPress, onLongPress, onToggleStatus }: DeviceCardProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const isActive = device.is_active;
  const isOnline = device.status === 'online';

  const getSeverityConfig = () => {
    switch(device.severity) {
      case 'high': return { color: CustomColors.danger, icon: ShieldAlert, label: 'ALTA' };
      case 'medium': return { color: CustomColors.tertiary, icon: AlertTriangle, label: 'MÉDIA' };
      case 'low': return { color: CustomColors.success, icon: CheckCircle, label: 'BAIXA' };
      default: return { color: CustomColors.tertiary, icon: AlertTriangle, label: 'N/A' };
    }
  };

  const currentSeverity = getSeverityConfig();
  const SeverityIcon = currentSeverity.icon;

  const BACKEND_URL = process.env.EXPO_PUBLIC_CV_BACKEND_URL || 'http://127.0.0.1:5000';
  const videoUrl = device?.id ? `${BACKEND_URL}/feed/${device.id}` : undefined;

  return (
    <AnimatedPressable
      style={[
        styles.cardContainer,
        animatedStyle,
        isActive ? styles.cardActive : styles.cardInactive
      ]}
      onPressIn={() => scale.value = withTiming(0.98, { duration: 100 })}
      onPressOut={() => scale.value = withTiming(1, { duration: 150 })}
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={250}
    >
      <View style={styles.cardHeader}>
        <View style={styles.titleRow}>
          {type !== 'camera' && (
            <View style={[styles.iconContainer, { backgroundColor: isActive ? CustomColors.primary : CustomColors.grayScale }]}>
              <BellDot size={20} color={CustomColors.dark} />
            </View>
          )}
          <View style={styles.titleTextContainer}>
            <Text style={styles.deviceName} numberOfLines={1}>{device.name}</Text>
            {device.description ? (
              <Text style={styles.deviceDescription} numberOfLines={1}>{device.description}</Text>
            ) : null}
          </View>
        </View>

        <Button
          variant={isActive ? "gradient" : "secondary"}
          width={40}
          height={40}
          borderRadius={12}
          paddingHorizontal={0}
          paddingVertical={0}
          onPress={onToggleStatus}
          style={{
            backgroundColor: isActive ? undefined : CustomColors.applyOpacity(CustomColors.primary, 0.4),
          }}
        >
          <Power size={22} strokeWidth={3} color={isActive ? CustomColors.light : CustomColors.quartenary} />
        </Button>
      </View>

      {type === 'camera' && (
        <View pointerEvents="none" style={styles.previewContainer}>
          {videoUrl ? (
            <MjpegPlayer
              url={videoUrl}
              style={styles.previewImage}
              resizeMode="stretch"
            />
          ) : (
            <Image 
              source={require('../../../assets/images/mock-camera.png')} 
              style={styles.previewImage} 
              resizeMode="stretch"
            />
          )}
        </View>
      )}

      {/* Info Row */}
      <View style={styles.infoRow}>
        <View style={[styles.infoBadge, { backgroundColor: CustomColors.applyOpacity(isOnline ? CustomColors.success : CustomColors.danger, 0.2), borderWidth: 0 }]}>
          {isOnline ? <Wifi size={12}  color={CustomColors.success} /> : <WifiOff size={12} color={CustomColors.danger} />}
          <Text style={[styles.infoBadgeText, { marginLeft: 4, color: isOnline ? CustomColors.success : CustomColors.danger }]}>{isOnline ? 'ONLINE' : 'OFFLINE'}</Text>
        </View>

        {type === 'camera' && (
          <>
            <View style={[styles.infoBadge, { backgroundColor: CustomColors.applyOpacity(currentSeverity.color, 0.2), borderWidth: 0 }]}>
              <SeverityIcon size={12} color={currentSeverity.color} style={{ marginRight: 4 }} />
              <Text style={[styles.infoBadgeText, { color: currentSeverity.color }]}>{currentSeverity.label}</Text>
            </View>
            <View style={styles.infoBadge}>
              <Text style={styles.infoBadgeText} numberOfLines={1} ellipsizeMode="tail">
                {device.rtsp_url ? 'RTSP Link' : 'Sem Link'}
              </Text>
            </View>
          </>
        )}
      </View>

    </AnimatedPressable>
  );
}
