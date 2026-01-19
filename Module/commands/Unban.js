module.exports.config = {
  name: 'unban',
  aliases: ['free', 'pardon', 'maf'],
  description: 'Unban a user from using the bot',
  credits: 'AKASH HASAN',
  usage: 'unban @user/uid',
  category: 'Admin',
  adminOnly: true,
  prefix: true,
  version: "1.0.0"
};

module.exports.run = async function({ api, event, args, send, Users, config }) {
  const { threadID, senderID, mentions, messageReply } = event;

  if (!config.ADMINBOT.includes(senderID)) {
    return send.reply(`╭───「 ⛔ 𝐃𝐄𝐍𝐈𝐄𝐃 」───╮
│
│ ❌ আপনি তো এডমিন না!
│    কয়েদীকে ছাড়ার ক্ষমতা
│    আপনার নাই।
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
│ ❌ কাকে মাফ করবো?
│
│ 👉 মেনশন করুন অথবা
│    রিপ্লাই দিন।
│
╰─────────────────────╯`);
  }

  try {
    const data = await Users.getData(uid);
    
    if (!data || !data.banned) {
      return send.reply(`╭───「 🥱 𝐅𝐑𝐄𝐄 」───╮
│
│ বস, ও তো এমনিতেই মুক্ত!
│ ওর নামে কোনো মামলা নাই।
│
╰─────────────────────╯`);
    }

    await Users.setData(uid, { banned: { status: false, reason: null, date: null } });
    
    const name = await Users.getNameUser(uid);

    return send.reply(`╭───「 ✅ 𝐔𝐍𝐁𝐀𝐍𝐍𝐄𝐃 」───╮
│
│ 👤 𝐍𝐚𝐦𝐞: ${name}
│ 🆔 𝐔𝐈𝐃 : ${uid}
│
│ 🎉 যাও মাফ করে দিলাম!
│    ভালো হয়ে থেকো, আর
│    দুষ্টামি করো না। 😎
│
│ </> 𝐀𝐮𝐭𝐡𝐨𝐫: 𝐀𝐊𝐀𝐒𝐇 𝐇𝐀𝐒𝐀𝐍
╰─────────────────────╯`);

  } catch (error) {
    return send.reply(`❌ আনব্যান করতে সমস্যা হয়েছে বস!`);
  }
};