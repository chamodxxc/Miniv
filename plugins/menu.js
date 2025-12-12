
const config = require('../config');

module.exports = {
  command: "menu",
  description: "Show bot command list with buttons",
  react: "🔰",
  category: "main",

  execute: async (socket, msg, args) => {
    try {
      const from = msg.key.remoteJid;
      const sender = msg.key.participant || from;
      const pushname = msg.pushName || "there";

      // Meta AI fake helper with your number
      const fakeMeta = {
        key: {
          participant: `94704896880@s.whatsapp.net`, // ඔබේ number
          remoteJid: from,
          fromMe: false,
          id: 'FAKE_META_menucmd'
        },
        message: {
          contactMessage: {
            displayName: 'Meta AI',
            vcard: `BEGIN:VCARD\nVERSION:3.0\nN:Meta AI;;;;\nFN:Meta AI\nTEL;waid=94704896880:0704896880\nEND:VCARD`,
            sendEphemeral: true
          }
        },
        pushName: 'Meta AI',
        messageTimestamp: Math.floor(Date.now() / 1000)
      };

      // Full menu message
      const menumsg = `
╭▰☭ *WhiteShadow MiniBot* ☭▰╮
✖ 🔰 *BOT NAME:* WhiteShadow MiniBot
✖ 🔰 *OWNER:* WHITESHADOW 
✖ 🔰 *VERSION:* v1.0
✖ 🔰 *USER:* ${pushname}
✖ 🔰 *JID:* @${sender.split("@")[0]}
✖ 🔰 *PREFIX:* ${config.PREFIX}
━━━━━━━━━━━━━━━━━━━
✆ Welcome to WhiteShadow MiniBot!
✆ Use the buttons below to navigate commands.

*╭━━ GENERAL ☭━━┈⊷*
*┃• ALIVE* • PING* • SYSTEM* • SUPPORT* • OWNER* • PAIR* • MENU*
*╰━━━━━━━━━━━━━┈⊷*

*╭━━ DOWNLOAD ☭━━┈⊷*
*┃• SONG* • VIDEO* • TIKTOK* • FACEBOOK* • APK* • IMG*
*╰━━━━━━━━━━━━━┈⊷*

*╭━━ SEARCH ☭━━┈⊷*
*┃• TMDB* • NEWS* • NPM* • FITGIRL* • IMG* • MOVIEDB* • RANDOMIMAGE* • CAT*
*╰━━━━━━━━━━━━━┈⊷*

*╭━━ OWNER ☭━━┈⊷*
*┃• BLOCK* • UNBLOCK* • DELETE* • LEAVE* • ADS* • VV* • JOIN* • CONTACTLIST* • RUN* • CODEADD* • EDIT*
*╰━━━━━━━━━━━━━┈⊷*

*╭━━ GROUP ☭━━┈⊷*
*┃• JOIN* • LEAVE* • BC* • HIDETAG* • WELCOME* • MUTE* • UNMUTE* • KICK* • ADD* • TAGALL* • PROMOTE* • DEMOTE* • GNAME* • GDESC*
*╰━━━━━━━━━━━━━┈⊷*

*╭━━ OTHER ☭━━┈⊷*
*┃• GETPP* • META* • TAKE* • STICKER* • VOICEGPT* • JOKE* • WEATHER* • TRAIN* • BUS* • SUMMARY* • AISUMMARY* • WABETA* • SENDUPDATE* • DL* • TEXTM* • GETDP* • BIRTHDAY* • REPLY* • RANK*
*╰━━━━━━━━━━━━━┈⊷*
> *powered by WhiteShadow*`;

      // Buttons for main menu
      const buttons = [
        { buttonId: 'general', buttonText: { displayText: '📌 GENERAL' }, type: 1 },
        { buttonId: 'download', buttonText: { displayText: '⬇️ DOWNLOAD' }, type: 1 },
        { buttonId: 'search', buttonText: { displayText: '🔎 SEARCH' }, type: 1 },
        { buttonId: 'owner', buttonText: { displayText: '👑 OWNER' }, type: 1 },
      ];

      // Send full menu with buttons
      await socket.sendMessage(from, {
        image: { url: 'https://files.catbox.moe/fyr37r.jpg' },
        caption: menumsg,
        footer: 'WhiteShadow MiniBot',
        buttons,
        headerType: 4,
        contextInfo: {
          mentionedJid: [sender],
          forwardingScore: 999,
          isForwarded: true,
        }
      }, { quoted: fakeMeta });

      // Button response listener
      socket.ev.on('messages.upsert', async ({ messages }) => {
        const buttonMsg = messages[0];
        if (!buttonMsg.message) return;
        if (!buttonMsg.message.buttonsResponseMessage) return;

        const buttonId = buttonMsg.message.buttonsResponseMessage.selectedButtonId;

        let submenu = '';

        switch(buttonId) {
          case 'general':
            submenu = `
╭━━ GENERAL COMMANDS ━━╮
• ALIVE
• PING
• SYSTEM
• SUPPORT
• OWNER
• PAIR
• MENU
╰━━━━━━━━━━━━━━╯`;
            break;
          case 'download':
            submenu = `
╭━━ DOWNLOAD COMMANDS ━━╮
• SONG
• VIDEO
• TIKTOK
• FACEBOOK
• APK
• IMG
╰━━━━━━━━━━━━━━╯`;
            break;
          case 'search':
            submenu = `
╭━━ SEARCH COMMANDS ━━╮
• TMDB
• NEWS
• NPM
• FITGIRL
• IMG
• MOVIEDB
• RANDOMIMAGE
• CAT
╰━━━━━━━━━━━━━━╯`;
            break;
          case 'owner':
            submenu = `
╭━━ OWNER COMMANDS ━━╮
• BLOCK
• UNBLOCK
• DELETE
• LEAVE
• ADS
• VV
• JOIN
• CONTACTLIST
• RUN
• CODEADD
• EDIT
╰━━━━━━━━━━━━━━╯`;
            break;
          default:
            submenu = `❌ Unknown button: ${buttonId}`;
        }

        // Send submenu as reply (Meta AI style)
        await socket.sendMessage(buttonMsg.key.remoteJid, { text: submenu }, { quoted: fakeMeta });
      });

    } catch (e) {
      console.error(e);
      await socket.sendMessage(msg.key.remoteJid, { 
        text: `❌ ERROR: ${e.message}` 
      }, { quoted: msg });
    }
  }
};
