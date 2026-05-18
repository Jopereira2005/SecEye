import { ICamera } from './camera.interface';

export interface IDetectionZone {
  id: string;
  camera_id: string;
  name: string;
  roi_points: number[][];
  
  camera?: ICamera;
}