const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

module.exports.config = {
  name: 'groupinfo',
  aliases: ['gcinfo', 'threadinfo', 'infobox'],
  version: '1.0.0',
  author: 'AKASH HASAN',
  description: 'Get group information with image',
  usage: 'groupinfo',
  category: 'Group',
  groupOnly: true,
  prefix: true
};

module.exports.run = async function({ api, event, send, Users }) {
  const { threadID, messageID } = event;
  
  try {
    const threadInfo = await api.getThreadInfo(threadID);
    const participantIDs = threadInfo.participantIDs || [];
    const adminIDs = threadInfo.adminIDs || [];
    const userInfo = threadInfo.userInfo || [];
    
    let maleCount = 0;
    let femaleCount = 0;
    
    userInfo.forEach(user => {
      if (user.gender === 'MALE') maleCount++;
      else if (user.gender === 'FEMALE') femaleCount++;
    });

    let adminNames = [];
    for (const admin of adminIDs.slice(0, 5)) {
      try {
        const name = await Users.getNameUser(admin.id);
        adminNames.push(name);
      } catch {
        adminNames.push("Unknown Admin");
      }
    }

    const approvalMode = threadInfo.approvalMode ? "🔒 ON" : "🔓 OFF";
    const imageSrc = threadInfo.imageSrc;

    const msg = `╭───「 𝐆𝐑𝐎𝐔𝐏 𝐈𝐍𝐅𝐎 」───╮
│
│ 📛 𝐍𝐚𝐦𝐞 : ${threadInfo.threadName || 'No Name'}
│ 🆔 𝐈𝐃   : ${threadID}
│ 🧩 𝐄𝐦𝐨𝐣𝐢 : ${threadInfo.emoji || '👍'}
│ 🛡️ 𝐀𝐩𝐩𝐫𝐨𝐯𝐚𝐥 : ${approvalMode}
│
│ 👥 𝐓𝐨𝐭𝐚𝐥 : ${participantIDs.length}
│ 👦 𝐌𝐚𝐥𝐞 : ${maleCount} | 👧 𝐅𝐞𝐦𝐚𝐥𝐞 : ${femaleCount}
│ 💬 𝐌𝐬𝐠𝐬  : ${threadInfo.messageCount}
│
│ 👑 𝐀𝐝𝐦𝐢𝐧𝐬 :
│ ${adminNames.join("\n│ ")}
│
╰─────────────────────╯`;

    if (imageSrc) {
      const cacheDir = path.join(__dirname, 'cache');
      if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);
      const imgPath = path.join(cacheDir, `group_${threadID}.png`);

      try {
        const response = await axios.get(imageSrc, { responseType: 'arraybuffer' });
        fs.writeFileSync(imgPath, Buffer.from(response.data));

        await api.sendMessage({
          body: msg,
          attachment: fs.createReadStream(imgPath)
        }, threadID, () => fs.unlinkSync(imgPath), messageID);
      } catch (e) {
        return send.reply(msg);
      }
    } else {
      return send.reply(msg);
    }

  } catch (error) {
    return send.reply(`╭───「 ❌ 𝐄𝐑𝐑𝐎𝐑 」───╮
│
│ ⚠️ 𝐅𝐚𝐢𝐥𝐞𝐝 𝐭𝐨 𝐟𝐞𝐭𝐜𝐡
│    𝐠𝐫𝐨𝐮𝐩 𝐝𝐚𝐭𝐚.
│
╰─────────────────────╯`);
  }
};