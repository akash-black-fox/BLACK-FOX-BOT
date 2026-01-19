const path = require('path');
const fs = require('fs-extra');

module.exports.config = {
  name: 'restart',
  aliases: ['reboot', 'reload', 'refresh'],
  version: '1.0.0',
  author: 'AKASH HASAN',
  description: 'Reload system files without stopping',
  usage: 'restart',
  category: 'System',
  adminOnly: true,
  prefix: true
};

module.exports.run = async function({ api, event, send, client }) {
  const { threadID, messageID } = event;
  const startTime = Date.now();

  api.sendMessage(`╭───「 ⏳ 𝐏𝐑𝐎𝐂𝐄𝐒𝐒𝐈𝐍𝐆 」───╮
│
│ 🔄 𝐒𝐲𝐬𝐭𝐞𝐦 : Restarting...
│ 📂 𝐅𝐢𝐥𝐞𝐬  : Reloading...
│
╰─────────────────────╯`, threadID, (err, info) => {
    
    setTimeout(async () => {
      try {
        const { loadCommands, loadEvents, clearRequireCache } = require('../../BLACK-FOX/system/handle/handleRefresh');
        
        const commandsPath = path.join(__dirname);
        const eventsPath = path.join(__dirname, '../events');
        const newCommandsPath = path.join(__dirname, 'NEW COMMANDS');
        
        const oldCmdCount = client.commands.size;
        const oldEvtCount = client.events.size;
        
        await loadCommands(client, commandsPath);
        await loadEvents(client, eventsPath);

        if (fs.existsSync(newCommandsPath)) {
          const newCmdFiles = fs.readdirSync(newCommandsPath).filter(f => f.endsWith('.js'));
          for (const file of newCmdFiles) {
            try {
              const filePath = path.join(newCommandsPath, file);
              clearRequireCache(filePath);
              const command = require(filePath);
              if (command.config && command.config.name) {
                client.commands.set(command.config.name.toLowerCase(), command);
                if (command.config.aliases && Array.isArray(command.config.aliases)) {
                  command.config.aliases.forEach(alias => {
                    client.commands.set(alias.toLowerCase(), command);
                  });
                }
              }
            } catch (e) {}
          }
        }

        const endTime = Date.now();
        const timeTaken = ((endTime - startTime) / 1000).toFixed(2);
        const newCmdCount = client.commands.size;
        const newEvtCount = client.events.size;

        api.sendMessage(`╭───「 ✅ 𝐂𝐎𝐌𝐏𝐋𝐄𝐓𝐄𝐃 」───╮
│
│ ⏱️ 𝐓𝐢𝐦𝐞 : ${timeTaken}s
│ 📦 𝐂𝐦𝐝𝐬 : ${oldCmdCount} ➟ ${newCmdCount}
│ 📡 𝐄𝐯𝐭𝐬 : ${oldEvtCount} ➟ ${newEvtCount}
│
╰─────────────────────╯
সিস্টেম সফলভাবে রিফ্রেশ করা হয়েছে...!! 🚀`, threadID, messageID);

        api.unsendMessage(info.messageID);

      } catch (error) {
        api.sendMessage(`╭───「 ❌ 𝐄𝐑𝐑𝐎𝐑 」───╮
│
│ ⚠️ 𝐑𝐞𝐬𝐭𝐚𝐫𝐭 𝐅𝐚𝐢𝐥𝐞𝐝
│ 🔧 𝐂𝐡𝐞𝐜𝐤 𝐂𝐨𝐧𝐬𝐨𝐥𝐞
│
╰─────────────────────╯`, threadID, messageID);
      }
    }, 1000);
  }, messageID);
};