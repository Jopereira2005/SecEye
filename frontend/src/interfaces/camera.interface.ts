import { IUser } from './user.interfaces';
import { IAlarm } from './alarm.interface';
import { IAlarmGroup } from './alarm-group.interface';
import { IDetectionZone } from './detection-zone.interface';
import { IOcurrence } from './ocurrence.interface';

export interface ICamera {
  id: string;
  user_id: string | null;
  name: string;
  description: string | null;
  severity: 'low' | 'medium' | 'high' | null;
  rtsp_url: string;
  min_confidence: number;
  process_every: number;
  cooldown_seconds: number;
  status: 'online' | 'offline';
  is_active: boolean;
  created_at: string;
  updated_at: string;
  
  user?: IUser;
  roi_points?: any;
  alarms?: IAlarm[];
  alarm_groups?: IAlarmGroup[];
  ocurrences?: IOcurrence[];
}