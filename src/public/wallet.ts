import { Connection } from '@solana/web3.js';
import {
    Adapter,
    WalletReadyState,
    MessageSignerWalletAdapter,
} from '@solana/wallet-adapter-base';

// Define the Solana window type
declare global {
    interface Window {
        solana?: {
            connect(): Promise<void>;
            disconnect(): Promise<void>;
            on(event: string, callback: () => void): void;
            isPhantom?: boolean;
        };
    }
}

interface ChatMessage {
    type: 'message' | 'status';
    username: string;
    content: string;
    timestamp: number;
    userColor?: string;
}

class WalletManager {
    private wallet: MessageSignerWalletAdapter | null = null;
    private username: string = '';
    private ws: WebSocket | null = null;
    
    constructor() {
        this.initializeWallet();
        this.initializeWebSocket();
    }

    private initializeWebSocket() {
        this.ws = new WebSocket(`ws://${window.location.host}`);
        
        this.ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === 'status') {
                document.getElementById('userCount')!.textContent = data.content;
            } else if (data.type === 'message') {
                this.addMessageToChat(data);
            }
        };
    }

    private addMessageToChat(message: ChatMessage) {
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

    private async initializeWallet() {
        if (typeof window !== 'undefined' && window.solana) {
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

    public async connect() {
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

    private createInitialModal() {
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

        usernameBtn?.addEventListener('click', () => {
            modal.classList.remove('show');
            setTimeout(() => {
                modal.remove();
                this.promptUsername();
            }, 300);
        });

        walletBtn?.addEventListener('click', async () => {
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

    public async disconnect() {
        try {
            if (typeof window !== 'undefined' && window.solana) {
                await window.solana.disconnect();
            }
        } catch (error) {
            console.error('Failed to disconnect wallet:', error);
        }
    }

    private promptUsername() {
        const modal = document.createElement('div');
        modal.className = 'username-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h3>Choose your username</h3>
                <input type="text" id="usernameInput" placeholder="Enter username" maxlength="20">
                <div class="modal-buttons">
                    <button id="saveUsername">Save</button>
                    <button id="cancelUsername">Cancel</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        setTimeout(() => modal.classList.add('show'), 0);

        const handleSave = () => {
            const input = document.getElementById('usernameInput') as HTMLInputElement;
            const username = input.value.trim();
            if (username) {
                this.setUsername(username);
                this.showNotification('Username set: ' + username);
                modal.classList.remove('show');
                setTimeout(() => modal.remove(), 300);
            }
        };

        const handleCancel = () => {
            modal.classList.remove('show');
            setTimeout(() => modal.remove(), 300);
            this.disconnect(); // Disconnect if user cancels username selection
        };

        document.getElementById('saveUsername')?.addEventListener('click', handleSave);
        document.getElementById('cancelUsername')?.addEventListener('click', handleCancel);
    }

    public setUsername(name: string) {
        this.username = name;
    }

    public getUsername() {
        return this.username;
    }

    private showNotification(message: string) {
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

    public sendMessage(content: string) {
        if (!this.username) {
            this.showNotification('Please set a username first');
            this.promptUsername();
            return;
        }

        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            const message: ChatMessage = {
                type: 'message',
                username: this.username,
                content: content,
                timestamp: Date.now()
            };
            this.ws.send(JSON.stringify(message));
        }
    }
}

export const walletManager = new WalletManager(); 