import { ICamera } from './camera.interface';
import { IAlarmGroup } from './alarm-group.interface';

export interface IAlarm {
  id: string;
  camera_id: string | null;
  is_active: boolean;
  
  camera?: ICamera;
  alarm_groups?: IAlarmGroup[];
}