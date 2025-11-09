module.exports = {
  command: "owner",
  description: "Show owner contacts, website button and command list",
  category: "info",

  async execute(sock, msg) {
    const jid = msg.key.remoteJid;

    const contacts = [
      {
        displayName: "𝙼𝚛 𝙻𝚘𝚏𝚝",
        vcard: `
BEGIN:VCARD
VERSION:3.0
FN:bilal
TEL;type=CELL;type=VOICE;waid=255778018545:+255778018545
END:VCARD`.trim(),
      }
    ];

    // Send contacts
    for (const contact of contacts) {
      await sock.sendMessage(jid, {
        contacts: {
          displayName: contact.displayName,
          contacts: [{ vcard: contact.vcard }],
        },
      });
    }

    // Send list message with 1 section
    await sock.sendMessage(jid, {
      title: "📑ᴏᴡɴᴇʀꜱ ɪɴꜰᴏx📑",
      text: "ᴄɪᴄᴋ ᴛʜᴇ ᴏᴡᴇʀꜱ ɪɴꜰᴏ ʙᴜᴛᴛᴏɴ🖲📋",
      footer: "𝙼𝚛 𝙻𝚘𝚏𝚝",
      buttonText: "☤ᴏᴡɴᴇʀꜱ ɪɴꜰᴏ☤",
      sections: [
        {
          title: "loft Quantum CEO",
          rows: [
            {
              title: "ɴᴀᴍᴇ",
              description: "Quantum CEO",
              rowId: ".owner",
            },
            {
              title: "ᴀɢᴇ",
              description: "ᴀɢᴇ - NA",
              rowId: ".owner",
            },
            {
              title: "ᴄᴏᴜɴʀᴛʏ",
              description: "Tanzania",
              rowId: ".owner",
            },
          ],
        }
      ],
    });
  },
};
