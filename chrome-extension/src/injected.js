// WYN Link Chrome Extension Injected Script
// This script runs in the context of the web page

(function() {
  'use strict';

  // Create the WYN Link Extension API
  window.WYNLinkExtension = {
    version: '1.0.0',
    isInstalled: true,
    
    // Request screen sharing
    requestScreenShare: function(sessionId) {
      return new Promise((resolve, reject) => {
        const messageId = 'screen_share_' + Date.now();
        
        // Listen for response
        const responseHandler = (event) => {
          if (event.data.type === 'WYN_LINK_SCREEN_SHARE_RESPONSE' && 
              event.data.sessionId === sessionId) {
            window.removeEventListener('message', responseHandler);
            
            if (event.data.success) {
              resolve({
                streamId: event.data.streamId,
                sessionId: event.data.sessionId
              });
            } else {
              reject(new Error(event.data.error || 'Screen share request failed'));
            }
          }
        };
        
        window.addEventListener('message', responseHandler);
        
        // Send request
        window.postMessage({
          type: 'WYN_LINK_REQUEST',
          action: 'REQUEST_SCREEN_SHARE',
          sessionId: sessionId,
          messageId: messageId
        }, window.location.origin);
        
        // Timeout after 30 seconds
        setTimeout(() => {
          window.removeEventListener('message', responseHandler);
          reject(new Error('Screen share request timed out'));
        }, 30000);
      });
    },
    
    // End session
    endSession: function(sessionId) {
      return new Promise((resolve, reject) => {
        const messageId = 'end_session_' + Date.now();
        
        // Listen for response
        const responseHandler = (event) => {
          if (event.data.type === 'WYN_LINK_SESSION_END_RESPONSE' && 
              event.data.sessionId === sessionId) {
            window.removeEventListener('message', responseHandler);
            
            if (event.data.success) {
              resolve({ sessionId: event.data.sessionId });
            } else {
              reject(new Error(event.data.error || 'End session request failed'));
            }
          }
        };
        
        window.addEventListener('message', responseHandler);
        
        // Send request
        window.postMessage({
          type: 'WYN_LINK_REQUEST',
          action: 'END_SESSION',
          sessionId: sessionId,
          messageId: messageId
        }, window.location.origin);
        
        // Timeout after 10 seconds
        setTimeout(() => {
          window.removeEventListener('message', responseHandler);
          reject(new Error('End session request timed out'));
        }, 10000);
      });
    },
    
    // Check extension status
    getStatus: function() {
      return new Promise((resolve, reject) => {
        const messageId = 'status_' + Date.now();
        
        // Listen for response
        const responseHandler = (event) => {
          if (event.data.type === 'WYN_LINK_EXTENSION_STATUS') {
            window.removeEventListener('message', responseHandler);
            resolve({
              isInstalled: event.data.isInstalled,
              isActive: event.data.isActive,
              sessionId: event.data.sessionId
            });
          }
        };
        
        window.addEventListener('message', responseHandler);
        
        // Send request
        window.postMessage({
          type: 'WYN_LINK_REQUEST',
          action: 'CHECK_EXTENSION_STATUS',
          messageId: messageId
        }, window.location.origin);
        
        // Timeout after 5 seconds
        setTimeout(() => {
          window.removeEventListener('message', responseHandler);
          reject(new Error('Status check timed out'));
        }, 5000);
      });
    },
    
    // Listen for status updates
    onStatusUpdate: function(callback) {
      const statusHandler = (event) => {
        if (event.data.type === 'WYN_LINK_STATUS_UPDATE') {
          callback({
            isActive: event.data.isActive,
            sessionId: event.data.sessionId
          });
        }
      };
      
      window.addEventListener('message', statusHandler);
      
      // Return unsubscribe function
      return () => {
        window.removeEventListener('message', statusHandler);
      };
    }
  };

  // Dispatch extension ready event
  window.dispatchEvent(new CustomEvent('wynlink-extension-ready', {
    detail: {
      version: window.WYNLinkExtension.version,
      api: window.WYNLinkExtension
    }
  }));

  // Also dispatch on document ready if not already ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.dispatchEvent(new CustomEvent('wynlink-extension-ready', {
        detail: {
          version: window.WYNLinkExtension.version,
          api: window.WYNLinkExtension
        }
      }));
    });
  }

  console.log('WYN Link Extension API injected successfully');

})();