export interface User {
  id: string;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  push_token: string | null;
  created_at: string;
  updated_at: string;
}

export interface Camera {
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
}

export interface Alarm {
  id: string;
  camera_id: string;
  is_active: boolean;
}

export interface AlarmGroup {
  id: string;
  camera_id: string;
  alarm_id: string;
}

export interface DetectionZone {
  id: string;
  camera_id: string;
  name: string;
  roi_points: number[][];
}

export interface Occurrence {
  id: string;
  camera_id: string;
  event_image: string;
  timestamp: string;
}

export interface Routine {
  id: string;
  user_id: string;
  description: string;
  days_week: string[];
  hora_inicio: string;
  hora_fim: string;
}
