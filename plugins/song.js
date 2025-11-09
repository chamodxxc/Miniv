const axios = require('axios');
const yts = require('yt-search');
const ddownr = require('denethdev-ytmp3');
const sharp = require('sharp');

module.exports = {
  command: "song",
  description: "Download YouTube song in voice note, document, or normal audio format",
  react: "🎵",
  category: "download",

  execute: async (socket, msg, args) => {
    const from = msg.key.remoteJid;
    const sender = msg.key.participant || from;
    const pushname = msg.pushName || "User";
    const query = args.join(" ").trim();

    if (!query) {
      return await socket.sendMessage(from, {
        text: "❌ Please provide a YouTube title or link!\nExample: *.song Faded Alan Walker*",
      }, { quoted: msg });
    }

    try {
      // Search YouTube
      const search = await yts(query);
      const video = search.videos[0];
      if (!video) return await socket.sendMessage(from, { text: "❌ No results found." }, { quoted: msg });

      // Download audio link
      const result = await ddownr.download(video.url, 'mp3');
      const downloadLink = result.downloadUrl;

      // Thumbnail buffer for document
      const getThumbBuffer = async (url) => {
        try {
          const { data } = await axios.get(url, { responseType: 'arraybuffer' });
          return await sharp(data).resize(300, 300).jpeg({ quality: 80 }).toBuffer();
        } catch { return null; }
      };

      // Buttons
      const buttons = [
        { buttonId: '1', buttonText: { displayText: '🔊 Voice Note' }, type: 1 },
        { buttonId: '2', buttonText: { displayText: '📁 Document' }, type: 1 },
        { buttonId: '3', buttonText: { displayText: '🎵 Normal Audio' }, type: 1 },
      ];

      // Caption
      const caption = `
╭───────────────⭓
│  🎵 𝗬𝗼𝘂𝗧𝘂𝗯𝗲 𝗦𝗼𝗻𝗴 𝗗𝗼𝘄𝗻𝗹𝗼𝗮𝗱
│  
│  👤 Requested by: *${pushname}*
│  🎬 Title: *${video.title}*
│  ⏱ Duration: ${video.timestamp}
│  📅 Uploaded: ${video.ago}
│  👁 Views: ${video.views}
│  🔗 URL: ${video.url}
│
│  ⚡ Reply using buttons below to download:
│  
│  ┌─────────────●●►
│  │ 🔊 Voice Note
│  │ 📁 Document
│  │ 🎵 Normal Audio
│  └─────────────●●►
│
╰───────────────⭓
*Powered by WhiteShadow MiniBot*
`;

      // Send message with buttons
      const sentMsg = await socket.sendMessage(from, {
        image: { url: video.thumbnail },
        caption,
        footer: "WhiteShadow MiniBot",
        buttons,
        headerType: 4
      }, { quoted: msg });

      const msgId = sentMsg.key.id;

      // Reply listener
      const handler = async (update) => {
        const mek = update.messages?.[0];
        if (!mek?.message) return;

        const replyTo = mek.message?.extendedTextMessage?.contextInfo?.stanzaId;
        if (replyTo !== msgId) return;

        const text = mek.message?.conversation || mek.message?.extendedTextMessage?.text;
        if (!text) return;

        // React ✅
        await socket.sendMessage(from, { react: { text: "✅", key: mek.key } });

        switch (text.trim()) {
          case "1": // Voice Note
            await socket.sendMessage(from, {
              audio: { url: downloadLink },
              mimetype: "audio/mpeg",
              ptt: true
            }, { quoted: mek });
            break;

          case "2": // Document
            await socket.sendMessage(from, {
              document: { url: downloadLink },
              mimetype: "audio/mpeg",
              jpegThumbnail: await getThumbBuffer(video.thumbnail),
              fileName: `${video.title}.mp3`,
              caption: video.title
            }, { quoted: mek });
            break;

          case "3": // Normal Audio
            await socket.sendMessage(from, {
              audio: { url: downloadLink },
              mimetype: "audio/mpeg",
              ptt: false
            }, { quoted: mek });
            break;

          default:
            await socket.sendMessage(from, { text: "❌ Invalid option. Use buttons only." }, { quoted: mek });
        }
      };

      socket.ev.on("messages.upsert", handler);
      setTimeout(() => socket.ev.off("messages.upsert", handler), 2 * 60 * 1000); // auto-off after 2 min

    } catch (e) {
      console.error("Song Command Error:", e);
      await socket.sendMessage(from, { text: `⚠️ Error: ${e.message}` }, { quoted: msg });
    }
  }
};
