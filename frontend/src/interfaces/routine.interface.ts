import { IUser } from './user.interfaces';

export interface IRoutine {
  id: number;
  user_id: string | null;
  description: string | null;
  days_week: number[];
  hora_inicio: string;
  hora_fim: string;
  repeat_type: 'once' | 'everyday' | 'weekly';
  specific_date: string | null;
  is_active: boolean;

  user?: IUser;
}
