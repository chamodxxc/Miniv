module.exports = {
  command: "sticker",
  desc: "Convert image to sticker",
  category: "sticker", 
  use: ".sticker (reply to image)",
  alias: ["s"],
  fromMe: false,
  filename: __filename,

  execute: async (sock, msg, args) => {
    const { remoteJid, quotedMsg } = msg;

    if (!quotedMsg || (!quotedMsg.imageMessage && !quotedMsg.videoMessage)) {
      return await sock.sendMessage(remoteJid, { 
        text: "❌ Please reply to an image or video with .sticker" 
      }, { quoted: msg });
    }

    try {
      await sock.sendMessage(remoteJid, { 
        text: "🔄 Converting to sticker..." 
      }, { quoted: msg });
      
      // Add your image-to-sticker conversion logic here
      // Process image and create sticker
      
    } catch (error) {
      await sock.sendMessage(remoteJid, { 
        text: `❌ Error creating sticker: ${error.message}` 
      }, { quoted: msg });
    }
  }
};
