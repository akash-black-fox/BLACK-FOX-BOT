module.exports.config = {
  name: 'pending',
  aliases: ['pendinglist', 'req'],
  description: 'Approve pending groups',
  credits: 'AKASH HASAN',
  usage: 'pending',
  category: 'Admin',
  adminOnly: true,
  prefix: true,
  version: "1.0.0"
};

module.exports.run = async function({ api, event, send, Threads, config }) {
  const { senderID, messageID } = event;
  
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
  
  const pendingThreads = allThreads.filter(t => t.isGroup && !t.approved);
  
  if (pendingThreads.length === 0) {
    return send.reply(`╭───「 ✅ 𝐂𝐋𝐄𝐀𝐍 」───╮
│
│ বস, কোনো পেন্ডিং
│ গ্রুপ নাই। সব ক্লিয়ার!
│
╰─────────────────────╯`);
  }
  
  let msg = `╭───「 ⏳ 𝐏𝐄𝐍𝐃𝐈𝐍𝐆 」───╮\n│\n`;
  const list = [];
  
  pendingThreads.forEach((group, i) => {
    const name = group.threadName || group.name || "Unknown Group";
    msg += `│ ${i + 1}. ${name.substring(0, 15)}\n`;
    msg += `│ 🆔 ${group.threadID}\n│\n`;
    
    list.push({
      id: group.threadID,
      name: name
    });
  });
  
  msg += `╰─────────────────────╯
💡 রিপ্লাই দিন:
👉 "all" (সবগুলো অ্যাপ্রুভ করতে)
👉 "1" (নির্দিষ্ট একটা করতে)
👉 "1,2" (একাধিক করতে)
</> 𝐀𝐮𝐭𝐡𝐨𝐫: 𝐀𝐊𝐀𝐒𝐇 𝐇𝐀𝐒𝐀𝐍`;
  
  const info = await send.reply(msg);
  
  global.client.handleReply.push({
    name: this.config.name,
    messageID: info.messageID,
    author: senderID,
    pendingList: list
  });
};

module.exports.handleReply = async function({ api, event, send, handleReply, Threads }) {
  const { body, senderID } = event;
  const { pendingList } = handleReply;
  
  if (senderID !== handleReply.author) return;
  
  const args = body.toLowerCase().split(',');
  const toApprove = [];
  
  if (body.toLowerCase() === 'all') {
    toApprove.push(...pendingList);
  } else {
    args.forEach(num => {
      const index = parseInt(num.trim());
      if (!isNaN(index) && index > 0 && index <= pendingList.length) {
        toApprove.push(pendingList[index - 1]);
      }
    });
  }
  
  if (toApprove.length === 0) {
    return send.reply("⚠️ ভুল নম্বর দিয়েছেন বস! ঠিক করে দিন।");
  }
  
  send.reply(`⏳ কাজ করছি বস... (${toApprove.length} টি গ্রুপ)`);
  
  let successCount = 0;
  
  for (const group of toApprove) {
    try {
      await Threads.approve(group.id);
      
      api.sendMessage(`╭───「 ✅ 𝐀𝐏𝐏𝐑𝐎𝐕𝐄𝐃 」───╮
│
│ 🎉 অভিনন্দন!
│
│ বস আকাশ হাসান এই গ্রুপটি
│ অ্যাপ্রুভ করেছেন।
│
│ এখন থেকে আমি এই গ্রুপে
│ সব কাজ করবো।
│
╰─────────────────────╯`, group.id);
      
      successCount++;
      await new Promise(r => setTimeout(r, 1000));
    } catch (e) {
      
    }
  }
  
  return send.reply(`╭───「 🎉 𝐃𝐎𝐍𝐄 」───╮
│
│ ✅ সফলভাবে অ্যাপ্রুভ হয়েছে!
│
│ 📊 মোট: ${successCount} টি গ্রুপ
│
│ </> 𝐀𝐮𝐭𝐡𝐨𝐫: 𝐀𝐊𝐀𝐒𝐇 𝐇𝐀𝐒𝐀𝐍
╰─────────────────────╯`);
};