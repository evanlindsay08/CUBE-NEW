document.addEventListener('DOMContentLoaded', () => {
    const usernameBtn = document.querySelector('.connect-btn');
    const messageInput = document.getElementById('messageInput');
    const sendButton = document.getElementById('sendButton');
    
    // Username button handler
    usernameBtn.addEventListener('click', async () => {
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
                showComingSoon();
            });
        }
    });

    function showComingSoon() {
        const comingSoon = document.createElement('div');
        comingSoon.className = 'coming-soon-console';
        comingSoon.innerHTML = `
            <div class="console-content">
                <pre class="ascii-art">
 ██████╗ ██████╗ ███╗   ███╗██╗███╗   ██╗ ██████╗     ███████╗ ██████╗  ██████╗ ███╗   ██╗
██╔════╝██╔═══██╗████╗ ████║██║████╗  ██║██╔════╝     ██╔════╝██╔═══██╗██╔═══██╗████╗  ██║
██║     ██║   ██║██╔████╔██║██║██╔██╗ ██║██║  ███╗    ███████╗██║   ██║██║   ██║██╔██╗ ██║
██║     ██║   ██║██║╚██╔╝██║██║██║╚██╗██║██║   ██║    ╚════██║██║   ██║██║   ██║██║╚██╗██║
╚██████╗╚██████╔╝██║ ╚═╝ ██║██║██║ ╚████║╚██████╔╝    ███████║╚██████╔╝╚██████╔╝██║ ╚████║
 ╚═════╝ ╚═════╝ ╚═╝     ╚═╝╚═╝╚═╝  ╚═══╝ ╚═════╝     ╚══════╝ ╚═════╝  ╚═════╝ ╚═╝  ╚═══╝</pre>
            </div>
        `;
        document.body.appendChild(comingSoon);

        // Create scanline effect
        const scanline = document.createElement('div');
        scanline.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 2px;
            background: rgba(0, 255, 0, 0.2);
            animation: scan 2s linear infinite;
        `;
        comingSoon.appendChild(scanline);

        // Animation sequence with more dramatic effect
        requestAnimationFrame(() => {
            comingSoon.classList.add('show');
            comingSoon.style.animation = 'glowPulse 0.5s ease-out';
        });

        setTimeout(() => {
            comingSoon.classList.remove('show');
            comingSoon.style.transform = 'translate(-50%, -50%) scale(0.9) perspective(1000px) rotateX(-45deg)';
            comingSoon.style.opacity = '0';
            setTimeout(() => comingSoon.remove(), 500);
        }, 3000);
    }

    // Add this to your existing CSS
    const style = document.createElement('style');
    style.textContent = `
        @keyframes scan {
            0% { top: 0; }
            100% { top: 100%; }
        }
        @keyframes glowPulse {
            0% { box-shadow: 0 0 50px rgba(0, 255, 0, 0.5); }
            50% { box-shadow: 0 0 100px rgba(0, 255, 0, 0.8); }
            100% { box-shadow: 0 0 50px rgba(0, 255, 0, 0.5); }
        }
    `;
    document.head.appendChild(style);

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