import { ICamera } from './camera.interface';

export interface IDetectionZone {
  id: number;
  camera_id: string | null;
  name: string | null;
  roi_points: any | null;

  camera?: ICamera;
}
