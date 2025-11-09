module.exports = {
  command: 'vv',
  description: 'Owner Only - Retrieve view-once media',
  category: 'main',
  react: '🐳',
  execute: async (socket, msg, args, number, isCreator) => {
    const sender = msg.key.remoteJid;

    if (!isCreator) {
      return await socket.sendMessage(sender, {
        text: "*📛 This is an owner-only command.*"
      }, { quoted: msg });
    }

    if (!msg.quoted) {
      return await socket.sendMessage(sender, {
        text: "*🍁 Please reply to a view-once message.*"
      }, { quoted: msg });
    }


  }
};
