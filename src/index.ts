import express, { Request, Response } from 'express';
import path from 'path';
import { WebSocketServer, WebSocket } from 'ws';
import http from 'http';

interface ChatMessage {
    type: 'message' | 'status';
    username: string;
    content: string;
    timestamp: number;
    userColor: string;
}

const COLORS = [
    '#ff0000', // red
    '#ff8000', // orange
    '#ffff00', // yellow
    '#80ff00', // lime
    '#00ff00', // green
    '#00ff80', // spring green
    '#00ffff', // cyan
    '#0080ff', // sky blue
    '#0000ff', // blue
    '#8000ff', // purple
    '#ff00ff', // magenta
    '#ff0080'  // pink
];

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const port = process.env.PORT || 3000;
let connectedClients = new Set<WebSocket>();
let messageHistory: ChatMessage[] = [];
const userColors = new Map<string, string>();
const MAX_MESSAGES = 100;

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
    res.status(200).send('OK');
});

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Route for the home page
app.get('/', (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Route for the chat page
app.get('/chat', (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, 'public', 'chat.html'));
});

// Catch-all route to handle client-side routing
app.get('*', (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// WebSocket connection handling
wss.on('connection', (ws: WebSocket) => {
    connectedClients.add(ws);
    
    // Send message history to new client
    messageHistory.forEach(msg => {
        ws.send(JSON.stringify(msg));
    });
    
    // Send current user count to all clients
    broadcastUserCount();

    ws.on('message', (data: string) => {
        try {
            const message: ChatMessage = JSON.parse(data.toString());
            
            // Assign color to user if they don't have one
            if (!userColors.has(message.username)) {
                const availableColors = COLORS.filter(color => 
                    ![...userColors.values()].includes(color)
                );
                const randomColor = availableColors.length > 0 
                    ? availableColors[Math.floor(Math.random() * availableColors.length)]
                    : COLORS[Math.floor(Math.random() * COLORS.length)];
                userColors.set(message.username, randomColor);
            }
            
            // Add color to message
            message.userColor = userColors.get(message.username) || COLORS[0];
            
            // Save message to history
            messageHistory.push(message);
            if (messageHistory.length > MAX_MESSAGES) {
                messageHistory.shift();
            }
            
            // Broadcast message to all connected clients
            broadcastMessage(message);
        } catch (error) {
            console.error('Error processing message:', error);
        }
    });

    ws.on('close', () => {
        connectedClients.delete(ws);
        broadcastUserCount();
    });
});

function broadcastMessage(message: ChatMessage) {
    const messageStr = JSON.stringify(message);
    connectedClients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(messageStr);
        }
    });
}

function broadcastUserCount() {
    const countMessage = JSON.stringify({
        type: 'status',
        content: connectedClients.size.toString()
    });
    
    connectedClients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(countMessage);
        }
    });
}

// Error handling
app.use((err: Error, req: Request, res: Response, next: Function) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

server.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
}); 