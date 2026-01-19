module.exports = {
  config: {
    name: 'botadmin',
    aliases: ['godmode', 'botmod'],
    version: '1.1.0',
    author: 'AKASH HASAN',
    description: 'Manage bot admins (Add/Remove/List)',
    usage: 'botadmin [add/remove/list] [uid]',
    category: 'Admin',
    adminOnly: true,
    prefix: true
  },
  
  async run({ api, event, args, send, config }) {
    const { threadID } = event;
    const action = args[0]?.toLowerCase();
    const fs = require('fs-extra');
    const path = require('path');
    const configPath = path.join(__dirname, '../../config.json');

    if (!action || action === 'list') {
      const admins = config.ADMINBOT || [];
      let msg = `╭───「 𝐀𝐃𝐌𝐈𝐍 𝐋𝐈𝐒𝐓 」───╮\n│\n`;
      
      for (let i = 0; i < admins.length; i++) {
        try {
          const info = await api.getUserInfo(admins[i]);
          let name = info[admins[i]]?.name || 'Unknown';
          msg += `│ ${i + 1}. ${name}\n│    🆔 ${admins[i]}\n│\n`;
        } catch {
          msg += `│ ${i + 1}. Unknown User\n│    🆔 ${admins[i]}\n│\n`;
        }
      }
      
      msg += `╰─────────────────────╯\n`;
      msg += `👤 𝐓𝐨𝐭𝐚𝐥 𝐀𝐝𝐦𝐢𝐧𝐬: ${admins.length}`;
      
      return send.reply(msg);
    }
    
    const uid = args[1];
    
    if (!uid || !/^\d+$/.test(uid)) {
      return send.reply(`╭───「 ⚠️ 𝐖𝐀𝐑𝐍𝐈𝐍𝐆 」───╮
│
│ ❌ 𝐈𝐧𝐯𝐚𝐥𝐢𝐝 𝐔𝐈𝐃
│ 👉 𝐔𝐬𝐚𝐠𝐞: ${config.PREFIX}botadmin add [UID]
│
╰─────────────────────╯`);
    }
    
    let envConfig = fs.readJsonSync(configPath);
    
    if (action === 'add') {
      if (envConfig.ADMINBOT.includes(uid)) {
        return send.reply(`╭───「 ⚠️ 𝐈𝐍𝐅𝐎 」───╮
│
│ 👤 𝐔𝐬𝐞𝐫 𝐢𝐬 𝐚𝐥𝐫𝐞𝐚𝐝𝐲
│    𝐚𝐧 𝐀𝐝𝐦𝐢𝐧.
│
╰─────────────────────╯`);
      }
      
      envConfig.ADMINBOT.push(uid);
      fs.writeJsonSync(configPath, envConfig, { spaces: 2 });
      
      let name = 'New Admin';
      try {
        const info = await api.getUserInfo(uid);
        name = info[uid]?.name || 'New Admin';
      } catch {}
      
      return send.reply(`╭───「 𝐀𝐃𝐌𝐈𝐍 𝐀𝐃𝐃𝐄𝐃 」───╮
│
│ 👤 𝐍𝐚𝐦𝐞 : ${name}
│ 🆔 𝐔𝐈𝐃  : ${uid}
│ ✅ 𝐒𝐭𝐚𝐭𝐮𝐬 : Success
│
╰─────────────────────╯`);
    }
    
    if (action === 'remove' || action === 'del') {
      if (!envConfig.ADMINBOT.includes(uid)) {
        return send.reply(`╭───「 ❌ 𝐄𝐑𝐑𝐎𝐑 」───╮
│
│ ⚠️ 𝐔𝐬𝐞𝐫 𝐢𝐬 𝐧𝐨𝐭 𝐢𝐧
│    𝐀𝐝𝐦𝐢𝐧 𝐋𝐢𝐬𝐭.
│
╰─────────────────────╯`);
      }
      
      if (envConfig.ADMINBOT.length === 1) {
        return send.reply(`╭───「 ⛔ 𝐃𝐄𝐍𝐈𝐄𝐃 」───╮
│
│ ⚠️ 𝐂𝐚𝐧𝐧𝐨𝐭 𝐫𝐞𝐦𝐨𝐯𝐞
│    𝐭𝐡𝐞 𝐥𝐚𝐬𝐭 𝐚𝐝𝐦𝐢𝐧.
│
╰─────────────────────╯`);
      }
      
      envConfig.ADMINBOT = envConfig.ADMINBOT.filter(id => id !== uid);
      fs.writeJsonSync(configPath, envConfig, { spaces: 2 });
      
      return send.reply(`╭───「 𝐀𝐃𝐌𝐈𝐍 𝐑𝐄𝐌𝐎𝐕𝐄 」───╮
│
│ 🆔 𝐔𝐈𝐃  : ${uid}
│ 🗑️ 𝐒𝐭𝐚𝐭𝐮𝐬 : Removed
│
╰─────────────────────╯`);
    }
    
    return send.reply(`╭───「 𝐇𝐄𝐋𝐏 」───╮
│
│ ➤ botadmin list
│ ➤ botadmin add [UID]
│ ➤ botadmin remove [UID]
│
╰─────────────────────╯`);
  }
};