import React, { memo } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { Video, Clock, ShieldAlert, CheckCircle, AlertTriangle, Check } from 'lucide-react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { styles } from './occurrence-card.styles';
import { CustomColors } from '@/constants/theme';
const formatTime = (isoString: string) => {
  try {
    let safeStr = isoString.replace('+00:00', '').replace('Z', '');
    if (safeStr.includes('.')) safeStr = safeStr.split('.')[0];
    
    // Parse manual para evitar fallback de UTC do Hermes em strings ISO sem offset
    const [datePart, timePart] = safeStr.split('T');
    const [year, month, day] = datePart.split('-').map(Number);
    const [hour, min, sec] = timePart.split(':').map(Number);
    
    const d = new Date(year, month - 1, day, hour, min, sec || 0);
    if (isNaN(d.getTime())) return "00:00";
    
    const h = d.getHours().toString().padStart(2, '0');
    const m = d.getMinutes().toString().padStart(2, '0');
    return `${h}:${m}`;
  } catch (e) {
    return "00:00";
  }
};

const formatDate = (isoString: string) => {
  try {
    let safeStr = isoString.replace('+00:00', '').replace('Z', '');
    if (safeStr.includes('.')) safeStr = safeStr.split('.')[0];
    
    const [datePart, timePart] = safeStr.split('T');
    const [year, month, day] = datePart.split('-').map(Number);
    const [hour, min, sec] = timePart.split(':').map(Number);
    
    const d = new Date(year, month - 1, day, hour, min, sec || 0);
    if (isNaN(d.getTime())) return "--/--/----";
    
    const dDay = d.getDate().toString().padStart(2, '0');
    const dMonth = (d.getMonth() + 1).toString().padStart(2, '0');
    const dYear = d.getFullYear();
    return `${dDay}/${dMonth}/${dYear}`;
  } catch (e) {
    return "--/--/----";
  }
};

export type OccurrenceCardSize = 'small' | 'medium' | 'large' | 'recent';

export interface OccurrenceCardProps {
  occurrence: IOcurrence;
  size?: OccurrenceCardSize;
  onPress?: (occurrence: IOcurrence) => void;
  onLongPress?: (occurrence: IOcurrence) => void;
  selectable?: boolean;
  selected?: boolean;
}

export const OccurrenceCard = memo(function OccurrenceCard({ 
  occurrence, 
  size = 'large', 
  onPress,
  onLongPress,
  selectable = false,
  selected = false
}: OccurrenceCardProps) {
  // Lógica de pulsação para alta severidade
  const scaleAnim = useSharedValue(1);

  const handlePressIn = () => {
    scaleAnim.value = withSpring(0.97, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    scaleAnim.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleAnim.value }]
  }));

  const camera: ICamera | undefined = occurrence.camera;
  const severity = camera?.severity || 'medium';
  
  // Define cores da severidade
  const severityConfig = {
    high: { color: CustomColors.danger, icon: ShieldAlert, label: 'ALTA' },
    medium: { color: CustomColors.tertiary, icon: AlertTriangle, label: 'MÉDIA' },
    low: { color: CustomColors.success, icon: CheckCircle, label: 'BAIXA' },
  };

  const currentSeverity = severityConfig[severity] || severityConfig.medium;
  const SeverityIcon = currentSeverity.icon;

  // Placeholder caso não tenha imagem da ocorrencia
  const hasImage = !!occurrence.event_image;

  return (
    <Pressable
      style={size === 'small' ? { flex: 1 } : { width: '100%' }}
      onPress={() => onPress?.(occurrence)}
      onLongPress={() => onLongPress?.(occurrence)}
      delayLongPress={300}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View style={[
        size !== 'recent' ? styles.container : styles.containerRecent, 
        size === 'large' && styles.containerLarge,
        size === 'medium' && styles.containerMedium,
        size === 'small' && styles.containerSmall,
        selectable && !selected && { opacity: 0.8 }, // feedback visual quando em modo de seleção
        animatedStyle
      ]}>
        
        {size === 'recent' ? (
          <>
            <View style={styles.iconContainerRecent}>
              <SeverityIcon size={24} color={currentSeverity.color} />
            </View>
            <View style={styles.contentRecent}>
              <Text style={styles.titleRecent}>Movimento Detectado</Text>
              <Text style={styles.subtitleRecent}>
                {camera?.name?.toUpperCase() || 'DESCONHECIDO'} • {formatTime(occurrence.timestamp)}
              </Text>
            </View>
          </>
        ) : (
          <>
            {/* Imagem do Evento */}
            <View style={[
              styles.imageContainer,
              size === 'large' && styles.imageLarge,
              size === 'medium' && styles.imageMedium,
              size === 'small' && styles.imageSmall,
            ]}>
              {hasImage ? (
                <Image 
                  source={{ uri: occurrence.event_image! }}
                  style={styles.image}
                  contentFit="cover"
                  transition={200}
                />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Video color={CustomColors.grayScale} size={32} opacity={0.5} />
                </View>
              )}

              {/* Badge de Severidade na imagem (Large / Small) */}
              {(size === 'large' || size === 'small') && (
                <View style={[styles.severityBadge, { backgroundColor: CustomColors.applyOpacity(currentSeverity.color, 0.2) }]}>
                  <SeverityIcon size={12} color={currentSeverity.color} />
                  <Text style={[styles.severityText, { color: currentSeverity.color }]}>
                    {currentSeverity.label}
                  </Text>
                </View>
              )}
            </View>

            {/* Informações */}
            <View style={[
              styles.contentContainer,
              size === 'large' && { paddingTop: 16 },
              size === 'medium' && styles.contentMedium,
              size === 'small' && styles.contentSmall,
            ]}>
              {size === 'medium' ? (
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                  {/* Lado esquerdo: Textos */}
                  <View style={{ flex: 1, gap: 4 }}>
                    <View style={styles.cameraNameContainer}>
                      <Video size={16} color={CustomColors.grayScale} />
                      <Text style={styles.cameraName} numberOfLines={1} ellipsizeMode="tail">
                        {camera?.name || 'Câmera Desconhecida'}
                      </Text>
                    </View>
                    <View style={styles.timestampContainer}>
                      <Clock size={14} color={CustomColors.grayScale} />
                      <Text style={styles.timestampText}>
                        {`${formatDate(occurrence.timestamp)} - ${formatTime(occurrence.timestamp)}`}
                      </Text>
                    </View>
                  </View>

                  {/* Lado direito: Badge de Risco em Flex (Sem absolute) */}
                  <View style={{
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingVertical: 6,
                    paddingHorizontal: 8,
                    borderRadius: 8,
                    backgroundColor: CustomColors.applyOpacity(currentSeverity.color, 0.2)
                  }}>
                    <SeverityIcon size={20} color={currentSeverity.color} />
                    <Text style={[styles.severityText, { color: currentSeverity.color, fontSize: 9, marginTop: 4, textAlign: 'center' }]}>
                      {currentSeverity.label}
                    </Text>
                  </View>
                </View>
              ) : (
                <>
                  <View style={styles.headerRow}>
                    <View style={styles.cameraNameContainer}>
                      <Video size={16} color={CustomColors.grayScale} />
                      <Text style={styles.cameraName} numberOfLines={1} ellipsizeMode="tail">
                        {camera?.name || 'Câmera Desconhecida'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.timestampContainer}>
                    <Clock size={14} color={CustomColors.grayScale} />
                    <Text style={styles.timestampText}>
                      {formatTime(occurrence.timestamp)}
                    </Text>
                  </View>

                  {size === 'large' && (
                    <View style={styles.footerRow}>
                      <Text style={styles.footerText}>
                        Data: {formatDate(occurrence.timestamp)}
                      </Text>
                      <Text style={styles.footerText}>
                        ID: #{occurrence.id.slice(0, 6)}
                      </Text>
                    </View>
                  )}
                </>
              )}
            </View>
          </>
        )}

        {/* Overlay de Seleção */}
        {selected && (
          <>
            <View style={styles.selectedOverlay} pointerEvents="none" />
            <View style={styles.checkIconContainer} pointerEvents="none">
              <Check size={16} color={CustomColors.dark} strokeWidth={3} />
            </View>
          </>
        )}
      </Animated.View>
    </Pressable>
  );
}, (prevProps, nextProps) => {
  return prevProps.occurrence.id === nextProps.occurrence.id 
    && prevProps.selected === nextProps.selected 
    && prevProps.selectable === nextProps.selectable
    && prevProps.size === nextProps.size;
});
