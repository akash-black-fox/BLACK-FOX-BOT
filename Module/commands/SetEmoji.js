module.exports.config = {
  name: 'setemoji',
  aliases: ['emoji', 'groupemoji', 'changemoji'],
  description: 'Change the group emoji',
  credits: 'AKASH HASAN',
  usage: 'setemoji [emoji]',
  category: 'Group',
  groupOnly: true,
  prefix: true,
  version: "1.0.0"
};

module.exports.run = async function({ api, event, args, send, config }) {
  const { threadID, senderID } = event;
  
  const threadInfo = await api.getThreadInfo(threadID);
  const adminIDs = threadInfo.adminIDs.map(a => a.id);
  
  const isGroupAdmin = adminIDs.includes(senderID);
  const isBotAdmin = config.ADMINBOT.includes(senderID);
  
  if (!isGroupAdmin && !isBotAdmin) {
    return send.reply(`╭───「 ⛔ 𝐃𝐄𝐍𝐈𝐄𝐃 」───╮
│
│ ❌ আরে তুই তো এডমিন না!
│    ইমোজি চেঞ্জ করার সাহস
│    পেলি কই? 😒
│
│ 👉 আগে এডমিন হ, তারপর আসিস।
│
╰─────────────────────╯`);
  }
  
  const emoji = args[0];
  
  if (!emoji) {
    return send.reply(`╭───「 ⚠️ 𝐄𝐑𝐑𝐎𝐑 」───╮
│
│ ❌ ইমোজি কই? বাতাসে
│    কি ইমোজি পাল্টাবো?
│
│ 👉 ব্যবহার: ${confix.PREFIX}setemoji 🦊
│
╰─────────────────────╯`);
  }
  
  try {
    await api.changeThreadEmoji(emoji, threadID);
    return send.reply(`╭───「 ✅ 𝐔𝐏𝐃𝐀𝐓𝐄𝐃 」───╮
│
│ ✨ ইমোজি চেঞ্জ করা হয়েছে!
│
│ 🎃 𝐍𝐞𝐰: ${emoji}
│
│ </> 𝐀𝐮𝐭𝐡𝐨𝐫: 𝐀𝐊𝐀𝐒𝐇 𝐇𝐀𝐒𝐀𝐍
╰─────────────────────╯`);
  } catch (error) {
    return send.reply(`❌ ইমোজি চেঞ্জ করতে পারলাম না! হয়তো এই ইমোজি সাপোর্ট করে না।`);
  }
};