// File: plugins/xnxx.js
const { fetchJson } = require('../lib/functions');

const activeReplyHandlers = new Map(); // prevent duplicate listeners

module.exports = {
  command: "xnxx",
  description: "Search & download XNXX videos with quality option",
  react: "🔞",
  category: "adult",

  execute: async (socket, msg, args) => {
    const from = msg.key.remoteJid;
    const q = args.join(" ").trim();

    if (!q) {
      return await socket.sendMessage(from, {
        text: "❌ *Please provide a search keyword!*\n\nExample: *.xnxx mia khalifa*",
      }, { quoted: msg });
    }

    try {
      const searchApi = await fetchJson(`https://tharuzz-ofc-api-v2.vercel.app/api/search/xvsearch?query=${encodeURIComponent(q)}`);
      if (!searchApi.result?.xvideos?.length) {
        return await socket.sendMessage(from, { text: `❌ No results found for "${q}".` }, { quoted: msg });
      }

      const videos = searchApi.result.xvideos.slice(0, 10);
      let caption = `🔞 *XNXX Results for:* ${q}\n\n`;
      videos.forEach((v, i) => caption += `*${i + 1}.* ${v.title}\n`);
      caption += `\n📥 Reply with the number to select a video (1-${videos.length})\n\n> powered by WHITESHADOW MD`;

      const sentMsg = await socket.sendMessage(from, { text: caption }, { quoted: msg });
      const msgId = sentMsg.key.id;
      if (activeReplyHandlers.has(msgId)) return;

      const messageListener = async (update) => {
        const m = update.messages?.[0];
        if (!m?.message) return;
        const replyTo = m.message.extendedTextMessage?.contextInfo?.stanzaId;
        if (replyTo !== msgId) return;

        const text = m.message.conversation || m.message.extendedTextMessage?.text;
        const selectedNum = parseInt(text.trim());
        if (isNaN(selectedNum) || selectedNum < 1 || selectedNum > videos.length) {
          return await socket.sendMessage(from, { text: `❌ Invalid selection. Reply with 1-${videos.length}.` }, { quoted: m });
        }

        await socket.sendMessage(from, { react: { text: "✅", key: m.key } });

        const chosen = videos[selectedNum - 1];
        const downloadApi = await fetchJson(`https://tharuzz-ofc-api-v2.vercel.app/api/download/xvdl?url=${chosen.link}`);
        const info = downloadApi.result;
        const urlHigh = info.dl_Links.highquality;
        const urlLow = info.dl_Links.lowquality;

        const askMsg = await socket.sendMessage(from, {
          image: { url: info.thumbnail },
          caption: `*🔞 VIDEO INFO*\n\n` +
                   `*Title:* ${info.title}\n` +
                   `*Duration:* ${info.duration}\n\n` +
                   `Reply number:\n1 | High Quality\n2 | Low Quality\n\n© WHITESHADOW-MD`
        }, { quoted: m });

        const typeListener = async (tUpdate) => {
          const tMsg = tUpdate.messages?.[0];
          if (!tMsg?.message) return;

          const replyTo2 = tMsg.message.extendedTextMessage?.contextInfo?.stanzaId;
          if (replyTo2 !== askMsg.key.id) return;

          conn.ev.off("messages.upsert", typeListener);

          const choice = parseInt(tMsg.message.conversation || tMsg.message.extendedTextMessage?.text);
          if (![1, 2].includes(choice)) {
            return await socket.sendMessage(from, { text: "❌ Invalid option. Reply 1 for High, 2 for Low." }, { quoted: tMsg });
          }

          const videoUrl = choice === 1 ? urlHigh : urlLow;
          await socket.sendMessage(from, { video: { url: videoUrl }, caption: `🔞 ${info.title}\n> ${choice === 1 ? "High Quality" : "Low Quality"}` }, { quoted: tMsg });
        };

        socket.ev.on("messages.upsert", typeListener);
      };

      socket.ev.on("messages.upsert", messageListener);
      activeReplyHandlers.set(msgId, true);

    } catch (e) {
      console.error("XNXX Plugin Error:", e);
      await socket.sendMessage(from, { text: "*❌ Error:* " + e }, { quoted: msg });
    }
  }
};
