import { ICamera } from './camera.interface';

export interface IOcurrence {
  id: string;
  camera_id: string;
  event_image: string;
  timestamp: string;
  
  camera?: ICamera;
}