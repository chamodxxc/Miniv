module.exports = {
  command: "tagall",
  desc: "Tag everyone in the group",
  category: "group",
  use: ".tagall",
  fromMe: true,
  filename: __filename,

  execute: async (sock, msg) => {
    const metadata = await sock.groupMetadata(msg.key.remoteJid);
    const participants = metadata.participants.map(p => p.id);
    const groupName = metadata.subject || "Group";
    const adminCount = metadata.participants.filter(p => p.admin).length;
    const user = msg.pushName || "User";
    const memberCount = participants.length;

    // List of emojis for mentions
    const emojis = ["🌺", "🌹", "🌟", "🌝", "🍒", "🍥", "🍷"];
    
    // Create mentions with alternating emojis
    const mentionsText = participants.map((id, index) => {
      const emoji = emojis[index % emojis.length];
      return `${emoji} @${id.split("@")[0]}`;
    }).join("\n");

    const caption = `
╭───────────────⭓
│ •whiteshadow-mini gruop tag   
│  
│  🏷️ ɢʀᴏᴜᴘ : ${groupName}
│  👑 ᴀᴅᴍɪɴ : ${adminCount}
│  👤 ᴜꜱᴇʀ: ${user}
│  👥 ᴍᴇᴍʙᴇʀꜱ : ${memberCount}
│  
│  📨 ᴍᴇꜱꜱᴀɢᴇ:  
╰───────────────⭓
> free bot ©whiteshadow

${mentionsText}
  
> 𝚙𝚘𝚠𝚎𝚛𝚎𝚍 𝚋𝚢 whiteshadow md`;

    await sock.sendMessage(msg.key.remoteJid, {
      image: { url: "https://raw.githubusercontent.com/cnw-db/WHITESHADOW-MD-/refs/heads/main/IMG-20250926-WA0023.jpg" },
      caption: caption,
      mentions: participants
    }, { quoted: msg });
  }
};
        
