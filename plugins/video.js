const fetch = require("node-fetch");
const yts = require("yt-search");
const axios = require("axios");

module.exports = {
  command: "video",
  alias: ["ytmp4","mp4","ytv","vi","v","vid","vide","videos","ytvi","ytvid","ytvide","ytvideos","searchyt","download","get","need","search"],
  description: "Download YouTube video in MP4 format",
  category: "download",
  react: "🎬",
  usage: ".video <video name>",

  execute: async (socket, msg, args) => {
    const from = msg.key.remoteJid;
    const text = args.join(" ");

    if (!text) {
      return await socket.sendMessage(from, {
        text: `⚠️ *Usage:* .video <video name>\n\nExample:\n.video Believer - Imagine Dragons\n\nThis command will search the video on YouTube and let you download it easily 🎧`
      }, { quoted: msg });
    }

    try {
      const search = await yts(text);
      if (!search.videos.length) 
        return await socket.sendMessage(from, { text: "❌ Sorry, no video found." }, { quoted: msg });

      const data = search.videos[0];
      const ytUrl = data.url;

      // Replace 'APIKEY' with your real key
      const api = `https://gtech-api-xtp1.onrender.com/api/video/yt?apikey=APIKEY&url=${encodeURIComponent(ytUrl)}`;
      const { data: apiRes } = await axios.get(api);

      if (!apiRes?.status || !apiRes.result?.media?.video_url) {
        return await socket.sendMessage(from, { text: "⚠️ Unable to download video right now. Please try again later." }, { quoted: msg });
      }

      const result = apiRes.result.media;

      const caption = `╭───〔 *🎬 YouTube Video Info* 〕───⬤
│ 📺 *Title:* ${data.title}
│ 👤 *Channel:* ${data.author.name}
│ ⏱️ *Duration:* ${data.timestamp}
│ 👁️ *Views:* ${data.views}
│ 🔗 *Link:* ${data.url}
╰───────────────────────────⬤

Choose how you want to receive the video:
「 1 」▶️ Watch Online
「 2 」📁 Download File`;

      // Send thumbnail preview + info
      const sentMsg = await socket.sendMessage(from, { image: { url: result.thumbnail }, caption }, { quoted: msg });
      const replyId = sentMsg.key.id;

      // Temporary message handler
      const handler = async (msgData) => {
        const receivedMsg = msgData.messages[0];
        if (!receivedMsg?.message) return;

        const receivedText = receivedMsg.message.conversation || receivedMsg.message.extendedTextMessage?.text;
        const isReplyToBot = receivedMsg.message.extendedTextMessage?.contextInfo?.stanzaId === replyId;
        const senderID = receivedMsg.key.remoteJid;

        if (!isReplyToBot) return;

        switch (receivedText.trim()) {
          case "1":
            await socket.sendMessage(senderID, { video: { url: result.video_url }, mimetype: "video/mp4", caption: `🎥 *${data.title}*` }, { quoted: receivedMsg });
            break;

          case "2":
            await socket.sendMessage(senderID, { document: { url: result.video_url }, mimetype: "video/mp4", fileName: `${data.title}.mp4` }, { quoted: receivedMsg });
            break;

          default:
            await socket.sendMessage(senderID, { text: "⚠️ Please reply with only *1* or *2*." }, { quoted: receivedMsg });
        }

        // Remove handler after 1 use (memory-safe)
        socket.ev.off("messages.upsert", handler);
      };

      socket.ev.on("messages.upsert", handler);

    } catch (error) {
      console.error("Video download error:", error);
      await socket.sendMessage(from, { text: "❌ Something went wrong while downloading the video. Please try again later." }, { quoted: msg });
    }
  }
};
