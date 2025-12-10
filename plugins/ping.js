const meta = {
  key: {
    participant: `13135550002@s.whatsapp.net`,
    remoteJid: `13135550002@s.whatsapp.net`,
    fromMe: false,
    id: 'FAKE_META_pingcmd'
  },
  message: {
    contactMessage: {
      displayName: 'WHITESHADOW-AI',
      vcard: `BEGIN:VCARD\nVERSION:3.0\nN:Meta AI;;;;\nFN:Meta AI\nTEL;waid=13135550002:+1 313 555 0002\nEND:VCARD`,
      sendEphemeral: true
    }
  },
  pushName: 'Meta AI',
  messageTimestamp: Math.floor(Date.now() / 1000)
};

module.exports = {  
  command: "ping",  
  desc: "Check bot response time",  
  category: "utility",  
  use: ".ping",  
  fromMe: false,  
  filename: __filename,  
  
  execute: async (sock, msg) => {  
    const start = Date.now();  

    // Send initial fake Meta AI Pong
    await sock.sendMessage(msg.key.remoteJid, { text: "🏓 Pong! Checking response..." }, { quoted: meta });  

    const latency = Date.now() - start;  
      
    // Send final response with latency
    await sock.sendMessage(msg.key.remoteJid, {   
      text: `🏓 Pong! Response time: ${latency}ms`   
    }, { quoted: meta });  
  }  
};
