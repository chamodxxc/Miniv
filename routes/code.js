const express = require('express');
const router = express.Router();
const { makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const config = require('../config');
const fs = require('fs');
const path = require('path');

const activeSockets = new Map();
const SESSION_BASE_PATH = './session';

// Ensure session directory exists
if (!fs.existsSync(SESSION_BASE_PATH)) {
    fs.mkdirSync(SESSION_BASE_PATH, { recursive: true });
}

// Utility function to setup message handlers
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
            } catch (error) {
                console.error(`[${number}] Command error:`, error);
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
    } catch (error) {
        console.error(`❌ Failed to restore session for ${number}:`, error);
    }
}

// Main route
router.get('/', async (req, res) => {
    const { number } = req.query;
    if (!number) return res.status(400).json({ error: 'Number parameter is required' });

    // ✅ Immediately respond to avoid H12 timeout
    res.status(200).json({ status: 'starting_session', number });

    // Start background session restore
    restoreSession(number);
});

module.exports = router;

// Dummy findCommand function, replace with your actual command lookup
function findCommand(name) {
    // Example: return { function: async (socket, msg, opts) => { ... } }
    return null;
}
