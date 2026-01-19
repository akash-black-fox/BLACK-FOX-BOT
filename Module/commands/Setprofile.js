const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

module.exports.config = {
  name: 'setprofile',
  aliases: ['setavatar', 'setpfp', 'setdp'],
  description: 'Change bot profile picture',
  credits: 'AKASH HASAN',
  usage: 'setprofile (reply to image)',
  category: 'Admin',
  adminOnly: true,
  prefix: true,
  version: "1.0.0"
};

module.exports.run = async function({ api, event, send, config }) {
  const { senderID, messageReply } = event;
  
  if (!config.ADMINBOT.includes(senderID)) {
    return send.reply(`╭───「 ⛔ 𝐃𝐄𝐍𝐈𝐄𝐃 」───╮
│
│ ❌ আপনি তো বস আকাশ না!
│    বটের চেহারায় হাত দিবেন না।
│
│ 😒 নিজের চরকায় তেল দেন।
│
╰─────────────────────╯`);
  }
  
  if (!messageReply || !messageReply.attachments || messageReply.attachments.length === 0 || messageReply.attachments[0].type !== 'photo') {
    return send.reply(`╭───「 ⚠️ 𝐄𝐑𝐑𝐎𝐑 」───╮
│
│ ❌ ছবি কই বস?
│    বাতাসে কি প্রোফাইল পিক দিবো?
│
│ 👉 ছবির উপর রিপ্লাই দিয়ে লিখুন
│    ${config.PREFIX}setprofile
│
╰─────────────────────╯`);
  }
  
  const imageUrl = messageReply.attachments[0].url;
  
  await send.reply("⏳ দারাও বস, মেকআপ করে আসি...");
  
  try {
    const cacheDir = path.join(__dirname, 'cache');
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);
    
    const imagePath = path.join(cacheDir, `pfp_${Date.now()}.jpg`);
    
    const response = await axios.get(imageUrl, { 
      responseType: 'arraybuffer'
    });
    
    fs.writeFileSync(imagePath, Buffer.from(response.data));
    
    api.changeAvatar(fs.createReadStream(imagePath), (err) => {
      if (err) {
        return send.reply(`❌ ফেসবুক চাচা আটকাচ্ছে! প্রোফাইল চেঞ্জ করা যাচ্ছে না।`);
      }
      
      return send.reply(`╭───「 ✅ 𝐔𝐏𝐃𝐀𝐓𝐄𝐃 」───╮
│
│ ✨ নতুন প্রোফাইল পিকচার
│    সেট করা হয়েছে!
│
│ 😎 এখন আমাকে কেমন লাগছে?
│
│ </> 𝐀𝐮𝐭𝐡𝐨𝐫: 𝐀𝐊𝐀𝐒𝐇 𝐇𝐀𝐒𝐀𝐍
╰─────────────────────╯`);
      
      setTimeout(() => fs.unlinkSync(imagePath), 5000);
    });
    
  } catch (error) {
    return send.reply(`❌ সমস্যা হয়েছে বস! এরর: ${error.message}`);
  }
};