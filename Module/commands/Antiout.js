module.exports.config = {
  name: "antiout",
  aliases: ["noleave"],
  description: "Prevent members from leaving",
  credits: "AKASH HASAN",
  usage: "antiout [on/off]",
  category: "Group",
  groupOnly: true,
  prefix: true,
  version: "1.0.0"
};

module.exports.run = async function({ api, event, args, send, Threads, config }) {
  const { threadID, senderID } = event;
  
  const threadInfo = await api.getThreadInfo(threadID);
  const adminIDs = threadInfo.adminIDs.map(a => a.id);
  const isGroupAdmin = adminIDs.includes(senderID);
  const isBotAdmin = config.ADMINBOT.includes(senderID);
  
  if (!isGroupAdmin && !isBotAdmin) {
    return api.sendMessage(`╭───「 🔒 𝐃𝐄𝐍𝐈𝐄𝐃 」───╮
│
│ ❌ 𝐏𝐞𝐫𝐦𝐢𝐬𝐬𝐢𝐨𝐧 𝐃𝐞𝐧𝐢𝐞𝐝!
│ 👉 Only Admins can use.
│
╰─────────────────────╯`, threadID);
  }
  

  let data = (await Threads.getData(threadID)).data || {};
  const action = args[0]?.toLowerCase();
  
  if (action === 'on' || action === 'enable') {
    data.antiout = true;
   
    await Threads.setData(threadID, { data });
    
    return api.sendMessage(`╭───「 🛡️ 𝐀𝐍𝐓𝐈-𝐎𝐔𝐓 」───╮
│
│ 🟢 𝐒𝐭𝐚𝐭𝐮𝐬 : Enabled
│ ⚡ 𝐀𝐜𝐭𝐢𝐨𝐧 : Auto Re-add
│
│ ⚠️ Members cannot leave!
│
│ </> 𝐀𝐮𝐭𝐡𝐨𝐫: 𝐀𝐊𝐀𝐒𝐇 𝐇𝐀𝐒𝐀𝐍
╰─────────────────────╯`, threadID);
  }
  
  if (action === 'off' || action === 'disable') {
    data.antiout = false;

    await Threads.setData(threadID, { data });
    
    return api.sendMessage(`╭───「 🛡️ 𝐀𝐍𝐓𝐈-𝐎𝐔𝐓 」───╮
│
│ 🔴 𝐒𝐭𝐚𝐭𝐮𝐬 : Disabled
│ ⚡ 𝐀𝐜𝐭𝐢𝐨𝐧 : None
│
│ 🕊️ Members can leave.
│
│ </> 𝐀𝐮𝐭𝐡𝐨𝐫: 𝐀𝐊𝐀𝐒𝐇 𝐇𝐀𝐒𝐀𝐍
╰─────────────────────╯`, threadID);
  }
  
  const status = data.antiout ? 'Enabled' : 'Disabled';
  return api.sendMessage(`╭───「 ⚙️ 𝐒𝐄𝐓𝐓𝐈𝐍𝐆𝐒 」───╮
│
│ 📊 𝐂𝐮𝐫𝐫𝐞𝐧𝐭: ${status}
│ ❓ 𝐔𝐬𝐚𝐠𝐞: antiout [on/off]
│
│ </> 𝐀𝐮𝐭𝐡𝐨𝐫: 𝐀𝐊𝐀𝐒𝐇 𝐇𝐀𝐒𝐀𝐍
╰─────────────────────╯`, threadID);
};