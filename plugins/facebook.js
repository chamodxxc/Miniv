const axios = require('axios');

function formatDuration(ms) {
  if (!ms) return "N/A";
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// Meta AI fake style message
const fakeMeta = (from) => ({
  key: {
    participant: `13135550002@s.whatsapp.net`,
    remoteJid: from,
    fromMe: false,
    id: 'FAKE_META_facebookcmd'
  },
  message: {
    contactMessage: {
      displayName: 'Meta AI',
      vcard: `BEGIN:VCARD\nVERSION:3.0\nN:Meta AI;;;;\nFN:Meta AI\nTEL;waid=13135550002:+1 313 555 0002\nEND:VCARD`,
      sendEphemeral: true
    }
  },
  pushName: 'Meta AI',
  messageTimestamp: Math.floor(Date.now() / 1000)
});

module.exports = {
  command: "facebook",
  description: "📘 Download Facebook Reel Video (HD/SD) with details (Meta AI style)",
  react: "📥",
  category: "download",

  execute: async (socket, msg, args) => {
    try {
      const from = msg.key.remoteJid;
      const pushname = msg.pushName || "there";
      const url = args[0];

      if (!url || !url.includes("facebook.com")) {
        return await socket.sendMessage(from, {
          text: `❌ *Please provide a valid Facebook video/reel URL!*\n\nExample: *.facebook https://www.facebook.com/reel/xyz*`,
        }, { quoted: fakeMeta(from) });
      }

      // API call
      const api = await axios.get(`https://facebook-downloader.chamodshadow125.workers.dev/api/fb?url=${encodeURIComponent(url)}`);

      if (!api.data || !api.data.download || !api.data.download.videos) {
        return await socket.sendMessage(from, {
          text: "❌ Failed to fetch video data. Please check your URL or try later.",
        }, { quoted: fakeMeta(from) });
      }

      const videos = api.data.download.videos;
      const hdVideo = videos.find(v => v.quality.includes("720"))?.link;
      const sdVideo = videos.find(v => v.quality.includes("360"))?.link;

      const title = api.data.metadata?.title || "Facebook Video";
      const duration = api.data.metadata?.duration || "N/A";
      const thumbnail = api.data.metadata?.thumbnail || "https://files.catbox.moe/fyr37r.jpg";

      const caption =
`╭───────────────⭓
│  👤 Requested by: ${pushname}
│  🎬 Title: ${title}
│  ⏱ Duration: ${duration}
│  🔗 Source: ${url}
│  
│  🔢 Reply with the number to download:
│  ╭─────────────●●►
│  ├ 🎞️ 1 HD Video
│  ├ 📼 2 SD Video
│  ├ 🎧 3 Audio Only (Unavailable)
│  ╰─────────────●●►
╰───────────────⭓
● WhiteShadow MiniBot ●`;

      const sentMsg = await socket.sendMessage(from, {
        image: { url: thumbnail },
        caption,
      }, { quoted: fakeMeta(from) });

      const msgId = sentMsg.key.id;

      // Reply listener
      const listener = async (update) => {
        try {
          const mek = update.messages[0];
          if (!mek.message) return;

          const isReply = mek.message.extendedTextMessage?.contextInfo?.stanzaId === msgId;
          if (!isReply || mek.key.remoteJid !== from) return;

          const text = mek.message.conversation || mek.message.extendedTextMessage?.text;
          await socket.sendMessage(from, { react: { text: '✅', key: mek.key } });

          switch (text.trim()) {
            case "1":
              if (!hdVideo) return socket.sendMessage(from, { text: "❌ HD video not available." }, { quoted: fakeMeta(from) });
              await socket.sendMessage(from, { video: { url: hdVideo }, caption: "✅ *Facebook Video (HD)*\n> WhiteShadow MiniBot" }, { quoted: fakeMeta(from) });
              break;

            case "2":
              if (!sdVideo) return socket.sendMessage(from, { text: "❌ SD video not available." }, { quoted: fakeMeta(from) });
              await socket.sendMessage(from, { video: { url: sdVideo }, caption: "📼 *Facebook Video (SD)*\n> WhiteShadow MiniBot" }, { quoted: fakeMeta(from) });
              break;

            case "3":
              await socket.sendMessage(from, { text: "❌ Audio only option is not available for Facebook videos." }, { quoted: fakeMeta(from) });
              break;

            default:
              await socket.sendMessage(from, { text: "❌ Invalid option. Please reply with 1, 2, or 3." }, { quoted: fakeMeta(from) });
          }
        } catch (err) {
          console.error("Reply handler error:", err);
        }
      };

      socket.ev.on("messages.upsert", listener);
      setTimeout(() => socket.ev.off("messages.upsert", listener), 2 * 60 * 1000);

    } catch (e) {
      console.error("Main error:", e);
      await socket.sendMessage(msg.key.remoteJid, { text: `⚠️ Error occurred: ${e.message}` }, { quoted: fakeMeta(msg.key.remoteJid) });
    }
  }
};
