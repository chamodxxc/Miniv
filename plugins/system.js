const os = require('os');
const moment = require('moment');

module.exports = {
  command: 'system',
  description: 'Show the system info',
  react: '🖥️',
  category: 'info',

  execute: async (socket, msg, args, number) => {
    const from = msg.key.remoteJid;

    const uptime = process.uptime();
    const formattedUptime = moment.utc(uptime * 1000).format("HH:mm:ss");

    const memoryUsage = process.memoryUsage();
    const usedMemory = (memoryUsage.rss / 1024 / 1024).toFixed(2);
    const totalMem = (os.totalmem() / 1024 / 1024).toFixed(2);
    const freeMem = (os.freemem() / 1024 / 1024).toFixed(2);
    const cpuInfo = os.cpus()[0].model;

    const caption = `
╭───────────────⭓
│  🖥️ *SYSTEM INFO*
│
│  🤖 Platform: ${os.platform()}
│  🖥 Architecture: ${os.arch()}
│  ⏱ Uptime: ${formattedUptime}
│  🧠 RAM Usage: ${usedMemory} MB / ${totalMem} MB
│  ⚙️ Free Memory: ${freeMem} MB
│  🔌 CPU: ${cpuInfo}
│
│  ⚡ Node: ${process.version}
│  📂 Working Dir: ${process.cwd()}
│  🧩 Modules Loaded: ${Object.keys(require.cache).length}
│  👤 User: ${os.userInfo().username}
│
╰───────────────⭓
*Powered by •WHITESHADOW*
`;

    // Optional buttons for system actions (example: refresh uptime, memory stats)
    const buttons = [
      { buttonId: 'sys_refresh', buttonText: { displayText: '🔄 Refresh' }, type: 1 },
      { buttonId: 'sys_mem', buttonText: { displayText: '🧠 RAM Info' }, type: 1 },
      { buttonId: 'sys_cpu', buttonText: { displayText: '⚙️ CPU Info' }, type: 1 }
    ];

    await socket.sendMessage(from, {
      image: { url: 'https://files.catbox.moe/fyr37r.jpg' }, // Bot banner
      caption,
      footer: 'WhiteShadow MiniBot',
      buttons,
      headerType: 4,
      contextInfo: {
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: '120363397446799567@newsletter',
          newsletterName: 'SYSTEM',
          serverMessageId: 143
        }
      }
    }, { quoted: msg });
  }
};
