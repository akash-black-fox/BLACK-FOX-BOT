module.exports.config = {
  name: 'setnickall',
  aliases: ['allnick', 'setallnick', 'nameall'],
  description: 'Set nickname for all group members',
  credits: 'AKASH HASAN',
  usage: 'setnickall [nickname]',
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
│ ❌ আপনি তো এডমিন না!
│    সবার নাম পাল্টানোর সাহস
│    পেলেন কই? 😒
│
│ 👉 আগে এডমিন হন।
│
╰─────────────────────╯`);
  }
  
  const nickname = args.join(" ");
  
  if (!nickname) {
    return send.reply(`╭───「 ⚠️ 𝐄𝐑𝐑𝐎𝐑 」───╮
│
│ ❌ নাম কই? আমি কি
│    বাতাসের নাম রাখবো?
│
│ 👉 ${config.PREFIX}setnickall BLACK FOX
│
╰─────────────────────╯`);
  }
  
  await send.reply(`╭───「 ⏳ 𝐖𝐎𝐑𝐊𝐈𝐍𝐆 」───╮
│
│ 🔄 কাজ শুরু করছি বস...
│    সবাইকে "${nickname}"
│    বানিয়ে দিচ্ছি!
│
│ ☕ একটু সময় লাগবে, ওয়েট।
│
╰─────────────────────╯`);
  
  const members = threadInfo.participantIDs;
  let success = 0;
  
  for (const user of members) {
    try {
      await api.changeNickname(nickname, threadID, user);
      success++;
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (e) {
    }
  }
  
  return send.reply(`╭───「 ✅ 𝐂𝐎𝐌𝐏𝐋𝐄𝐓𝐄 」───╮
│
│ ✨ মিশন সাকসেসফুল!
│
│ 👤 𝐓𝐨𝐭𝐚𝐥: ${success}/${members.length}
│ 🏷️ 𝐍𝐚𝐦𝐞: ${nickname}
│
│ </> 𝐀𝐮𝐭𝐡𝐨𝐫: 𝐀𝐊𝐀𝐒𝐇 𝐇𝐀𝐒𝐀𝐍
╰─────────────────────╯`);
};