module.exports.config = {
  name: 'unapprove',
  aliases: ['reject', 'disapprove', 'banthread'],
  description: 'Unapprove a group from using bot',
  credits: 'AKASH HASAN',
  usage: 'unapprove [threadID]',
  category: 'Admin',
  adminOnly: true,
  prefix: true,
  version: "1.0.0"
};

module.exports.run = async function({ api, event, args, send, Threads, config }) {
  const { threadID, senderID } = event;
  const targetThread = args[0] || threadID;
  
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
  
  if (!/^\d+$/.test(targetThread)) {
    return send.reply(`╭───「 ⚠️ 𝐄𝐑𝐑𝐎𝐑 」───╮
│
│ ❌ সঠিক গ্রুপ আইডি দিন।
│    উল্টাপাল্টা দিলে হবে না!
│
╰─────────────────────╯`);
  }
  
  const isApproved = await Threads.isApproved(targetThread);

  if (!isApproved) {
    return send.reply(`╭───「 🥱 𝐀𝐋𝐑𝐄𝐀𝐃𝐘 」───╮
│
│ বস, এই গ্রুপ তো আগেই
│ বাতিল করা আছে।
│
│ নতুন করে কি করবো?
│
╰─────────────────────╯`);
  }
  
  await Threads.unapprove(targetThread);
  
  let groupName = 'Unknown Group';
  try {
    const info = await api.getThreadInfo(targetThread);
    groupName = info.threadName || 'Unknown Group';
  } catch {}
  
  if (targetThread !== threadID) {
    api.sendMessage(`╭───「 ⛔ 𝐒𝐓𝐎𝐏𝐏𝐄𝐃 」───╮
│
│ ❌ বস আকাশ এই গ্রুপটি
│    আন-এপ্রুভ করেছেন!
│
│ ⚠️ এখন থেকে এই গ্রুপে
│    বট আর কাজ করবে না।
│
╰─────────────────────╯`, targetThread);
  }
  
  return send.reply(`╭───「 ⛔ 𝐔𝐍𝐀𝐏𝐏𝐑𝐎𝐕𝐄𝐃 」───╮
│
│ 📂 𝐍𝐚𝐦𝐞: ${groupName}
│ 🆔 𝐈𝐃  : ${targetThread}
│
│ ❌ গ্রুপটি সফলভাবে বাতিল
│    করা হয়েছে বস!
│
│ </> 𝐀𝐮𝐭𝐡𝐨𝐫: 𝐀𝐊𝐀𝐒𝐇 𝐇𝐀𝐒𝐀𝐍
╰─────────────────────╯`);
};