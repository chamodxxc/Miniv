const fetch = require('node-fetch');

module.exports = {
  command: 'song',
  alias: ["play","mp3","audio","music","s","so","son","songs"],
  description: "Download YouTube song (Audio) via Nekolabs API",
  category: "download",
  react: "🎵",
  usage: ".song <song name>",

  execute: async (socket, msg, args) => {
    const from = msg.key.remoteJid;
    const text = args.join(" ");

    if (!text) {
      return await socket.sendMessage(from, {
        text: `*🎧 Use this command properly!*\n\n*Example:* .song Shape of You\n\n_Then I'll download and send your requested audio ❤️_`
      }, { quoted: msg });
    }

    try {
      // 🔹 Nekolabs API Call
      const apiUrl = `https://api.nekolabs.my.id/downloader/youtube/play/v1?q=${encodeURIComponent(text)}`;
      const res = await fetch(apiUrl);
      const data = await res.json();

      if (!data?.success || !data?.result?.downloadUrl) {
        return await socket.sendMessage(from, { text: "*😔 Song not found!*" }, { quoted: msg });
      }

      const meta = data.result.metadata;
      const dlUrl = data.result.downloadUrl;

      // 🔹 Fetch thumbnail
      let buffer;
      try {
        const thumbRes = await fetch(meta.cover);
        buffer = Buffer.from(await thumbRes.arrayBuffer());
      } catch {
        buffer = null;
      }

      // 🔹 Info Card
      const caption = `╭───〔 *🎧 SONG INFO* 〕───⬤
│ 🎵 *Title:* ${meta.title}
│ 📺 *Channel:* ${meta.channel}
│ ⏱️ *Duration:* ${meta.duration}
│ 💾 *Quality:* 128kbps
│ 🤖 *Bot:* 𝗪𝗛𝗜𝗧𝗘𝗦𝗛𝗔𝗗𝗢𝗪-𝗠𝗗
╰───────────────────────────⬤`;

      // 🖼️ Send thumbnail
      if (buffer) {
        await socket.sendMessage(from, { image: buffer, caption }, { quoted: msg });
      } else {
        await socket.sendMessage(from, { text: caption }, { quoted: msg });
      }

      // 🎧 Send MP3
      await socket.sendMessage(from, {
        audio: { url: dlUrl },
        mimetype: "audio/mpeg",
        fileName: `${meta.title.replace(/[\\/:*?"<>|]/g, "").slice(0, 80)}.mp3`
      }, { quoted: msg });

    } catch (err) {
      console.error("Audio download error:", err);
      await socket.sendMessage(from, { text: "*❌ Error: Please try again later!*" }, { quoted: msg });
    }
  }
};
