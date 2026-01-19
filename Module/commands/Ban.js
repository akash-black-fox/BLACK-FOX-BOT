module.exports = {
  config: {
    name: 'ban',
    aliases: ['banuser'],
    description: 'Ban a user from using the bot',
    credits: 'AKASH HASAN',
    usage: 'ban @user/uid [reason]',
    category: 'Admin',
    adminOnly: true,
    prefix: true
  },

  help: async function({ api, event, config }) {
    const { threadID } = event;
    const prefix = config.PREFIX || '/';
    const message = `╭───「 💡 𝗕𝗔𝗡 𝗖𝗢𝗠𝗠𝗔𝗡𝗗 」───
│
│ Usage:
│ ${prefix}ban @user [reason]
│ ${prefix}ban 1234567890 [reason]
│
│ Description:
│ Ban a user from using the bot. You can mention the user,
│ reply to their message, or use their UID.
│
│ Examples:
│ ${prefix}ban @Sumne
│ ${prefix}ban 1234567890
│
│ AUTHOR : AKASH HASAN
│ LINK   : m.me/akash.black.fox
╰───────────────⭓`;
    api.sendMessage(message, threadID);
  },

  async run({ api, event, args, send, Users }) {
    const { threadID, messageID, mentions } = event;

    let uid = '';
    let reason = '';

    if (Object.keys(mentions).length > 0) {
      uid = Object.keys(mentions)[0];
      reason = args.slice(1).join(' ') || 'No reason provided';
    } else if (args[0] && /^\d+$/.test(args[0])) {
      uid = args[0];
      reason = args.slice(1).join(' ') || 'No reason provided';
    } else if (event.messageReply) {
      uid = event.messageReply.senderID;
      reason = args.join(' ') || 'No reason provided';
    } else {
      return send.reply(`╭───「 ⚠️ 𝗘𝗥𝗥𝗢𝗥 」───
│
│ Please mention a user, reply to their message, or provide their UID.
│
╰───────────────⭓`);
    }

    if (Users.isBanned(uid)) {
      return send.reply(`╭───「 ⚠️ 𝗔𝗟𝗥𝗘𝗔𝗗𝗬 𝗕𝗔𝗡𝗡𝗘𝗗 」───
│
│ This user is already banned.
│
╰───────────────⭓`);
    }

    Users.ban(uid, reason);

    let name = 'User';
    try {
      name = await Users.getValidName(uid, 'User');
    } catch {
      try {
        const info = await api.getUserInfo(uid);
        const rawName = info[uid]?.name;
        if (rawName && rawName.toLowerCase() !== 'facebook user' && rawName.toLowerCase() !== 'facebook') {
          name = rawName;
        }
      } catch {}
    }

    return send.reply(`╭───「 ✅ 𝗨𝗦𝗘𝗥 𝗕𝗔𝗡𝗡𝗘𝗗 」───
│
│ Name   : ${name}
│ UID    : ${uid}
│ Reason : ${reason}
│
╰───────────────⭓`);
  }
};