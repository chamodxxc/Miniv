const gis = require("g-i-s");
const {
  prepareWAMessageMedia,
  generateWAMessageFromContent,
  proto,
} = require("@whiskeysockets/baileys");

module.exports = {
  command: "img",
  description: "👾 Google Image Search (button options for Image/Doc/More)",
  react: "📸",
  category: "media",

  execute: async (socket, msg, args) => {
    try {
      const from = msg.key.remoteJid;
      const query = args.join(" ");
      const pushname = msg.pushName || "there";

      if (!query) {
        return await socket.sendMessage(from, {
          text: `🔍 *Google Image Search*\n\nPlease enter a query!\n\nExample:\n.img cat`,
        }, { quoted: msg });
      }

      gis(query, async (error, result) => {
        if (error || !result || result.length < 3) {
          return await socket.sendMessage(from, {
            text: "❌ Not enough images found. Try another keyword.",
          }, { quoted: msg });
        }

        const img1 = result[0].url;
        const img2 = result[1].url;
        const moreImages = result.slice(2, 12).map(r => r.url);

        // Button options
        const buttons = [
          { buttonId: "img_1", buttonText: { displayText: "🖼️ Image" }, type: 1 },
          { buttonId: "img_2", buttonText: { displayText: "📄 Document" }, type: 1 },
          { buttonId: "img_3", buttonText: { displayText: "🖼️ 10 More" }, type: 1 },
        ];

        const buttonMessage = {
          image: { url: img1 },
          caption: `🔍 *Google Image Search*\n👤 Requested by: ${pushname}\nQuery: ${query}\n\n● WhiteShadow MiniBot ●`,
          footer: "WhiteShadow MiniBot",
          buttons,
          headerType: 4
        };

        const sentMsg = await socket.sendMessage(from, buttonMessage, { quoted: msg });

        // Listen for button clicks
        const listener = async (update) => {
          try {
            const mek = update.messages[0];
            if (!mek.message?.buttonsResponseMessage) return;
            if (mek.key.remoteJid !== from) return;

            const btnId = mek.message.buttonsResponseMessage.selectedButtonId;

            switch (btnId) {
              case "img_1":
                await socket.sendMessage(from, {
                  image: { url: img1 },
                  caption: `✅ *Here is your image!*\n> WhiteShadow MiniBot`,
                }, { quoted: mek });
                break;

              case "img_2":
                await socket.sendMessage(from, {
                  document: { url: img2 },
                  mimetype: "image/jpeg",
                  fileName: `img_${Date.now()}.jpg`,
                  caption: `📄 *Here is your image as document!*\n> WhiteShadow MiniBot`,
                }, { quoted: mek });
                break;

              case "img_3":
                for (let i = 0; i < moreImages.length; i++) {
                  await socket.sendMessage(from, {
                    image: { url: moreImages[i] },
                    caption: `🖼️ *Extra Image ${i + 1}*\n> WhiteShadow MiniBot`,
                  }, { quoted: mek });
                  await new Promise(res => setTimeout(res, 1000));
                }
                break;

              default:
                await socket.sendMessage(from, { text: "❌ Unknown button clicked!" }, { quoted: mek });
            }
          } catch (err) {
            console.error("Button listener error:", err);
          }
        };

        socket.ev.on("messages.upsert", listener);
        setTimeout(() => socket.ev.off("messages.upsert", listener), 2 * 60 * 1000);
      });
    } catch (e) {
      console.error("Main error:", e);
      await socket.sendMessage(msg.key.remoteJid, {
        text: `⚠️ *Error occurred:* ${e.message}`,
      }, { quoted: msg });
    }
  }
};
