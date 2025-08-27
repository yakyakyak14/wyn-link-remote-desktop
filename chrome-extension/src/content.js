// WYN Link Chrome Extension Content Script

(function() {
  'use strict';

  // Only run on WYN Link web app pages
  if (!window.location.hostname.includes('localhost') && 
      !window.location.hostname.includes('wynlink.com') &&
      !window.location.hostname.includes('supabase.co')) {
    return;
  }

  console.log('WYN Link Chrome Extension content script loaded');

  // Inject the extension bridge script
  const script = document.createElement('script');
  script.src = chrome.runtime.getURL('injected.js');
  script.onload = function() {
    this.remove();
  };
  (document.head || document.documentElement).appendChild(script);

  // Listen for messages from the injected script
  window.addEventListener('message', function(event) {
    // Only accept messages from the same origin
    if (event.origin !== window.location.origin) {
      return;
    }

    if (event.data.type && event.data.type === 'WYN_LINK_REQUEST') {
      handleWebAppRequest(event.data);
    }
  });

  // Listen for messages from the background script
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'SESSION_STATUS_CHANGED') {
      // Notify the web app about session status changes
      window.postMessage({
        type: 'WYN_LINK_STATUS_UPDATE',
        isActive: message.isActive,
        sessionId: message.sessionId
      }, window.location.origin);
    }
  });

  function handleWebAppRequest(data) {
    switch (data.action) {
      case 'REQUEST_SCREEN_SHARE':
        requestScreenShare(data.sessionId);
        break;
        
      case 'END_SESSION':
        endSession(data.sessionId);
        break;
        
      case 'CHECK_EXTENSION_STATUS':
        checkExtensionStatus();
        break;
        
      default:
        console.log('Unknown web app request:', data.action);
    }
  }

  function requestScreenShare(sessionId) {
    chrome.runtime.sendMessage({
      type: 'START_SCREEN_SHARE',
      sessionId: sessionId
    }, (response) => {
      window.postMessage({
        type: 'WYN_LINK_SCREEN_SHARE_RESPONSE',
        success: response.success,
        streamId: response.streamId,
        error: response.error,
        sessionId: sessionId
      }, window.location.origin);
    });
  }

  function endSession(sessionId) {
    chrome.runtime.sendMessage({
      type: 'STOP_SCREEN_SHARE'
    }, (response) => {
      window.postMessage({
        type: 'WYN_LINK_SESSION_END_RESPONSE',
        success: response.success,
        error: response.error,
        sessionId: sessionId
      }, window.location.origin);
    });
  }

  function checkExtensionStatus() {
    chrome.runtime.sendMessage({
      type: 'GET_SESSION_STATUS'
    }, (response) => {
      window.postMessage({
        type: 'WYN_LINK_EXTENSION_STATUS',
        isInstalled: true,
        isActive: response.isActive,
        sessionId: response.sessionId
      }, window.location.origin);
    });
  }

  // Notify the web app that the extension is available
  window.postMessage({
    type: 'WYN_LINK_EXTENSION_READY',
    version: chrome.runtime.getManifest().version
  }, window.location.origin);

})();