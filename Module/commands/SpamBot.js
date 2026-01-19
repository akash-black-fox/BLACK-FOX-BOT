module.exports.config = {
  name: 'spamgc',
  aliases: ['requestgc', 'pendinggc'],
  description: 'Accept pending/spam groups',
  credits: 'AKASH HASAN',
  usage: 'spamgc',
  category: 'Admin',
  adminOnly: true,
  prefix: true,
  version: "1.0.0"
};

module.exports.spamData = new Map();

module.exports.run = async function({ api, event, send, client, config }) {
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

  send.reply("⏳ স্প্যাম গ্রুপের বস্তা খুঁজছি বস...");

  try {
    const pendingThreads = await api.getThreadList(100, null, ['PENDING']) || [];
    const otherThreads = await api.getThreadList(100, null, ['OTHER']) || [];
    
    const allSpam = [...pendingThreads, ...otherThreads].filter(t => t.isGroup);

    if (allSpam.length === 0) {
      return send.reply(`╭───「 ✅ 𝐂𝐋𝐄𝐀𝐍 」───╮
│
│ বস, কোনো স্প্যাম গ্রুপ নাই!
│ সব ক্লিয়ার।
│
╰─────────────────────╯`);
    }

    let msg = `╭───「 📦 𝐒𝐏𝐀𝐌 𝐆𝐑𝐎𝐔𝐏𝐒 」───╮\n│\n`;
    const spamList = [];

    for (let i = 0; i < Math.min(allSpam.length, 20); i++) {
      const group = allSpam[i];
      spamList.push({
        index: i + 1,
        id: group.threadID,
        name: group.name || group.threadName || 'Unknown Group'
      });

      msg += `│ ${i + 1}. ${group.name || 'Unknown'}\n`;
      msg += `│ 🆔 ${group.threadID}\n│ 👥 ${group.participantIDs.length} Members\n│\n`;
    }

    msg += `╰─────────────────────╯
💡 রিপ্লাই দিন:
👉 "all" (সবগুলো একসেপ্ট করতে)
👉 "1" (নির্দিষ্ট একটা করতে)
</> 𝐀𝐮𝐭𝐡𝐨𝐫: 𝐀𝐊𝐀𝐒𝐇 𝐇𝐀𝐒𝐀𝐍`;

    const info = await send.reply(msg);

    if (global.client && global.client.replies) {
      global.client.replies.set(info.messageID, {
        commandName: 'spamgc',
        author: senderID,
        spamList: spamList
      });
    }

  } catch (error) {
    return send.reply("❌ গ্রুপ লোড করতে সমস্যা হচ্ছে!");
  }
};

module.exports.handleReply = async function({ api, event, send, handleReply }) {
  const { body, senderID } = event;
  const { spamList } = handleReply;

  if (senderID !== handleReply.author) return;

  const args = body.toLowerCase().split(',');
  const toAccept = [];

  if (body.toLowerCase() === 'all') {
    toAccept.push(...spamList);
  } else {
    args.forEach(num => {
      const index = parseInt(num.trim());
      if (!isNaN(index) && index > 0 && index <= spamList.length) {
        toAccept.push(spamList[index - 1]);
      }
    });
  }

  if (toAccept.length === 0) {
    return send.reply("⚠️ ভুল নম্বর দিয়েছেন বস!");
  }

  send.reply(`⏳ কাজ করছি বস... (${toAccept.length} টি গ্রুপ)`);

  let successCount = 0;

  for (const group of toAccept) {
    try {
      
      await api.sendMessage(`╭───「 ✅ 𝐂𝐎𝐍𝐍𝐄𝐂𝐓𝐄𝐃 」───╮
│
│ 🤖 𝐁𝐋𝐀𝐂𝐊 𝐅𝐎𝐗 𝐁𝐎𝐓
│
│ বস আকাশ হাসান আমাকে
│ এই গ্রুপে পারমিশন দিয়েছেন!
│
│ এখন থেকে আমি একটিভ।
│
╰─────────────────────╯`, group.id);
      
      successCount++;
      await new Promise(r => setTimeout(r, 1500));

    } catch (e) {
    }
  }

  return send.reply(`╭───「 🎉 𝐃𝐎𝐍𝐄 」───╮
│
│ ✅ সফলভাবে একসেপ্ট
│    করা হয়েছে!
│
│ 📊 মোট: ${successCount} টি গ্রুপ
│
│ </> 𝐀𝐮𝐭𝐡𝐨𝐫: 𝐀𝐊𝐀𝐒𝐇 𝐇𝐀𝐒𝐀𝐍
╰─────────────────────╯`);
};