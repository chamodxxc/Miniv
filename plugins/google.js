const axios = require('axios');
const config = require('../config');

module.exports = {
  command: "google",
  alias: ["gsearch"],
  description: "Search Google via Chamod API",
  category: "search",
  react: "🔎",

  execute: async (socket, msg, args) => {
    try {
      const from = msg.key.remoteJid;
      const sender = msg.key.participant || from;
      const pushname = msg.pushName || "there";

      if (!args || args.length === 0) {
        return await socket.sendMessage(from, { text: "⚠️ Please provide a search query!\nExample: .google tiktok" }, { quoted: msg });
      }

      const query = args.join(" ");
      const apiUrl = `https://google-search-api.chamodshadow125.workers.dev/?q=${encodeURIComponent(query)}`;
      const res = await axios.get(apiUrl);

      if (res.data.status && res.data.data.length > 0) {
        let resultMsg = `🔎 *Google Search Results for:* ${query}\n\n`;
        res.data.data.slice(0, 5).forEach((item, i) => {
          resultMsg += `*${i + 1}.* ${item.title}\n${item.link}\n_${item.snippet}_\n\n`;
        });

        await socket.sendMessage(from, {
          text: resultMsg,
          contextInfo: {
            mentionedJid: [sender],
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
              newsletterJid: '120363397446799567@newsletter',
              newsletterName: "WHITESHADOW-MD",
              serverMessageId: 143
            }
          }
        }, { quoted: msg });

      } else {
        await socket.sendMessage(from, { text: "⚠️ No results found 😔" }, { quoted: msg });
      }

    } catch (e) {
      console.error("❌ Error in google command:", e);
      await socket.sendMessage(from, { text: `⚠️ Error: ${e.message}` }, { quoted: msg });
    }
  }
};
