document.addEventListener('DOMContentLoaded', () => {
    const messageInput = document.getElementById('messageInput');
    const sendButton = document.getElementById('sendButton');
    
    // Feature button handlers
    document.querySelectorAll('.box-link').forEach(link => {
        if (link.textContent === 'Art Agent' || link.textContent === 'Copy Writing Agent') {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                if (!document.body.classList.contains('wallet-connected')) {
                    showNotification('Please connect wallet to use this feature');
                } else {
                    showNotification('Please wait for the $CUBE contract to be validated');
                }
            });
        }
    });

    // Chat functionality (only on chat page)
    if (messageInput && sendButton) {
        messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });

        sendButton.addEventListener('click', sendMessage);

        function sendMessage() {
            const content = messageInput.value.trim();
            if (content) {
                window.walletManager.sendMessage(content);
                messageInput.value = '';
            }
        }
    }
});

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