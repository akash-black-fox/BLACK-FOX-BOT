module.exports.config = {
  name: 'kick',
  aliases: ['remove', 'banish', 'out'],
  description: 'Kick a member from the group',
  credits: 'AKASH HASAN',
  usage: 'kick @user/uid',
  category: 'Group',
  groupOnly: true,
  prefix: true,
  version: "1.0.0"
};

const axios = require('axios');

module.exports.run = async function({ api, event, args, send, Users, config }) {
  const { threadID, senderID, mentions, messageReply } = event;
  
  const threadInfo = await api.getThreadInfo(threadID);
  const adminIDs = threadInfo.adminIDs.map(a => a.id);
  const botID = api.getCurrentUserID();
  
  if (!adminIDs.includes(botID)) {
    return send.reply(`╭───「 ⚠️ 𝐖𝐀𝐑𝐍𝐈𝐍𝐆 」───╮
│
│ ❌ 𝐀𝐜𝐜𝐞𝐬𝐬 𝐃𝐞𝐧𝐢𝐞𝐝!
│
│ আগে আমাকে এডমিন বানান,
│ তারপর লাথি মারতে বলুন! 😒
│
╰─────────────────────╯`);
  }
  
  const isGroupAdmin = adminIDs.includes(senderID);
  const isBotAdmin = config.ADMINBOT.includes(senderID);
  
  if (!isGroupAdmin && !isBotAdmin) {
    return send.reply(`╭───「 🔒 𝐃𝐄𝐍𝐈𝐄𝐃 」───╮
│
│ ❌ আপনি তো এডমিন না!
│
│ শুধু এডমিনরা মেম্বারদের
│ কিক মারতে পারবে।
│
╰─────────────────────╯`);
  }
  
  let uid = '';
  
  if (Object.keys(mentions).length > 0) {
    uid = Object.keys(mentions)[0];
  } else if (args[0] && /^\d+$/.test(args[0])) {
    uid = args[0];
  } else if (messageReply) {
    uid = messageReply.senderID;
  } else {
    return send.reply(`╭───「 ⚠️ 𝐄𝐑𝐑𝐎𝐑 」───╮
│
│ ❌ কাউকে তো মেনশন করুন
│    অথবা রিপ্লাই দিন!
│
│ 👉 .kick @User
│
╰─────────────────────╯`);
  }
  
  if (uid === botID) {
    return send.reply(`╭───「 😒 𝐒𝐄𝐑𝐈𝐎𝐔𝐒𝐋𝐘? 」───╮
│
│ আমি নিজেকে কেন কিক দিবো?
│ পাগল নাকি আপনি? 🐸
│
╰─────────────────────╯`);
  }
  
  if (adminIDs.includes(uid) && !isBotAdmin) {
    return send.reply(`╭───「 🛡️ 𝐒𝐄𝐂𝐔𝐑𝐈𝐓𝐘 」───╮
│
│ ❌ এডমিনকে কিক মারা যাবে না!
│    বস ক্ষেপে যাবে।
│
╰─────────────────────╯`);
  }
  
  try {
    const name = await Users.getNameUser(uid);
    await api.removeUserFromGroup(uid, threadID);
    
    const kickGif = "https://i.ibb.co/CpGKLVw2/1b5eb5cb1b76.gif";

    const msgBody = `╭───「 🔨 𝐊𝐈𝐂𝐊𝐄𝐃 」───╮
│
│ 👤 𝐍𝐚𝐦𝐞: ${name}
│ 🆔 𝐔𝐈𝐃 : ${uid}
│
│ 👋 টাটা বাই বাই!
│    গ্রুপ থেকে বের করে দিলাম।
│
│ </> 𝐀𝐮𝐭𝐡𝐨𝐫: 𝐀𝐊𝐀𝐒𝐇 𝐇𝐀𝐒𝐀𝐍
╰─────────────────────╯`;

    try {
      const response = await axios.get(kickGif, { responseType: 'stream' });
      return api.sendMessage({
        body: msgBody,
        attachment: response.data
      }, threadID);
    } catch (e) {
      return api.sendMessage(msgBody, threadID);
    }

  } catch (error) {
    return send.reply(`❌ কিক মারতে পারলাম না বস! সমস্যা হচ্ছে।`);
  }
};