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

      const buttons = [
        { buttonId: 'general', buttonText: { displayText: '📌 GENERAL' }, type: 1 },
        { buttonId: 'download', buttonText: { displayText: '⬇️ DOWNLOAD' }, type: 1 },
        { buttonId: 'search', buttonText: { displayText: '🔎 SEARCH' }, type: 1 },
        { buttonId: 'owner', buttonText: { displayText: '👑 OWNER' }, type: 1 },
      ];

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
      }, { quoted: msg });

    } catch (e) {
      console.error(e);
      await socket.sendMessage(msg.key.remoteJid, { 
        text: `❌ ERROR: ${e.message}` 
      }, { quoted: msg });
    }
  }
};
