import { ICamera } from './camera.interface';
import { IAlarm } from './alarm.interface';

export interface IAlarmGroup {
  id: string;
  camera_id: string | null;
  alarm_id: string | null;
  
  camera?: ICamera;
  alarm?: IAlarm;
}