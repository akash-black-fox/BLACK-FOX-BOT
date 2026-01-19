module.exports.config = {
  name: 'nickname',
  aliases: ['nick', 'setnick', 'name'],
  description: 'Change nickname of a user',
  credits: 'AKASH HASAN',
  usage: 'nickname @user [new name]',
  category: 'Group',
  groupOnly: true,
  prefix: true,
  version: "1.0.0"
};

module.exports.run = async function({ api, event, args, send, config, Users }) {
  const { threadID, senderID, mentions, messageReply } = event;
  
  const threadInfo = await api.getThreadInfo(threadID);
  const adminIDs = threadInfo.adminIDs.map(a => a.id);
  
  const isGroupAdmin = adminIDs.includes(senderID);
  const isBotAdmin = config.ADMINBOT.includes(senderID);
  
  let uid = senderID;
  let nickname = args.join(' ');
  
  if (messageReply) {
    uid = messageReply.senderID;
    nickname = args.join(' ');
  } else if (Object.keys(mentions).length > 0) {
    uid = Object.keys(mentions)[0];
    nickname = args.join(' ').replace(mentions[uid], '').trim();
  }

  if (uid !== senderID && !isGroupAdmin && !isBotAdmin) {
    return send.reply(`╭───「 ⛔ 𝐃𝐄𝐍𝐈𝐄𝐃 」───╮
│
│ ❌ অন্যের নাম পাল্টানোর
│    ক্ষমতা আপনার নাই!
│
│ 😒 আগে এডমিন হন,
│    তারপর মাস্তানি মারেন।
│
╰─────────────────────╯`);
  }
  
  try {
    const userName = await Users.getNameUser(uid);

    await api.changeNickname(nickname, threadID, uid);
    
    if (nickname) {
      return send.reply(`╭───「 ✅ 𝐔𝐏𝐃𝐀𝐓𝐄𝐃 」───╮
│
│ 👤 𝐔𝐬𝐞𝐫: ${userName}
│ 🏷️ 𝐍𝐞𝐰: ${nickname}
│
│ ✨ নাম পরিবর্তন সফল!
│    নতুন নামটা জোস হইছে। 😎
│
│ </> 𝐀𝐮𝐭𝐡𝐨𝐫: 𝐀𝐊𝐀𝐒𝐇 𝐇𝐀𝐒𝐀𝐍
╰─────────────────────╯`);
    } else {
      return send.reply(`╭───「 🗑️ 𝐑𝐄𝐌𝐎𝐕𝐄𝐃 」───╮
│
│ 👤 𝐔𝐬𝐞𝐫: ${userName}
│
│ ♻️ নিকনেম রিমুভ করা হলো!
│    আগের নামেই ফিরে গেলাম।
│
╰─────────────────────╯`);
    }

  } catch (error) {
    return send.reply(`╭───「 ⚠️ 𝐄𝐑𝐑𝐎𝐑 」───╮
│
│ ❌ নাম চেঞ্জ করতে পারলাম না!
│
│ 🔒 হয়তো বট এডমিন নেই,
│    অথবা মেম্বারের পাওয়ার বেশি।
│
╰─────────────────────╯`);
  }
};