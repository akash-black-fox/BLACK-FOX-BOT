module.exports = {
  config: {
    name: 'creategroup',
    aliases: ['newgroup', 'makegroup'],
    version: '1.0.0',
    author: 'AKASH HASAN',
    description: 'Create a new group with specified members',
    usage: 'creategroup [name] | @mention',
    category: 'Utility',
    adminOnly: true,
    prefix: true
  },
  
  async run({ api, event, args, send, config }) {
    const { senderID, mentions } = event;
    
    if (!config.ADMINBOT.includes(senderID)) {
      return send.reply(`╭───「 ⛔ 𝐃𝐄𝐍𝐈𝐄𝐃 」───╮
│
│ ⚠️ 𝐏𝐞𝐫𝐦𝐢𝐬𝐬𝐢𝐨𝐧 𝐃𝐞𝐧𝐢𝐞𝐝
│ 👤 𝐎𝐧𝐥𝐲 𝐁𝐨𝐭 𝐀𝐝𝐦𝐢𝐧𝐬
│    𝐜𝐚𝐧 𝐮𝐬𝐞 𝐭𝐡𝐢𝐬.
│
╰─────────────────────╯`);
    }
    
    const mentionIDs = Object.keys(mentions);
    
    if (mentionIDs.length < 1) {
      return send.reply(`╭───「 ⚠️ 𝐖𝐀𝐑𝐍𝐈𝐍𝐆 」───╮
│
│ ❌ 𝐍𝐨 𝐌𝐞𝐦𝐛𝐞𝐫𝐬 𝐒𝐞𝐥𝐞𝐜𝐭𝐞𝐝
│ 👉 𝐌𝐞𝐧𝐭𝐢𝐨𝐧 𝐚𝐭 𝐥𝐞𝐚𝐬𝐭 𝟏
│    𝐩𝐞𝐫𝐬𝐨𝐧 𝐭𝐨 𝐚𝐝𝐝.
│
╰─────────────────────╯`);
    }
    
    const input = args.join(' ');
    const parts = input.split('|');
    let groupName = 'New Group';
    
    if (parts.length > 1) {
      groupName = parts[0].trim();
    }
    
    mentionIDs.push(senderID);
    
    try {
      if (typeof api.createNewGroup !== 'function') {
        return send.reply(`╭───「 ❌ 𝐄𝐑𝐑𝐎𝐑 」───╮
│
│ ⚠️ 𝐀𝐏𝐈 𝐍𝐨𝐭 𝐒𝐮𝐩𝐩𝐨𝐫𝐭𝐞𝐝
│ 🔧 𝐘𝐨𝐮𝐫 𝐛𝐨𝐭 𝐜𝐚𝐧'𝐭
│    𝐜𝐫𝐞𝐚𝐭𝐞 𝐠𝐫𝐨𝐮𝐩𝐬.
│
╰─────────────────────╯`);
      }
      
      const threadID = await api.createNewGroup(mentionIDs, groupName);
      
      return send.reply(`╭───「 ✅ 𝐂𝐑𝐄𝐀𝐓𝐄𝐃 」───╮
│
│ 📂 𝐍𝐚𝐦𝐞 : ${groupName}
│ 👥 𝐌𝐞𝐦𝐛𝐞𝐫𝐬 : ${mentionIDs.length}
│ 🆔 𝐓𝐈𝐃 : ${threadID}
│
╰─────────────────────╯`);

    } catch (error) {
      return send.reply(`╭───「 ❌ 𝐅𝐀𝐈𝐋𝐄𝐃 」───╮
│
│ ⚠️ 𝐂𝐨𝐮𝐥𝐝 𝐧𝐨𝐭 𝐜𝐫𝐞𝐚𝐭𝐞
│    𝐭𝐡𝐞 𝐠𝐫𝐨𝐮𝐩.
│
╰─────────────────────╯`);
    }
  }
};