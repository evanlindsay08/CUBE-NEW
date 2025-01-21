// Define WalletManager class
class WalletManager {
    constructor() {
        this.username = '';
        this.ws = null;
        this.initializeWallet();
        this.initializeWebSocket();
    }

    async initializeWallet() {
        if (window.solana) {
            window.solana.on('connect', () => {
                this.showNotification('Wallet connected!');
                document.body.classList.add('wallet-connected');
                const connectBtn = document.querySelector('.connect-btn');
                if (connectBtn) connectBtn.textContent = 'Options';
            });

            window.solana.on('disconnect', () => {
                this.showNotification('Wallet disconnected');
                document.body.classList.remove('wallet-connected');
                const connectBtn = document.querySelector('.connect-btn');
                if (connectBtn) connectBtn.textContent = 'Connect';
            });
        }
    }

    createInitialModal() {
        const modal = document.createElement('div');
        modal.className = 'wallet-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h3>Choose an Option</h3>
                <div class="wallet-list">
                    <button class="wallet-option username">
                        <span>${this.username ? 'Change Username' : 'Set Username'}</span>
                    </button>
                    <button class="wallet-option connect-wallet">
                        <span>${document.body.classList.contains('wallet-connected') ? 'Disconnect Wallet' : 'Connect Wallet'}</span>
                    </button>
                </div>
                <button class="close-modal">✕</button>
            </div>
        `;

        // Add event listeners
        const closeBtn = modal.querySelector('.close-modal');
        closeBtn?.addEventListener('click', () => {
            modal.classList.remove('show');
            setTimeout(() => modal.remove(), 300);
        });

        // Handle option selection
        const usernameBtn = modal.querySelector('.username');
        const walletBtn = modal.querySelector('.connect-wallet');

        usernameBtn.addEventListener('click', () => {
            modal.classList.remove('show');
            setTimeout(() => {
                modal.remove();
                this.promptUsername();
            }, 300);
        });

        walletBtn.addEventListener('click', async () => {
            if (document.body.classList.contains('wallet-connected')) {
                modal.classList.remove('show');
                setTimeout(() => {
                    modal.remove();
                    this.disconnect();
                }, 300);
            } else {
                if (!window.solana) {
                    this.showNotification('Please install Phantom wallet');
                    return;
                }
                try {
                    modal.classList.remove('show');
                    setTimeout(() => modal.remove(), 300);
                    await window.solana.connect();
                } catch (error) {
                    this.showNotification('Failed to connect wallet');
                }
            }
        });

        return modal;
    }

    async connect() {
        try {
            const modal = this.createInitialModal();
            document.body.appendChild(modal);
            setTimeout(() => modal.classList.add('show'), 0);
            return true;
        } catch (error) {
            console.error('Failed to show modal:', error);
            return false;
        }
    }

    async disconnect() {
        try {
            if (window.solana) {
                await window.solana.disconnect();
                this.username = '';
            }
        } catch (error) {
            console.error('Failed to disconnect wallet:', error);
        }
    }

    promptUsername() {
        const modal = document.createElement('div');
        modal.className = 'username-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h3>${this.username ? 'Change Username' : 'Choose your username'}</h3>
                <input type="text" id="usernameInput" placeholder="Enter username" maxlength="20" value="${this.username}">
                <div class="modal-buttons">
                    <button id="saveUsername">Save</button>
                    <button id="cancelUsername">Cancel</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        // Focus and select existing username if present
        setTimeout(() => {
            const input = document.getElementById('usernameInput');
            input.focus();
            input.select();
            modal.classList.add('show');
        }, 0);

        const handleSave = () => {
            const input = document.getElementById('usernameInput');
            const username = input.value.trim();
            if (username) {
                const isUpdate = this.username !== '';
                this.setUsername(username);
                this.showNotification(`Username ${isUpdate ? 'updated' : 'set'}: ${username}`);
                modal.classList.remove('show');
                setTimeout(() => modal.remove(), 300);
            }
        };

        const handleCancel = () => {
            modal.classList.remove('show');
            setTimeout(() => modal.remove(), 300);
        };

        document.getElementById('saveUsername')?.addEventListener('click', handleSave);
        document.getElementById('cancelUsername')?.addEventListener('click', handleCancel);

        // Add enter key support
        const input = document.getElementById('usernameInput');
        input?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleSave();
            }
        });
    }

    setUsername(name) {
        this.username = name;
    }

    getUsername() {
        return this.username;
    }

    showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => notification.classList.add('show'), 0);

        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 600);
        }, 2000);
    }

    initializeWebSocket() {
        // Use secure WebSocket if the page is loaded over HTTPS
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}`;
        
        try {
            this.ws = new WebSocket(wsUrl);
            
            this.ws.onmessage = (event) => {
                const data = JSON.parse(event.data);
                if (data.type === 'status') {
                    document.getElementById('userCount')?.textContent = data.content;
                } else if (data.type === 'message') {
                    this.addMessageToChat(data);
                }
            };

            this.ws.onerror = (error) => {
                console.error('WebSocket error:', error);
                this.showNotification('Failed to connect to chat');
            };
        } catch (error) {
            console.error('WebSocket initialization error:', error);
        }
    }

    sendMessage(content) {
        if (!this.username) {
            this.showNotification('Please set a username first');
            this.promptUsername();
            return;
        }

        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            const message = {
                type: 'message',
                username: this.username,
                content: content,
                timestamp: Date.now()
            };
            this.ws.send(JSON.stringify(message));
        }
    }

    addMessageToChat(message) {
        const chatMessages = document.getElementById('chatMessages');
        if (!chatMessages) return;

        const messageDiv = document.createElement('div');
        messageDiv.className = 'message';
        
        const time = new Date(message.timestamp).toLocaleTimeString();
        messageDiv.innerHTML = `
            <div class="message-header">
                <span class="user" style="color: ${message.userColor}">${message.username}</span>
                <span class="timestamp">${time}</span>
            </div>
            <div class="content">${message.content}</div>
        `;
        
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
}

// Make WalletManager available globally
if (typeof window !== 'undefined') {
    window.WalletManager = WalletManager;
} 