import { ICamera } from './camera.interface';

export interface IOcurrence {
  id: string;
  camera_id: string | null;
  event_image: string | null;
  timestamp: string;
  
  camera?: ICamera;
}