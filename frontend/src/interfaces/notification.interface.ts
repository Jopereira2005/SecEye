export interface INotification {
  id: string;
  user_id: string;
  type: 'occurrence' | 'routine' | 'system';
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}
