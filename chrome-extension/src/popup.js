// WYN Link Chrome Extension Popup Script

class PopupController {
  constructor() {
    this.sessionTimer = null;
    this.sessionStartTime = null;
    this.init();
  }

  async init() {
    this.bindEvents();
    await this.updateStatus();
    this.startStatusPolling();
  }

  bindEvents() {
    // Open Web App button
    document.getElementById('openWebAppBtn').addEventListener('click', () => {
      chrome.tabs.create({ url: 'http://localhost:3000' });
      window.close();
    });

    // Quick Connect button
    document.getElementById('quickConnectBtn').addEventListener('click', () => {
      this.toggleQuickConnectForm();
    });

    // Connect button
    document.getElementById('connectBtn').addEventListener('click', () => {
      this.handleConnect();
    });

    // Cancel button
    document.getElementById('cancelBtn').addEventListener('click', () => {
      this.hideQuickConnectForm();
    });

    // Stop Sharing button
    document.getElementById('stopSharingBtn').addEventListener('click', () => {
      this.handleStopSharing();
    });

    // Open Session button
    document.getElementById('openSessionBtn').addEventListener('click', () => {
      this.openCurrentSession();
    });

    // Settings button
    document.getElementById('settingsBtn').addEventListener('click', () => {
      this.openSettings();
    });

    // Auto-format session code input
    const sessionCodeInput = document.getElementById('sessionCode');
    sessionCodeInput.addEventListener('input', (e) => {
      e.target.value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    });

    // Auto-format PIN input
    const sessionPinInput = document.getElementById('sessionPin');
    sessionPinInput.addEventListener('input', (e) => {
      e.target.value = e.target.value.replace(/[^0-9]/g, '');
    });
  }

  async updateStatus() {
    try {
      const response = await this.sendMessage({ type: 'GET_SESSION_STATUS' });
      
      if (response.isActive) {
        this.showConnectedState(response.sessionId);
      } else {
        this.showNotConnectedState();
      }
    } catch (error) {
      console.error('Error updating status:', error);
      this.showNotConnectedState();
    }
  }

  showNotConnectedState() {
    document.getElementById('notConnectedState').style.display = 'block';
    document.getElementById('connectedState').style.display = 'none';
    
    const statusDot = document.getElementById('statusDot');
    const statusText = document.getElementById('statusText');
    
    statusDot.className = 'status-dot';
    statusText.textContent = 'Not Connected';
    
    this.stopSessionTimer();
  }

  showConnectedState(sessionId) {
    document.getElementById('notConnectedState').style.display = 'none';
    document.getElementById('connectedState').style.display = 'block';
    
    const statusDot = document.getElementById('statusDot');
    const statusText = document.getElementById('statusText');
    
    statusDot.className = 'status-dot connected';
    statusText.textContent = 'Connected';
    
    document.getElementById('sessionId').textContent = sessionId || 'Unknown';
    
    this.startSessionTimer();
  }

  showConnectingState() {
    const statusDot = document.getElementById('statusDot');
    const statusText = document.getElementById('statusText');
    
    statusDot.className = 'status-dot connecting';
    statusText.textContent = 'Connecting...';
  }

  toggleQuickConnectForm() {
    const form = document.getElementById('quickConnectForm');
    const isVisible = form.style.display !== 'none';
    
    if (isVisible) {
      this.hideQuickConnectForm();
    } else {
      this.showQuickConnectForm();
    }
  }

  showQuickConnectForm() {
    document.getElementById('quickConnectForm').style.display = 'block';
    document.getElementById('sessionCode').focus();
  }

  hideQuickConnectForm() {
    document.getElementById('quickConnectForm').style.display = 'none';
    document.getElementById('sessionCode').value = '';
    document.getElementById('sessionPin').value = '';
  }

  async handleConnect() {
    const sessionCode = document.getElementById('sessionCode').value.trim();
    const pin = document.getElementById('sessionPin').value.trim();
    
    if (!sessionCode || !pin) {
      this.showError('Please enter both session code and PIN');
      return;
    }
    
    if (sessionCode.length !== 8) {
      this.showError('Session code must be 8 characters');
      return;
    }
    
    if (pin.length !== 4) {
      this.showError('PIN must be 4 digits');
      return;
    }
    
    try {
      this.showConnectingState();
      
      const response = await this.sendMessage({
        type: 'CONNECT_TO_SESSION',
        sessionCode,
        pin
      });
      
      if (response.success) {
        this.hideQuickConnectForm();
        this.showSuccess('Connected successfully!');
        
        // Open the session in a new tab
        chrome.tabs.create({
          url: `http://localhost:3000/session/${response.session.id}`
        });
        
        window.close();
      } else {
        this.showError(response.error || 'Failed to connect');
        this.showNotConnectedState();
      }
    } catch (error) {
      console.error('Connection error:', error);
      this.showError('Connection failed. Please try again.');
      this.showNotConnectedState();
    }
  }

  async handleStopSharing() {
    try {
      const response = await this.sendMessage({ type: 'STOP_SCREEN_SHARE' });
      
      if (response.success) {
        this.showSuccess('Screen sharing stopped');
        this.showNotConnectedState();
      } else {
        this.showError(response.error || 'Failed to stop sharing');
      }
    } catch (error) {
      console.error('Error stopping sharing:', error);
      this.showError('Failed to stop sharing');
    }
  }

  openCurrentSession() {
    // This would open the current session page
    chrome.tabs.create({ url: 'http://localhost:3000' });
    window.close();
  }

  openSettings() {
    // This would open the settings page
    chrome.tabs.create({ url: 'chrome-extension://' + chrome.runtime.id + '/settings.html' });
    window.close();
  }

  startSessionTimer() {
    this.sessionStartTime = Date.now();
    this.sessionTimer = setInterval(() => {
      this.updateSessionDuration();
    }, 1000);
  }

  stopSessionTimer() {
    if (this.sessionTimer) {
      clearInterval(this.sessionTimer);
      this.sessionTimer = null;
    }
    this.sessionStartTime = null;
    
    const durationElement = document.getElementById('sessionDuration');
    if (durationElement) {
      durationElement.textContent = '00:00:00';
    }
  }

  updateSessionDuration() {
    if (!this.sessionStartTime) return;
    
    const elapsed = Date.now() - this.sessionStartTime;
    const hours = Math.floor(elapsed / 3600000);
    const minutes = Math.floor((elapsed % 3600000) / 60000);
    const seconds = Math.floor((elapsed % 60000) / 1000);
    
    const duration = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    const durationElement = document.getElementById('sessionDuration');
    if (durationElement) {
      durationElement.textContent = duration;
    }
  }

  startStatusPolling() {
    // Poll for status updates every 5 seconds
    setInterval(() => {
      this.updateStatus();
    }, 5000);
  }

  showError(message) {
    this.removeMessages();
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error';
    errorDiv.textContent = message;
    document.querySelector('.content').prepend(errorDiv);
    
    setTimeout(() => {
      errorDiv.remove();
    }, 5000);
  }

  showSuccess(message) {
    this.removeMessages();
    const successDiv = document.createElement('div');
    successDiv.className = 'success';
    successDiv.textContent = message;
    document.querySelector('.content').prepend(successDiv);
    
    setTimeout(() => {
      successDiv.remove();
    }, 3000);
  }

  removeMessages() {
    const messages = document.querySelectorAll('.error, .success');
    messages.forEach(msg => msg.remove());
  }

  sendMessage(message) {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(message, (response) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(response);
        }
      });
    });
  }
}

// Initialize popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new PopupController();
});