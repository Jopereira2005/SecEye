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

    if (error) {
      console.error('getNotifications query error:', error);
      return { data: null, error: new Error(error.message) };
    }

    return { data, error: null };
  } catch (error) {
    console.error('getNotifications exception:', error);
    return { data: null, error: error as Error };
  }
}

export async function markAsRead(notificationId: string): Promise<Result<boolean>> {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);

    if (error) {
      console.error('markAsRead query error:', error);
      return { data: null, error: new Error(error.message) };
    }

    return { data: true, error: null };
  } catch (error) {
    console.error('markAsRead exception:', error);
    return { data: null, error: error as Error };
  }
}

export async function markAllAsRead(userId: string): Promise<Result<boolean>> {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) {
      console.error('markAllAsRead query error:', error);
      return { data: null, error: new Error(error.message) };
    }

    return { data: true, error: null };
  } catch (error) {
    console.error('markAllAsRead exception:', error);
    return { data: null, error: error as Error };
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

    if (error) {
      console.error('createNotification query error:', error);
      return { data: null, error: new Error(error.message) };
    }

    return { data: true, error: null };
  } catch (error) {
    console.error('createNotification exception:', error);
    return { data: null, error: error as Error };
  }
}
