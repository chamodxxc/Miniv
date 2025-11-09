const fs = require("fs");
const path = require("path");

const SUPPORT_LOG_FILE = path.join(__dirname, "../lib/support-logs.json");
const OWNER_JID = "94704896880@s.whatsapp.net"; // ✅ Replace with your JID

// ✅ Auto-create support logs file if missing
function loadSupportLogs() {
    if (!fs.existsSync(SUPPORT_LOG_FILE)) {
        fs.writeFileSync(SUPPORT_LOG_FILE, JSON.stringify({}));
    }
    return JSON.parse(fs.readFileSync(SUPPORT_LOG_FILE));
}

function saveSupportLogs(data) {
    fs.writeFileSync(SUPPORT_LOG_FILE, JSON.stringify(data, null, 2));
}

// ✅ Anti-spam: stores last request timestamps
let spamTimestamps = {};

function checkSpam(sender) {
    const last = spamTimestamps[sender];
    const now = Date.now();
    if (last && now - last < 10 * 60 * 1000) return true; // 10 minutes
    spamTimestamps[sender] = now;
    return false;
}

// ✅ Ticket ID Generator
function generateTicketID() {
    return Math.random().toString(36).substr(2, 6).toUpperCase();
}

module.exports = {
  command: "support",
  desc: "Send a support request to the bot developer",
  category: "utility",
  use: ".support <your issue>",
  react: "📩",
  filename: __filename,

  execute: async (socket, msg, args, number) => {
    try {
      const supportLogs = loadSupportLogs();
      const sender = msg.key?.remoteJid || msg.chat;
      const userPushname = msg.pushName || "Unknown";
      const q = args.join(" ").trim();

      if (!q) {
        return await socket.sendMessage(sender, { text: "📝 Please type your support request.\n\nExample:\n.support I can't play songs" }, { quoted: msg });
      }

      if (checkSpam(sender)) {
        return await socket.sendMessage(sender, { text: "⚠️ You're sending requests too quickly. Please wait 10 minutes before sending another support request." }, { quoted: msg });
      }

      const ticketID = generateTicketID();

      supportLogs[ticketID] = {
        userJid: sender,
        username: userPushname,
        message: q,
        time: new Date().toISOString(),
        status: "open",
      };

      saveSupportLogs(supportLogs);

      const supportText = `
╭───────────────⭓  
│  📥 ɴᴇᴡ ꜱᴜᴘᴘᴏʀᴛ ʀᴇQᴜᴇꜱᴛ (#${ticketID})
│  👤 ɴᴀᴍᴇ: ${userPushname}
│  📱 ɴᴜᴍʙᴇʀ: wa.me/${sender.split("@")[0]}
│  🕐 ᴛɪᴍᴇ: ${new Date().toLocaleString("en-US", { timeZone: "Asia/Colombo" })}
│  📝 ᴍᴇꜱꜱᴀɢᴇ: ${q}
╰───────────────⭓
> 𝚙𝚘𝚠𝚎𝚛𝚎𝚍 𝚋𝚢 whiteshadow
`.trim();

      await socket.sendMessage(OWNER_JID, {
        text: supportText,
        mentions: [sender]
      });

      await socket.sendMessage(sender, {
        text: `✅ Your support request has been sent with Ticket ID *#${ticketID}*.\nPlease wait for a response.`,
      }, { quoted: msg });

      await socket.sendMessage(sender, {
        react: { text: "✅", key: msg.key }
      });

    } catch (err) {
      console.error(err);
      await socket.sendMessage(msg.key.remoteJid, {
        text: "⚠️ Failed to send your support request. Please try again later."
      }, { quoted: msg });
    }
  }
};
