module.exports = {
  config: {
    name: 'groupadmin',
    aliases: ['gadmin', 'promote', 'demote'],
    version: '1.1.0',
    author: 'AKASH HASAN',
    description: 'Promote or Demote group admins',
    usage: 'groupadmin [add/remove] [mention/reply]',
    category: 'Group',
    groupOnly: true,
    prefix: true
  },
  
  async run({ api, event, args, send, config }) {
    const { threadID, senderID } = event;
    const mentions = event.mentions || {};
    
    const threadInfo = await api.getThreadInfo(threadID);
    const adminIDs = threadInfo.adminIDs.map(a => a.id);
    const botID = api.getCurrentUserID();
    
    if (!adminIDs.includes(botID)) {
      return send.reply(`╭───「 ❌ 𝐄𝐑𝐑𝐎𝐑 」───╮
│
│ ⚠️ 𝐁𝐨𝐭 𝐢𝐬 𝐧𝐨𝐭 𝐀𝐝𝐦𝐢𝐧
│ 🔧 𝐏𝐥𝐞𝐚𝐬𝐞 𝐦𝐚𝐤𝐞 𝐦𝐞 𝐚𝐝𝐦𝐢𝐧 𝐟𝐢𝐫𝐬𝐭.
│
╰─────────────────────╯`);
    }
    
    const isGroupAdmin = adminIDs.includes(senderID);
    const isBotAdmin = config.ADMINBOT.includes(senderID);
    
    if (!isGroupAdmin && !isBotAdmin) {
      return send.reply(`╭───「 ⛔ 𝐃𝐄𝐍𝐈𝐄𝐃 」───╮
│
│ ⚠️ 𝐏𝐞𝐫𝐦𝐢𝐬𝐬𝐢𝐨𝐧 𝐃𝐞𝐧𝐢𝐞𝐝
│ 👤 𝐎𝐧𝐥𝐲 𝐀𝐝𝐦𝐢𝐧𝐬 𝐜𝐚𝐧 𝐮𝐬𝐞 𝐭𝐡𝐢𝐬.
│
╰─────────────────────╯`);
    }
    
    const action = args[0]?.toLowerCase();
    
    if (!action || !['add', 'remove'].includes(action)) {
      return send.reply(`╭───「 𝐇𝐄𝐋𝐏 」───╮
│
│ ➤ groupadmin add @user
│ ➤ groupadmin remove @user
│
╰─────────────────────╯`);
    }
    
    let uid = '';
    
    if (Object.keys(mentions).length > 0) {
      uid = Object.keys(mentions)[0];
    } 
    else if (event.messageReply) {
      uid = event.messageReply.senderID;
    } 
    else if (args[1] && /^\d+$/.test(args[1])) {
      uid = args[1];
    } 
    else {
      return send.reply(`╭───「 ⚠️ 𝐖𝐀𝐑𝐍𝐈𝐍𝐆 」───╮
│
│ ❌ 𝐍𝐨 𝐔𝐬𝐞𝐫 𝐅𝐨𝐮𝐧𝐝
│ 👉 𝐌𝐞𝐧𝐭𝐢𝐨𝐧 𝐨𝐫 𝐑𝐞𝐩𝐥𝐲 𝐭𝐨 𝐮𝐬𝐞𝐫.
│
╰─────────────────────╯`);
    }
    
    if (uid === botID) {
      return send.reply(`╭───「 ❌ 𝐄𝐑𝐑𝐎𝐑 」───╮
│
│ ⚠️ 𝐂𝐚𝐧𝐧𝐨𝐭 𝐜𝐡𝐚𝐧𝐠𝐞
│    𝐁𝐨𝐭's 𝐬𝐭𝐚𝐭𝐮𝐬.
│
╰─────────────────────╯`);
    }
    
    try {
      let name = 'Unknown';
      try {
        const info = await api.getUserInfo(uid);
        name = info[uid]?.name || 'Unknown';
      } catch {}
      
      if (action === 'add') {
        if (adminIDs.includes(uid)) {
          return send.reply(`╭───「 ⚠️ 𝐈𝐍𝐅𝐎 」───╮
│
│ 👤 ${name}
│    𝐢𝐬 𝐚𝐥𝐫𝐞𝐚𝐝𝐲 𝐚𝐧 𝐀𝐝𝐦𝐢𝐧.
│
╰─────────────────────╯`);
        }
        
        await api.changeAdminStatus(threadID, uid, true);
        return send.reply(`╭───「 𝐏𝐑𝐎𝐌𝐎𝐓𝐄𝐃 」───╮
│
│ 👤 𝐍𝐚𝐦𝐞 : ${name}
│ 🆙 𝐑𝐨𝐥𝐞 : 𝐆𝐫𝐨𝐮𝐩 𝐀𝐝𝐦𝐢𝐧
│ ✅ 𝐒𝐭𝐚𝐭𝐮𝐬 : Success
│
╰─────────────────────╯`);
      } 
      
      else {
        if (!adminIDs.includes(uid)) {
          return send.reply(`╭───「 ⚠️ 𝐈𝐍𝐅𝐎 」───╮
│
│ 👤 ${name}
│    𝐢𝐬 𝐧𝐨𝐭 𝐚𝐧 𝐀𝐝𝐦𝐢𝐧.
│
╰─────────────────────╯`);
        }
        
        await api.changeAdminStatus(threadID, uid, false);
        return send.reply(`╭───「 𝐃𝐄𝐌𝐎𝐓𝐄𝐃 」───╮
│
│ 👤 𝐍𝐚𝐦𝐞 : ${name}
│ ⬇️ 𝐑𝐨𝐥𝐞 : 𝐌𝐞𝐦𝐛𝐞𝐫
│ 🗑️ 𝐒𝐭𝐚𝐭𝐮𝐬 : Removed Admin
│
╰─────────────────────╯`);
      }
    } catch (error) {
      return send.reply(`╭───「 ❌ 𝐅𝐀𝐈𝐋𝐄𝐃 」───╮
│
│ ⚠️ 𝐎𝐩𝐞𝐫𝐚𝐭𝐢𝐨𝐧 𝐅𝐚𝐢𝐥𝐞𝐝.
│ 🔧 𝐂𝐡𝐞𝐜𝐤 𝐁𝐨𝐭 𝐏𝐞𝐫𝐦𝐢𝐬𝐬𝐢𝐨𝐧𝐬.
│
╰─────────────────────╯`);
    }
  }
};