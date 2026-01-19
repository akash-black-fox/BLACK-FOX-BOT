const moment = require('moment-timezone');

module.exports = {
  config: {
    name: 'adminnoti',
    aliases: ['noti', 'anoti'],
    version: '1.0.0',
    author: 'AKASH HASAN',
    description: 'Send notification to all bot admins',
    usage: 'adminnoti [message]',
    category: 'Admin',
    adminOnly: true,
    prefix: true
  },
  
  async run({ api, event, args, send, config, Users }) {
    const message = args.join(' ');
    
    if (!message) {
      return send.reply(`╭───「 ⚠️ 𝐖𝐀𝐑𝐍𝐈𝐍𝐆 」───╮
│
│ ❌ 𝐄𝐦𝐩𝐭𝐲 𝐌𝐞𝐬𝐬𝐚𝐠𝐞
│ 👉 𝐔𝐬𝐚𝐠𝐞: ${config.PREFIX}noti [msg]
│
╰─────────────────────╯`);
    }
    
    const admins = config.ADMINBOT || [];
    
    if (admins.length === 0) {
      return send.reply('No admins found in config.');
    }
    
    let senderName = 'Admin';
    try {
      const info = await api.getUserInfo(event.senderID);
      senderName = info[event.senderID]?.name || await Users.getNameUser(event.senderID);
    } catch {
      senderName = 'Admin';
    }
    
    const time = moment().tz('Asia/Dhaka').format('h:mm A');
    const date = moment().tz('Asia/Dhaka').format('DD/MM/YYYY');

    const notificationMsg = `╭───「 𝐍𝐎𝐓𝐈𝐅𝐈𝐂𝐀𝐓𝐈𝐎𝐍 」───╮
│
│ 👤 𝐅𝐫𝐨𝐦 : ${senderName}
│ 🕒 𝐓𝐢𝐦𝐞 : ${time}
│ 📅 𝐃𝐚𝐭𝐞 : ${date}
│
╰─────────────────────╯
📝 𝐌𝐞𝐬𝐬𝐚𝐠𝐞 :
${message}`;
    
    let sent = 0;
    let failed = 0;
    
    for (const adminID of admins) {
      if (adminID === event.senderID) continue;
      
      try {
        await api.sendMessage(notificationMsg, adminID);
        sent++;
        await new Promise(r => setTimeout(r, 1000));
      } catch (err) {
        failed++;
      }
    }
    
    return send.reply(`╭───「 𝐑𝐄𝐏𝐎𝐑𝐓 」───╮
│
│ ✅ 𝐒𝐞𝐧𝐭 𝐓𝐨 : ${sent} Admins
│ ❌ 𝐅𝐚𝐢𝐥𝐞𝐝  : ${failed}
│
╰─────────────────────╯`);
  }
};