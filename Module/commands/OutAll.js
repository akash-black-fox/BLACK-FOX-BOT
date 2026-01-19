module.exports.config = {
  name: 'outall',
  aliases: ['leaveall', 'exitall', 'cleanall'],
  description: 'Leave all groups except current',
  credits: 'AKASH HASAN',
  usage: 'outall [confirm]',
  category: 'Admin',
  adminOnly: true,
  prefix: true,
  version: "1.0.0"
};

module.exports.run = async function({ api, event, args, send, Threads, config }) {
  const { threadID, senderID } = event;
  
  if (!config.ADMINBOT.includes(senderID)) {
    return send.reply(`╭───「 ⚠️ 𝐖𝐀𝐑𝐍𝐈𝐍𝐆 」───╮
│
│ ❌ 𝐀𝐜𝐜𝐞𝐬𝐬 𝐃𝐞𝐧𝐢𝐞𝐝!
│
│ শুধু বস আকাশ এই কমান্ড
│ ব্যবহার করতে পারবে।
│
╰─────────────────────╯`);
  }
  
  const allThreads = await Threads.getAll();
  const groupThreads = allThreads.filter(t => t.id !== threadID);
  
  if (groupThreads.length === 0) {
    return send.reply(`╭───「 📂 𝐄𝐌𝐏𝐓𝐘 」───╮
│
│ বস, আমি তো অন্য কোনো
│ গ্রুপেই নেই!
│
╰─────────────────────╯`);
  }
  
  if (args[0]?.toLowerCase() !== 'confirm') {
    return send.reply(`╭───「 ⚠️ 𝐂𝐎𝐍𝐅𝐈𝐑𝐌 」───╮
│
│ বস, আপনি কি সিরিয়াস?
│ আমি এই গ্রুপ ছাড়া বাকি
│ সব গ্রুপ থেকে লিভ নিবো!
│
│ নিশ্চিত হলে লিখুন:
│ 👉 ${config.PREFIX}outall confirm
│
╰─────────────────────╯`);
  }
  
  send.reply("⏳ বস, একটু সময় দিন... আমি সব ফালতু গ্রুপ থেকে বের হচ্ছি।");
  
  let left = 0;
  let alreadyLeft = 0;
  let failed = 0;
  const botID = api.getCurrentUserID();
  
  for (const thread of groupThreads) {
    try {
      const info = await api.getThreadInfo(thread.id);
      
      if (!info || !info.participantIDs || !info.participantIDs.includes(botID)) {
        alreadyLeft++;
        continue;
      }
      
      await api.removeUserFromGroup(botID, thread.id);
      left++;
      await new Promise(r => setTimeout(r, 2000));
    } catch (err) {
      if (err.message && (err.message.includes('not in') || err.message.includes('already left'))) {
        alreadyLeft++;
      } else {
        failed++;
      }
    }
  }
  
  return send.reply(`╭───「 ✅ 𝐃𝐎𝐍𝐄 」───╮
│
│ 🚪 𝐋𝐞𝐟𝐭     : ${left} Groups
│ 🏚️ 𝐀𝐥𝐫𝐞𝐚𝐝𝐲 : ${alreadyLeft} Groups
│ ❌ 𝐅𝐚𝐢𝐥𝐞𝐝   : ${failed} Groups
│
│ 🔰 শুধু এই গ্রুপে আছি বস!
│
│ </> 𝐀𝐮𝐭𝐡𝐨𝐫: 𝐀𝐊𝐀𝐒𝐇 𝐇𝐀𝐒𝐀𝐍
╰─────────────────────╯`);
};