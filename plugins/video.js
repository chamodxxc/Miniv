const fetch = require("node-fetch");
const yts = require("yt-search");
const axios = require("axios");

module.exports = {
  command: "video",
  alias: ["ytmp4","mp4","ytv","vi","v","vid","vide","videos","ytvi","ytvid","ytvide","ytvideos","searchyt","download","get","need","search"],
  description: "Download YouTube video in multiple formats",
  category: "download",
  react: "🎬",
  usage: ".video <video name>",

  execute: async (socket, msg, args) => {
    const from = msg.key.remoteJid;
    const text = args.join(" ");

    if (!text) {
      return await socket.sendMessage(from, {
        text: `⚠️ *Usage:* .video <video name>\n\nExample:\n.video calm down remix`
      }, { quoted: msg });
    }

    try {
      // Search video
      const search = await yts(text);
      if (!search.videos.length)
        return await socket.sendMessage(from, { text: "❌ No video found." }, { quoted: msg });

      const data = search.videos[0];
      const ytUrl = data.url;

      // Format list
      const formats = ["360", "720", "1080", "mp3"];

      let caption = `╭───〔 *🎬 YouTube Video Info* 〕───⬤
│ 📺 *Title:* ${data.title}
│ 👤 *Channel:* ${data.author.name}
│ ⏱️ *Duration:* ${data.timestamp}
│ 👁️ *Views:* ${data.views}
│ 🔗 *Link:* ${data.url}
╰───────────────────────────⬤

*Select Format to Download:*
「 1 」360p
「 2 」720p
「 3 」1080p
「 4 」MP3 Audio`;

      // Send preview message
      const sentMsg = await socket.sendMessage(
        from,
        { image: { url: data.thumbnail }, caption },
        { quoted: msg }
      );

      const replyId = sentMsg.key.id;

      // Handler
      const handler = async (msgData) => {
        const receivedMsg = msgData.messages[0];
        if (!receivedMsg?.message) return;

        const senderID = receivedMsg.key.remoteJid;

        const receivedText =
          receivedMsg.message.conversation ||
          receivedMsg.message.extendedTextMessage?.text;

        const isReplyToBot =
          receivedMsg.message.extendedTextMessage?.contextInfo?.stanzaId === replyId;

        if (!isReplyToBot) return;

        const choice = parseInt(receivedText.trim());
        if (!choice || choice < 1 || choice > formats.length) {
          return await socket.sendMessage(
            senderID,
            { text: "⚠️ Please reply a number (1-4)" },
            { quoted: receivedMsg }
          );
        }

        const selectedFormat = formats[choice - 1];

        // Izumi YouTube Downloader API
        const apiUrl = `https://api.ootaizumi.web.id/downloader/youtube?url=${encodeURIComponent(
          ytUrl
        )}&format=${selectedFormat}`;

        try {
          const { data } = await axios.get(apiUrl);

          if (!data?.status || !data?.result) {
            return await socket.sendMessage(
              senderID,
              { text: "❌ Unable to download this format." },
              { quoted: receivedMsg }
            );
          }

          const res = data.result;

          if (selectedFormat === "mp3") {
            await socket.sendMessage(
              senderID,
              {
                audio: { url: res.download },
                mimetype: "audio/mpeg",
                fileName: `${res.title}.mp3`,
                caption: `🎧 *${res.title}*`
              },
              { quoted: receivedMsg }
            );
          } else {
            await socket.sendMessage(
              senderID,
              {
                video: { url: res.download },
                mimetype: "video/mp4",
                caption: `🎬 *${res.title}* (${selectedFormat}p)`
              },
              { quoted: receivedMsg }
            );
          }
        } catch (err) {
          console.error("Format download error:", err);
          await socket.sendMessage(
            senderID,
            { text: "❌ Error downloading video." },
            { quoted: receivedMsg }
          );
        }

        socket.ev.off("messages.upsert", handler);
      };

      socket.ev.on("messages.upsert", handler);

    } catch (error) {
      console.error("Video command error:", error);
      await socket.sendMessage(from, { text: "❌ Something went wrong." }, { quoted: msg });
    }
  }
};
