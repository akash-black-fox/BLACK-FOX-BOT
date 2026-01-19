module.exports = {
  config: {
    name: 'banlist',
    aliases: ['banned', 'bans'],
    description: 'List banned users',
    credits: 'AKASH HASAN',
    usage: 'banlist',
    category: 'Utility',
    adminOnly: true,
    prefix: true
  },

  help: async function({ api, event, config }) {
    const { threadID } = event;
    const prefix = config.PREFIX || '/';
    const message = `╭───「 💡 𝗕𝗔𝗡𝗟𝗜𝗦𝗧 𝗖𝗢𝗠𝗠𝗔𝗡𝗗 」───
│
│ Usage:
│ ${prefix}banlist
│
│ Description:
│ Lists all banned users in the bot database.
│ You can see their UID, name, and ban reason.
│
│ Example:
│ ${prefix}banlist
│
╰───────────────⭓
AUTHOR : AKASH HASAN
LINK   : m.me/akash.black.fox`;
    api.sendMessage(message, threadID);
  },

  async run({ api, event, send, Users, config }) {
    const banned = Users.getBanned();

    if (banned.length === 0) {
      return send.reply(`╭───「 ⚠️ 𝗡𝗢 𝗕𝗔𝗡𝗡𝗘𝗗 𝗨𝗦𝗘𝗥𝗦 」───
│
│ There are currently no banned users.
│
╰───────────────⭓`);
    }

    let msg = `╭───「 🛑 𝗕𝗔𝗡𝗡𝗘𝗗 𝗨𝗦𝗘𝗥𝗦 」───
│ Total: ${banned.length}\n─────────────────\n`;

    for (let i = 0; i < Math.min(banned.length, 15); i++) {
      const user = banned[i];
      msg += `│ ${i + 1}. ${user.name || 'Unknown'}\n   UID: ${user.id}\n   Reason: ${user.banReason || 'No reason'}\n─────────────────\n`;
    }

    msg += `│ Use ${config.PREFIX}unban [uid] to unban a user
╰───────────────⭓`;

    return send.reply(msg);
  }
};