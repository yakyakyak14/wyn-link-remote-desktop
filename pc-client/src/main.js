const { app, BrowserWindow, Menu, Tray, ipcMain, desktopCapturer, systemPreferences } = require('electron');
const path = require('path');
const Store = require('electron-store');
const { createClient } = require('@supabase/supabase-js');

// Initialize store for persistent data
const store = new Store();

// Supabase configuration
const supabaseUrl = 'https://dormyjrizsmstzzhtolu.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRvcm15anJpenNtc3R6emh0b2x1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzUyNTI4MDAsImV4cCI6MjA1MDgyODgwMH0.Qs8-Qs8-Qs8-Qs8-Qs8-Qs8-Qs8-Qs8-Qs8-Qs8-Qs8';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

let mainWindow;
let tray;
let isQuitting = false;

// Enable live reload for development
if (process.env.NODE_ENV === 'development') {
  require('electron-reload')(__dirname, {
    electron: path.join(__dirname, '..', 'node_modules', '.bin', 'electron'),
    hardResetMethod: 'exit'
  });
}

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    icon: path.join(__dirname, '../assets/icon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js')
    },
    show: false,
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default'
  });

  // Load the app
  mainWindow.loadFile(path.join(__dirname, 'renderer/index.html'));

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    
    // Focus on window
    if (process.platform === 'darwin') {
      app.dock.show();
    }
  });

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Handle window close (minimize to tray instead of quit)
  mainWindow.on('close', (event) => {
    if (!isQuitting) {
      event.preventDefault();
      mainWindow.hide();
      
      if (process.platform === 'darwin') {
        app.dock.hide();
      }
    }
  });

  // Open DevTools in development
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }
}

function createTray() {
  const trayIconPath = path.join(__dirname, '../assets/tray-icon.png');
  tray = new Tray(trayIconPath);
  
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show WYN Link',
      click: () => {
        mainWindow.show();
        if (process.platform === 'darwin') {
          app.dock.show();
        }
      }
    },
    {
      label: 'Start Session',
      click: () => {
        mainWindow.show();
        mainWindow.webContents.send('start-session');
      }
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        isQuitting = true;
        app.quit();
      }
    }
  ]);
  
  tray.setToolTip('WYN Link - Remote Desktop');
  tray.setContextMenu(contextMenu);
  
  // Show window on tray click
  tray.on('click', () => {
    if (mainWindow.isVisible()) {
      mainWindow.hide();
    } else {
      mainWindow.show();
    }
  });
}

// App event handlers
app.whenReady().then(() => {
  createWindow();
  createTray();
  
  // Request screen recording permission on macOS
  if (process.platform === 'darwin') {
    systemPreferences.getMediaAccessStatus('screen');
  }
});

app.on('window-all-closed', () => {
  // Keep app running in background
  if (process.platform !== 'darwin') {
    // On macOS, keep the app running even when all windows are closed
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  } else if (mainWindow) {
    mainWindow.show();
  }
});

app.on('before-quit', () => {
  isQuitting = true;
});

// IPC handlers
ipcMain.handle('get-sources', async () => {
  try {
    const sources = await desktopCapturer.getSources({
      types: ['window', 'screen'],
      thumbnailSize: { width: 150, height: 150 }
    });
    
    return sources.map(source => ({
      id: source.id,
      name: source.name,
      thumbnail: source.thumbnail.toDataURL()
    }));
  } catch (error) {
    console.error('Error getting sources:', error);
    throw error;
  }
});

ipcMain.handle('create-session', async (event, sessionData) => {
  try {
    const { data, error } = await supabase
      .from('sessions')
      .insert([sessionData])
      .select()
      .single();
    
    if (error) throw error;
    
    // Store session locally
    store.set('currentSession', data);
    
    return data;
  } catch (error) {
    console.error('Error creating session:', error);
    throw error;
  }
});

ipcMain.handle('end-session', async (event, sessionId) => {
  try {
    const { error } = await supabase
      .from('sessions')
      .update({ is_active: false })
      .eq('id', sessionId);
    
    if (error) throw error;
    
    // Clear local session
    store.delete('currentSession');
    
    return true;
  } catch (error) {
    console.error('Error ending session:', error);
    throw error;
  }
});

ipcMain.handle('get-stored-data', (event, key) => {
  return store.get(key);
});

ipcMain.handle('set-stored-data', (event, key, value) => {
  store.set(key, value);
  return true;
});

ipcMain.handle('get-system-info', () => {
  const os = require('os');
  return {
    platform: process.platform,
    arch: process.arch,
    hostname: os.hostname(),
    username: os.userInfo().username,
    version: app.getVersion()
  };
});

// Handle protocol for deep linking (wynlink://)
app.setAsDefaultProtocolClient('wynlink');

// Handle deep link on Windows/Linux
app.on('second-instance', (event, commandLine, workingDirectory) => {
  // Someone tried to run a second instance, focus our window instead
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
    
    // Handle deep link
    const url = commandLine.find(arg => arg.startsWith('wynlink://'));
    if (url) {
      mainWindow.webContents.send('deep-link', url);
    }
  }
});

// Handle deep link on macOS
app.on('open-url', (event, url) => {
  event.preventDefault();
  if (mainWindow) {
    mainWindow.webContents.send('deep-link', url);
  }
});