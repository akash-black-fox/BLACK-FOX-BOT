const fs = require('fs-extra');
const axios = require('axios');
const path = require('path');

module.exports.config = {
  name: 'group',
  aliases: ['gc', 'groupsettings', 'box'],
  version: '1.0.0',
  author: 'AKASH HASAN',
  description: 'Manage group settings (Name, Emoji, Admin, Image, Info)',
  usage: 'group [name/emoji/admin/image/info]',
  category: 'Group',
  groupOnly: true,
  prefix: true
};

module.exports.run = async function({ api, event, args, send, config, Users }) {
  const { threadID, senderID, messageID, mentions, messageReply } = event;
  
  const threadInfo = await api.getThreadInfo(threadID);
  const adminIDs = threadInfo.adminIDs.map(a => a.id);
  const botID = api.getCurrentUserID();
  const isBotAdmin = adminIDs.includes(botID);
  const isSenderAdmin = adminIDs.includes(senderID) || config.ADMINBOT.includes(senderID);

  if (args.length === 0) {
    return send.reply(`╭───「 𝐆𝐑𝐎𝐔𝐏 𝐌𝐄𝐍𝐔 」───╮
│
│ ➤ group name [text]
│ ➤ group emoji [icon]
│ ➤ group image [reply]
│ ➤ group admin [tag]
│ ➤ group info
│
╰─────────────────────╯`);
  }

  const type = args[0].toLowerCase();

  if (type === 'name') {
    if (!isSenderAdmin) return send.reply(`╭───「 ⛔ 𝐃𝐄𝐍𝐈𝐄𝐃 」───╮\n│\n│ ⚠️ 𝐎𝐧𝐥𝐲 𝐀𝐝𝐦𝐢𝐧𝐬 𝐜𝐚𝐧\n│    𝐜𝐡𝐚𝐧𝐠𝐞 𝐧𝐚𝐦𝐞.\n│\n╰─────────────────────╯`);
    
    const newName = args.slice(1).join(" ");
    if (!newName) return send.reply(`╭───「 ⚠️ 𝐖𝐀𝐑𝐍𝐈𝐍𝐆 」───╮\n│\n│ ❌ 𝐍𝐚𝐦𝐞 𝐌𝐢𝐬𝐬𝐢𝐧𝐠\n│ 👉 group name [New Name]\n│\n╰─────────────────────╯`);
    
    await api.setTitle(newName, threadID);
    return send.reply(`╭───「 ✅ 𝐔𝐏𝐃𝐀𝐓𝐄𝐃 」───╮\n│\n│ 📂 𝐍𝐞𝐰 𝐍𝐚𝐦𝐞 :\n│ ${newName}\n│\n╰─────────────────────╯`);
  }

  if (type === 'emoji') {
    if (!isSenderAdmin) return send.reply(`╭───「 ⛔ 𝐃𝐄𝐍𝐈𝐄𝐃 」───╮\n│\n│ ⚠️ 𝐎𝐧𝐥𝐲 𝐀𝐝𝐦𝐢𝐧𝐬 𝐜𝐚𝐧\n│    𝐜𝐡𝐚𝐧𝐠𝐞 𝐞𝐦𝐨𝐣𝐢.\n│\n╰─────────────────────╯`);
    
    const emoji = args[1] || (messageReply ? messageReply.body : null);
    if (!emoji) return send.reply(`╭───「 ⚠️ 𝐖𝐀𝐑𝐍𝐈𝐍𝐆 」───╮\n│\n│ ❌ 𝐄𝐦𝐨𝐣𝐢 𝐌𝐢𝐬𝐬𝐢𝐧𝐠\n│ 👉 group emoji [😎]\n│\n╰─────────────────────╯`);
    
    try {
      await api.changeThreadEmoji(emoji, threadID);
      return send.reply(`╭───「 ✅ 𝐔𝐏𝐃𝐀𝐓𝐄𝐃 」───╮\n│\n│ 🧩 𝐍𝐞𝐰 𝐄𝐦𝐨𝐣𝐢 : ${emoji}\n│\n╰─────────────────────╯`);
    } catch (e) {
      return send.reply(`╭───「 ❌ 𝐅𝐀𝐈𝐋𝐄𝐃 」───╮\n│\n│ ⚠️ 𝐈𝐧𝐯𝐚𝐥𝐢𝐝 𝐄𝐦𝐨𝐣𝐢\n│\n╰─────────────────────╯`);
    }
  }

  if (type === 'image') {
    if (!isSenderAdmin) return send.reply(`╭───「 ⛔ 𝐃𝐄𝐍𝐈𝐄𝐃 」───╮\n│\n│ ⚠️ 𝐎𝐧𝐥𝐲 𝐀𝐝𝐦𝐢𝐧𝐬 𝐜𝐚𝐧\n│    𝐜𝐡𝐚𝐧𝐠𝐞 𝐢𝐦𝐚𝐠𝐞.\n│\n╰─────────────────────╯`);
    
    if (event.type !== "message_reply" || !messageReply.attachments || messageReply.attachments.length === 0) {
      return send.reply(`╭───「 ⚠️ 𝐖𝐀𝐑𝐍𝐈𝐍𝐆 」───╮\n│\n│ ❌ 𝐑𝐞𝐩𝐥𝐲 𝐭𝐨 𝐚𝐧 𝐢𝐦𝐚𝐠𝐞\n│    𝐭𝐨 𝐬𝐞𝐭 𝐠𝐫𝐨𝐮𝐩 𝐩𝐡𝐨𝐭𝐨.\n│\n╰─────────────────────╯`);
    }

    if (!isBotAdmin) return send.reply(`╭───「 ❌ 𝐄𝐑𝐑𝐎𝐑 」───╮\n│\n│ ⚠️ 𝐁𝐨𝐭 𝐦𝐮𝐬𝐭 𝐛𝐞 𝐀𝐝𝐦𝐢𝐧\n│    𝐭𝐨 𝐜𝐡𝐚𝐧𝐠𝐞 𝐩𝐡𝐨𝐭𝐨.\n│\n╰─────────────────────╯`);

    const imgUrl = messageReply.attachments[0].url;
    const cachePath = path.join(__dirname, 'cache', 'groupimg.jpg');
    
    try {
      const response = await axios.get(imgUrl, { responseType: 'stream' });
      const writer = fs.createWriteStream(cachePath);
      response.data.pipe(writer);
      
      writer.on('finish', () => {
        api.changeGroupImage(fs.createReadStream(cachePath), threadID, () => fs.unlinkSync(cachePath));
        send.reply(`╭───「 ✅ 𝐔𝐏𝐃𝐀𝐓𝐄𝐃 」───╮\n│\n│ 🖼️ 𝐆𝐫𝐨𝐮𝐩 𝐈𝐦𝐚𝐠𝐞\n│    𝐂𝐡𝐚𝐧𝐠𝐞𝐝 𝐒𝐮𝐜𝐜𝐞𝐬𝐬𝐟𝐮𝐥𝐥𝐲!\n│\n╰─────────────────────╯`);
      });
    } catch (e) {
      return send.reply(`╭───「 ❌ 𝐅𝐀𝐈𝐋𝐄𝐃 」───╮\n│\n│ ⚠️ 𝐄𝐫𝐫𝐨𝐫 𝐂𝐡𝐚𝐧𝐠𝐢𝐧𝐠 𝐈𝐦𝐚𝐠𝐞\n│\n╰─────────────────────╯`);
    }
    return;
  }

  if (type === 'admin') {
    if (!isSenderAdmin) return send.reply(`╭───「 ⛔ 𝐃𝐄𝐍𝐈𝐄𝐃 」───╮\n│\n│ ⚠️ 𝐎𝐧𝐥𝐲 𝐀𝐝𝐦𝐢𝐧𝐬 𝐜𝐚𝐧\n│    𝐦𝐚𝐧𝐚𝐠𝐞 𝐚𝐝𝐦𝐢𝐧𝐬.\n│\n╰─────────────────────╯`);
    if (!isBotAdmin) return send.reply(`╭───「 ❌ 𝐄𝐑𝐑𝐎𝐑 」───╮\n│\n│ ⚠️ 𝐁𝐨𝐭 𝐦𝐮𝐬𝐭 𝐛𝐞 𝐀𝐝𝐦𝐢𝐧\n│\n╰─────────────────────╯`);

    let targetID;
    if (Object.keys(mentions).length > 0) targetID = Object.keys(mentions)[0];
    else if (args[1]) targetID = args[1];
    else if (messageReply) targetID = messageReply.senderID;

    if (!targetID) return send.reply(`╭───「 ⚠️ 𝐖𝐀𝐑𝐍𝐈𝐍𝐆 」───╮\n│\n│ ❌ 𝐓𝐚𝐫𝐠𝐞𝐭 𝐍𝐨𝐭 𝐅𝐨𝐮𝐧𝐝\n│ 👉 𝐌𝐞𝐧𝐭𝐢𝐨𝐧/𝐑𝐞𝐩𝐥𝐲/𝐔𝐈𝐃\n│\n╰─────────────────────╯`);

    const isTargetAdmin = adminIDs.includes(targetID);
    await api.changeAdminStatus(threadID, targetID, !isTargetAdmin);
    
    const status = isTargetAdmin ? "Demoted ⬇️" : "Promoted ⬆️";
    let name = await Users.getNameUser(targetID);

    return send.reply(`╭───「 𝐀𝐃𝐌𝐈𝐍 𝐔𝐏𝐃𝐀𝐓𝐄 」───╮\n│\n│ 👤 𝐔𝐬𝐞𝐫 : ${name}\n│ ⚡ 𝐒𝐭𝐚𝐭𝐮𝐬 : ${status}\n│\n╰─────────────────────╯`);
  }

  if (type === 'info') {
    let maleCount = 0, femaleCount = 0;
    try {
      (threadInfo.userInfo || []).forEach(u => {
        if (u.gender === "MALE") maleCount++;
        else if (u.gender === "FEMALE") femaleCount++;
      });
    } catch (e) {}

    const approval = threadInfo.approvalMode ? "🔒 ON" : "🔓 OFF";
    let adminNames = [];
    
    for (let admin of threadInfo.adminIDs) {
      let name = await Users.getNameUser(admin.id);
      adminNames.push(name);
    }

    const msg = `╭───「 𝐆𝐑𝐎𝐔𝐏 𝐈𝐍𝐅𝐎 」───╮
│
│ 📂 𝐍𝐚𝐦𝐞 : ${threadInfo.threadName}
│ 🆔 𝐈𝐃   : ${threadID}
│ 🧩 𝐄𝐦𝐨𝐣𝐢 : ${threadInfo.emoji}
│ 🛡️ 𝐀𝐩𝐩𝐫𝐨𝐯𝐚𝐥 : ${approval}
│
│ 👥 𝐓𝐨𝐭𝐚𝐥 : ${threadInfo.participantIDs.length}
│ 👦 𝐌𝐚𝐥𝐞 : ${maleCount} | 👧 𝐅𝐞𝐦𝐚𝐥𝐞 : ${femaleCount}
│ 💬 𝐌𝐬𝐠𝐬  : ${threadInfo.messageCount}
│
│ 👑 𝐀𝐝𝐦𝐢𝐧𝐬 :
│ ${adminNames.slice(0, 5).join("\n│ ")}
│
╰─────────────────────╯`;

    return send.reply(msg);
  }

  return send.reply(`╭───「 ⚠️ 𝐖𝐀𝐑𝐍𝐈𝐍𝐆 」───╮
│
│ ❌ 𝐈𝐧𝐯𝐚𝐥𝐢𝐝 𝐎𝐩𝐭𝐢𝐨𝐧
│ 👉 𝐔𝐬𝐞: name, emoji,
│    image, admin, info
│
╰─────────────────────╯`);
};