const fs = require('fs');
if (fs.existsSync('config.env')) require('dotenv').config({
    path: './config.env'
});

function convertToBool(text, fault = 'true') {
    return text === fault ? true : false;
}






module.exports = {
    LANG: 'si',
    WELCOME: 'true',
    AUTO_VIEW_STATUS: 'true',
    AUTO_VOICE: 'true',
    AUTO_LIKE_STATUS: 'true',
    AUTO_RECORDING: 'false',
    HEROKU_APP_URL: 'https://vajiramini-5b70406079da.herokuapp.com',
    AUTO_LIKE_EMOJI: ['💥', '👍', '😍', '💗', '🎈', '🎉', '🥳', '😎', '🚀', '🔥'],
    PREFIX: '.',
    MAX_RETRIES: 3,
    GROUP_INVITE_LINK: 'https://chat.whatsapp.com/B9HqRViG3g91f76iNx50L3?mode=wwt',
    ADMIN_LIST_PATH: './lib/admin.json',
    RCD_IMAGE_PATH: 'https://raw.githubusercontent.com/cnw-db/WHITESHADOW-MD-/refs/heads/main/IMG-20250926-WA0024.jpg',
    NEWSLETTER_JID: '120363397446799567@newsletter',
    NEWSLETTER_MESSAGE_ID: '428',
    OTP_EXPIRY: 300000,    OWNER_NUMBER: '94704896880',
    CHANNEL_LINK: 'https://whatsapp.com/channel/0029Vb4bj5zI7BeFm6aM8O1p'
};

