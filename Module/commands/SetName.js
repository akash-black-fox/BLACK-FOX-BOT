module.exports.config = {
  name: 'setname',
  aliases: ['groupname', 'rename', 'name'],
  description: 'Change the group name',
  credits: 'AKASH HASAN',
  usage: 'setname [new name]',
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
│ ❌ একি ভাই! আপনি তো এডমিন না।
│    গ্রুপের নাম পাল্টানোর সাহস
│    পেলেন কই? 😒
│
│ 👉 আগে এডমিন হন, তারপর আসেন।
│
╰─────────────────────╯`);
  }
  
  const newName = args.join(' ');
  
  if (!newName) {
    return send.reply(`╭───「 ⚠️ 𝐄𝐑𝐑𝐎𝐑 」───╮
│
│ ❌ নাম কই? আমি কি
│    বাতাসের নাম রাখবো?
│
│ 👉 ব্যবহার: ${config.PREFIX}setname আড্ডা ঘর
│
╰─────────────────────╯`);
  }
  
  try {
    await api.setTitle(newName, threadID);
    return send.reply(`╭───「 ✅ 𝐔𝐏𝐃𝐀𝐓𝐄𝐃 」───╮
│
│ ✨ গ্রুপের নাম চেঞ্জ করা হলো!
│
│ 🏷️ 𝐍𝐞𝐰: ${newName}
│
│ </> 𝐀𝐮𝐭𝐡𝐨𝐫: 𝐀𝐊𝐀𝐒𝐇 𝐇𝐀𝐒𝐀𝐍
╰─────────────────────╯`);
  } catch (error) {
    return send.reply(`❌ নাম চেঞ্জ করতে পারলাম না! হয়তো ফেসবুকের সমস্যা।`);
  }
};