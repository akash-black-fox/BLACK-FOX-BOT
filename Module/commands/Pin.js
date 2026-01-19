module.exports.config = {
  name: 'pin',
  aliases: ['pinmsg', 'unpin'],
  description: 'Pin or unpin a message',
  credits: 'AKASH HASAN',
  usage: 'pin (reply) | unpin (reply)',
  category: 'Group',
  groupOnly: true,
  prefix: true,
  version: "1.0.0"
};

module.exports.run = async function({ api, event, args, send, config }) {
  const { threadID, senderID, messageReply } = event;
  
  const threadInfo = await api.getThreadInfo(threadID);
  const adminIDs = threadInfo.adminIDs.map(a => a.id);
  
  const isGroupAdmin = adminIDs.includes(senderID);
  const isBotAdmin = config.ADMINBOT.includes(senderID);
  
  if (!isGroupAdmin && !isBotAdmin) {
    return send.reply(`╭───「 ⚠️ 𝐖𝐀𝐑𝐍𝐈𝐍𝐆 」───╮
│
│ ❌ 𝐀𝐜𝐜𝐞𝐬𝐬 𝐃𝐞𝐧𝐢𝐞𝐝!
│
│ গ্রুপ এডমিন ছাড়া মেসেজ
│ পিন করা যায় না।
│
│ আগে এডমিন হন! 😒
│
╰─────────────────────╯`);
  }
  
  if (!messageReply) {
    return send.reply(`╭───「 ⚠️ 𝐄𝐑𝐑𝐎𝐑 」───╮
│
│ ❌ কোন মেসেজ পিন করবো?
│
│ 👉 মেসেজে রিপ্লাই দিয়ে
│    লিখুন: ${config.PREFIX}pin
│
╰─────────────────────╯`);
  }
  
  const messageID = messageReply.messageID;
  const isUnpin = args[0]?.toLowerCase() === 'unpin' || event.body.toLowerCase().includes('unpin');
  
  try {
    await api.pinMessage(!isUnpin, messageID, threadID);
    
    if (isUnpin) {
      return send.reply(`╭───「 🗑️ 𝐔𝐍-𝐏𝐈𝐍𝐍𝐄𝐃 」───╮
│
│ ✅ মেসেজ আন-পিন করা হলো!
│    সরিয়ে দিলাম।
│
│ </> 𝐀𝐮𝐭𝐡𝐨𝐫: 𝐀𝐊𝐀𝐒𝐇 𝐇𝐀𝐒𝐀𝐍
╰─────────────────────╯`);
    } else {
      return send.reply(`╭───「 📌 𝐏𝐈𝐍𝐍𝐄𝐃 」───╮
│
│ ✅ মেসেজ পিন করা হয়েছে!
│    সবার চোখে পড়বে এখন।
│
│ </> 𝐀𝐮𝐭𝐡𝐨𝐫: 𝐀𝐊𝐀𝐒𝐇 𝐇𝐀𝐒𝐀𝐍
╰─────────────────────╯`);
    }

  } catch (error) {
    return send.reply(`❌ পিন করতে পারলাম না বস! সমস্যা হচ্ছে।`);
  }
};