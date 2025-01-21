"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
class ChatSystem {
    constructor() {
        this.bannedPatterns = [
            // Banned words and variations
            /\b(rug|fud|rugger|rigged|fraud)\b/i,
            /\b(dev\s*sold|made\s*before|done\s*before)\b/i,
            /\bprism\b/i,
            // Contract address pattern (0x followed by 40 hex chars)
            /0x[a-fA-F0-9]{40}/,
            // General hex-like strings that could be contracts
            /\b[a-fA-F0-9]{32,}\b/
        ];
        this.messageHistory = [];
        this.maxMessages = 100;
        this.initializeWebSocket();
    }
    initializeWebSocket() {
        // WebSocket implementation here
    }
    validateMessage(message) {
        // Check message against banned patterns
        for (const pattern of this.bannedPatterns) {
            if (pattern.test(message)) {
                return false;
            }
        }
        // Additional checks
        if (message.length > 280)
            return false; // Max length
        if (message.trim().length === 0)
            return false; // Empty message
        return true;
    }
    sendMessage(user, message) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.validateMessage(message)) {
                return false;
            }
            const chatMessage = {
                user,
                message: this.sanitizeMessage(message),
                timestamp: Date.now()
            };
            this.messageHistory.push(chatMessage);
            if (this.messageHistory.length > this.maxMessages) {
                this.messageHistory.shift();
            }
            // Send to WebSocket here
            return true;
        });
    }
    sanitizeMessage(message) {
        // Basic XSS prevention
        return message
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
}
const app = (0, express_1.default)();
const port = 3000;
// Initialize WebSocket server
const chatSystem = new ChatSystem();
// Serve static files from the public directory
app.use(express_1.default.static(path_1.default.join(__dirname, 'public')));
// Route for the home page
app.get('/', (req, res) => {
    res.sendFile(path_1.default.join(__dirname, 'public', 'index.html'));
});
// Route for the chat page
app.get('/chat', (req, res) => {
    res.sendFile(path_1.default.join(__dirname, 'public', 'chat.html'));
});
// Catch-all route for 404s
app.use((req, res) => {
    res.status(404).send('Page not found');
});
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
