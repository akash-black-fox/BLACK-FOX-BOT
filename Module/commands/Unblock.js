module.exports.config = {
  name: 'unblock',
  aliases: ['unlock', 'forgive', 'freeuser'],
  description: 'Unblock a user on Facebook',
  credits: 'AKASH HASAN',
  usage: 'unblock [uid]',
  category: 'Admin',
  adminOnly: true,
  prefix: true,
  version: "1.0.0"
};

module.exports.run = async function({ api, event, args, send, config, Users }) {
  const { senderID } = event;
  
  if (!config.ADMINBOT.includes(senderID)) {
    return send.reply(`╭───「 ⛔ 𝐃𝐄𝐍𝐈𝐄𝐃 」───╮
│
│ ❌ এক্সেস ডিনাইড!
│
│ ব্লক/আনব্লক করার ক্ষমতা
│ শুধু বস আকাশের আছে।
│
╰─────────────────────╯`);
  }
  
  const uid = args[0];
  
  if (!uid || !/^\d+$/.test(uid)) {
    return send.reply(`╭───「 ⚠️ 𝐄𝐑𝐑𝐎𝐑 」───╮
│
│ ❌ ইউজার আইডি (UID) দিন।
│
│ 👉 ${config.PREFIX}unblock 1000xxxx
│
╰─────────────────────╯`);
  }
  
  try {
    await api.changeBlockStatus(uid, 0);
    
    let name = 'Facebook User';
    try {
      name = await Users.getNameUser(uid);
    } catch {}
    
    return send.reply(`╭───「 ✅ 𝐔𝐍𝐁𝐋𝐎𝐂𝐊𝐄𝐃 」───╮
│
│ 👤 𝐍𝐚𝐦𝐞: ${name}
│ 🆔 𝐔𝐈𝐃 : ${uid}
│
│ 🎉 যাও মাফ করে দিলাম!
│    আজ থেকে তুমি মুক্ত।
│
│ </> 𝐀𝐮𝐭𝐡𝐨𝐫: 𝐀𝐊𝐀𝐒𝐇 𝐇𝐀𝐒𝐀𝐍
╰─────────────────────╯`);

  } catch (error) {
    return send.reply(`❌ আনব্লক করতে সমস্যা হচ্ছে! হয়তো সে ব্লকড না।`);
  }
};