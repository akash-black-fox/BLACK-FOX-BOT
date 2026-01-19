module.exports.config = {
  name: 'kickall',
  aliases: ['removeall', 'cleargroup', 'genocide'],
  description: 'Kick all members except admins',
  credits: 'AKASH HASAN',
  usage: 'kickall [confirm]',
  category: 'Group',
  groupOnly: true,
  prefix: true,
  version: "1.0.0"
};

module.exports.run = async function({ api, event, args, send, config }) {
  const { threadID, senderID } = event;
  
  const threadInfo = await api.getThreadInfo(threadID);
  const adminIDs = threadInfo.adminIDs.map(a => a.id);
  const botID = api.getCurrentUserID();
  
  if (!config.ADMINBOT.includes(senderID)) {
    return send.reply(`╭───「 ⚠️ 𝐖𝐀𝐑𝐍𝐈𝐍𝐆 」───╮
│
│ ❌ 𝐀𝐜𝐜𝐞𝐬𝐬 𝐃𝐞𝐧𝐢𝐞𝐝!
│
│ এই পাওয়ার শুধু বস আকাশ
│ এর আছে। আপনি দূরে থাকুন!
│
╰─────────────────────╯`);
  }

  if (!adminIDs.includes(botID)) {
    return send.reply(`╭───「 ⚠️ 𝐄𝐑𝐑𝐎𝐑 」───╮
│
│ ❌ আমাকে আগে গ্রুপ এডমিন
│    বানান, তারপর দেখুন খেলা!
│
╰─────────────────────╯`);
  }
  
  const participants = threadInfo.participantIDs || [];
  const membersToKick = participants.filter(id => id !== botID && !adminIDs.includes(id));
  
  if (membersToKick.length === 0) {
    return send.reply(`╭───「 😌 𝐒𝐀𝐅𝐄 」───╮
│
│ ❌ কিক মারার মতো কেউ নেই!
│    শুধু এডমিনরা বাকি আছে।
│
╰─────────────────────╯`);
  }
  
  if (args[0]?.toLowerCase() !== 'confirm') {
    return send.reply(`╭───「 ⚠️ 𝐖𝐀𝐑𝐍𝐈𝐍𝐆 」───╮
│
│ ❌ আপনি কি নিশ্চিত?
│    ${membersToKick.length} জন মেম্বার উধাও হবে!
│
│ 👉 নিশ্চিত হলে লিখুন:
│    ${config.PREFIX}kickall confirm
│
╰─────────────────────╯`);
  }
  
  send.reply(`╭───「 💀 𝐀𝐂𝐓𝐈𝐎𝐍 」───╮
│
│ 🚀 খেলা শুরু হলো...
│ 🔪 টার্গেট: ${membersToKick.length} জন
│
╰─────────────────────╯`);
  
  let kicked = 0;
  let failed = 0;
  
  for (const uid of membersToKick) {
    try {
      await api.removeUserFromGroup(uid, threadID);
      kicked++;
      await new Promise(r => setTimeout(r, 1000));
    } catch {
      failed++;
    }
  }
  
  return send.reply(`╭───「 ☠️ 𝐑𝐄𝐏𝐎𝐑𝐓 」───╮
│
│ 🔪 খতম করেছি : ${kicked} জন
│ 🛡️ বেঁচে গেছে : ${failed} জন
│ 👑 এডমিন বাকি : ${adminIDs.length} জন
│
│ </> 𝐀𝐮𝐭𝐡𝐨𝐫: 𝐀𝐊𝐀𝐒𝐇 𝐇𝐀𝐒𝐀𝐍
╰─────────────────────╯`);
};