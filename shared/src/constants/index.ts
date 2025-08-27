export const APP_CONFIG = {
  NAME: 'WYN Link',
  VERSION: '1.0.0',
  DESCRIPTION: 'Remote Desktop Application',
  COMPANY: 'WYN Tech',
  DEVELOPER: 'Hope Ukpai',
  LOCATION: 'Abuja, Federal Capital Territory, Nigeria'
};

export const SUPABASE_CONFIG = {
  PROJECT_ID: 'dormyjrizsmstzzhtolu',
  PROJECT_NAME: 'WYN_Link_Remote_App'
};

export const SESSION_CONFIG = {
  DEFAULT_EXPIRATION_HOURS: 24,
  PIN_EXPIRATION_MINUTES: 30,
  MAX_RECONNECTION_ATTEMPTS: 3,
  HEARTBEAT_INTERVAL: 30000, // 30 seconds
  CONNECTION_TIMEOUT: 10000 // 10 seconds
};

export const WEBRTC_CONFIG = {
  ICE_SERVERS: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' }
  ],
  DEFAULT_VIDEO_CONSTRAINTS: {
    width: { ideal: 1920, max: 1920 },
    height: { ideal: 1080, max: 1080 },
    frameRate: { ideal: 30, max: 60 }
  },
  DEFAULT_AUDIO_CONSTRAINTS: {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true
  }
};

export const ACCESS_LEVELS = {
  FULL: 'full',
  PARTIAL: 'partial'
} as const;

export const DEVICE_TYPES = {
  WEB: 'web',
  MOBILE: 'mobile',
  DESKTOP: 'desktop',
  EXTENSION: 'extension'
} as const;

export const EVENT_TYPES = {
  MOUSE_MOVE: 'mouse_move',
  MOUSE_CLICK: 'mouse_click',
  KEY_PRESS: 'key_press',
  SCROLL: 'scroll',
  TOUCH: 'touch'
} as const;

export const NOTIFICATION_TYPES = {
  SESSION_REQUEST: 'session_request',
  SESSION_STARTED: 'session_started',
  SESSION_ENDED: 'session_ended',
  FILE_TRANSFER: 'file_transfer',
  ERROR: 'error'
} as const;

export const FILE_TRANSFER_STATUS = {
  PENDING: 'pending',
  TRANSFERRING: 'transferring',
  COMPLETED: 'completed',
  FAILED: 'failed'
} as const;

export const CONNECTION_STATES = {
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  DISCONNECTED: 'disconnected',
  FAILED: 'failed',
  CLOSED: 'closed'
} as const;

export const QUALITY_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high'
} as const;

export const DEFAULT_PORTS = {
  WEB_APP: 3000,
  SIGNALING_SERVER: 3001,
  STUN_SERVER: 3478,
  TURN_SERVER: 3479
};

export const SECURITY_CONFIG = {
  ENCRYPTION_ALGORITHM: 'AES-256-GCM',
  KEY_LENGTH: 256,
  SALT_LENGTH: 128,
  TOKEN_LENGTH: 32,
  SESSION_CODE_LENGTH: 8,
  PIN_LENGTH: 4
};

export const API_ENDPOINTS = {
  AUTH: '/api/auth',
  SESSIONS: '/api/sessions',
  DEVICES: '/api/devices',
  FILES: '/api/files',
  STATS: '/api/stats'
};

export const STORAGE_KEYS = {
  USER_TOKEN: 'wyn_link_user_token',
  DEVICE_ID: 'wyn_link_device_id',
  SESSION_DATA: 'wyn_link_session_data',
  USER_PREFERENCES: 'wyn_link_preferences'
};

export const ERROR_CODES = {
  AUTHENTICATION_FAILED: 'AUTH_001',
  SESSION_NOT_FOUND: 'SESSION_001',
  SESSION_EXPIRED: 'SESSION_002',
  INVALID_PIN: 'SESSION_003',
  CONNECTION_FAILED: 'CONN_001',
  PERMISSION_DENIED: 'PERM_001',
  FILE_TRANSFER_FAILED: 'FILE_001',
  WEBRTC_ERROR: 'WEBRTC_001'
};

export const SUPPORTED_FILE_TYPES = [
  '.txt', '.doc', '.docx', '.pdf', '.jpg', '.jpeg', '.png', '.gif',
  '.mp4', '.avi', '.mov', '.mp3', '.wav', '.zip', '.rar', '.exe', '.msi'
];

export const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

export const CHROME_EXTENSION_ID = 'wyn-link-chrome-extension';

export const MOBILE_APP_SCHEMES = {
  ANDROID: 'wynlink://connect',
  IOS: 'wynlink://connect'
};