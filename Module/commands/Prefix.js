const moment = require('moment-timezone');
const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

module.exports.config = {
  name: 'prefix',
  aliases: ['px', 'pre', 'info'],
  description: 'Show bot prefix and info with GIF',
  credits: 'AKASH HASAN',
  usage: 'prefix',
  category: 'Utility',
  prefix: false,
  version: "1.1.0"
};

module.exports.run = async function({ api, event, config, client, Users }) {
  const { threadID, messageID, senderID } = event;
  
  const uniqueCommands = new Set();
  if (client && client.commands) {
    client.commands.forEach((cmd) => {
      if (cmd.config && cmd.config.name) {
        uniqueCommands.add(cmd.config.name.toLowerCase());
      }
    });
  }
  const commandCount = uniqueCommands.size;
  
  const startTime = global.startTime || Date.now();
  const uptime = Date.now() - startTime;
  const hours = Math.floor(uptime / 3600000);
  const minutes = Math.floor((uptime % 3600000) / 60000);
  const seconds = Math.floor((uptime % 60000) / 1000);
  
  const time = moment().tz('Asia/Dhaka').format('hh:mm:ss A');
  const date = moment().tz('Asia/Dhaka').format('DD/MM/YYYY');
  
  let senderName = 'Unknown';
  try {
    senderName = await Users.getNameUser(senderID);
  } catch {}

  const gifs = [
    "https://i.ibb.co/tpvztNQP/821b1008e2d7.gif"
  ];
  
  const randomGif = gifs[Math.floor(Math.random() * gifs.length)];
  const cacheDir = path.join(__dirname, "cache");
  if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);
  const gifPath = path.join(cacheDir, `prefix_${Date.now()}.gif`);

  try {
    const response = await axios.get(randomGif, { responseType: 'arraybuffer' });
    fs.writeFileSync(gifPath, Buffer.from(response.data));

    const msg = {
        body: `╭───「 𝐒𝐘𝐒𝐓𝐄𝐌 𝐈𝐍𝐅𝐎 」───╮
│
│ 👤 𝐔𝐬𝐞𝐫 : ${senderName}
│ 🤖 𝐁𝐨𝐭  : ${config.BOTNAME}
│ 🔧 𝐏𝐫𝐞𝐟𝐢𝐱: [ ${config.PREFIX} ]
│ 📊 𝐂𝐦𝐝𝐬 : ${commandCount}
│ ⏰ 𝐔𝐩𝐭𝐢𝐦𝐞: ${hours}h ${minutes}m ${seconds}s
│
│ 📅 ${date} | ${time}
│
│ 💡 কমান্ড দেখতে লিখুন:
│ 👉 ${config.PREFIX}help
│
│ </> 𝐀𝐮𝐭𝐡𝐨𝐫: 𝐀𝐊𝐀𝐒𝐇 𝐇𝐀𝐒𝐀𝐍
╰─────────────────────╯`,
        attachment: fs.createReadStream(gifPath)
    };

    api.sendMessage(msg, threadID, (err, info) => {
        fs.unlinkSync(gifPath);
        if (!err && info) {
            setTimeout(() => {
                api.unsendMessage(info.messageID);
            }, 30000);
        }
    }, messageID);

  } catch (e) {
    api.sendMessage(`My Prefix is: [ ${config.PREFIX} ]`, threadID, messageID);
  }
};