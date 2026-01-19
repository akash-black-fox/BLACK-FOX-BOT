module.exports.config = {
  name: 'out',
  aliases: ['leave', 'bye', 'left', 'jang'],
  description: 'Bot leaves the group',
  credits: 'AKASH HASAN',
  usage: 'out',
  category: 'Admin',
  groupOnly: true,
  prefix: true,
  adminOnly: true,
  version: "1.0.0"
};

module.exports.run = async function({ api, event, send, config }) {
  const { threadID, senderID } = event;
  const botID = api.getCurrentUserID();
  
  if (!config.ADMINBOT.includes(senderID)) {
    return send.reply(`╭───「 ⚠️ 𝐖𝐀𝐑𝐍𝐈𝐍𝐆 」───╮
│
│ ❌ 𝐀𝐜𝐜𝐞𝐬𝐬 𝐃𝐞𝐧𝐢𝐞𝐝!
│
│ আপনি কি আমার বস? না!
│ তাহলে আমাকে তাড়ানোর
│ সাহস পেলেন কই? 😒
│
╰─────────────────────╯`);
  }
  
  await send.reply(`╭───「 👋 𝐆𝐎𝐎𝐃𝐁𝐘𝐄 」───╮
│
│ 🚶 বস আমাকে চলে যেতে
│    বলেছেন, তাই গেলাম!
│
│ 🥀 দেখা হবে অন্য কোনো
│    গ্রুপে। ভালো থাকবেন!
│
│ </> 𝐀𝐮𝐭𝐡𝐨𝐫: 𝐀𝐊𝐀𝐒𝐇 𝐇𝐀𝐒𝐀𝐍
╰─────────────────────╯`);
  
  setTimeout(() => {
    api.removeUserFromGroup(botID, threadID);
  }, 2000);
};