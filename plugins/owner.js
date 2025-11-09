module.exports = {
  command: "owner",
  description: "📇 Show owner contacts, website button and command list",
  category: "info",
  react: "👑",

  async execute(sock, msg) {
    const jid = msg.key.remoteJid;

    // Owner contacts
    const contacts = [
      {
        displayName: "𝙼𝚛 𝙻𝚘𝚏𝚝",
        vcard: `
BEGIN:VCARD
VERSION:3.0
FN:Chamod Nimsara
TEL;type=CELL;type=VOICE;waid=94704896880:+94704896880
END:VCARD`.trim(),
      }
    ];

    // Send contacts first
    for (const contact of contacts) {
      await sock.sendMessage(jid, {
        contacts: {
          displayName: contact.displayName,
          contacts: [{ vcard: contact.vcard }],
        },
      });
    }

    // Send List message with sections (WhiteShadow MiniBot style)
    await sock.sendMessage(jid, {
      title: "📑 WhiteShadow MiniBot Owners Info 📑",
      text: "Tap the button below to view owner details and contact info.",
      footer: "👑 WhiteShadow MiniBot 👑",
      buttonText: "☤ Owner Info ☤",
      sections: [
        {
          title: "🔹 Owner Details",
          rows: [
            {
              title: "🧑 Name",
              description: "Chamod Nimsara",
              rowId: ".owner",
            },
            {
              title: "🎂 Age",
              description: "NA",
              rowId: ".owner",
            },
            {
              title: "🌍 Country",
              description: "Sri Lanka",
              rowId: ".owner",
            },
            {
              title: "📞 WhatsApp",
              description: "+94704896880",
              rowId: ".owner",
            },
            {
              title: "🌐 Website",
              description: "https://whiteshadow-md.vercel.app",
              rowId: ".owner",
            },
          ],
        },
      ],
    });
  },
};
