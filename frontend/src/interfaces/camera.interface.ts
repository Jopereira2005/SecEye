import { IUser } from './user.interfaces';
import { IAlarm } from './alarm.interface';
import { IAlarmGroup } from './alarm-group.interface';
import { IDetectionZone } from './detection-zone.interface';
import { IOcurrence } from './ocurrence.interface';

export interface ICamera {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  severity: string;
  rtsp_url: string;
  min_confidence: number;
  process_every: number;
  cooldown_seconds: number;
  status: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  
  user?: IUser;
  alarms?: IAlarm[];
  alarm_groups?: IAlarmGroup[];
  detection_zones?: IDetectionZone[];
  ocurrences?: IOcurrence[];
}