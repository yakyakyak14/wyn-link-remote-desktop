// WYN Link PC Client Application

class WYNLinkApp {
    constructor() {
        this.currentSession = null;
        this.sessionStartTime = null;
        this.sessionTimer = null;
        this.participants = [];
        
        this.init();
    }

    async init() {
        this.setupEventListeners();
        await this.loadSystemInfo();
        await this.loadStoredSession();
        this.setupDeepLinkHandler();
    }

    setupEventListeners() {
        // Header buttons
        document.getElementById('minimize-btn').addEventListener('click', () => {
            window.electronAPI.minimize();
        });

        document.getElementById('close-btn').addEventListener('click', () => {
            window.electronAPI.close();
        });

        // Access level change
        document.getElementById('access-level').addEventListener('change', (e) => {
            this.togglePartialAccessOptions(e.target.value === 'partial');
        });

        // Session management
        document.getElementById('start-session-btn').addEventListener('click', () => {
            this.startSession();
        });

        document.getElementById('end-session-btn').addEventListener('click', () => {
            this.endSession();
        });

        document.getElementById('pause-session-btn').addEventListener('click', () => {
            this.pauseSession();
        });

        document.getElementById('copy-details-btn').addEventListener('click', () => {
            this.copySessionDetails();
        });

        document.getElementById('add-folder-btn').addEventListener('click', () => {
            this.addFolder();
        });

        // Listen for start session from tray
        window.electronAPI.onStartSession(() => {
            this.showScreen('welcome-screen');
        });
    }

    async loadSystemInfo() {
        try {
            const systemInfo = await window.electronAPI.getSystemInfo();
            console.log('System Info:', systemInfo);
        } catch (error) {
            console.error('Error loading system info:', error);
        }
    }

    async loadStoredSession() {
        try {
            const storedSession = await window.electronAPI.getStoredData('currentSession');
            if (storedSession && storedSession.is_active) {
                this.currentSession = storedSession;
                this.showSessionScreen();
            }
        } catch (error) {
            console.error('Error loading stored session:', error);
        }
    }

    setupDeepLinkHandler() {
        window.electronAPI.onDeepLink((url) => {
            console.log('Deep link received:', url);
            // Handle deep link (e.g., wynlink://join/ABC123?pin=1234)
            this.handleDeepLink(url);
        });
    }

    handleDeepLink(url) {
        try {
            const urlObj = new URL(url);
            if (urlObj.pathname.startsWith('/join/')) {
                const sessionCode = urlObj.pathname.split('/')[2];
                const pin = urlObj.searchParams.get('pin');
                
                if (sessionCode && pin) {
                    // Auto-fill join form if we had one
                    console.log('Auto-joining session:', sessionCode, pin);
                }
            }
        } catch (error) {
            console.error('Error handling deep link:', error);
        }
    }

    togglePartialAccessOptions(show) {
        const options = document.getElementById('partial-access-options');
        options.style.display = show ? 'block' : 'none';
        
        if (show) {
            this.loadAvailableApps();
        }
    }

    async loadAvailableApps() {
        const appList = document.getElementById('app-list');
        
        // Mock app list - in real implementation, this would get actual running apps
        const apps = [
            { name: 'Google Chrome', icon: '🌐' },
            { name: 'Microsoft Word', icon: '📝' },
            { name: 'Excel', icon: '📊' },
            { name: 'PowerPoint', icon: '📽️' },
            { name: 'File Explorer', icon: '📁' },
            { name: 'Calculator', icon: '🧮' },
            { name: 'Notepad', icon: '📄' }
        ];

        appList.innerHTML = '';
        apps.forEach(app => {
            const appItem = document.createElement('div');
            appItem.className = 'app-item';
            appItem.innerHTML = `
                <input type="checkbox" id="app-${app.name.replace(/\s+/g, '-').toLowerCase()}" value="${app.name}">
                <label for="app-${app.name.replace(/\s+/g, '-').toLowerCase()}">
                    <span class="app-icon">${app.icon}</span>
                    ${app.name}
                </label>
            `;
            appList.appendChild(appItem);
        });
    }

    addFolder() {
        const folderList = document.getElementById('folder-list');
        const addButton = document.getElementById('add-folder-btn');
        
        const folderItem = document.createElement('div');
        folderItem.className = 'folder-item';
        folderItem.innerHTML = `
            <input type="text" placeholder="Enter folder path..." class="form-control">
            <button type="button" class="btn btn-secondary" onclick="this.parentElement.remove()">Remove</button>
        `;
        
        folderList.insertBefore(folderItem, addButton);
    }

    async startSession() {
        try {
            this.showScreen('loading-screen');

            const accessLevel = document.getElementById('access-level').value;
            let allowedApps = null;
            let allowedPaths = null;

            if (accessLevel === 'partial') {
                // Get selected apps
                const appCheckboxes = document.querySelectorAll('#app-list input[type="checkbox"]:checked');
                allowedApps = Array.from(appCheckboxes).map(cb => cb.value);

                // Get folder paths
                const folderInputs = document.querySelectorAll('#folder-list input[type="text"]');
                allowedPaths = Array.from(folderInputs)
                    .map(input => input.value.trim())
                    .filter(path => path.length > 0);
            }

            // Generate session data
            const sessionData = {
                session_code: this.generateSessionCode(),
                pin: this.generatePin(),
                host_user_id: 'system-user', // In real app, this would be the authenticated user
                access_level: accessLevel,
                allowed_apps: allowedApps,
                allowed_paths: allowedPaths,
                is_active: true,
                expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
            };

            // Create session
            const session = await window.electronAPI.createSession(sessionData);
            this.currentSession = session;
            this.sessionStartTime = new Date();

            // Show session screen
            this.showSessionScreen();
            this.startSessionTimer();

            // Show notification
            window.electronAPI.showNotification(
                'Session Started',
                `Session ${session.session_code} is now active. PIN: ${session.pin}`
            );

        } catch (error) {
            console.error('Error starting session:', error);
            alert('Failed to start session. Please try again.');
            this.showScreen('welcome-screen');
        }
    }

    async endSession() {
        if (!this.currentSession) return;

        try {
            await window.electronAPI.endSession(this.currentSession.id);
            this.currentSession = null;
            this.sessionStartTime = null;
            
            if (this.sessionTimer) {
                clearInterval(this.sessionTimer);
                this.sessionTimer = null;
            }

            this.showScreen('welcome-screen');
            
            window.electronAPI.showNotification(
                'Session Ended',
                'Remote desktop session has been terminated.'
            );

        } catch (error) {
            console.error('Error ending session:', error);
            alert('Failed to end session. Please try again.');
        }
    }

    pauseSession() {
        // Implementation for pausing session
        console.log('Pausing session...');
        // In real implementation, this would pause the WebRTC connection
    }

    copySessionDetails() {
        if (!this.currentSession) return;

        const details = `Session Code: ${this.currentSession.session_code}\nPIN: ${this.currentSession.pin}`;
        
        // Copy to clipboard
        navigator.clipboard.writeText(details).then(() => {
            // Show temporary feedback
            const button = document.getElementById('copy-details-btn');
            const originalText = button.textContent;
            button.textContent = 'Copied!';
            button.style.background = '#10b981';
            
            setTimeout(() => {
                button.textContent = originalText;
                button.style.background = '';
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy to clipboard:', err);
        });
    }

    showSessionScreen() {
        if (!this.currentSession) return;

        // Update session details
        document.getElementById('session-code').textContent = this.currentSession.session_code;
        document.getElementById('session-pin').textContent = this.currentSession.pin;
        document.getElementById('current-access-level').textContent = 
            this.currentSession.access_level === 'full' ? 'Full Access' : 'Partial Access';

        this.showScreen('session-screen');
    }

    startSessionTimer() {
        this.sessionTimer = setInterval(() => {
            this.updateSessionDuration();
        }, 1000);
    }

    updateSessionDuration() {
        if (!this.sessionStartTime) return;

        const now = new Date();
        const elapsed = now.getTime() - this.sessionStartTime.getTime();
        
        const hours = Math.floor(elapsed / 3600000);
        const minutes = Math.floor((elapsed % 3600000) / 60000);
        const seconds = Math.floor((elapsed % 60000) / 1000);

        const duration = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        document.getElementById('session-duration').textContent = duration;
    }

    showScreen(screenId) {
        // Hide all screens
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });

        // Show target screen
        document.getElementById(screenId).classList.add('active');
    }

    generateSessionCode() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < 8; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    generatePin() {
        return Math.floor(1000 + Math.random() * 9000).toString();
    }

    addParticipant(participant) {
        this.participants.push(participant);
        this.updateParticipantsList();
    }

    removeParticipant(participantId) {
        this.participants = this.participants.filter(p => p.id !== participantId);
        this.updateParticipantsList();
    }

    updateParticipantsList() {
        const participantsList = document.getElementById('participants-list');
        
        if (this.participants.length === 0) {
            participantsList.innerHTML = '<div class="no-participants">No users connected yet</div>';
            return;
        }

        participantsList.innerHTML = this.participants.map(participant => `
            <div class="participant-item">
                <div class="participant-avatar">${participant.name[0].toUpperCase()}</div>
                <div class="participant-info">
                    <div class="participant-name">${participant.name}</div>
                    <div class="participant-time">Connected ${this.formatTime(participant.connectedAt)}</div>
                </div>
            </div>
        `).join('');
    }

    formatTime(timestamp) {
        const now = new Date();
        const time = new Date(timestamp);
        const diff = now.getTime() - time.getTime();
        
        const minutes = Math.floor(diff / 60000);
        if (minutes < 1) return 'just now';
        if (minutes < 60) return `${minutes}m ago`;
        
        const hours = Math.floor(minutes / 60);
        return `${hours}h ago`;
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.wynLinkApp = new WYNLinkApp();
});