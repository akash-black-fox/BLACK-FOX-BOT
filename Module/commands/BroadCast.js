module.exports.config = {
  name: 'broadcast',
  aliases: ['bc', 'announce', 'notify'],
  description: 'Send a message to all groups',
  credits: 'AKASH HASAN',
  usage: 'broadcast [message]',
  category: 'Admin',
  adminOnly: true,
  prefix: true,
  version: "1.0.0"
};

module.exports.run = async function({ api, event, args, send, Threads, config }) {
  const message = args.join(' ');
  
  if (!message) {
    return send.reply(`╭───「 ⚠️ 𝐄𝐑𝐑𝐎𝐑 」───╮
│
│ ❌ 𝐏𝐥𝐞𝐚𝐬𝐞 𝐰𝐫𝐢𝐭𝐞 𝐚
│    𝐦𝐞𝐬𝐬𝐚𝐠𝐞.
│
│ 👉 ${config.PREFIX}bc Hello Everyone
│
╰─────────────────────╯`);
  }
  
  try {
    const allThreads = await Threads.getAll();
    const activeGroups = allThreads.filter(t => t.isGroup && t.banned !== true);
    
    if (activeGroups.length === 0) {
      return send.reply("❌ No active groups found.");
    }
    
    send.reply(`╭───「 ⏳ 𝐒𝐄𝐍𝐃𝐈𝐍𝐆 」───╮
│
│ 📡 𝐁𝐫𝐨𝐚𝐝𝐜𝐚𝐬𝐭𝐢𝐧𝐠...
│ 👥 𝐓𝐚𝐫𝐠𝐞𝐭: ${activeGroups.length} Groups
│
╰─────────────────────╯`);
    
    let success = 0;
    let failed = 0;
    
    const broadcastMsg = `╭───「 📢 𝐍𝐎𝐓𝐈𝐂𝐄 」───╮
│
${message}
│
│ 🤖 𝐅𝐫𝐨𝐦: ${config.BOTNAME}
│ </> 𝐀𝐮𝐭𝐡𝐨𝐫: 𝐀𝐊𝐀𝐒𝐇 𝐇𝐀𝐒𝐀𝐍
╰─────────────────────╯`;
    
    for (const group of activeGroups) {
      try {
        await api.sendMessage(broadcastMsg, group.threadID);
        success++;
        await new Promise(r => setTimeout(r, 1500));
      } catch (error) {
        failed++;
      }
    }
    
    return send.reply(`╭───「 ✅ 𝐑𝐄𝐏𝐎𝐑𝐓 」───╮
│
│ 📢 𝐒𝐞𝐧𝐭: ${success} Groups
│ ❌ 𝐅𝐚𝐢𝐥𝐞𝐝: ${failed} Groups
│
╰─────────────────────╯`);

  } catch (e) {
    return send.reply("❌ Error: " + e.message);
  }
};