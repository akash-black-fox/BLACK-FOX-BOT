module.exports = {
  config: {
    name: 'allinfo',
    aliases: ['botgroups', 'adminlist'],
    version: '1.0.0',
    author: 'AKASH HASAN',
    description: 'Show detailed info of all groups',
    usage: 'allinfo',
    category: 'Admin',
    adminOnly: true,
    prefix: true
  },

  async run({ api, event, send, config }) {
    const { threadID, senderID } = event;

    if (!config.ADMINBOT.includes(senderID)) {
      return send.reply(`╭───「 ⛔ 𝐃𝐄𝐍𝐈𝐄𝐃 」───╮
│
│ ⚠️ 𝐏𝐞𝐫𝐦𝐢𝐬𝐬𝐢𝐨𝐧 𝐃𝐞𝐧𝐢𝐞𝐝
│ 👤 𝐎𝐧𝐥𝐲 𝐁𝐨𝐭 𝐀𝐝𝐦𝐢𝐧𝐬
│    𝐜𝐚𝐧 𝐮𝐬𝐞 𝐭𝐡𝐢𝐬.
│
╰─────────────────────╯`);
    }

    await send.reply(`╭───「 🔄 𝐋𝐎𝐀𝐃𝐈𝐍𝐆 」───╮
│
│ ⏳ 𝐅𝐞𝐭𝐜𝐡𝐢𝐧𝐠 𝐃𝐚𝐭𝐚...
│ 📂 𝐒𝐜𝐚𝐧𝐧𝐢𝐧𝐠 𝐆𝐫𝐨𝐮𝐩𝐬...
│
╰─────────────────────╯`);

    try {
      const threadList = await api.getThreadList(100, null, ['INBOX']);
      const groups = threadList.filter(t => t.isGroup);

      if (groups.length === 0) {
        return send.reply(`╭───「 ❌ 𝐄𝐑𝐑𝐎𝐑 」───╮
│
│ ⚠️ 𝐍𝐨 𝐆𝐫𝐨𝐮𝐩𝐬 𝐅𝐨𝐮𝐧𝐝.
│
╰─────────────────────╯`);
      }

      groups.sort((a, b) => b.messageCount - a.messageCount);

      const limit = 10;
      const displayGroups = groups.slice(0, limit);

      let msg = `╭───「 𝐆𝐑𝐎𝐔𝐏 𝐃𝐄𝐓𝐀𝐈𝐋𝐒 」───╮\n│\n`;

      for (let i = 0; i < displayGroups.length; i++) {
        const group = displayGroups[i];
        
        let adminNames = [];
        try {
          const info = await api.getThreadInfo(group.threadID);
          const adminIDs = info.adminIDs || [];
          
          for (let j = 0; j < Math.min(adminIDs.length, 3); j++) {
            try {
              const userInfo = await api.getUserInfo(adminIDs[j].id);
              let name = userInfo[adminIDs[j].id]?.name || 'Unknown';
              adminNames.push(name);
            } catch {
              adminNames.push(adminIDs[j].id);
            }
          }
        } catch {
          adminNames.push("Error fetching info");
        }

        msg += `│ ${i + 1}. ${group.name || 'Unnamed'}\n`;
        msg += `│    🆔 ${group.threadID}\n`;
        msg += `│    👥 𝐌𝐞𝐦𝐛𝐞𝐫𝐬: ${group.participantIDs.length}\n`;
        msg += `│    👑 𝐀𝐝𝐦𝐢𝐧𝐬: ${adminNames.join(', ')}\n`;
        msg += `│\n`;
      }

      msg += `╰─────────────────────╯\n`;
      msg += `📊 𝐓𝐨𝐭𝐚𝐥 𝐆𝐫𝐨𝐮𝐩𝐬: ${groups.length}\n`;
      msg += `⚠️ 𝐒𝐡𝐨𝐰𝐢𝐧𝐠 𝐓𝐨𝐩 ${limit} 𝐆𝐫𝐨𝐮𝐩𝐬`;

      return api.sendMessage(msg, threadID);

    } catch (error) {
      return send.reply(`╭───「 ❌ 𝐅𝐀𝐈𝐋𝐄𝐃 」───╮
│
│ ⚠️ 𝐄𝐫𝐫𝐨𝐫: ${error.message}
│
╰─────────────────────╯`);
    }
  }
};