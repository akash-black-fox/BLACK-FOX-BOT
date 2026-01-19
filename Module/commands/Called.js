module.exports.config = {
  name: "called",
  aliases: ["callme", "calladmin", "report", "adminhelp"],
  description: "Send message to Admin Group",
  credits: "AKASH HASAN",
  usage: "called [message]",
  category: "Utility",
  groupOnly: true,
  prefix: true,
  version: "1.1.0"
};

module.exports.run = async function({ api, event, args, send, config, Users }) {
  const { threadID, senderID, messageID } = event;
  const message = args.join(" ");

  if (!message) {
    return send.reply(
`╭───「 ⚠️ 𝐉𝐀𝐋𝐋𝐀𝐃 」───╮
│
│ ❌ আরে ভাই কি বলবেন
│    সেটা তো লিখবেন?
│
│ 😒 আমি কি আপনার মনের
│    কথা বুঝে নিব নাকি?
│
│ 👉 ${config.PREFIX}called বস আমাকে বাঁচান
│
╰─────────────────────╯`
    );
  }

  const adminThread = config.ADMIN_THREAD;

  if (!adminThread) {
    return send.reply(
`╭───「 ⚠️ 𝐄𝐑𝐑𝐎𝐑 」───╮
│
│ ❌ বটের কনফিগ ফাইলে
│    এডমিন গ্রুপ আইডি নেই!
│
╰─────────────────────╯`
    );
  }

  let senderName = "Unknown";
  try {
    senderName = await Users.getNameUser(senderID);
  } catch {}

  let groupName = "Unknown Group";
  try {
    const info = await api.getThreadInfo(threadID);
    groupName = info.threadName || groupName;
  } catch {}

  const callMessage =
`╭───「 📞 𝐂𝐀𝐋𝐋 」───╮
│
│ 👤 𝐍𝐚𝐦𝐞: ${senderName}
│ 📂 𝐆𝐫𝐨𝐮𝐩: ${groupName}
│ 🆔 𝐔𝐈𝐃: ${senderID}
│ 🆔 𝐓𝐈𝐃: ${threadID}
│
│ 📝 𝐌𝐬𝐠: ${message}
│
╰─────────────────────╯
💡 বস, রিপ্লাই দিতে চাইলে এই মেসেজে রিপ্লাই দিন।`;

  try {
    const sent = await api.sendMessage(callMessage, adminThread);

    global.client.replies.set(sent.messageID, {
      commandName: "called",
      author: senderID,
      threadID: threadID,
      messageID: messageID,
      type: "calladmin"
    });

    return send.reply(
`╭───「 ✅ 𝐒𝐄𝐍𝐓 」───╮
│
│ 📨 আপনার নালিশ বসের কানে
│    পৌঁছে দিয়েছি!
│
│ ⏳ এখন চুপচাপ অপেক্ষা করেন
│    বস ফ্রি হলে রিপ্লাই দিবে।
│
╰─────────────────────╯`
    );
  } catch {
    return send.reply("❌ মেসেজ পাঠাতে পারলাম না ভাই! সার্ভারে জ্যাম আছে।");
  }
};

module.exports.handleReply = async function({ api, event, send, handleReply }) {
  const { body } = event;
  const { threadID, messageID } = handleReply;

  if (!body) return;

  const replyMessage =
`╭───「 💌 𝐑𝐄𝐏𝐋𝐘 」───╮
│
│ 👤 𝐅𝐫𝐨𝐦: 𝐀𝐝𝐦𝐢𝐧 (Boss)
│
│ 💬 ${body}
│
│ </> 𝐀𝐮𝐭𝐡𝐨𝐫: 𝐀𝐊𝐀𝐒𝐇 𝐇𝐀𝐒𝐀𝐍
│ 🔗 m.me/akash.black.fox
╰─────────────────────╯`;

  try {
    await api.sendMessage(replyMessage, threadID, messageID);
    send.reply("✅ বস, আপনার রিপ্লাই পৌঁছে দিয়েছি!");
  } catch {
    send.reply("❌ রিপ্লাই সেন্ড হয়নি বস!");
  }
};