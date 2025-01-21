interface Window {
    solana?: {
        connect(): Promise<void>;
        disconnect(): Promise<void>;
        on(event: string, callback: () => void): void;
        isPhantom?: boolean;
    };
    walletManager?: any;
    WalletManager?: any;
} 