const moment = require('moment-timezone');

module.exports.config = {
  name: "inbox",
  aliases: ["dm", "messages", "chatlist"],
  description: "Manage Bot Inbox (Simple Design)",
  credits: "AKASH HASAN",
  usage: "inbox [inbox/group/page/reply/help]",
  category: "Admin",
  adminOnly: true,
  prefix: true,
  version: "1.1.0"
};

module.exports.run = async function({ api, event, args, send, config, client }) {
  const { senderID, threadID, messageID } = event;

  if (!config.ADMINBOT.includes(senderID)) {
    return send.reply(`⚠️ ACCESS DENIED
━━━━━━━━━━━━━━━━
You are not authorized.
Only Bot Admin can use this.`);
  }

  const action = args[0]?.toLowerCase();

  if (action === "help") {
    return send.reply(
`📥 INBOX COMMANDS
━━━━━━━━━━━━━━━━
1. ${config.PREFIX}inbox
   (Show all messages)

2. ${config.PREFIX}inbox group
   (Show only groups)

3. ${config.PREFIX}inbox inbox
   (Show only personal)

4. ${config.PREFIX}inbox reply [No] [Msg]
   (Reply to a chat)

AUTHOR : AKASH HASAN`
    );
  }

  if (action === "reply") {
    const index = parseInt(args[1]) - 1;
    const text = args.slice(2).join(" ");

    if (isNaN(index) || !text) {
      return send.reply(`⚠️ Usage: inbox reply [Number] [Message]`);
    }

    const cache = client.inboxCache;
    if (!cache || !cache[index]) {
      return send.reply(`⚠️ Invalid List Number. Check inbox list first.`);
    }

    try {
      await api.sendMessage(text, cache[index].threadID);
      return send.reply(`✅ REPLIED SUCCESSFULLY
━━━━━━━━━━━━━━━━
📂 To: ${cache[index].name}
📝 Msg: ${text}`);
    } catch (e) {
      return send.reply("❌ Failed to send message.");
    }
  }

  const filter = (action === "inbox" || action === "group") ? action : null;
  const pageArg = filter ? args[1] : args[0];
  const page = parseInt(pageArg) || 1;
  const perPage = 5;

  send.reply("⏳ Loading messages...");

  try {
    let threads = await api.getThreadList(30, null, ["INBOX"]);

    if (filter === "inbox") threads = threads.filter(t => !t.isGroup);
    if (filter === "group") threads = threads.filter(t => t.isGroup);

    if (!threads.length) {
      return send.reply(`📭 Inbox is empty.`);
    }

    const totalPages = Math.ceil(threads.length / perPage);
    if (page < 1 || page > totalPages) return send.reply(`❌ Invalid Page. Range: 1-${totalPages}`);

    const start = (page - 1) * perPage;
    const view = threads.slice(start, start + perPage);

    client.inboxCache = view;

    let msg = `📥 INBOX LIST (${page}/${totalPages})
━━━━━━━━━━━━━━━━\n`;

    view.forEach((t, i) => {
      const timestamp = Number(t.timestamp);
      const timeStr = moment(timestamp).tz("Asia/Dhaka").format("DD/MM hh:mm A");
      const name = t.name || t.threadName || "Unknown";
      const snippet = t.snippet ? t.snippet.substring(0, 20) : "Attachment";
      const type = t.isGroup ? "👥" : "👤";
      const unread = t.unreadCount > 0 ? "[NEW]" : "";

      msg += `${i + 1}. ${type} ${name.substring(0, 18)} ${unread}\n`;
      msg += `   💬 ${snippet}...\n`;
      msg += `   ⏰ ${timeStr}\n\n`;
    });

    msg += `━━━━━━━━━━━━━━━━
💡 Reply: ${config.PREFIX}inbox reply [No] [Msg]
</> Author: AKASH HASAN`;

    return send.reply(msg);

  } catch (err) {
    return send.reply("❌ Error loading inbox: " + err.message);
  }
};