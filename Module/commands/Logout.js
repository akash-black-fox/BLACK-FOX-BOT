const fs = require('fs-extra');
const path = require('path');

module.exports.config = {
  name: 'logout',
  aliases: ['shutdown', 'stop', 'off', 'die'],
  description: 'Logout and stop the bot',
  credits: 'AKASH HASAN',
  usage: 'logout',
  category: 'Admin',
  adminOnly: true,
  prefix: true,
  version: "1.0.0"
};

module.exports.run = async function({ api, event, send, config }) {
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
  
  await send.reply(`╭───「 👋 𝐆𝐎𝐎𝐃𝐁𝐘𝐄 」───╮
│
│ 😴 বস, আমি ঘুমাতে গেলাম!
│    আবার দেখা হবে।
│
│ 🔌 𝐒𝐲𝐬𝐭𝐞𝐦: 𝐒𝐡𝐮𝐭𝐭𝐢𝐧𝐠 𝐃𝐨𝐰𝐧...
│
│ </> 𝐀𝐮𝐭𝐡𝐨𝐫: 𝐀𝐊𝐀𝐒𝐇 𝐇𝐀𝐒𝐀𝐍
╰─────────────────────╯`);
  
  try {
    const appstatePath = path.join(__dirname, '../../appstate.json');
    if (fs.existsSync(appstatePath)) {
      fs.unlinkSync(appstatePath);
    }
    
    setTimeout(() => {
      process.exit(0);
    }, 2000);
    
  } catch (error) {
    process.exit(1);
  }
};