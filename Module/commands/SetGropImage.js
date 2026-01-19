const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

module.exports.config = {
  name: 'setgroupimage',
  aliases: ['setgroupphoto', 'groupimage', 'setdp', 'gimg'],
  description: 'Set group profile picture',
  credits: 'AKASH HASAN',
  usage: 'setgroupimage (reply to image)',
  category: 'Group',
  groupOnly: true,
  prefix: true,
  version: "1.0.0"
};

module.exports.run = async function({ api, event, send, config }) {
  const { threadID, senderID, messageReply } = event;
  
  const threadInfo = await api.getThreadInfo(threadID);
  const adminIDs = threadInfo.adminIDs.map(a => a.id);
  const isGroupAdmin = adminIDs.includes(senderID);
  const isBotAdmin = config.ADMINBOT.includes(senderID);

  if (!isGroupAdmin && !isBotAdmin) {
    return send.reply(`╭───「 ⛔ 𝐃𝐄𝐍𝐈𝐄𝐃 」───╮
│
│ ❌ আপনি তো এডমিন না!
│    গ্রুপের ফটো পাল্টানোর
│    সাহস পেলেন কই? 😒
│
╰─────────────────────╯`);
  }
  
  if (!messageReply || !messageReply.attachments || messageReply.attachments.length === 0) {
    return send.reply(`╭───「 ⚠️ 𝐄𝐑𝐑𝐎𝐑 」───╮
│
│ ❌ আরে ভাই ছবির রিপ্লাই
│    দিয়ে কমান্ড দিন!
│
│ 🖼️ ছবির ওপর রিপ্লাই দিয়ে
│    লিখুন: ${config.PREFIX}setgroupimage
│
╰─────────────────────╯`);
  }
  
  const attachment = messageReply.attachments[0];
  
  if (attachment.type !== 'photo') {
    return send.reply(`╭───「 ⚠️ 𝐈𝐍𝐕𝐀𝐋𝐈𝐃 」───╮
│
│ ❌ ভিডিও বা ফাইল দিলে
│    হবে না!
│
│ 👉 শুধু ছবি (Photo) দিন।
│
╰─────────────────────╯`);
  }
  
  const imageUrl = attachment.url;
  
  send.reply("⏳ একটু দাঁড়ান বস, ছবিটা সেট করছি...");
  
  try {
    const cacheDir = path.join(__dirname, 'cache');
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);
    
    const imagePath = path.join(cacheDir, `groupimg_${Date.now()}.jpg`);
    
    const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    fs.writeFileSync(imagePath, Buffer.from(response.data));
    
    await api.changeGroupImage(fs.createReadStream(imagePath), threadID);
    
    setTimeout(() => {
      try {
        if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
      } catch {}
    }, 5000);
    
    return send.reply(`╭───「 ✅ 𝐔𝐏𝐃𝐀𝐓𝐄𝐃 」───╮
│
│ ✨ গ্রুপ ফটো চেঞ্জ
│    করা হয়েছে বস!
│
│ 😎 এখন গ্রুপটা
│    জোস লাগছে!
│
│ </> 𝐀𝐮𝐭𝐡𝐨𝐫: 𝐀𝐊𝐀𝐒𝐇 𝐇𝐀𝐒𝐀𝐍
╰─────────────────────╯`);

  } catch (error) {
    return send.reply(`❌ ফটো চেঞ্জ করতে পারলাম না! হয়তো আমার পারমিশন নেই।`);
  }
};