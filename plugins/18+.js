const axios = require('axios');

const activeReplyHandlers = new Map(); // Prevent duplicate replies per message

module.exports = {
  command: "xnxx",
  description: "Search and download XNXX videos with quality option",
  react: "🔞",
  category: "adult",

  execute: async (socket, msg, args) => {
    const from = msg.key.remoteJid;
    const input = args.join(" ").trim();

    if (!input) {
      return await socket.sendMessage(from, {
        text: "❌ *Please provide a search keyword!*\n\nExample: *.xnxx mia khalifa*",
      }, { quoted: msg });
    }

    try {
      const { data } = await axios.get(`https://vajiraapi-4780395b47f1.herokuapp.com/download/xnxx?text=${encodeURIComponent(input)}`);

      if (!data.status || !data.result || data.result.length === 0) {
        return await socket.sendMessage(from, {
          text: `❌ No results found for "${input}".`,
        }, { quoted: msg });
      }

      const videos = data.result.slice(0, 10);

      let caption = `🔞 *XNXX Results for:* ${input}\n\n`;
      videos.forEach((v, i) => caption += `*${i + 1}.* ${v.title}\n`);
      caption += `\n📥 *Reply with the number to select a video (1-${videos.length}).*\n\n> MADE IN BY BILAL MD`;

      const sentMsg = await socket.sendMessage(from, { text: caption }, { quoted: msg });
      const msgId = sentMsg.key.id;

      if (activeReplyHandlers.has(msgId)) return; // already handled

      const messageListener = async (update) => {
        try {
          const m = update.messages?.[0];
          if (!m?.message) return;

          const replyTo = m.message.extendedTextMessage?.contextInfo?.stanzaId;
          if (replyTo !== msgId) return;

          const text = m.message.conversation || m.message.extendedTextMessage?.text;
          if (!text) return;

          const selectedNum = parseInt(text.trim());
          if (isNaN(selectedNum) || selectedNum < 1 || selectedNum > videos.length) {
            return await socket.sendMessage(from, {
              text: `❌ Invalid selection. Please reply with a number (1-${videos.length}).`,
            }, { quoted: m });
          }

          await socket.sendMessage(from, { react: { text: "✅", key: m.key } });

          const selectedVideo = videos[selectedNum - 1];
          const videoPageUrl = selectedVideo.url;

          const confirmMsg = await socket.sendMessage(from, {
            text:
              `✅ *Selected:* ${selectedVideo.title}\n\n` +
              `🔢 *Choose download quality:*\n` +
              `1️⃣ High Quality (Large)\n` +
              `2️⃣ Low Quality (Small)\n\n` +
              `📥 *Reply with 1 or 2 to continue.*\n\n> MINI BILAL MD`,
          }, { quoted: m });

          const confirmMsgId = confirmMsg.key.id;

          // Add quality listener
          const qualityListener = async (update2) => {
            try {
              const m2 = update2.messages?.[0];
              if (!m2?.message) return;

              const replyTo2 = m2.message.extendedTextMessage?.contextInfo?.stanzaId;
              if (replyTo2 !== confirmMsgId) return;

              const qualityText = m2.message.conversation || m2.message.extendedTextMessage?.text;
              const choice = parseInt(qualityText.trim());

              if (![1, 2].includes(choice)) {
                return await socket.sendMessage(from, {
                  text: "❌ Invalid option. Reply with 1 (High) or 2 (Low).",
                }, { quoted: m2 });
              }

              await socket.sendMessage(from, { react: { text: "⏬", key: m2.key } });

              const { data: finalData } = await axios.get(`https://apiofficial-219be46516d4.herokuapp.com/download/xhamster?url=${encodeURIComponent(videoPageUrl)}`);

              if (!finalData.status || !finalData.result || !finalData.result.video?.length) {
                return await socket.sendMessage(from, {
                  text: "❌ Could not retrieve video download link.",
                }, { quoted: m2 });
              }

              // High quality = first video, Low quality = last video
              const finalVideo = choice === 1
                ? finalData.result.video[0]
                : finalData.result.video[finalData.result.video.length - 1];

              const videoBuffer = (await axios.get(finalVideo.url, { responseType: 'arraybuffer' })).data;

              await socket.sendMessage(from, {
                video: Buffer.from(videoBuffer),
                mimetype: 'video/mp4',
                caption: `${finalData.result.title}\n\n💾 ${finalVideo.quality} - ${finalVideo.size}\n\n> 𝙼𝚛 𝙻𝚘𝚏𝚝`,
              }, { quoted: m2 });

              // No removal of listeners: allows continuous replies

            } catch (e) {
              console.error("Quality selection error:", e);
            }
          };

          socket.ev.on("messages.upsert", qualityListener);

        } catch (e) {
          console.error("Video selection error:", e);
        }
      };

      socket.ev.on("messages.upsert", messageListener);
      activeReplyHandlers.set(msgId, true);

    } catch (err) {
      console.error("XNXX Plugin Error:", err);
      await socket.sendMessage(from, {
        text: `⚠️ Error: ${err.message || "Unknown error."}`,
      }, { quoted: msg });
    }
  }
};
          
