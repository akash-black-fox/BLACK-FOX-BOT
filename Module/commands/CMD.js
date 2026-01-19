module.exports.config = {
  name: 'cmd',
  aliases: ['command', 'commands'],
  description: 'Manage and view bot commands',
  credits: 'AKASH HASAN',
  usage: 'cmd [list/info] [command]',
  category: 'Admin',
  adminOnly: true,
  prefix: true,
  version: "1.0.0"
};

module.exports.run = async function({ api, event, args, send, client, config }) {
  const action = args[0]?.toLowerCase();
  const target = args[1]?.toLowerCase();

  if (!action || action === 'list' || action === 'all') {
    
    const uniqueCommands = new Map();

    client.commands.forEach((cmd) => {
      if (cmd.config && cmd.config.name) {
        uniqueCommands.set(cmd.config.name, cmd);
      }
    });

    const categories = {};

    uniqueCommands.forEach((cmd) => {
      const cat = cmd.config.category ? cmd.config.category.toUpperCase() : 'OTHER';
      if (!categories[cat]) categories[cat] = [];
      categories[cat].push(cmd.config.name);
    });

    let msg = `╭───「 𝐂𝐎𝐌𝐌𝐀𝐍𝐃𝐒 」───╮\n│\n`;
    let total = 0;

    const sortedCategories = Object.keys(categories).sort();

    sortedCategories.forEach(cat => {
      msg += `│ 📂 ${cat}\n`;
      msg += `│ ${categories[cat].sort().join(', ')}\n│\n`;
      total += categories[cat].length;
    });

    msg += `╰─────────────────────╯
📊 Total: ${total} Commands
💡 Use: ${config.PREFIX}cmd info [name]
</> 𝐀𝐮𝐭𝐡𝐨𝐫: 𝐀𝐊𝐀𝐒𝐇 𝐇𝐀𝐒𝐀𝐍`;

    return send.reply(msg);
  }

  if (action === 'info') {
    if (!target) {
      return send.reply(`╭───「 ⚠️ 𝐄𝐑𝐑𝐎𝐑 」───╮
│
│ ❌ Please provide a
│    command name.
│
╰─────────────────────╯`);
    }

    let cmd = client.commands.get(target);
    if (!cmd) {
       for (const [name, command] of client.commands) {
         if (command.config.aliases && command.config.aliases.includes(target)) {
           cmd = command;
           break;
         }
       }
    }

    if (!cmd) {
      return send.reply(`╭───「 ❌ 𝟒𝟎𝟒 」───╮
│
│ Command '${target}'
│ not found.
│
╰─────────────────────╯`);
    }

    const c = cmd.config;
    return send.reply(`╭───「 ℹ️ 𝐈𝐍𝐅𝐎 」───╮
│
│ 📝 𝐍𝐚𝐦𝐞: ${c.name}
│ 🏷️ 𝐀𝐥𝐢𝐚𝐬: ${c.aliases?.join(', ') || 'None'}
│ 📂 𝐓𝐲𝐩𝐞: ${c.category}
│ 👮 𝐀𝐝𝐦𝐢𝐧: ${c.adminOnly ? 'Yes' : 'No'}
│ ⚡ 𝐏𝐫𝐞𝐟𝐢𝐱: ${c.prefix ? 'Yes' : 'No'}
│
│ 📖 𝐃𝐞𝐬𝐜: ${c.description}
│
│ </> 𝐀𝐮𝐭𝐡𝐨𝐫: 𝐀𝐊𝐀𝐒𝐇 𝐇𝐀𝐒𝐀𝐍
╰─────────────────────╯`);
  }

  return send.reply(`╭───「 🔰 𝐇𝐄𝐋𝐏 」───╮
│
│ ${config.PREFIX}cmd list
│ ${config.PREFIX}cmd info [command]
│
╰─────────────────────╯`);
};