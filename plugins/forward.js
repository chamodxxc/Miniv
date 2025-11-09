const {
  generateForwardMessageContent,
  generateWAMessageFromContent,
  proto,
} = require("@whiskeysockets/baileys");

module.exports = {
  command: "forward",
  description: "Forward replied or sent message to given JID",

  async execute(sock, msg, args) {
    const from = msg.key.remoteJid;
    const targetJid = args[0];

    // ✅ Validate target JID
    if (!targetJid || !targetJid.includes("@")) {
      return await sock.sendMessage(from, {
        text: "❌ Please specify a valid JID. Example:\n.forward 1@newsletter",
      });
    }

    try {
      // ✅ Get message content
      let originalContent;
      if (msg.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
        // Replied message
        originalContent = msg.message.extendedTextMessage.contextInfo.quotedMessage;
      } else {
        // Own message
        originalContent = msg.message;
      }

      // ✅ Generate forwardable content
      const forwardContent = await generateForwardMessageContent(originalContent, false);
      const contentMessage = proto.Message.fromObject(forwardContent);

      const forwardMsg = await generateWAMessageFromContent(targetJid, contentMessage, {
        userJid: from,
        messageId: msg.key.id,
      });

      // ✅ Send the message
      await sock.relayMessage(targetJid, forwardMsg.message, {
        messageId: forwardMsg.key.id,
      });

      await sock.sendMessage(from, {
        text: `✅ Message successfully forwarded to: *${targetJid}*`,
      });
    } catch (e) {
      console.error("❌ Forward Error:", e);
      await sock.sendMessage(from, {
        text: "❌ Failed to forward the message. Please make sure the message type is supported and bot has permission.",
      });
    }
  },
};
