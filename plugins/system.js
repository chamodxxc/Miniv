const { formatMessage } = require('../lib/formatter');
const os = require('os');
const moment = require('moment');


module.exports = {
        command: 'system',
        description: 'Show the system',
        execute: async (socket, msg, args, number) => {
            const uptime = process.uptime();
            const formattedUptime = moment.utc(uptime * 1000).format("HH:mm:ss");

            const memoryUsage = process.memoryUsage();
            const usedMemory = (memoryUsage.rss / 1024 / 1024).toFixed(2);
            const totalMem = (os.totalmem() / 1024 / 1024).toFixed(2);
            const freeMem = (os.freemem() / 1024 / 1024).toFixed(2);
            const cpuInfo = os.cpus()[0].model;

            const caption = `
╭───────────────⭓
│   
│  🤖 ᴘʟᴀᴛꜰᴏʀᴍ: ${os.platform()}
│  🖥️ ᴀʀᴄʜ: ${os.arch()}
│  💾 ᴜᴘᴛɪᴍᴇ: ${formattedUptime}
│  🧠 ʀᴀᴍ ᴜꜱᴀɢᴇ: ${usedMemory} ᴍʙ / ${totalMem} ᴍʙ
│  ⚙️ ꜰʀᴇᴇ ᴍᴇᴍᴏʀʏ: ${freeMem} ᴍʙ
│  🔌 ᴄᴘᴜ: ${cpuInfo}
│  
│  ⚙️ ɴᴏᴅᴇ: ${process.version}
│  📂 ᴡᴏʀᴋɪɴɢ ᴅɪʀ: ${process.cwd()}
│  
│  🧩 ᴍᴏᴅᴜʟᴇꜱ ʟᴏᴀᴅᴇᴅ: ${Object.keys(require.cache).length}
│  👤 ᴜꜱᴇʀ: ${os.userInfo().username}
│ 
╰───────────────⭓
> 𝚙𝚘𝚠𝚎𝚛𝚎𝚍 𝚋𝚢 𝚂𝚒𝚛 𝙻𝙾𝙵𝚃`
            

            const sender = msg.key.remoteJid;

            await socket.sendMessage(sender, {
                image: { url: 'https://files.catbox.moe/deeo6l.jpg' }, // Confirm accessibility
                caption,
                contextInfo: {
                    mentionedJid: ['255778018545@s.whatsapp.net'],
                    forwardingScore: 999,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '1@newsletter',
                        newsletterName: '𝙼𝚛 𝙻𝚘𝚏𝚝',
                        serverMessageId: 143
                    }
                }
            })
        }
}




