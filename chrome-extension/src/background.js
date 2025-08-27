// WYN Link Chrome Extension Background Script

let activeSession = null;
let screenStream = null;

// Extension installation
chrome.runtime.onInstalled.addListener(() => {
  console.log('WYN Link Chrome Extension installed');
  
  // Set default settings
  chrome.storage.local.set({
    isEnabled: true,
    autoConnect: false,
    quality: 'medium'
  });
});

// Handle messages from popup and content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.type) {
    case 'START_SCREEN_SHARE':
      startScreenShare(message.sessionId, sendResponse);
      return true; // Keep message channel open for async response
      
    case 'STOP_SCREEN_SHARE':
      stopScreenShare(sendResponse);
      return true;
      
    case 'GET_SESSION_STATUS':
      sendResponse({
        isActive: !!activeSession,
        sessionId: activeSession?.sessionId || null
      });
      break;
      
    case 'CONNECT_TO_SESSION':
      connectToSession(message.sessionCode, message.pin, sendResponse);
      return true;
      
    default:
      console.log('Unknown message type:', message.type);
  }
});

// Handle external messages from web app
chrome.runtime.onMessageExternal.addListener((message, sender, sendResponse) => {
  if (!isValidOrigin(sender.origin)) {
    console.warn('Message from invalid origin:', sender.origin);
    return;
  }
  
  switch (message.type) {
    case 'REQUEST_SCREEN_SHARE':
      requestScreenShare(message.sessionId, sendResponse);
      return true;
      
    case 'END_SESSION':
      endSession(message.sessionId, sendResponse);
      return true;
  }
});

async function startScreenShare(sessionId, sendResponse) {
  try {
    // Request screen capture
    const streamId = await new Promise((resolve, reject) => {
      chrome.desktopCapture.chooseDesktopMedia(
        ['screen', 'window', 'tab'],
        (streamId) => {
          if (streamId) {
            resolve(streamId);
          } else {
            reject(new Error('User cancelled screen share'));
          }
        }
      );
    });
    
    // Store session info
    activeSession = {
      sessionId,
      streamId,
      startTime: Date.now()
    };
    
    // Notify popup of status change
    chrome.runtime.sendMessage({
      type: 'SESSION_STATUS_CHANGED',
      isActive: true,
      sessionId
    });
    
    // Show notification
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon48.png',
      title: 'WYN Link',
      message: 'Screen sharing started successfully'
    });
    
    sendResponse({
      success: true,
      streamId,
      sessionId
    });
    
  } catch (error) {
    console.error('Error starting screen share:', error);
    sendResponse({
      success: false,
      error: error.message
    });
  }
}

async function stopScreenShare(sendResponse) {
  try {
    if (screenStream) {
      screenStream.getTracks().forEach(track => track.stop());
      screenStream = null;
    }
    
    const sessionId = activeSession?.sessionId;
    activeSession = null;
    
    // Notify popup of status change
    chrome.runtime.sendMessage({
      type: 'SESSION_STATUS_CHANGED',
      isActive: false,
      sessionId: null
    });
    
    // Show notification
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon48.png',
      title: 'WYN Link',
      message: 'Screen sharing stopped'
    });
    
    sendResponse({
      success: true,
      sessionId
    });
    
  } catch (error) {
    console.error('Error stopping screen share:', error);
    sendResponse({
      success: false,
      error: error.message
    });
  }
}

async function connectToSession(sessionCode, pin, sendResponse) {
  try {
    // This would typically connect to your backend API
    // For now, we'll simulate the connection
    
    const response = await fetch('http://localhost:3000/api/sessions/join', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        sessionCode,
        pin,
        deviceType: 'extension'
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to connect to session');
    }
    
    const sessionData = await response.json();
    
    sendResponse({
      success: true,
      session: sessionData
    });
    
  } catch (error) {
    console.error('Error connecting to session:', error);
    sendResponse({
      success: false,
      error: error.message
    });
  }
}

async function requestScreenShare(sessionId, sendResponse) {
  try {
    // Show notification to user
    const notificationId = await chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon48.png',
      title: 'WYN Link - Screen Share Request',
      message: 'Someone is requesting to share your screen. Click to approve.',
      buttons: [
        { title: 'Approve' },
        { title: 'Deny' }
      ]
    });
    
    // Handle notification click
    chrome.notifications.onButtonClicked.addListener((notifId, buttonIndex) => {
      if (notifId === notificationId) {
        if (buttonIndex === 0) {
          // Approved
          startScreenShare(sessionId, (response) => {
            sendResponse(response);
          });
        } else {
          // Denied
          sendResponse({
            success: false,
            error: 'User denied screen share request'
          });
        }
        chrome.notifications.clear(notificationId);
      }
    });
    
  } catch (error) {
    console.error('Error requesting screen share:', error);
    sendResponse({
      success: false,
      error: error.message
    });
  }
}

async function endSession(sessionId, sendResponse) {
  if (activeSession && activeSession.sessionId === sessionId) {
    stopScreenShare(sendResponse);
  } else {
    sendResponse({
      success: true,
      message: 'No active session to end'
    });
  }
}

function isValidOrigin(origin) {
  const validOrigins = [
    'https://dormyjrizsmstzzhtolu.supabase.co',
    'http://localhost:3000',
    'https://wynlink.com',
    'https://app.wynlink.com'
  ];
  
  return validOrigins.some(validOrigin => origin.startsWith(validOrigin));
}

// Handle tab updates to detect when user navigates away from session
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && activeSession) {
    // Check if user navigated away from the session page
    if (!tab.url || !tab.url.includes('/session/')) {
      // Optionally pause or end the session
      console.log('User navigated away from session page');
    }
  }
});

// Handle extension unload
chrome.runtime.onSuspend.addListener(() => {
  if (activeSession) {
    stopScreenShare(() => {});
  }
});