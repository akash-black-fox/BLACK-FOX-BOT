module.exports.config = {
  name: 'config',
  aliases: ['settings', 'botconfig', 'set'],
  description: 'View or change bot configuration',
  credits: 'AKASH HASAN',
  usage: 'config [key] [value]',
  category: 'Admin',
  adminOnly: true,
  prefix: true,
  version: "1.1.0"
};

module.exports.run = async function({ api, event, args, send }) {
  const fs = require('fs-extra');
  const path = require('path');
  const configPath = path.join(__dirname, '../../config.json');
  let envConfig = fs.readJsonSync(configPath);
  
  if (args.length === 0) {
    let msg = `╭───「 ⚙️ 𝐂𝐎𝐍𝐅𝐈𝐆 」───╮\n│\n`;
    
    for (const [key, value] of Object.entries(envConfig)) {
      if (Array.isArray(value)) {
        msg += `│ 📝 ${key}: [List]\n`;
      } else {
        msg += `│ 📝 ${key}: ${value}\n`;
      }
    }
    
    msg += `│\n╰─────────────────────╯
💡 Usage: config [Key] [Value]
👉 Ex: config PREFIX !`;
    
    return send.reply(msg);
  }
  
  const key = args[0].toUpperCase();
  const value = args.slice(1).join(' ');
  
  if (!value) {
    if (envConfig.hasOwnProperty(key)) {
      const val = envConfig[key];
      return send.reply(`╭───「 🔍 𝐕𝐀𝐋𝐔𝐄 」───╮
│
│ 🔑 𝐊𝐞𝐲: ${key}
│ 📄 𝐕𝐚𝐥: ${JSON.stringify(val)}
│
╰─────────────────────╯`);
    }
    return send.reply(`╭───「 ❌ 𝐄𝐑𝐑𝐎𝐑 」───╮
│
│ ⚠️ Unknown Config Key
│
╰─────────────────────╯`);
  }
  
  if (!envConfig.hasOwnProperty(key)) {
    return send.reply(`╭───「 ❌ 𝐄𝐑𝐑𝐎𝐑 」───╮
│
│ ⚠️ This setting does
│    not exist.
│
╰─────────────────────╯`);
  }
  
  const currentType = typeof envConfig[key];
  let newValue;
  
  if (currentType === 'boolean') {
    newValue = value.toLowerCase() === 'true' || value === '1' || value.toLowerCase() === 'on';
  } else if (currentType === 'number') {
    newValue = Number(value);
  } else if (Array.isArray(envConfig[key])) {
    newValue = value.split(',').map(s => s.trim());
  } else {
    newValue = value;
  }
  
  envConfig[key] = newValue;
  fs.writeJsonSync(configPath, envConfig, { spaces: 2 });
  
  send.reply(`╭───「 🔄 𝐑𝐄𝐒𝐓𝐀𝐑𝐓 」───╮
│
│ 🔧 𝐒𝐞𝐭𝐭𝐢𝐧𝐠: ${key}
│ 📝 𝐔𝐩𝐝𝐚𝐭𝐞𝐝: ${newValue}
│
│ ⏳ বট রিস্টার্ট হচ্ছে...
│    ১০/১৫ সেকেন্ড অপেক্ষা করুন।
│
│ </> 𝐀𝐮𝐭𝐡𝐨𝐫: 𝐀𝐊𝐀𝐒𝐇 𝐇𝐀𝐒𝐀𝐍
╰─────────────────────╯`, () => {
    setTimeout(() => {
        process.exit(1);
    }, 2000);
  });
};