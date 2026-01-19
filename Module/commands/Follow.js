module.exports.config = {
  name: 'follow',
  aliases: ['sub', 'unfollow'],
  version: '1.0.0',
  author: 'AKASH HASAN',
  description: 'Follow or Unfollow a user',
  usage: 'follow [uid/@mention] | unfollow [uid]',
  category: 'Utility',
  adminOnly: true,
  prefix: true
};

module.exports.run = async function({ api, event, args, send, config, Users }) {
  const { senderID, mentions, messageReply } = event;
  
  if (!config.ADMINBOT.includes(senderID)) {
    return send.reply(`╭───「 ⛔ 𝐃𝐄𝐍𝐈𝐄𝐃 」───╮
│
│ ⚠️ এইটা শুধু বস আকাশের
│    জন্য, তুমি পিচ্চি পোলা
│    দূরে গিয়ে খেলো...!! 👶
│
╰─────────────────────╯`);
  }
  
  let targetID;
  let isUnfollow = false;
  
  if (args[0]?.toLowerCase() === 'unfollow') {
    isUnfollow = true;
    if (Object.keys(mentions).length > 0) {
      targetID = Object.keys(mentions)[0];
    } else if (messageReply) {
      targetID = messageReply.senderID;
    } else if (args[1]) {
      targetID = args[1];
    }
  } else {
    if (Object.keys(mentions).length > 0) {
      targetID = Object.keys(mentions)[0];
    } else if (messageReply) {
      targetID = messageReply.senderID;
    } else if (args[0]) {
      targetID = args[0];
    }
  }
  
  if (!targetID) {
    return send.reply(`╭───「 ⚠️ 𝐖𝐀𝐑𝐍𝐈𝐍𝐆 」───╮
│
│ ❌ আরে ভাই কাকে ফলো দিবো?
│    বাতাসকে নাকি? 🙄
│
│ 👉 মেনশন দে অথবা UID দে!
│
╰─────────────────────╯`);
  }
  
  try {
    let name = 'Unknown User';
    try {
      name = await Users.getNameUser(targetID);
    } catch {}

    if (typeof api.follow !== 'function') {
      return send.reply(`╭───「 ❌ 𝐄𝐑𝐑𝐎𝐑 」───╮
│
│ ⚠️ 𝐀𝐏𝐈 𝐍𝐨𝐭 𝐒𝐮𝐩𝐩𝐨𝐫𝐭𝐞𝐝
│ 🔧 𝐂𝐚𝐧𝐧𝐨𝐭 𝐩𝐞𝐫𝐟𝐨𝐫𝐦
│    𝐟𝐨𝐥𝐥𝐨𝐰 𝐚𝐜𝐭𝐢𝐨𝐧.
│
╰─────────────────────╯`);
    }
    
    await api.follow(targetID, !isUnfollow);
    
    const status = isUnfollow ? 'Unfollowed' : 'Followed';
    const icon = isUnfollow ? '➖' : '➕';

    return send.reply(`╭───「 𝐒𝐔𝐂𝐂𝐄𝐒𝐒 」───╮
│
│ ${icon} 𝐒𝐭𝐚𝐭𝐮𝐬 : ${status}
│ 👤 𝐔𝐬𝐞𝐫   : ${name}
│ 🆔 𝐔𝐈𝐃    : ${targetID}
│
╰─────────────────────╯`);

  } catch (error) {
    return send.reply(`╭───「 ❌ 𝐅𝐀𝐈𝐋𝐄𝐃 」───╮
│
│ ⚠️ 𝐄𝐫𝐫𝐨𝐫: ${error.message}
│
╰─────────────────────╯`);
  }
};