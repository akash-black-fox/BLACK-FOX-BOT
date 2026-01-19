const fs = require('fs-extra');
const path = require('path');

module.exports.config = {
  name: 'clearcache',
  aliases: ['cc', 'clean', 'trash'],
  description: 'Delete temporary cache files',
  credits: 'AKASH HASAN',
  usage: 'clearcache',
  category: 'Admin',
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
│ আপনি দূরে গিয়ে মুড়ি খান! 😒
│
╰─────────────────────╯`);
  }
  
  const cacheDir = path.join(__dirname, 'cache');
  
  if (!fs.existsSync(cacheDir)) {
    return send.reply(`╭───「 📂 𝐍𝐎 𝐅𝐈𝐋𝐄𝐒 」───╮
│
│ বস, ফোল্ডার তো আগেই ফাঁকা!
│ নতুন করে কি ডিলিট করবো?
│
╰─────────────────────╯`);
  }
  
  try {
    const files = fs.readdirSync(cacheDir);
    
    if (files.length === 0) {
      return send.reply(`╭───「 ✅ 𝐂𝐋𝐄𝐀𝐍 」───╮
│
│ বস, সব ক্লিন আছে!
│ কোনো ময়লা আবর্জনা নাই।
│
╰─────────────────────╯`);
    }
    
    const mediaExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.mp3', '.mp4', '.mpeg', '.webp', '.wav', '.ogg', '.m4a'];
    
    let deleted = 0;
    let totalSize = 0;
    
    for (const file of files) {
      const filePath = path.join(cacheDir, file);
      const ext = path.extname(file).toLowerCase();
      
      if (mediaExtensions.includes(ext)) {
        try {
          const stats = fs.statSync(filePath);
          totalSize += stats.size;
          fs.unlinkSync(filePath);
          deleted++;
        } catch {}
      }
    }
    
    if (deleted === 0) {
      return send.reply(`╭───「 ✅ 𝐂𝐋𝐄𝐀𝐍 」───╮
│
│ বস, সব ক্লিন আছে!
│ কোনো ময়লা আবর্জনা নাই।
│
╰─────────────────────╯`);
    }
    
    const sizeMB = (totalSize / (1024 * 1024)).toFixed(2);
    
    return send.reply(`╭───「 🧹 𝐂𝐀𝐂𝐇𝐄 𝐂𝐋𝐄𝐀𝐑 」───╮
│
│ 🗑️ 𝐃𝐞𝐥𝐞𝐭𝐞𝐝 : ${deleted} Files
│ 💾 𝐒𝐢𝐳𝐞     : ${sizeMB} MB
│ 🚀 𝐒𝐲𝐬𝐭𝐞𝐦 : Optimized
│
│ </> 𝐀𝐮𝐭𝐡𝐨𝐫: 𝐀𝐊𝐀𝐒𝐇 𝐇𝐀𝐒𝐀𝐍
│ 🔗 m.me/akash.black.fox
╰─────────────────────╯`);
    
  } catch (error) {
    return send.reply(`❌ ডিলিট করতে পারলাম না বস! ভেজাল আছে।`);
  }
};