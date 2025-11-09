const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const file_size_url = (...args) => import('file_size_url').then(({default: file_size_url}) => file_size_url(...args));
const tools = require('../lib/config.js');

module.exports = {
  command: "apk",
  description: "📥 Get APK info and download the APK file",
  execute: async (socket, msg, args) => {
    const sender = msg.key.remoteJid;
    const reply = (text) => socket.sendMessage(sender, { text }, { quoted: msg });

    if (!args.length) return reply("Please provide app package or name.\nExample: .apkdl com.whatsapp");

    const id = args.join(" ");

    // Your download function embedded inside plugin
    async function download(id) {
      let res = await fetch(tools.api(5, '/apps/search', {
        query: id,
        limit: 1
      }));
      res = await res.json();
      if (!res.datalist?.list?.length) throw new Error('No app found');

      const app = res.datalist.list[0];
      const size = await file_size_url(app.file.path);

      return {
        name: app.name,
        package: app.package,
        icon: app.icon,
        dllink: app.file.path,
        lastup: app.updated,
        size,
      };
    }

    try {
      const data = await download(id);

      const text = `
╭───────────────⭓
│  📱 *${data.name}*
│  📦 ᴘᴀᴄᴋᴀɢᴇ: ${data.package}
│  📅 ᴜᴘᴅᴀᴛᴇᴅ: ${data.lastup}
│  📏 ꜱɪᴢᴇ: ${data.size}
│  🔗 ᴅᴏᴡɴʟᴏᴀᴅ ʟɪɴᴋ ʙᴇʟᴏᴡ ⬇️
╰───────────────⭓
> 𝙿𝙾𝚆𝙴𝚁𝙴𝙳 𝙱𝚈 𝚆𝙷𝙸𝚃𝙴𝚂𝙷𝙰𝙳𝙾𝚆-𝙼𝙳`;
      
      if (data.icon) {
        await socket.sendMessage(sender, {
          image: { url: data.icon },
          caption: text,
        }, { quoted: msg });
      }

      // Send APK file document
      await socket.sendMessage(sender, {
        document: { url: data.dllink },
        fileName: `${data.name || 'app'}.apk`,
        mimetype: 'application/vnd.android.package-archive',
      }, { quoted: msg });

    } catch (e) {
      console.error(e);
      await reply("❌ Failed to fetch or send APK info. Please check your input or try again later.");
    }
  }
};

