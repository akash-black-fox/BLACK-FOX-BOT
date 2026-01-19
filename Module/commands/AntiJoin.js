module.exports = {
  config: {
    name: 'antijoin',
    aliases: ['nojoin', 'lockjoin'],
    version: '1.0.0',
    author: 'AKASH HASAN',
    description: 'Prevent new members from joining',
    usage: 'antijoin [on/off]',
    category: 'Group',
    groupOnly: true,
    prefix: true
  },
  
  async run({ api, event, args, send, Threads, config }) {
    const { threadID, senderID } = event;
    
    const threadInfo = await api.getThreadInfo(threadID);
    const adminIDs = threadInfo.adminIDs.map(a => a.id);
    const botID = api.getCurrentUserID();
    
    if (!adminIDs.includes(botID)) {
      return send.reply(`╭───「 ❌ 𝐄𝐑𝐑𝐎𝐑 」───╮
│
│ ⚠️ 𝐁𝐨𝐭 𝐢𝐬 𝐧𝐨𝐭 𝐀𝐝𝐦𝐢𝐧
│ 🔧 𝐏𝐥𝐞𝐚𝐬𝐞 𝐦𝐚𝐤𝐞 𝐦𝐞 𝐚𝐝𝐦𝐢𝐧.
│
╰─────────────────────╯`);
    }
    
    const isGroupAdmin = adminIDs.includes(senderID);
    const isBotAdmin = config.ADMINBOT.includes(senderID);
    
    if (!isGroupAdmin && !isBotAdmin) {
      return send.reply(`╭───「 ⛔ 𝐃𝐄𝐍𝐈𝐄𝐃 」───╮
│
│ ⚠️ 𝐏𝐞𝐫𝐦𝐢𝐬𝐬𝐢𝐨𝐧 𝐃𝐞𝐧𝐢𝐞𝐝
│ 👤 𝐎𝐧𝐥𝐲 𝐀𝐝𝐦𝐢𝐧𝐬 𝐜𝐚𝐧 𝐮𝐬𝐞.
│
╰─────────────────────╯`);
    }
    
    const settings = await Threads.getData(threadID) || {};
    const threadData = settings.data || {};
    const action = args[0]?.toLowerCase();
    
    if (action === 'on' || action === 'enable') {
      threadData.antijoin = true;
      await Threads.setData(threadID, { data: threadData });
      
      return send.reply(`╭───「 𝐒𝐄𝐂𝐔𝐑𝐈𝐓𝐘 」───╮
│
│ 🔒 𝐀𝐧𝐭𝐢-𝐉𝐨𝐢𝐧 : 𝐄𝐧𝐚𝐛𝐥𝐞𝐝
│ 🛡️ বস আকশ এর অনুমতি ছারা কাউকে
│    ADD করা যাবেনা বেয়াদপ...!!
│
╰─────────────────────╯`);
    }
    
    if (action === 'off' || action === 'disable') {
      threadData.antijoin = false;
      await Threads.setData(threadID, { data: threadData });
      
      return send.reply(`╭───「 𝐒𝐄𝐂𝐔𝐑𝐈𝐓𝐘 」───╮
│
│ 🔓 𝐀𝐧𝐭𝐢-𝐉𝐨𝐢𝐧 : 𝐃𝐢𝐬𝐚𝐛𝐥𝐞𝐝
│ ✅ 𝐍𝐞𝐰 𝐦𝐞𝐦𝐛𝐞𝐫𝐬 𝐜𝐚𝐧
│    𝐣𝐨𝐢𝐧 𝐧𝐨𝐰.
│
╰─────────────────────╯`);
    }
    
    const currentStatus = threadData.antijoin ? '𝐄𝐧𝐚𝐛𝐥𝐞𝐝 🔒' : '𝐃𝐢𝐬𝐚𝐛𝐥𝐞𝐝 🔓';
    
    return send.reply(`╭───「 𝐒𝐓𝐀𝐓𝐔𝐒 」───╮
│
│ ⚙️ 𝐂𝐮𝐫𝐫𝐞𝐧𝐭 : ${currentStatus}
│
│ ➤ antijoin on
│ ➤ antijoin off
│
╰─────────────────────╯`);
  }
};