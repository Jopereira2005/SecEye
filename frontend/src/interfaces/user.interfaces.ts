import { ICamera } from './camera.interface';
import { IRoutine } from './routine.interface';

export interface IUser {
  id: string;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  push_token: string | null;
  created_at: string;
  updated_at: string;
  
  cameras?: ICamera[];
  routines?: IRoutine[];
}