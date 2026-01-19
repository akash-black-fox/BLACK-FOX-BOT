const fs = require('fs-extra');
const path = require('path');

const activeTargets = new Map();
const galiPath = path.join(__dirname, 'data/gali.txt');

function getGaliMessages() {
  try {
    if (!fs.existsSync(galiPath)) {
      const defaultData = "Tura nanir heda\nBal pakna polapain\nKuttar baccha";
      fs.ensureDirSync(path.join(__dirname, 'data'));
      fs.writeFileSync(galiPath, defaultData);
    }
    const content = fs.readFileSync(galiPath, 'utf8');
    return content.split('\n').filter(m => m.trim().length > 0);
  } catch {
    return ['Spamming... 🖕'];
  }
}

function getRandomMessage() {
  const messages = getGaliMessages();
  return messages[Math.floor(Math.random() * messages.length)];
}

module.exports = {
  config: {
    name: 'fyt',
    aliases: ['fuckytag', 'spamtag'],
    version: '1.0.0',
    author: 'AKASH HASAN',
    description: 'Tag someone repeatedly with custom messages',
    usage: 'fyt [on/off] [@mention/reply]',
    category: 'Fun',
    adminOnly: false,
    groupOnly: true,
    prefix: true
  },
  
  async run({ api, event, args, send, config, Users }) {
    const { threadID, senderID, mentions, messageReply } = event;
    const action = args[0]?.toLowerCase();
    
    if (!action || !['on', 'off'].includes(action)) {
      return send.reply(`╭───「 ⚠️ 𝐖𝐀𝐑𝐍𝐈𝐍𝐆 」───╮
│
│ ❌ 𝐈𝐧𝐯𝐚𝐥𝐢𝐝 𝐀𝐜𝐭𝐢𝐨𝐧
│ 👉 𝐔𝐬𝐚𝐠𝐞: fyt on/off @user
│
╰─────────────────────╯`);
    }

    let targetID = null;
    if (Object.keys(mentions).length > 0) {
      targetID = Object.keys(mentions)[0];
    } else if (messageReply) {
      targetID = messageReply.senderID;
    } else if (action === 'off') {
        const active = [...activeTargets.entries()].find(([k]) => k.startsWith(threadID));
        if (active) targetID = active[0].split('_')[1];
    }

    if (!targetID) {
      return send.reply(`╭───「 ⚠️ 𝐄𝐑𝐑𝐎𝐑 」───╮
│
│ ❌ 𝐓𝐚𝐫𝐠𝐞𝐭 𝐍𝐨𝐭 𝐅𝐨𝐮𝐧𝐝
│ 👉 𝐌𝐞𝐧𝐭𝐢𝐨𝐧 𝐨𝐫 𝐑𝐞𝐩𝐥𝐲
│
╰─────────────────────╯`);
    }

    let targetName = await Users.getNameUser(targetID);

    if (action === 'on') {
      const threadInfo = await api.getThreadInfo(threadID);
      const adminIDs = threadInfo.adminIDs.map(a => a.id);
      
      if (!adminIDs.includes(senderID) && !config.ADMINBOT.includes(senderID)) {
        return send.reply(`╭───「 ⛔ 𝐃𝐄𝐍𝐈𝐄𝐃 」───╮
│
│ ⚠️ 𝐎𝐧𝐥𝐲 𝐀𝐝𝐦𝐢𝐧𝐬 𝐜𝐚𝐧
│    𝐮𝐬𝐞 𝐭𝐡𝐢𝐬 𝐜𝐨𝐦𝐦𝐚𝐧𝐝.
│
╰─────────────────────╯`);
      }

      const key = `${threadID}_${targetID}`;
      
      if (activeTargets.has(key)) {
        return send.reply(`╭───「 ⚠️ 𝐑𝐔𝐍𝐍𝐈𝐍𝐆 」───╮
│
│ ❌ 𝐀𝐥𝐫𝐞𝐚𝐝𝐲 𝐒𝐩𝐚𝐦𝐦𝐢𝐧𝐠
│ 👤 𝐓𝐚𝐫𝐠𝐞𝐭 : ${targetName}
│
╰─────────────────────╯`);
      }

      send.reply(`╭───「 𝐅𝐘𝐓 𝐀𝐂𝐓𝐈𝐕𝐀𝐓𝐄𝐃 」───╮
│
│ 🎯 𝐓𝐚𝐫𝐠𝐞𝐭 : ${targetName}
│ 💣 𝐒𝐭𝐚𝐭𝐮𝐬 : Spamming...
│ ⚡ 𝐒𝐩𝐞𝐞𝐝  : 4 Seconds
│
╰─────────────────────╯`);

      const interval = setInterval(() => {
        const msg = getRandomMessage();
        api.sendMessage({
          body: `${msg} @${targetName}`,
          mentions: [{ tag: `@${targetName}`, id: targetID }]
        }, threadID);
      }, 4000);

      activeTargets.set(key, interval);
    } 
    
    else {
      const key = `${threadID}_${targetID}`;
      
      if (!activeTargets.has(key)) {
        return send.reply(`╭───「 ⚠️ 𝐄𝐑𝐑𝐎𝐑 」───╮
│
│ ❌ 𝐍𝐨 𝐀𝐜𝐭𝐢𝐯𝐞 𝐒𝐩𝐚𝐦
│    𝐟𝐨𝐫 𝐭𝐡𝐢𝐬 𝐮𝐬𝐞𝐫.
│
╰─────────────────────╯`);
      }

      clearInterval(activeTargets.get(key));
      activeTargets.delete(key);

      return send.reply(`╭───「 𝐅𝐘𝐓 𝐒𝐓𝐎𝐏𝐏𝐄𝐃 」───╮
│
│ 🛑 𝐒𝐭𝐚𝐭𝐮𝐬 : Stopped
│ 👤 𝐓𝐚𝐫𝐠𝐞𝐭 : ${targetName}
│
╰─────────────────────╯`);
    }
  }
};