export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  created_at: string;
  updated_at: string;
}

export interface Session {
  id: string;
  host_user_id: string;
  client_user_id?: string;
  session_code: string;
  pin: string;
  access_level: 'full' | 'partial';
  allowed_apps?: string[];
  allowed_paths?: string[];
  is_active: boolean;
  expires_at: string;
  created_at: string;
  updated_at: string;
}

export interface Device {
  id: string;
  user_id: string;
  device_name: string;
  device_type: 'web' | 'mobile' | 'desktop' | 'extension';
  platform: string;
  is_online: boolean;
  last_seen: string;
  created_at: string;
}

export interface RemoteControlEvent {
  type: 'mouse_move' | 'mouse_click' | 'key_press' | 'scroll' | 'touch';
  data: {
    x?: number;
    y?: number;
    button?: 'left' | 'right' | 'middle';
    key?: string;
    deltaX?: number;
    deltaY?: number;
    touches?: TouchPoint[];
  };
  timestamp: number;
}

export interface TouchPoint {
  id: number;
  x: number;
  y: number;
  pressure?: number;
}

export interface ScreenShare {
  session_id: string;
  stream_id: string;
  resolution: {
    width: number;
    height: number;
  };
  quality: 'low' | 'medium' | 'high';
  fps: number;
}

export interface FileTransfer {
  id: string;
  session_id: string;
  filename: string;
  size: number;
  type: 'upload' | 'download';
  progress: number;
  status: 'pending' | 'transferring' | 'completed' | 'failed';
  created_at: string;
}

export interface AppPermission {
  app_name: string;
  executable_path: string;
  allowed: boolean;
}

export interface AccessControl {
  session_id: string;
  access_level: 'full' | 'partial';
  allowed_apps: AppPermission[];
  allowed_directories: string[];
  blocked_directories: string[];
  can_transfer_files: boolean;
  can_install_software: boolean;
  can_access_system_settings: boolean;
}

export interface SessionStats {
  session_id: string;
  duration: number;
  data_transferred: number;
  commands_executed: number;
  files_transferred: number;
  average_latency: number;
}

export interface NotificationPayload {
  type: 'session_request' | 'session_started' | 'session_ended' | 'file_transfer' | 'error';
  title: string;
  message: string;
  data?: any;
  timestamp: number;
}