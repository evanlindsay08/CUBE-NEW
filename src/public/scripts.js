document.addEventListener('DOMContentLoaded', async () => {
    // Wait for Phantom to be injected
    let attempts = 0;
    const maxAttempts = 50;
    
    while (!window.solana && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
    }

    const connectBtn = document.querySelector('.connect-btn');
    const messageInput = document.getElementById('messageInput');
    const sendButton = document.getElementById('sendButton');
    
    // Update connect button text if wallet is connected
    if (document.body.classList.contains('wallet-connected')) {
        connectBtn.textContent = 'Options';
    }

    // Connect button handler
    connectBtn.addEventListener('click', async () => {
        if (!window.solana) {
            window.open('https://phantom.app/', '_blank');
            return;
        }
        await window.walletManager.connect();
    });

    // Chat message handlers
    if (messageInput && sendButton) {
        messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });

        sendButton.addEventListener('click', sendMessage);
    }

    function sendMessage() {
        const content = messageInput.value.trim();
        if (content) {
            window.walletManager.sendMessage(content);
            messageInput.value = '';
        }
    }

    // Feature button handlers
    document.querySelectorAll('.box-link').forEach(link => {
        if (link.textContent === 'Art Agent' || link.textContent === 'Copy Writing Agent') {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                if (!document.body.classList.contains('wallet-connected')) {
                    window.walletManager.showNotification('Please connect wallet to use this feature');
                } else {
                    window.walletManager.showNotification('Please wait for the $CUBE contract to be validated');
                }
            });
        }
    });

    // Handle navigation with animation
    document.querySelectorAll('.nav-links a').forEach(link => {
        if (link.getAttribute('href') !== '#') {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                document.querySelector('.console-box').style.animation = 'warpOut 0.6s cubic-bezier(.22,.61,.36,1) forwards';
                setTimeout(() => {
                    window.location = link.getAttribute('href');
                }, 500);
            });
        }
    });
});

function showUsernameModal() {
    const modal = document.createElement('div');
    modal.className = 'username-modal';
    modal.innerHTML = `
        <h3>Choose your username</h3>
        <input type="text" id="usernameInput" placeholder="Enter username" maxlength="20">
        <button id="saveUsername">Save</button>
    `;
    document.body.appendChild(modal);
    
    setTimeout(() => modal.classList.add('show'), 0);
    
    document.getElementById('saveUsername').addEventListener('click', () => {
        const username = document.getElementById('usernameInput').value;
        if (username.trim()) {
            walletManager.setUsername(username);
            modal.classList.remove('show');
            setTimeout(() => modal.remove(), 300);
            showNotification('Username set: ' + username);
        }
    });
}

function showNotification(message) {
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