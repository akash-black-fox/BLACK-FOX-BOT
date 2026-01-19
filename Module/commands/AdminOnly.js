module.exports = {
  config: {
    name: 'adminonly',
    aliases: ['onlyadmin', 'maintenance'],
    version: '1.0.0',
    author: 'AKASH HASAN',
    description: 'Toggle admin only mode',
    usage: 'adminonly [on/off]',
    category: 'Admin',
    adminOnly: true,
    prefix: true
  },
  
  async run({ api, event, args, send, config }) {
    const fs = require('fs-extra');
    const path = require('path');
    const configPath = path.join(__dirname, '../../config.json');
    let envConfig = fs.readJsonSync(configPath);
    
    const action = args[0]?.toLowerCase();
    
    if (action === 'on' || action === 'true' || action === 'enable') {
      envConfig.ADMIN_ONLY_MODE = true;
      fs.writeJsonSync(configPath, envConfig, { spaces: 2 });
      
      return send.reply(`╭───「 𝐌𝐎𝐃𝐄 𝐔𝐏𝐃𝐀𝐓𝐄 」───╮
│
│ 🔒 𝐒𝐭𝐚𝐭𝐮𝐬 : 𝐄𝐧𝐚𝐛𝐥𝐞𝐝
│ 👤 𝐀𝐜𝐜𝐞𝐬𝐬 : 𝐀𝐝𝐦𝐢𝐧 𝐎𝐧𝐥𝐲
│ ⚠️ 𝐍𝐨𝐭𝐞   : 𝐔𝐬𝐞𝐫𝐬 𝐁𝐥𝐨𝐜𝐤𝐞𝐝
│
╰─────────────────────╯`);
    }
    
    if (action === 'off' || action === 'false' || action === 'disable') {
      envConfig.ADMIN_ONLY_MODE = false;
      fs.writeJsonSync(configPath, envConfig, { spaces: 2 });
      
      return send.reply(`╭───「 𝐌𝐎𝐃𝐄 𝐔𝐏𝐃𝐀𝐓𝐄 」───╮
│
│ 🔓 𝐒𝐭𝐚𝐭𝐮𝐬 : 𝐃𝐢𝐬𝐚𝐛𝐥𝐞𝐝
│ 👥 𝐀𝐜𝐜𝐞𝐬𝐬 : 𝐄𝐯𝐞𝐫𝐲𝐨𝐧𝐞
│ ✅ 𝐍𝐨𝐭𝐞   : 𝐏𝐮𝐛𝐥𝐢𝐜 𝐌𝐨𝐝𝐞
│
╰─────────────────────╯`);
    }
    
    const currentStatus = envConfig.ADMIN_ONLY_MODE ? '𝐄𝐧𝐚𝐛𝐥𝐞𝐝 🔒' : '𝐃𝐢𝐬𝐚𝐛𝐥𝐞𝐝 🔓';
    
    return send.reply(`╭───「 𝐒𝐓𝐀𝐓𝐔𝐒 」───╮
│
│ ⚙️ 𝐂𝐮𝐫𝐫𝐞𝐧𝐭 : ${currentStatus}
│
│ ➤ adminonly on
│ ➤ adminonly off
│
╰─────────────────────╯`);
  }
};