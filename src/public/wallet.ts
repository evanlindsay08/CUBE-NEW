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
            off(event: string, callback: () => void): void;
            isPhantom?: boolean;
            isConnected: boolean;
            publicKey?: { toString(): string };
            request(params: { method: string; params?: any[] }): Promise<any>;
        };
    }
}

class WalletManager {
    private wallet: MessageSignerWalletAdapter | null = null;
    private username: string = '';
    private ws: WebSocket | null = null;
    
    constructor() {
        this.initializeWallet();
        this.initializeWebSocket();
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
                <h3>Connect Wallet</h3>
                <div class="wallet-list">
                    <button class="wallet-option phantom">
                        <img src="https://phantom.app/img/logo.png" alt="Phantom">
                        <span>Phantom</span>
                    </button>
                    <button class="wallet-option solflare">
                        <img src="https://solflare.com/assets/logo.svg" alt="Solflare">
                        <span>Solflare</span>
                    </button>
                    <button class="wallet-option slope">
                        <img src="https://slope.finance/assets/images/logo.svg" alt="Slope">
                        <span>Slope</span>
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

        // Handle wallet selection
        const walletButtons = modal.querySelectorAll('.wallet-option');
        walletButtons.forEach(button => {
            button.addEventListener('click', async () => {
                if (window.solana && button.classList.contains('phantom')) {
                    try {
                        await window.solana.connect();
                        modal.classList.remove('show');
                        setTimeout(() => modal.remove(), 300);
                        this.showNotification('Wallet connected!');
                        document.body.classList.add('wallet-connected');
                        this.promptUsername();
                    } catch (error) {
                        this.showNotification('Failed to connect wallet');
                    }
                } else {
                    this.showNotification('Please install Phantom wallet');
                }
            });
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
}

export const walletManager = new WalletManager(); 