module.exports.config = {
  name: 'grouplock',
  aliases: ['glock', 'lockgroup'],
  description: 'Lock group settings',
  credits: 'AKASH HASAN',
  usage: 'grouplock [lock/unlock/status]',
  category: 'Group',
  groupOnly: true,
  prefix: true,
  version: "1.0.0"
};

module.exports.run = async function({ api, event, args, send, config, Threads }) {
  const { threadID, senderID } = event;
  
  try {
    const threadInfo = await api.getThreadInfo(threadID);
    const adminIDs = threadInfo.adminIDs.map(a => a.id);
    const botID = api.getCurrentUserID();
    
    const isGroupAdmin = adminIDs.includes(senderID);
    const isBotAdmin = config.ADMINBOT.includes(senderID);
    
    if (!isGroupAdmin && !isBotAdmin) {
      return send.reply(`⚠️ 𝐀𝐂𝐂𝐄𝐒𝐒 𝐃𝐄𝐍𝐈𝐄𝐃
━━━━━━━━━━━━━━━━
❌ You do not have permission.
👉 Only Group Admins can use this.`);
    }

    const action = args[0]?.toLowerCase();
    const settings = (await Threads.getData(threadID)).data || {};

    if (action === 'lock') {
      settings.lockName = true;
      settings.lockEmoji = true;
      settings.lockTheme = true;
      settings.lockImage = true;
      
      settings.originalName = threadInfo.threadName;
      settings.originalEmoji = threadInfo.emoji;
      settings.originalTheme = threadInfo.color;
      
      await Threads.setData(threadID, { data: settings });

      try {
        await api.changeThreadSettings(threadID, {
          THREAD_ADMINS_ONLY: true
        });
      } catch (e) {}

      return send.reply(`🔒 𝐆𝐑𝐎𝐔𝐏 𝐋𝐎𝐂𝐊𝐄𝐃
━━━━━━━━━━━━━━━━
✅ Settings have been secured!

🛡️ 𝐏𝐫𝐨𝐭𝐞𝐜𝐭𝐞𝐝:
 • Name, Theme, Emoji, Photo

⚠️ Changes will be auto-reverted.`);
    } 
    
    if (action === 'unlock') {
      settings.lockName = false;
      settings.lockEmoji = false;
      settings.lockTheme = false;
      settings.lockImage = false;
      
      await Threads.setData(threadID, { data: settings });

      try {
        await api.changeThreadSettings(threadID, {
          THREAD_ADMINS_ONLY: false
        });
      } catch (e) {}

      return send.reply(`🔓 𝐆𝐑𝐎𝐔𝐏 𝐔𝐍𝐋𝐎𝐂𝐊𝐄𝐃
━━━━━━━━━━━━━━━━
✅ Settings are now open!

🕊️ Members can change:
 • Name, Theme, Emoji, Photo`);
    }
    
    if (action === 'status') {
      const isLocked = settings.lockName ? "🔒 Active" : "🔓 Inactive";
      
      return send.reply(`📊 𝐒𝐄𝐂𝐔𝐑𝐈𝐓𝐘 𝐒𝐓𝐀𝐓𝐔𝐒
━━━━━━━━━━━━━━━━
🛡️ 𝐒𝐭𝐚𝐭𝐮𝐬: ${isLocked}
👥 𝐀𝐝𝐦𝐢𝐧𝐬: ${adminIDs.length}
🤖 𝐁𝐨𝐭 𝐀𝐝𝐦𝐢𝐧: ${adminIDs.includes(botID) ? "Yes" : "No"}`);
    }
    
    return send.reply(`🔰 𝐆𝐑𝐎𝐔𝐏 𝐋𝐎𝐂𝐊 𝐇𝐄𝐋𝐏
━━━━━━━━━━━━━━━━
💠 𝐔𝐬𝐚𝐠𝐞:
 • .grouplock lock
 • .grouplock unlock
 • .grouplock status`);
    
  } catch (error) {
    return send.reply(`⚠️ 𝐄𝐑𝐑𝐎𝐑: ${error.message}`);
  }
};