const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "hack",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "AKASH HASAN",
  description: "Hack prank using external API",
  commandCategory: "Fun",
  usages: "hack [mention/reply/uid]",
  cooldowns: 5,
  prefix: true
};

module.exports.run = async function ({ api, event, args, Users }) {
  const { threadID, messageID, senderID, mentions, messageReply } = event;

  let targetID = senderID;
  let targetName = "";

  if (Object.keys(mentions).length > 0) {
    targetID = Object.keys(mentions)[0];
    targetName = mentions[targetID].replace("@", "");
  } else if (messageReply) {
    targetID = messageReply.senderID;
    targetName = await Users.getNameUser(targetID);
  } else if (args[0] && !isNaN(args[0])) {
    targetID = args[0];
    targetName = await Users.getNameUser(targetID);
  } else {
    targetName = await Users.getNameUser(senderID);
  }

  const msg = `╭───「 𝐒𝐘𝐒𝐓𝐄𝐌 𝐇𝐀𝐂𝐊𝐄𝐃 」───╮
│
│ 👤 𝐕𝐢𝐜𝐭𝐢𝐦 : ${targetName}
│ 🔓 𝐒𝐭𝐚𝐭𝐮𝐬 : 𝟏𝟎𝟎% 𝐒𝐮𝐜𝐜𝐞𝐬𝐬
│ 🔑 𝐏𝐚𝐬𝐬   : 𝐒𝐞𝐧𝐭 𝐭𝐨 𝐀𝐝𝐦𝐢𝐧
│
╰─────────────────────╯
সাবধান! বটের সাথে পাঙ্গা নিবি না...!! তোর সব ডাটা এখন আমার কাছে...😈`;

  try {
    const cacheDir = path.join(__dirname, "cache");
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);
    const pathImg = path.join(cacheDir, `hack_${targetID}.png`);

    const apiUrl = `http://172.81.128.14:20541/hack?userId=${targetID}&name=${encodeURIComponent(targetName)}`;

    const response = await axios.get(apiUrl, {
      responseType: "arraybuffer",
      timeout: 20000
    });

    fs.writeFileSync(pathImg, Buffer.from(response.data));

    return api.sendMessage({
      body: msg,
      attachment: fs.createReadStream(pathImg)
    }, threadID, () => fs.unlinkSync(pathImg), messageID);

  } catch (error) {
    return api.sendMessage(`╭───「 ❌ 𝐄𝐑𝐑𝐎𝐑 」───╮
│
│ ⚠️ 𝐀𝐏𝐈 𝐅𝐚𝐢𝐥𝐞𝐝!
│ 🔧 𝐒𝐞𝐫𝐯𝐞𝐫 𝐦𝐢𝐠𝐡𝐭 𝐛𝐞 𝐨𝐟𝐟.
│
╰─────────────────────╯`, threadID, messageID);
  }
};