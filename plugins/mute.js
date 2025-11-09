module.exports = {
  command: "mute",
  desc: "Mute the group (admin-only mode)",
  category: "group",
  use: ".mute",
  fromMe: true,
  filename: __filename,

  execute: async (sock, msg) => {
    const { remoteJid } = msg.key;
    await sock.groupSettingUpdate(remoteJid, "announcement");
    await sock.sendMessage(remoteJid, { text: "🔇 Group has been muted. Only admins can send messages." }, { quoted: msg });
  }
};
