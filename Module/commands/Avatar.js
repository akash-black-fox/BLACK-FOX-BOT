const fs = require('fs-extra');
const path = require('path');
const axios = require('axios');

module.exports = {
  config: {
    name: 'pp',
    aliases: ['avatar', 'avt', 'profilepic', 'dp'],
    description: 'Get profile picture of user',
    usage: 'pp [@user/reply/uid]',
    category: 'Media',
    prefix: true,
    author: 'AKASH HASAN',
    version: '1.0.0'
  },

  async run({ api, event, args, send, Users, config }) {
    const { senderID, mentions, messageReply, threadID } = event;

    let uid = senderID;

    if (messageReply) {
      uid = messageReply.senderID;
    } else if (mentions && Object.keys(mentions).length > 0) {
      uid = Object.keys(mentions)[0];
    } else if (args[0] && /^\d+$/.test(args[0])) {
      uid = args[0];
    }

    if (args[0] === 'help') {
      return send.reply(
`╭───「 🖼️ PP HELP 」───╮
│
│ Commands:
│ ${config.PREFIX}pp
│ ${config.PREFIX}pp @mention
│ ${config.PREFIX}pp [uid]
│ (reply) ${config.PREFIX}pp
│
│ Description:
│ Show profile picture of yourself or others
│
│ AUTHOR : AKASH HASAN
│ LINK   : m.me/akash.black.fox
╰────────────────────╯`
      );
    }

    try {
      const name = await Users.getNameUser(uid);

      const avatarUrl = `https://graph.facebook.com/${uid}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;

      const cacheDir = path.join(__dirname, 'cache');
      fs.ensureDirSync(cacheDir);

      const avatarPath = path.join(cacheDir, `avatar_${uid}_${Date.now()}.jpg`);

      const response = await axios.get(avatarUrl, { responseType: 'arraybuffer' });
      fs.writeFileSync(avatarPath, Buffer.from(response.data));

      await api.sendMessage({
        body: 
`╭───「 🖼️ PROFILE PICTURE 」───╮
│
│ User : ${name}
│ UID  : ${uid}
╰─────────────────────────╯`,
        attachment: fs.createReadStream(avatarPath)
      }, threadID, event.messageID);

      setTimeout(() => {
        try { fs.unlinkSync(avatarPath); } catch {}
      }, 10000);

    } catch (err) {
      return send.reply(`Failed to get profile picture: ${err.message}`);
    }
  }
};