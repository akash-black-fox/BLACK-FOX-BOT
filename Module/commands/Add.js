module.exports = {
  config: {
    name: 'add',
    aliases: ['adduser'],
    version: '1.0.0',
    author: 'AKASH HASAN',
    description: 'Add a user to the group by UID',
    usage: 'add [uid]',
    category: 'Group',
    groupOnly: true,
    prefix: true
  },
  
  async run({ api, event, args, send, config }) {
    const { threadID, senderID } = event;
    const uid = args[0];
    
    if (!uid || !/^\d+$/.test(uid)) {
      return send.reply(`╭───「 ⚠️ 𝐖𝐀𝐑𝐍𝐈𝐍𝐆 」───╮
│
│ ❌ 𝐈𝐧𝐯𝐚𝐥𝐢𝐝 𝐔𝐈𝐃
│ 👉 𝐔𝐬𝐚𝐠𝐞: ${config.PREFIX}add [UID]
│
╰─────────────────────╯`);
    }

    try {
      const threadInfo = await api.getThreadInfo(threadID);
      const adminIDs = threadInfo.adminIDs.map(a => a.id);
      const botID = api.getCurrentUserID();
      
      if (!adminIDs.includes(botID)) {
        return send.reply(`╭───「 ❌ 𝐄𝐑𝐑𝐎𝐑 」───╮
│
│ ⚠️ 𝐁𝐨𝐭 𝐢𝐬 𝐧𝐨𝐭 𝐀𝐝𝐦𝐢𝐧
│ 🔧 𝐏𝐥𝐞𝐚𝐬𝐞 𝐦𝐚𝐤𝐞 𝐦𝐞 𝐚𝐝𝐦𝐢𝐧 𝐟𝐢𝐫𝐬𝐭.
│
╰─────────────────────╯`);
      }
      
      const isGroupAdmin = adminIDs.includes(senderID);
      const isBotAdmin = config.ADMINBOT.includes(senderID);
      
      if (!isGroupAdmin && !isBotAdmin) {
        return send.reply(`╭───「 ⛔ 𝐃𝐄𝐍𝐈𝐄𝐃 」───╮
│
│ ⚠️ 𝐏𝐞𝐫𝐦𝐢𝐬𝐬𝐢𝐨𝐧 𝐃𝐞𝐧𝐢𝐞𝐝
│ 👤 𝐎𝐧𝐥𝐲 𝐀𝐝𝐦𝐢𝐧𝐬 𝐜𝐚𝐧 𝐮𝐬𝐞 𝐭𝐡𝐢𝐬.
│
╰─────────────────────╯`);
      }
      
      if (threadInfo.participantIDs.includes(uid)) {
        return send.reply(`╭───「 ⚠️ 𝐈𝐍𝐅𝐎 」───╮
│
│ 👤 𝐔𝐬𝐞𝐫 𝐢𝐬 𝐚𝐥𝐫𝐞𝐚𝐝𝐲
│    𝐢𝐧 𝐭𝐡𝐞 𝐠𝐫𝐨𝐮𝐩.
│
╰─────────────────────╯`);
      }

      await api.addUserToGroup(uid, threadID);
      
      let name = 'Unknown User';
      try {
        const info = await api.getUserInfo(uid);
        if (info && info[uid]) {
          name = info[uid].name;
        }
      } catch {}

      const msg = `╭───「 𝐌𝐄𝐌𝐁𝐄𝐑 𝐀𝐃𝐃 」───╮
│
│ 👤 𝐍𝐚𝐦𝐞 : ${name}
│ 🆔 𝐔𝐈𝐃  : ${uid}
│ ✅ 𝐒𝐭𝐚𝐭𝐮𝐬 : Added Successfully
│
╰─────────────────────╯`;

      return send.reply(msg);

    } catch (error) {
      return send.reply(`╭───「 ❌ 𝐅𝐀𝐈𝐋𝐄𝐃 」───╮
│
│ ⚠️ 𝐔𝐧𝐚𝐛𝐥𝐞 𝐭𝐨 𝐚𝐝𝐝 𝐮𝐬𝐞𝐫.
│ 🔧 𝐂𝐡𝐞𝐜𝐤 𝐏𝐫𝐢𝐯𝐚𝐜𝐲/𝐁𝐥𝐨𝐜𝐤 𝐬𝐞𝐭𝐭𝐢𝐧𝐠𝐬.
│
╰─────────────────────╯`);
    }
  }
};