class WalletManager {
    constructor() {
        this.username = '';
        this.ws = null;
        this.initializeWebSocket();
    }

    initializeWebSocket() {
        this.ws = new WebSocket(`ws://${window.location.host}`);
        
        this.ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === 'status') {
                document.getElementById('userCount').textContent = data.content;
            } else if (data.type === 'message') {
                this.addMessageToChat(data);
            }
        };
    }

    createInitialModal() {
        const modal = document.createElement('div');
        modal.className = 'wallet-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h3>Choose Username</h3>
                <input type="text" id="usernameInput" placeholder="Enter username" maxlength="20" value="${this.username}">
                <div class="modal-buttons">
                    <button id="saveUsername">Save</button>
                    <button id="cancelUsername">Cancel</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        setTimeout(() => {
            const input = document.getElementById('usernameInput');
            input?.focus();
            input?.select();
            modal.classList.add('show');
        }, 0);

        const handleSave = () => {
            const input = document.getElementById('usernameInput');
            const username = input?.value.trim();
            if (username) {
                this.setUsername(username);
                this.showNotification(`Username ${this.username ? 'updated' : 'set'}: ${username}`);
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

        return modal;
    }

    async connect() {
        try {
            const modal = this.createInitialModal();
            return true;
        } catch (error) {
            console.error('Failed to show modal:', error);
            return false;
        }
    }

    setUsername(name) {
        this.username = name;
        const usernameBtn = document.querySelector('.connect-btn');
        if (usernameBtn) {
            usernameBtn.textContent = name;
        }
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

    sendMessage(content) {
        if (!this.username) {
            this.showNotification('Please set a username first');
            this.connect();
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

window.walletManager = new WalletManager(); 