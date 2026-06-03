import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, TouchableWithoutFeedback } from 'react-native';
import { Bell } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { styles } from './header.styles';
import { CustomColors } from '@/constants/theme';
import { Button } from '../Button/button';
import { useAuth } from '@/contexts/auth.context';
import { INotification } from '@/interfaces/notification.interface';
import { getNotifications, markAsRead, markAllAsRead } from '@/services/notification.service';
import { supabase } from '@/services/supabase';

export function Header() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { profile } = useAuth();
  
  const [showDropdown, setShowDropdown] = useState(false);
  const [notifications, setNotifications] = useState<INotification[]>([]);
  
  const hasUnread = notifications.some(n => !n.is_read);

  useEffect(() => {
    if (!profile?.id) return;

    fetchNotifications();

    // Iniciar listener em tempo real (nome de canal único para evitar conflitos de subscribe no hot reload)
    const channelId = `notifications_changes_${profile.id}_${Date.now()}`;
    const channel = supabase
      .channel(channelId)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${profile.id}`,
        },
        (payload) => {
          const newNotif = payload.new as INotification;
          setNotifications((prev) => [newNotif, ...prev]);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${profile.id}`,
        },
        (payload) => {
          const updatedNotif = payload.new as INotification;
          setNotifications((prev) => prev.map(n => n.id === updatedNotif.id ? updatedNotif : n));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.id]);

  const fetchNotifications = async () => {
    if (!profile?.id) return;
    const { data } = await getNotifications(profile.id);
    if (data) setNotifications(data);
  };

  const handleToggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const handleMarkAllRead = async () => {
    if (!profile?.id) return;
    await markAllAsRead(profile.id);
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  const handleNotificationPress = async (notif: INotification) => {
    if (!notif.is_read) {
      await markAsRead(notif.id);
      setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, is_read: true } : n));
    }
    setShowDropdown(false);
    
    // Navegar para a tela de ocorrências se for um alerta de invasão
    if (notif.type === 'occurrence') {
      router.push('/occurrences');
    }
  };

  const formatTime = (isoString: string) => {
    if (!isoString) return '';
    let safeStr = isoString.replace('+00:00', '').replace('Z', '');
    if (safeStr.includes('.')) safeStr = safeStr.split('.')[0];
    
    // Parse manual para evitar fallback de UTC do Hermes em strings ISO sem offset
    const parts = safeStr.split('T');
    if (parts.length < 2) return '';
    
    const [datePart, timePart] = parts;
    const [year, month, day] = datePart.split('-').map(Number);
    const [hour, min, sec] = timePart.split(':').map(Number);
    
    const date = new Date(year, month - 1, day, hour, min, sec || 0);
    if (isNaN(date.getTime())) return '';
    
    const timeStr = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', hour12: false });
    
    const today = new Date();
    const isToday = 
      today.getDate() === date.getDate() && 
      today.getMonth() === date.getMonth() && 
      today.getFullYear() === date.getFullYear();
      
    return isToday ? timeStr : `${date.toLocaleDateString()} ${timeStr}`;
  };

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 16) }]}>
      <TouchableOpacity style={styles.logoContainer} onPress={() => router.push('/home')} activeOpacity={0.8}>
        <Image
          source={require('@/assets/svgs/logo.svg')} 
          style={styles.logoImage} 
          contentFit="contain" 
        />
        <Text style={styles.logoText}>Sec<Text style={styles.logoHighlight}>Eye</Text></Text>
      </TouchableOpacity>
      
      <View style={{ position: 'relative' }}>
        <Button 
          variant="ghost" 
          style={styles.notificationButton} 
          paddingHorizontal={0}
          paddingVertical={0}
          onPress={handleToggleDropdown}
        >
          <Bell color={CustomColors.light} size={20} />
          {hasUnread && <View style={styles.badge} />}
        </Button>
      </View>

      {/* Dropdown Overlay Modal (permite clicar fora para fechar) */}
      <Modal visible={showDropdown} transparent animationType="fade">
        <TouchableWithoutFeedback onPress={() => setShowDropdown(false)}>
          <View style={{ flex: 1 }}>
            <TouchableWithoutFeedback>
              <View style={[styles.dropdownContainer, { top: Math.max(insets.top, 16) + 50 }]}>
                <View style={styles.dropdownHeader}>
                  <Text style={styles.dropdownTitle}>Notificações</Text>
                  {hasUnread && (
                    <TouchableOpacity onPress={handleMarkAllRead}>
                      <Text style={styles.markAllReadText}>Marcar lidas</Text>
                    </TouchableOpacity>
                  )}
                </View>

                <ScrollView style={{ maxHeight: 300 }}>
                  {notifications.length === 0 ? (
                    <Text style={styles.emptyText}>Sem novidades.</Text>
                  ) : (
                    notifications.map(notif => (
                      <TouchableOpacity 
                        key={notif.id} 
                        style={styles.notificationItem}
                        onPress={() => handleNotificationPress(notif)}
                        activeOpacity={0.7}
                      >
                        <View style={styles.notificationHeader}>
                          {!notif.is_read && <View style={styles.unreadIndicator} />}
                          <Text style={[styles.notificationTitle, !notif.is_read && { color: CustomColors.primary }]}>
                            {notif.title}
                          </Text>
                          <Text style={styles.notificationTime}>{formatTime(notif.created_at)}</Text>
                        </View>
                        <Text style={styles.notificationMessage} numberOfLines={2}>
                          {notif.message}
                        </Text>
                      </TouchableOpacity>
                    ))
                  )}
                </ScrollView>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}
