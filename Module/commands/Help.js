module.exports = {
  config: {
    name: "help",
    aliases: ["h", "menu", "cmds"],
    description: "Premium help menu",
    credits: "AKASH HASAN",
    usage: "help | help [page] | help [command] | help all",
    category: "Utility",
    prefix: true
  },

  async run({ api, event, args, send, client, config }) {
    const { senderID, threadID } = event;
    const input = args[0]?.toLowerCase();
    const isAdmin = config.ADMINBOT.includes(senderID);

    if (!input) {
      return sendHelpPage({ api, send, client, config, threadID, senderID, page: 1 });
    }

    if (input === "all") {
      return sendAllCommands({ api, send, client, config, threadID, senderID, isAdmin });
    }

    if (!isNaN(input)) {
      return sendHelpPage({ api, send, client, config, threadID, senderID, page: Number(input) });
    }

    if (input === "admin" && !isAdmin) {
      return send.reply("🔒 Admin commands are locked for you");
    }

    let cmd = client.commands.get(input);
    if (!cmd) {
      for (const c of client.commands.values()) {
        if (c.config.aliases && c.config.aliases.includes(input)) {
          cmd = c;
          break;
        }
      }
    }

    if (!cmd) {
      return send.reply(`❌ "${input}" নামে কোনো কমান্ড নাই`);
    }

    const c = cmd.config;

    return send.reply(
`╭━━━━━━━━━━━━━━━━━━━━━━╮
┃   🔍 COMMAND DETAILS
╰━━━━━━━━━━━━━━━━━━━━━━╯

✦ Name      : ${c.name}
✦ Desc      : ${c.description || "N/A"}
✦ Usage     : ${config.PREFIX}${c.usage || c.name}
✦ Aliases   : ${c.aliases?.join(", ") || "None"}
✦ Category  : ${c.category || "Other"}
✦ Admin     : ${c.adminOnly ? "YES" : "NO"}
✦ Group     : ${c.groupOnly ? "YES" : "NO"}

╭━━━━━━━━━━━━━━━━━━━━━━╮
┃  🤖 BLACK-FOX SYSTEM
╰━━━━━━━━━━━━━━━━━━━━━━╯
AUTHOR : AKASH HASAN
LINK   : m.me/akash.black.fox.`
    );
  },

  handleReply: async function({ api, event, handleReply, client, config, send }) {
    const body = event.body.toLowerCase();
    if (body !== "next" && body !== "back") return;

    let page = handleReply.page;
    page = body === "next" ? page + 1 : page - 1;

    return sendHelpPage({
      api,
      send,
      client,
      config,
      threadID: handleReply.threadID,
      senderID: event.senderID,
      page
    });
  }
};

async function sendHelpPage({ api, send, client, config, threadID, senderID, page }) {
  const unique = new Map();
  for (const c of client.commands.values()) {
    if (!unique.has(c.config.name)) {
      unique.set(c.config.name, c.config);
    }
  }

  const list = Array.from(unique.values());
  const per = 8;
  const total = Math.ceil(list.length / per);
  if (page < 1 || page > total) page = 1;

  const start = (page - 1) * per;
  const slice = list.slice(start, start + per);

  let text =
`╭━━━━━━━━━━━━━━━━━━━━━━╮
┃ 🤖 ${config.BOTNAME} COMMANDS
┣━━━━━━━━━━━━━━━━━━━━━━┫
┃ 📄 Page ${page} / ${total}
┃ ⚙ Prefix : ${config.PREFIX}
╰━━━━━━━━━━━━━━━━━━━━━━╯

`;

  slice.forEach((c, i) => {
    text += `❖ ${(start + i + 1).toString().padStart(2,"0")} ┃ ${c.name}\n`;
  });

  text +=
`
╭━━━━━━━━━━━━━━━━━━━━━━╮
┃ Reply: back | next
╰━━━━━━━━━━━━━━━━━━━━━━╯
AUTHOR : AKASH HASAN
LINK   : m.me/akash.black.fox.`;

  const gifUrl = "https://i.ibb.co/5X0JRYFt/dc5ccb089d16.gif";

  try {
    const msg = await api.sendMessage(
      { body: text, attachment: await global.utils.getStreamFromURL(gifUrl) },
      threadID
    );

    global.client.replies.set(msg.messageID, {
      commandName: "help",
      page,
      threadID
    });

  } catch {
    const msg = await send.reply(text);
    global.client.replies.set(msg.messageID, {
      commandName: "help",
      page,
      threadID
    });
  }
}

async function sendAllCommands({ api, send, client, config, threadID, senderID, isAdmin }) {
  const cats = {};
  const unique = new Map();

  for (const c of client.commands.values()) {
    if (!unique.has(c.config.name)) {
      unique.set(c.config.name, c.config);
    }
  }

  for (const c of unique.values()) {
    if (c.category === "Admin" && !isAdmin) continue;
    const cat = c.category || "Other";
    if (!cats[cat]) cats[cat] = [];
    cats[cat].push(c.name);
  }

  let text = `╭───「 📚 𝐀𝐋𝐋 𝐂𝐎𝐌𝐌𝐀𝐍𝐃𝐒 」───╮
│
│ 🤖 ${config.BOTNAME}
│ 🔧 Prefix: ${config.PREFIX}
│ 📊 Total: ${unique.size} commands
│
│ 📋 𝐂𝐚𝐭𝐞𝐠𝐨𝐫𝐢𝐞𝐬:
│`;

  for (const cat of Object.keys(cats).sort()) {
    text += `
│ ◆ ${cat.toUpperCase()}
│ ───────────────────`;
    
    const commands = cats[cat];
    const chunkSize = 3;
    
    for (let i = 0; i < commands.length; i += chunkSize) {
      const chunk = commands.slice(i, i + chunkSize);
      let line = '│';
      
      chunk.forEach((cmd, idx) => {
        line += ` ${cmd.padEnd(15)}`;
      });
      
      text += `
${line}`;
    }
    
    text += `
│`;
  }

  text += `
│
│ 🎯 𝐔𝐬𝐚𝐠𝐞:
│ ${config.PREFIX}help [page] - Page navigation
│ ${config.PREFIX}help [command] - Command details
│
╰─────────────────────╯
🤖 BLACK-FOX | Author: AKASH HASAN`;

  const gifList = [
    "https://i.ibb.co/5X0JRYFt/dc5ccb089d16.gif"
  ];
  
  const randomGif = gifList[Math.floor(Math.random() * gifList.length)];

  try {
    const msg = await api.sendMessage(
      { body: text, attachment: await global.utils.getStreamFromURL(randomGif) },
      threadID
    );
    return msg;
  } catch (error) {
    console.log("GIF Error, sending without GIF:", error.message);
    return api.sendMessage(text, threadID);
  }
}