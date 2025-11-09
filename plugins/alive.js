module.exports = {
  command: "alive",
  description: "Check if bot is running with WHITESHADOW-MD style",
  category: "info",

  async execute(sock, msg) {
    try {
      const jid = msg.key.remoteJid;
      const sender = msg.key.participant || msg.key.remoteJid;
      const jidName = sender.split("@")[0];

      const date = new Date().toLocaleDateString();
      const time = new Date().toLocaleTimeString();
      const speed = Math.floor(Math.random() * 90 + 10);

      const caption = `
╭───────────────⭓
│  🤖 ʙᴏᴛ ɴᴀᴍᴇ: ᴡʜɪᴛᴇꜱʜᴀᴅᴏᴡ-ᴍᴅ
│  💠 ꜱᴛᴀᴛᴜꜱ: ᴏɴʟɪɴᴇ ✅
│  ⚡ ꜱᴘᴇᴇᴅ: ${speed}ᴍꜱ
│  👤 ᴜꜱᴇʀ: @${jidName}
│  📆 ᴅᴀᴛᴇ: ${date}
│  ⏰ ᴛɪᴍᴇ: ${time}
│  🔰 ᴘʀᴇꜰɪx: .
╰───────────────⭓`;

      // Fake vCard for verified style
      const fakevCard = {
        key: {
          fromMe: false,
          participant: "0@s.whatsapp.net",
          remoteJid: "status@broadcast"
        },
        message: {
          contactMessage: {
            displayName: "© WHITESHADOW-VERIFIED ✅",
            vcard: `BEGIN:VCARD\nVERSION:3.0\nFN:WHITESHADOW\nORG:WHITESHADOW-MD;\nTEL;type=CELL;type=VOICE;waid=94704896880:+94704896880\nEND:VCARD`
          }
        }
      };

      // Buttons
      const aliveMessage = {
        image: { url: 'https://raw.githubusercontent.com/cnw-db/WHITESHADOW-MD-/refs/heads/main/IMG-20250926-WA0023.jpg' },
        caption: caption,
        buttons: [
          {
            buttonId: '.menu',
            buttonText: { displayText: '📂 ᴍᴇɴᴜ' },
            type: 1
          },
          {
            buttonId: '.bot_stats',
            buttonText: { displayText: '🌟 ʙᴏᴛ sᴛᴀᴛs' },
            type: 1
          },
          {
            buttonId: '.bot_info',
            buttonText: { displayText: '🌸 ʙᴏᴛ ɪɴғᴏ' },
            type: 1
          }
        ],
        headerType: 1
      };

      await sock.sendMessage(jid, aliveMessage, { quoted: fakevCard });

    } catch (err) {
      console.error("❌ Error in alive command:", err);
      await sock.sendMessage(msg.key.remoteJid, {
        text: "❌ Error checking bot status",
      });
    }
  },
};