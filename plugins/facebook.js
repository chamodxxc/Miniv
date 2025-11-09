const axios = require('axios');

function formatDuration(ms) {
  if (!ms) return "N/A";
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

module.exports = {
  command: "facebook",
  description: "📘 Download Facebook Reel Video (HD/SD) with details",
  react: "📥",
  category: "download",

  execute: async (socket, msg, args) => {
    try {
      const from = msg.key.remoteJid;
      const url = args[0];
      const pushname = msg.pushName || "there";

      if (!url || !url.includes("facebook.com")) {
        return await socket.sendMessage(from, {
          text: `❌ *Please provide a valid Facebook video/reel URL!*\n\nExample: *.facebook https://www.facebook.com/reel/xyz*`,
        }, { quoted: msg });
      }

      const api = await axios.get(`https://api.siputzx.my.id/api/d/facebook?url=${encodeURIComponent(url)}`);
      if (!api.data.status || !api.data.data) {
        return await socket.sendMessage(from, {
          text: "❌ Failed to fetch video data. Please try again later or check your URL.",
        }, { quoted: msg });
      }

      const data = api.data.data;
      if (!data.urls || !Array.isArray(data.urls) || data.urls.length === 0) {
        return await socket.sendMessage(from, {
          text: "❌ No downloadable video URLs found. The video may be private or unavailable.",
        }, { quoted: msg });
      }

      const hdVideo = data.urls[0];
      const sdVideo = data.urls[1] || null;
      const title = data.title || "N/A";
      const duration = formatDuration(data.duration);
      const comments = data.comments ?? "N/A";
      const reactions = data.reactions ?? "N/A";
      const views = data.views ?? "N/A";

      const caption =
`╭───────────────⭓
│  👤 Requested by: ${pushname}
│  🎬 Title: ${title}
│  ⏱ Duration: ${duration}
│  👁️ Views: ${views}
│  ❤️ Reactions: ${reactions}
│  💬 Comments: ${comments}
│  🔗 Source: ${url}
│  
│  🔢 Reply with the number to download:
│  ╭─────────────●●►
│  ├ 🎞️ 1 HD Video
│  ├ 📼 2 SD Video
│  ├ 🎧 3 Audio Only (Unavailable)
│  ╰─────────────●●►
│  ⚠️ Note: Audio-only option is currently unavailable for Facebook videos.
╰───────────────⭓
● WhiteShadow MiniBot ●`;

      const previewUrl = "https://files.catbox.moe/fyr37r.jpg";

      const sentMsg = await socket.sendMessage(from, {
        image: { url: previewUrl },
        caption,
      }, { quoted: msg });

      const msgId = sentMsg.key.id;

      // Listener for reply
      const messageListener = async (update) => {
        try {
          const mek = update.messages[0];
          if (!mek.message) return;

          const isReply = mek.message.extendedTextMessage?.contextInfo?.stanzaId === msgId;
          if (!isReply || mek.key.remoteJid !== from) return;

          const text = mek.message.conversation || mek.message.extendedTextMessage?.text;
          await socket.sendMessage(from, { react: { text: '✅', key: mek.key } });

          switch (text.trim()) {
            case "1":
              if (!hdVideo) return socket.sendMessage(from, { text: "❌ HD video not available." }, { quoted: mek });
              await socket.sendMessage(from, {
                video: { url: hdVideo },
                caption: "✅ *Facebook Video (HD)*\n> WhiteShadow MiniBot"
              }, { quoted: mek });
              break;

            case "2":
              if (!sdVideo) return socket.sendMessage(from, { text: "❌ SD video not available." }, { quoted: mek });
              await socket.sendMessage(from, {
                video: { url: sdVideo },
                caption: "📼 *Facebook Video (SD)*\n> WhiteShadow MiniBot"
              }, { quoted: mek });
              break;

            case "3":
              await socket.sendMessage(from, {
                text: "❌ Audio only option is not available for Facebook videos.",
              }, { quoted: mek });
              break;

            default:
              await socket.sendMessage(from, {
                text: "❌ Invalid option. Please reply with 1, 2, or 3.",
              }, { quoted: mek });
          }
        } catch (err) {
          console.error("Reply handler error:", err);
        }
      };

      socket.ev.on("messages.upsert", messageListener);
      setTimeout(() => {
        socket.ev.off("messages.upsert", messageListener);
      }, 2 * 60 * 1000); // 2 min timeout for reply

    } catch (e) {
      console.error("Main error:", e);
      await socket.sendMessage(msg.key.remoteJid, {
        text: `⚠️ Error occurred: ${e.message}`,
      }, { quoted: msg });
    }
  }
};
