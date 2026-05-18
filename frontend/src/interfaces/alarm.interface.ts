import { ICamera } from './camera.interface';
import { IAlarmGroup } from './alarm-group.interface';

export interface IAlarm {
  id: string;
  camera_id: string;
  is_active: boolean;
  
  camera?: ICamera;
  alarm_groups?: IAlarmGroup[];
}