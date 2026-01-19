module.exports.config = {
  name: 'threadban',
  aliases: ['tban', 'blockthread', 'bangroup'],
  description: 'Ban or unban a group from using the bot',
  credits: 'AKASH HASAN',
  usage: 'threadban [ban/unban] [tid]',
  category: 'Admin',
  adminOnly: true,
  prefix: true,
  version: "1.0.0"
};

module.exports.run = async function({ api, event, args, send, Threads, config }) {
  const { threadID, senderID } = event;
  
  if (!config.ADMINBOT.includes(senderID)) {
    return send.reply(`╭───「 ⛔ 𝐃𝐄𝐍𝐈𝐄𝐃 」───╮
│
│ ❌ আপনি তো এডমিন না!
│    গ্রুপ ব্যান করার সাহস
│    পেলেন কই? 😒
│
╰─────────────────────╯`);
  }
  
  const action = args[0]?.toLowerCase();
  const targetTID = args[1] || threadID;
  
  let threadName = 'Unknown Group';
  try {
    const info = await api.getThreadInfo(targetTID);
    threadName = info.threadName || info.name || 'Unknown Group';
  } catch {}
  
  if (!action) {
    const data = await Threads.getData(targetTID);
    const isBanned = data && data.banned;
    const status = isBanned ? "🔴 Banned" : "🟢 Active";
    
    return send.reply(`╭───「 📊 𝐒𝐓𝐀𝐓𝐔𝐒 」───╮
│
│ 📂 𝐍𝐚𝐦𝐞: ${threadName}
│ 🆔 𝐓𝐈𝐃 : ${targetTID}
│ 🛡️ 𝐒𝐭𝐚𝐭: ${status}
│
│ 💡 𝐔𝐬𝐚𝐠𝐞:
│ .threadban ban
│ .threadban unban
│
╰─────────────────────╯`);
  }
  
  if (action === 'ban' || action === 'block') {
    await Threads.ban(targetTID, 'Banned by Admin');
    
    if (targetTID !== threadID) {
      api.sendMessage(`╭───「 ⛔ 𝐁𝐀𝐍𝐍𝐄𝐃 」───╮
│
│ ❌ এই গ্রুপটি বস আকাশ
│    ব্যান করেছেন!
│
│ ⚠️ এখন থেকে এখানে কোনো
│    কমান্ড কাজ করবে না।
│
╰─────────────────────╯`, targetTID);
    }
    
    return send.reply(`╭───「 🔨 𝐁𝐀𝐍𝐍𝐄𝐃 」───╮
│
│ ✅ গ্রুপটি ব্যান করা হলো!
│
│ 📂 𝐍𝐚𝐦𝐞: ${threadName}
│ 🆔 𝐓𝐈𝐃 : ${targetTID}
│
│ </> 𝐀𝐮𝐭𝐡𝐨𝐫: 𝐀𝐊𝐀𝐒𝐇 𝐇𝐀𝐒𝐀𝐍
╰─────────────────────╯`);
  }
  
  if (action === 'unban' || action === 'unblock') {
    await Threads.unban(targetTID);
    
    if (targetTID !== threadID) {
      api.sendMessage(`╭───「 ✅ 𝐔𝐍𝐁𝐀𝐍𝐍𝐄𝐃 」───╮
│
│ 🎉 অভিনন্দন!
│
│ বস আকাশ এই গ্রুপটি
│ আনব্যান করেছেন।
│
│ 🤖 এখন আমি আবার একটিভ!
│
╰─────────────────────╯`, targetTID);
    }
    
    return send.reply(`╭───「 ✅ 𝐔𝐍𝐁𝐀𝐍𝐍𝐄𝐃 」───╮
│
│ ✨ গ্রুপটি আনব্যান করা হলো!
│
│ 📂 𝐍𝐚𝐦𝐞: ${threadName}
│ 🆔 𝐓𝐈𝐃 : ${targetTID}
│
│ </> 𝐀𝐮𝐭𝐡𝐨𝐫: 𝐀𝐊𝐀𝐒𝐇 𝐇𝐀𝐒𝐀𝐍
╰─────────────────────╯`);
  }
  
  return send.reply(`╭───「 ⚠️ 𝐄𝐑𝐑𝐎𝐑 」───╮
│
│ ❌ ভুল কমান্ড!
│
│ 👉 .threadban ban
│ 👉 .threadban unban
│
╰─────────────────────╯`);
};