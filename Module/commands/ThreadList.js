module.exports.config = {
  name: 'threadlist',
  aliases: ['threads', 'tlist', 'listbox'],
  description: 'List recent threads (Groups/Inbox)',
  credits: 'AKASH HASAN',
  usage: 'threadlist [limit]',
  category: 'Admin',
  adminOnly: true,
  prefix: true,
  version: "1.0.0"
};

module.exports.run = async function({ api, event, args, send, config }) {
  const { senderID } = event;
  
  if (!config.ADMINBOT.includes(senderID)) {
    return send.reply(`╭───「 ⛔ 𝐃𝐄𝐍𝐈𝐄𝐃 」───╮
│
│ ❌ আপনি তো এডমিন না!
│    চ্যাট লিস্ট দেখে কি করবেন?
│
│ 😒 নিজের কাজে যান।
│
╰─────────────────────╯`);
  }
  
  const limit = parseInt(args[0]) || 10;
  
  await send.reply(`⏳ একটু ওয়েট বস, আমি শেষ ${limit} টি চ্যাট বের করছি...`);
  
  try {
    const threads = await api.getThreadList(limit, null, ['INBOX']);
    
    if (threads.length === 0) {
      return send.reply(`╭───「 📭 𝐄𝐌𝐏𝐓𝐘 」───╮
│
│ বস, ইনবক্স পুরো ফাঁকা!
│ মাছি ভনভন করছে।
│
╰─────────────────────╯`);
    }
    
    let msg = `╭───「 🧵 𝐓𝐇𝐑𝐄𝐀𝐃𝐒 」───╮\n│\n`;
    
    for (let i = 0; i < threads.length; i++) {
      const thread = threads[i];
      const type = thread.isGroup ? '👥' : '👤';
      const name = thread.name || thread.threadName || 'Unknown Name';
      
      msg += `│ ${i + 1}. ${type} ${name.substring(0, 18)}\n`;
      msg += `│    🆔 ${thread.threadID}\n│\n`;
    }
    
    msg += `╰─────────────────────╯
📊 𝐓𝐨𝐭𝐚𝐥: ${threads.length} Threads
</> 𝐀𝐮𝐭𝐡𝐨𝐫: 𝐀𝐊𝐀𝐒𝐇 𝐇𝐀𝐒𝐀𝐍`;
    
    return send.reply(msg);
    
  } catch (error) {
    return send.reply(`❌ লিস্ট আনতে পারলাম না বস! সার্ভার জ্যাম।`);
  }
};