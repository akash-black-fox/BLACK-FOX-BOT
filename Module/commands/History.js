const moment = require('moment-timezone');

module.exports.config = {
  name: 'history',
  aliases: ['chatlog', 'msglog'],
  version: '1.0.0',
  author: 'AKASH HASAN',
  description: 'View recent chat history',
  usage: 'history [limit]',
  category: 'System',
  adminOnly: true,
  prefix: true
};

module.exports.run = async function({ api, event, args, send, config, Users }) {
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
  
  const limit = parseInt(args[0]) || 10;
  const count = Math.min(Math.max(limit, 1), 30);
  
  try {
    const history = await api.getThreadHistory(threadID, count, undefined);
    
    if (!history || history.length === 0) {
      return send.reply(`╭───「 📂 𝐄𝐌𝐏𝐓𝐘 」───╮
│
│ ⚠️ 𝐍𝐨 𝐦𝐞𝐬𝐬𝐚𝐠𝐞𝐬 𝐟𝐨𝐮𝐧𝐝
│    𝐢𝐧 𝐡𝐢𝐬𝐭𝐨𝐫𝐲.
│
╰─────────────────────╯`);
    }
    
    let msg = `╭───「 𝐂𝐇𝐀𝐓 𝐋𝐎𝐆𝐒 」───╮\n│\n`;
    
    for (const message of history) {
      if (message.type === 'message' && message.body) {
        let name = "Unknown";
        try {
          name = await Users.getNameUser(message.senderID);
        } catch {
          name = message.senderID;
        }
        
        const time = moment(message.timestamp).tz('Asia/Dhaka').format('h:mm A');
        const text = message.body.length > 30 ? message.body.substring(0, 30) + '...' : message.body;
        
        msg += `│ 👤 ${name}\n`;
        msg += `│ 💬 ${text}\n`;
        msg += `│ 🕒 ${time}\n│\n`;
      }
    }
    
    msg += `╰─────────────────────╯`;
    
    return send.reply(msg);

  } catch (error) {
    return send.reply(`╭───「 ❌ 𝐄𝐑𝐑𝐎𝐑 」───╮
│
│ ⚠️ 𝐅𝐚𝐢𝐥𝐞𝐝 𝐭𝐨 𝐟𝐞𝐭𝐜𝐡
│    𝐡𝐢𝐬𝐭𝐨𝐫𝐲.
│
╰─────────────────────╯`);
  }
};