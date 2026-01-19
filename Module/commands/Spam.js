module.exports.config = {
  name: 'spam',
  aliases: ['requests', 'pendingmsg', 'mr'],
  description: 'Check and accept message requests',
  credits: 'AKASH HASAN',
  usage: 'spam',
  category: 'Utility',
  adminOnly: true,
  prefix: true,
  version: "1.0.0"
};

module.exports.run = async function({ api, event, send, config, client }) {
  const { threadID, senderID, messageID } = event;
  
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
  
  send.reply("⏳ স্প্যাম ফোল্ডার চেক করছি বস...");
  
  try {
    const list = await api.getThreadList(50, null, ['PENDING', 'OTHER']);
    
    if (list.length === 0) {
      return send.reply(`╭───「 ✅ 𝐂𝐋𝐄𝐀𝐍 」───╮
│
│ বস, কোনো পেন্ডিং মেসেজ
│ বা স্প্যাম নাই।
│ সব ক্লিয়ার!
│
╰─────────────────────╯`);
    }

    let msg = `╭───「 📩 𝐑𝐄𝐐𝐔𝐄𝐒𝐓𝐒 」───╮\n│\n`;
    const pendingList = [];

    list.forEach((thread, i) => {
      const name = thread.name || thread.threadName || "Unknown User";
      const msgBody = thread.snippet ? thread.snippet.substring(0, 15) : "Photo/Video";
      
      msg += `│ ${i + 1}. ${name}\n`;
      msg += `│    📝 ${msgBody}...\n│\n`;
      
      pendingList.push({
        id: thread.threadID,
        name: name
      });
    });

    msg += `╰─────────────────────╯
💡 রিপ্লাই দিন:
👉 "all" (সবগুলো অ্যাকসেপ্ট করতে)
👉 "1" (নির্দিষ্ট একটা করতে)
</> 𝐀𝐮𝐭𝐡𝐨𝐫: 𝐀𝐊𝐀𝐒𝐇 𝐇𝐀𝐒𝐀𝐍`;

    const info = await send.reply(msg);
    
    global.client.handleReply.push({
      name: this.config.name,
      messageID: info.messageID,
      author: senderID,
      pendingList: pendingList
    });

  } catch (e) {
    return send.reply("❌ মেসেজ লোড করতে সমস্যা হচ্ছে!");
  }
};

module.exports.handleReply = async function({ api, event, send, handleReply }) {
  const { body, senderID } = event;
  const { pendingList } = handleReply;
  
  if (senderID !== handleReply.author) return;
  
  const args = body.toLowerCase().split(',');
  const toAccept = [];
  
  if (body.toLowerCase() === 'all') {
    toAccept.push(...pendingList);
  } else {
    args.forEach(num => {
      const index = parseInt(num.trim());
      if (!isNaN(index) && index > 0 && index <= pendingList.length) {
        toAccept.push(pendingList[index - 1]);
      }
    });
  }
  
  if (toAccept.length === 0) {
    return send.reply("⚠️ ভুল নম্বর দিয়েছেন বস! ঠিক করে দিন।");
  }
  
  send.reply(`⏳ অ্যাকসেপ্ট করছি বস... (${toAccept.length} টি)`);
  
  let successCount = 0;
  
  for (const user of toAccept) {
    try {
      
      await api.sendMessage("✅ Request Accepted By Admin", user.id);
      successCount++;
      await new Promise(r => setTimeout(r, 1000));
    } catch (e) {
      
    }
  }
  
  return send.reply(`╭───「 🎉 𝐃𝐎𝐍𝐄 」───╮
│
│ ✅ সফলভাবে অ্যাকসেপ্ট
│    করা হয়েছে!
│
│ 📊 মোট: ${successCount} টি চ্যাট
│
│ </> 𝐀𝐮𝐭𝐡𝐨𝐫: 𝐀𝐊𝐀𝐒𝐇 𝐇𝐀𝐒𝐀𝐍
╰─────────────────────╯`);
};