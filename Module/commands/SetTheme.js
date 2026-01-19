module.exports.config = {
  name: 'settheme',
  aliases: ['theme', 'color', 'background'],
  description: 'Change the group theme color',
  credits: 'AKASH HASAN',
  usage: 'settheme [name]',
  category: 'Group',
  groupOnly: true,
  prefix: true,
  version: "1.0.0"
};

module.exports.run = async function({ api, event, args, send, config }) {
  const { threadID, senderID } = event;
  
  const themes = {
    'black': '788274591712841',
    'blue': '196241301102133',
    'red': '2129984390566328',
    'green': '2136751179887052',
    'yellow': '174636906462322',
    'pink': '2058653964378557',
    'purple': '234137870477637',
    'orange': '175615189761153',
    'teal': '1928399724138152',
    'ocean': '1103386689793524',
    'love': '337294633367123',
    'gradient': '423719704386221'
  };
  
  const threadInfo = await api.getThreadInfo(threadID);
  const adminIDs = threadInfo.adminIDs.map(a => a.id);
  
  const isGroupAdmin = adminIDs.includes(senderID);
  const isBotAdmin = config.ADMINBOT.includes(senderID);
  
  if (!isGroupAdmin && !isBotAdmin) {
    return send.reply(`╭───「 ⛔ 𝐃𝐄𝐍𝐈𝐄𝐃 」───╮
│
│ ❌ আপনি তো এডমিন না!
│    থিম পাল্টানোর সাহস
│    পেলেন কই? 😒
│
│ 👉 আগে এডমিন হন।
│
╰─────────────────────╯`);
  }
  
  if (!args[0]) {
    const list = Object.keys(themes).map(t => `👉 ${t}`).join('\n');
    return send.reply(`╭───「 🎨 𝐓𝐇𝐄𝐌𝐄 𝐋𝐈𝐒𝐓 」───╮
│
${list}
│
│ 💡 ব্যবহার:
│ ${config.PREFIX}settheme black
│
╰─────────────────────╯`);
  }
  
  let themeName = args[0].toLowerCase();
  let themeID = themes[themeName];
  
  if (!themeID) {
    return send.reply(`╭───「 ⚠️ 𝐄𝐑𝐑𝐎𝐑 」───╮
│
│ ❌ ভুল থিম নাম!
│    লিস্ট চেক করুন।
│
│ 👉 ${config.PREFIX}settheme
│
╰─────────────────────╯`);
  }
  
  try {
    await api.changeThreadColor(themeID, threadID);
    return send.reply(`╭───「 ✅ 𝐔𝐏𝐃𝐀𝐓𝐄𝐃 」───╮
│
│ ✨ থিম চেঞ্জ করা হয়েছে!
│    এখন গ্রুপটা জোস লাগছে। 😎
│
│ 🎨 𝐓𝐡𝐞𝐦𝐞: ${themeName.toUpperCase()}
│
│ </> 𝐀𝐮𝐭𝐡𝐨𝐫: 𝐀𝐊𝐀𝐒𝐇 𝐇𝐀𝐒𝐀𝐍
╰─────────────────────╯`);
  } catch (error) {
    return send.reply(`❌ থিম চেঞ্জ করতে পারলাম না! হয়তো এই থিমটি আপনার আইডিতে এভেইলেবল না।`);
  }
};