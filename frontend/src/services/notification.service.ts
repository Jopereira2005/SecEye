import { supabase } from './supabase';
import { INotification } from '../interfaces/notification.interface';

type Result<T> = { data: T | null; error: Error | null };

export async function getNotifications(userId: string): Promise<Result<INotification[]>> {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('getNotifications exception:', error);
    throw error;
  }
}

export async function markAsRead(notificationId: string): Promise<Result<boolean>> {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);

    if (error) throw error;
    return { data: true, error: null };
  } catch (error) {
    console.error('markAsRead exception:', error);
    throw error;
  }
}

export async function markAllAsRead(userId: string): Promise<Result<boolean>> {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) throw error;
    return { data: true, error: null };
  } catch (error) {
    console.error('markAllAsRead exception:', error);
    throw error;
  }
}

export async function createNotification(
  userId: string,
  type: 'occurrence' | 'routine' | 'system',
  title: string,
  message: string
): Promise<Result<boolean>> {
  try {
    const { error } = await supabase
      .from('notifications')
      .insert([
        {
          user_id: userId,
          type,
          title,
          message,
        }
      ]);

    if (error) throw error;
    return { data: true, error: null };
  } catch (error) {
    console.error('createNotification exception:', error);
    throw error;
  }
}
