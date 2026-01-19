const fs = require('fs-extra');
const path = require('path');

module.exports.config = {
  name: 'setprefix',
  aliases: ['changeprefix', 'prefixset'],
  description: 'Change the bot prefix',
  credits: 'AKASH HASAN',
  usage: 'setprefix [new prefix]',
  category: 'Admin',
  adminOnly: true,
  prefix: true,
  version: "1.0.0"
};

module.exports.run = async function({ api, event, args, send, config }) {
  const { senderID } = event;
  
  if (!config.ADMINBOT.includes(senderID)) {
    return send.reply(`╭───「 ⛔ 𝐃𝐄𝐍𝐈𝐄𝐃 」───╮
│
│ ❌ এক্সেস ডিনাইড!
│
│ শুধু বস আকাশ এই কমান্ড
│ ব্যবহার করতে পারবে।
│
╰─────────────────────╯`);
  }
  
  const newPrefix = args[0];
  
  if (!newPrefix) {
    return send.reply(`╭───「 ⚠️ 𝐄𝐑𝐑𝐎𝐑 」───╮
│
│ ❌ নতুন প্রিফিক্স কই?
│
│ 👉 ব্যবহার: ${config.PREFIX}setprefix #
│
╰─────────────────────╯`);
  }
  
  if (newPrefix.length > 3) {
    return send.reply(`╭───「 ⚠️ 𝐋𝐈𝐌𝐈𝐓 」───╮
│
│ ❌ এত বড় প্রিফিক্স?
│    ১-৩ অক্ষরের মধ্যে দিন।
│
╰─────────────────────╯`);
  }
  
  const configPath = path.join(__dirname, '../../config.json');
  let envConfig = fs.readJsonSync(configPath);
  const oldPrefix = envConfig.PREFIX;
  
  envConfig.PREFIX = newPrefix;
  fs.writeJsonSync(configPath, envConfig, { spaces: 2 });
  global.config = envConfig;
  
  send.reply(`╭───「 ✅ 𝐔𝐏𝐃𝐀𝐓𝐄𝐃 」───╮
│
│ 🔄 প্রিফিক্স চেঞ্জ হয়েছে!
│
│ 🔴 𝐎𝐥𝐝: ${oldPrefix}
│ 🟢 𝐍𝐞𝐰: ${newPrefix}
│
│ ⏳ বট রিস্টার্ট হচ্ছে...
│    একটু অপেক্ষা করুন।
│
│ </> 𝐀𝐮𝐭𝐡𝐨𝐫: 𝐀𝐊𝐀𝐒𝐇 𝐇𝐀𝐒𝐀𝐍
╰─────────────────────╯`, () => {
    setTimeout(() => {
        process.exit(1);
    }, 2000);
  });
};