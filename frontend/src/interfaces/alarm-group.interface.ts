import { ICamera } from './camera.interface';
import { IAlarm } from './alarm.interface';

export interface IAlarmGroup {
  id: string;
  camera_id: string;
  alarm_id: string;
  
  camera?: ICamera;
  alarm?: IAlarm;
}