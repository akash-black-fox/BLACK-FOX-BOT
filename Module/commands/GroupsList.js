module.exports.config = {
  name: 'groupslist',
  aliases: ['glist', 'allgc', 'database'],
  version: '1.0.0',
  author: 'AKASH HASAN',
  description: 'List all groups from database',
  usage: 'groupslist [page]',
  category: 'Admin',
  adminOnly: true,
  prefix: true
};

module.exports.run = async function({ api, event, args, send, Threads, config }) {
  const { senderID } = event;
  
  if (!config.ADMINBOT.includes(senderID)) {
    return send.reply(`╭───「 ⛔ 𝐃𝐄𝐍𝐈𝐄𝐃 」───╮
│
│ ⚠️ 𝐏𝐞𝐫𝐦𝐢𝐬𝐬𝐢𝐨𝐧 𝐃𝐞𝐧𝐢𝐞𝐝
│ 👤 𝐎𝐧𝐥𝐲 𝐁𝐨𝐭 𝐀𝐝𝐦𝐢𝐧𝐬
│    𝐜𝐚𝐧 𝐮𝐬𝐞 𝐭𝐡𝐢𝐬.
│
╰─────────────────────╯`);
  }
  
  const allThreads = Threads.getAll();
  
  if (allThreads.length === 0) {
    return send.reply(`╭───「 📂 𝐄𝐌𝐏𝐓𝐘 」───╮
│
│ ⚠️ 𝐍𝐨 𝐆𝐫𝐨𝐮𝐩𝐬 𝐅𝐨𝐮𝐧𝐝
│    𝐢𝐧 𝐃𝐚𝐭𝐚𝐛𝐚𝐬𝐞.
│
╰─────────────────────╯`);
  }
  
  const page = parseInt(args[0]) || 1;
  const limit = 10;
  const totalPages = Math.ceil(allThreads.length / limit);
  
  if (page > totalPages) {
    return send.reply(`╭───「 ⚠️ 𝐖𝐀𝐑𝐍𝐈𝐍𝐆 」───╮
│
│ ❌ 𝐏𝐚𝐠𝐞 ${page} 𝐧𝐨𝐭 𝐟𝐨𝐮𝐧𝐝!
│ 📄 𝐓𝐨𝐭𝐚𝐥 𝐏𝐚𝐠𝐞𝐬: ${totalPages}
│
╰─────────────────────╯`);
  }
  
  const start = (page - 1) * limit;
  const groupSlice = allThreads.slice(start, start + limit);
  
  let msg = `╭───「 𝐃𝐀𝐓𝐀𝐁𝐀𝐒𝐄 」───╮\n│\n`;
  
  for (let i = 0; i < groupSlice.length; i++) {
    const group = groupSlice[i];
    const name = group.threadName || group.name || 'Unknown Group';
    const id = group.threadID || group.id;
    
    let status = "❌ Not Approved";
    if (group.approved) status = "✅ Approved";
    if (group.banned) status = "⛔ Banned";
    
    msg += `│ ${start + i + 1}. ${name}\n`;
    msg += `│    🆔 ${id}\n`;
    msg += `│    🔰 ${status}\n│\n`;
  }
  
  msg += `╰─────────────────────╯\n`;
  msg += `📄 𝐏𝐚𝐠𝐞 : ${page}/${totalPages}\n`;
  msg += `👥 𝐓𝐨𝐭𝐚𝐥 : ${allThreads.length} Groups\n`;
  msg += `👉 𝐔𝐬𝐞: ${config.PREFIX}glist [page]`;
  
  return send.reply(msg);
};