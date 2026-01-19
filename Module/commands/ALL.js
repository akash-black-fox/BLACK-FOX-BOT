module.exports = {
  config: {
    name: 'all',
    aliases: ['tagall', 'everyone', 'mentionall'],
    version: '1.0.0',
    author: 'AKASH HASAN',
    description: 'Tag all members in the group',
    usage: 'all [message]',
    category: 'Group',
    groupOnly: true,
    prefix: true
  },
  
  async run({ api, event, args, send, config }) {
    const { threadID, senderID } = event;
    
    let threadInfo;
    try {
      threadInfo = await api.getThreadInfo(threadID);
    } catch (error) {
      return send.reply(`╭───「 ❌ 𝐄𝐑𝐑𝐎𝐑 」───╮
│
│ ⚠️ 𝐅𝐚𝐢𝐥𝐞𝐝 𝐭𝐨 𝐠𝐞𝐭
│    𝐠𝐫𝐨𝐮𝐩 𝐝𝐚𝐭𝐚.
│
╰─────────────────────╯`);
    }
    
    const adminIDs = threadInfo.adminIDs?.map(a => a.id) || [];
    const isGroupAdmin = adminIDs.includes(senderID);
    const isBotAdmin = config.ADMINBOT?.includes(senderID);
    
    if (!isGroupAdmin && !isBotAdmin) {
      return send.reply(`╭───「 ⛔ 𝐃𝐄𝐍𝐈𝐄𝐃 」───╮
│
│ ⚠️ 𝐏𝐞𝐫𝐦𝐢𝐬𝐬𝐢𝐨𝐧 𝐃𝐞𝐧𝐢𝐞𝐝
│ 👤 𝐎𝐧𝐥𝐲 𝐀𝐝𝐦𝐢𝐧𝐬 𝐜𝐚𝐧 𝐮𝐬𝐞.
│
╰─────────────────────╯`);
    }
    
    const members = threadInfo.participantIDs.filter(id => id !== api.getCurrentUserID()) || [];
    const customMessage = args.join(' ') || 'Hello Everyone!';
    
    if (members.length === 0) {
      return send.reply(`╭───「 ⚠️ 𝐖𝐀𝐑𝐍𝐈𝐍𝐆 」───╮
│
│ ❌ 𝐍𝐨 𝐦𝐞𝐦𝐛𝐞𝐫𝐬 𝐟𝐨𝐮𝐧𝐝
│    𝐭𝐨 𝐦𝐞𝐧𝐭𝐢𝐨𝐧.
│
╰─────────────────────╯`);
    }
    
    let userInfoMap = {};
    try {
      userInfoMap = await api.getUserInfo(members);
    } catch (error) {}
    
    const BATCH_SIZE = 10;
    const DELAY_MS = 1500;
    
    await send.reply(`╭───「 𝐒𝐓𝐀𝐑𝐓𝐄𝐃 」───╮
│
│ 📢 𝐌𝐞𝐬𝐬𝐚𝐠𝐞 : ${customMessage}
│ 👥 𝐓𝐚𝐫𝐠𝐞𝐭 : ${members.length} Members
│ ⏳ 𝐒𝐭𝐚𝐭𝐮𝐬 : 𝐏𝐫𝐨𝐜𝐞𝐬𝐬𝐢𝐧𝐠...
│
╰─────────────────────╯`);
    
    await new Promise(r => setTimeout(r, 2000));
    
    for (let i = 0; i < members.length; i += BATCH_SIZE) {
      const batch = members.slice(i, i + BATCH_SIZE);
      
      let mentions = [];
      let text = `📢 ${customMessage}\n\n`;
      
      for (const uid of batch) {
        let rawName = userInfoMap[uid]?.name || 'Member';
        const firstName = rawName.split(' ')[0];
        const tag = `@${firstName}`;
        
        mentions.push({ 
          id: uid, 
          tag: tag,
          fromIndex: text.length
        });
        
        text += `${tag} `;
      }
      
      try {
        await api.sendMessage({ body: text, mentions }, threadID);
      } catch (error) {}
      
      if (i + BATCH_SIZE < members.length) {
        await new Promise(r => setTimeout(r, DELAY_MS));
      }
    }
    
    await new Promise(r => setTimeout(r, 1000));
    await send.reply(`╭───「 ✅ 𝐂𝐎𝐌𝐏𝐋𝐄𝐓𝐄 」───╮
│
│ 📢 𝐌𝐞𝐧𝐭𝐢𝐨𝐧 𝐀𝐥𝐥 𝐃𝐨𝐧𝐞!
│ 👥 𝐓𝐨𝐭𝐚𝐥 : ${members.length} Members
│
╰─────────────────────╯`);
  }
};