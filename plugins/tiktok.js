const axios = require('axios');

const fakeMeta = (from) => ({
  key: {
    participant: `13135550002@s.whatsapp.net`,
    remoteJid: from,
    fromMe: false,
    id: 'FAKE_META_tiktokcmd'
  },
  message: {
    contactMessage: {
      displayName: '©WHITESHADOW-X',
      vcard: `BEGIN:VCARD\nVERSION:3.0\nN:Meta AI;;;;\nFN:Meta AI\nTEL;waid=13135550002:+1 313 555 0002\nEND:VCARD`,
      sendEphemeral: true
    }
  },
  pushName: 'Meta AI',
  messageTimestamp: Math.floor(Date.now() / 1000)
});

module.exports = {
  command: "tiktok",
  description: "🎵 Download TikTok video (buttons + reply support)",
  react: "🎵",
  category: "download",

  execute: async (socket, msg, args) => {
    try {
      const from = msg.key.remoteJid;
      const pushname = msg.pushName || "there";
      const url = args[0];

      if (!url || !url.includes("tiktok.com")) {
        return socket.sendMessage(from, {
          text: "❌ Please provide a valid TikTok URL.\nExample: .tiktok https://vm.tiktok.com/XYZ"
        }, { quoted: fakeMeta(from) });
      }

      // Fetch TikTok JSON
      const api = await axios.get(`https://api.nekolabs.web.id/downloader/tiktok?url=${encodeURIComponent(url)}`);
      if (!api.data.success || !api.data.result) {
        return socket.sendMessage(from, { text: "❌ Failed to fetch TikTok video." }, { quoted: fakeMeta(from) });
      }

      const data = api.data.result;

      // Buttons
      const buttons = [
        { buttonId: 'tt_video', buttonText: { displayText: '🎞️ Video' }, type: 1 },
        { buttonId: 'tt_music', buttonText: { displayText: '🎧 Music' }, type: 1 }
      ];

      // Caption
      const caption = `╭───────────────⭓
│ 👤 Requested by: ${pushname}
│ 🎬 Title: ${data.title}
│ 🕒 Created: ${data.create_at}
│ ▶️ Plays: ${data.stats.play} | ❤️ Likes: ${data.stats.like} | 💬 Comments: ${data.stats.comment} | 🔄 Shares: ${data.stats.share}
│ 🎵 Music: ${data.music_info.title} - ${data.music_info.author}
│ 👤 Author: ${data.author.name} (${data.author.username})
│  
│ 🔢 Reply with 1 or 2, or use buttons below:
│ ├ 1 Video
│ ├ 2 Music
╰───────────────⭓
● WhiteShadow MiniBot ●`;

      const sentMsg = await socket.sendMessage(from, {
        image: { url: data.cover },
        caption,
        footer: "WhiteShadow MiniBot",
        buttons,
        headerType: 4
      }, { quoted: fakeMeta(from) });

      const msgId = sentMsg.key.id;

      // Handle reply messages
      const replyListener = async (update) => {
        try {
          const mek = update.messages[0];
          if (!mek.message) return;
          const isReply = mek.message.extendedTextMessage?.contextInfo?.stanzaId === msgId;
          if (!isReply || mek.key.remoteJid !== from) return;

          const text = mek.message.conversation || mek.message.extendedTextMessage?.text;
          await socket.sendMessage(from, { react: { text: '✅', key: mek.key } });

          if (text.trim() === "1") {
            await socket.sendMessage(from, {
              video: { url: data.videoUrl },
              caption: "🎞️ TikTok Video\n> WhiteShadow MiniBot"
            }, { quoted: fakeMeta(from) });
          } else if (text.trim() === "2") {
            await socket.sendMessage(from, {
              audio: { url: data.musicUrl, mimetype: "audio/mpeg" },
              caption: "🎧 TikTok Music\n> WhiteShadow MiniBot"
            }, { quoted: fakeMeta(from) });
          } else {
            await socket.sendMessage(from, { text: "❌ Invalid option. Reply 1 or 2.", }, { quoted: fakeMeta(from) });
          }
        } catch (err) {
          console.error("Reply handler error:", err);
        }
      };

      // Handle button presses
      socket.ev.on('messages.upsert', async (update) => {
        const mek = update.messages[0];
        if (!mek.message) return;
        if (!mek.message.buttonsResponseMessage) return;
        if (mek.key.remoteJid !== from) return;

        const btnId = mek.message.buttonsResponseMessage.selectedButtonId;
        await socket.sendMessage(from, { react: { text: '✅', key: mek.key } });

        if (btnId === "tt_video") {
          await socket.sendMessage(from, {
            video: { url: data.videoUrl },
            caption: "🎞️ TikTok Video\n> WhiteShadow MiniBot"
          }, { quoted: fakeMeta(from) });
        } else if (btnId === "tt_music") {
          await socket.sendMessage(from, {
            audio: { url: data.musicUrl, mimetype: "audio/mpeg" },
            caption: "🎧 TikTok Music\n> WhiteShadow MiniBot"
          }, { quoted: fakeMeta(from) });
        }
      });

      socket.ev.on("messages.upsert", replyListener);
      setTimeout(() => {
        socket.ev.off("messages.upsert", replyListener);
      }, 2 * 60 * 1000); // 2 min timeout

    } catch (err) {
      console.error(err);
      socket.sendMessage(msg.key.remoteJid, { text: `⚠️ Error: ${err.message}` }, { quoted: fakeMeta(msg.key.remoteJid) });
    }
  }
};
