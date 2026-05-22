import { IUser } from './user.interfaces';

export interface IRoutine {
  id: string;
  user_id: string;
  description: string;
  days_week: string[];
  hora_inicio: string;
  hora_fim: string;
  repeat_type: 'once' | 'daily' | 'weekly';
  specific_date: string;
  is_active: boolean;

  user?: IUser;
}