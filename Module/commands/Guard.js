module.exports.config = {
  name: 'guard',
  aliases: ['shield', 'avatarshield', 'profileguard'],
  version: '1.0.0',
  author: 'AKASH HASAN',
  description: 'Turn profile picture guard on or off',
  usage: 'guard [on/off]',
  category: 'System',
  adminOnly: true,
  prefix: true
};

module.exports.run = async function({ api, event, args, send, config }) {
  const { senderID } = event;
  
  if (!config.ADMINBOT.includes(senderID)) {
    return send.reply(`╭───「 ⛔ 𝐃𝐄𝐍𝐈𝐄𝐃 」───╮
│
│ ⚠️ 𝐏𝐞𝐫𝐦𝐢𝐬𝐬𝐢𝐨𝐧 𝐃𝐞𝐧𝐢𝐞𝐝
│ 👤 𝐎𝐧𝐥𝐲 𝐁𝐨𝐭 𝐀𝐝𝐦𝐢𝐧𝐬
│    𝐜𝐚𝐧 𝐮𝐬𝐞 𝐭𝐡𝐢𝐬.
│
╰─────────────────────╯`);
  }
  
  const action = args[0]?.toLowerCase();
  
  if (!action || !['on', 'off'].includes(action)) {
    return send.reply(`╭───「 ⚠️ 𝐖𝐀𝐑𝐍𝐈𝐍𝐆 」───╮
│
│ ❌ 𝐈𝐧𝐯𝐚𝐥𝐢𝐝 𝐀𝐜𝐭𝐢𝐨𝐧
│ 👉 𝐔𝐬𝐚𝐠𝐞: guard on
│    𝐎𝐫: guard off
│
╰─────────────────────╯`);
  }
  
  const enable = action === 'on';
  
  try {
    const guardFunc = api.setAvatarGuard || api.setProfileGuard;

    if (typeof guardFunc !== 'function') {
      return send.reply(`╭───「 ❌ 𝐄𝐑𝐑𝐎𝐑 」───╮
│
│ ⚠️ 𝐀𝐏𝐈 𝐍𝐨𝐭 𝐒𝐮𝐩𝐩𝐨𝐫𝐭𝐞𝐝
│ 🔧 𝐂𝐚𝐧𝐧𝐨𝐭 𝐜𝐡𝐚𝐧𝐠𝐞
│    𝐠𝐮𝐚𝐫𝐝 𝐬𝐞𝐭𝐭𝐢𝐧𝐠𝐬.
│
╰─────────────────────╯`);
    }
    
    await guardFunc(enable);
    
    const status = enable ? "Enabled 🛡️" : "Disabled 🔓";
    const msg = enable ? "Protected" : "Unprotected";

    return send.reply(`╭───「 𝐒𝐄𝐂𝐔𝐑𝐈𝐓𝐘 」───╮
│
│ 🛡️ 𝐒𝐭𝐚𝐭𝐮𝐬 : ${status}
│ 👤 𝐏𝐫𝐨𝐟𝐢𝐥𝐞 : ${msg}
│
╰─────────────────────╯`);

  } catch (error) {
    return send.reply(`╭───「 ❌ 𝐅𝐀𝐈𝐋𝐄𝐃 」───╮
│
│ ⚠️ 𝐎𝐩𝐞𝐫𝐚𝐭𝐢𝐨𝐧 𝐅𝐚𝐢𝐥𝐞𝐝
│ 🔧 𝐓𝐫𝐲 𝐚𝐠𝐚𝐢𝐧 𝐥𝐚𝐭𝐞𝐫.
│
╰─────────────────────╯`);
  }
};