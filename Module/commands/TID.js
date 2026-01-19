module.exports.config = {
  name: 'tid',
  aliases: ['threadid', 'gid', 'id'],
  description: 'Get current thread ID',
  credits: 'AKASH HASAN',
  usage: 'tid',
  category: 'Utility',
  prefix: true,
  version: "1.0.0"
};

module.exports.run = async function({ api, event, send }) {
  const { threadID, isGroup } = event;
  
  const type = isGroup ? "👥 Group" : "👤 Inbox";
  
  return send.reply(`╭───「 🆔 𝐓𝐇𝐑𝐄𝐀𝐃 𝐈𝐃 」───╮
│
│ 📂 𝐓𝐲𝐩𝐞 : ${type}
│ 🔢 𝐈𝐃   : ${threadID}
│
│ 💡 আইডিটা কপি করে রাখুন
│    কাজে লাগতে পারে।
│
│ </> 𝐀𝐮𝐭𝐡𝐨𝐫: 𝐀𝐊𝐀𝐒𝐇 𝐇𝐀𝐒𝐀𝐍
╰─────────────────────╯`);
};