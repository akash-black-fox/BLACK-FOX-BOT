const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

module.exports.config = {
  name: 'foxbye',
  aliases: ['botleave', 'leavegroup', 'remoteleave'],
  description: 'Bot leaves a specific group by ID',
  credits: 'AKASH HASAN',
  usage: 'foxbye [threadID]',
  category: 'Admin',
  adminOnly: true,
  prefix: true,
  version: "1.0.0"
};

module.exports.run = async function({ api, event, args, send, config }) {
  const { senderID } = event;

  if (!config.ADMINBOT.includes(senderID)) {
    return send.reply(`╭───「 ⚠️ 𝐖𝐀𝐑𝐍𝐈𝐍𝐆 」───╮
│
│ ❌ 𝐀𝐜𝐜𝐞𝐬𝐬 𝐃𝐞𝐧𝐢𝐞𝐝!
│
│ শুধু বস আকাশ এই কমান্ড
│ ব্যবহার করতে পারবে।
│
╰─────────────────────╯`);
  }

  const targetThreadID = args[0];

  if (!targetThreadID) {
    return send.reply(`╭───「 ⚠️ 𝐄𝐑𝐑𝐎𝐑 」───╮
│
│ ❌ গ্রুপের আইডি কই বস?
│
│ 👉 ${config.PREFIX}foxbye [GroupID]
│
╰─────────────────────╯`);
  }

  try {
    const byeGif = "https://i.ibb.co/tpvztNQP/821b1008e2d7.gif";
    const cacheDir = path.join(__dirname, "cache");
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);
    const gifPath = path.join(cacheDir, `bye_${Date.now()}.gif`);

    const response = await axios.get(byeGif, { responseType: 'arraybuffer' });
    fs.writeFileSync(gifPath, Buffer.from(response.data));

    const byeMessage = {
      body: `╭───「 👋 𝐆𝐎𝐎𝐃𝐁𝐘𝐄 」───╮
│
│ 🚶 বস আকাশ হাসান আমাকে
│    এই গ্রুপ থেকে লিভ নিতে
│    অর্ডার দিয়েছেন।
│
│ 💔 তাই চলে যাচ্ছি...
│    সবাই ভালো থাকবেন!
│
│ </> 𝐀𝐮𝐭𝐡𝐨𝐫: 𝐀𝐊𝐀𝐒𝐇 𝐇𝐀𝐒𝐀𝐍
╰─────────────────────╯`,
      attachment: fs.createReadStream(gifPath)
    };

    await api.sendMessage(byeMessage, targetThreadID);

    await new Promise(r => setTimeout(r, 3000));

    const botID = api.getCurrentUserID();
    
    api.removeUserFromGroup(botID, targetThreadID, (err) => {
      if (err) return send.reply(`❌ গ্রুপ থেকে বের হতে পারলাম না! হয়তো আমি এডমিন নই বা আইডি ভুল।`);
      
      send.reply(`╭───「 ✅ 𝐒𝐔𝐂𝐂𝐄𝐒𝐒 」───╮
│
│ 🚪 লিভ নেওয়া সম্পন্ন!
│
│ 🆔 𝐓𝐈𝐃: ${targetThreadID}
│
╰─────────────────────╯`);
    });

    fs.unlinkSync(gifPath);

  } catch (error) {
    return send.reply(`╭───「 ⚠️ 𝐅𝐀𝐈𝐋𝐄𝐃 」───╮
│
│ ❌ ঐ গ্রুপে মেসেজ পাঠানো
│    যাচ্ছে না।
│
│ 🔍 আইডি সঠিক কিনা চেক করুন।
│
╰─────────────────────╯`);
  }
};