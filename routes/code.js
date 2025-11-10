// routes/code.js
const express = require('express');
const router = express.Router();
const { makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const path = require('path');
const fs = require('fs');
const config = require('../config');

const SESSION_BASE_PATH = './session';
const activeSockets = new Map();

// Ensure session directory exists
if (!fs.existsSync(SESSION_BASE_PATH)) {
    fs.mkdirSync(SESSION_BASE_PATH, { recursive: true });
}

// Utility: find command (replace with your actual commands)
function findCommand(name) {
    // Example structure
    // return { function: async (socket, msg, opts) => { ... } }
    return null;
}

// Setup message handlers
function setupHandlers(socket, number) {
    socket.ev.on('messages.upsert', async ({ messages }) => {
        const msg = messages[0];
        if (!msg.message) return;

        const text = msg.message.conversation || msg.message.extendedTextMessage?.text || '';
        if (!text.startsWith(config.PREFIX)) return;

        const cmdName = text.slice(config.PREFIX.length).split(' ')[0].toLowerCase();
        const command = findCommand(cmdName);

        if (command) {
            try {
                await command.function(socket, msg, {
                    from: msg.key.remoteJid,
                    pushname: msg.pushName,
                    quoted: msg,
                    reply: (text) => socket.sendMessage(msg.key.remoteJid, { text }, { quoted: msg })
                });
            } catch (err) {
                console.error(`[${number}] Command error:`, err);
            }
        }
    });
}

// Async session restore in background
async function restoreSession(number) {
    try {
        const { state, saveCreds } = await useMultiFileAuthState(path.join(SESSION_BASE_PATH, number));
        const socket = makeWASocket({
            auth: state,
            printQRInTerminal: true,
            logger: { level: 'silent' }
        });

        socket.ev.on('connection.update', (update) => {
            if (update.connection === 'open') {
                activeSockets.set(number, socket);
                setupHandlers(socket, number);
                console.log(`✅ WhatsApp connected: ${number}`);
            }

            if (update.connection === 'close') {
                console.log(`❌ WhatsApp disconnected: ${number}`);
                activeSockets.delete(number);
            }
        });

        socket.ev.on('creds.update', saveCreds);
    } catch (err) {
        console.error(`❌ Failed to restore session for ${number}:`, err);
    }
}

// Main GET /code route
router.get('/', async (req, res) => {
    const { number } = req.query;
    if (!number) return res.status(400).json({ error: 'Number parameter is required' });

    // ✅ Immediately respond to avoid H12
    res.status(200).json({ status: 'session_starting', number });

    // ✅ Start session restore in background
    restoreSession(number);
});

module.exports = router;
