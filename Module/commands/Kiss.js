module.exports.config = {
  name: "kiss",
  version: "1.0.0",
  credits: "AKASH HASAN",
  description: "Kiss someone by reply or tag",
  commandCategory: "Love",
  usages: "kiss [reply/tag]",
  cooldowns: 5,
  prefix: true
};

const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.run = async function({ api, event, Users, send }) {
  const { threadID, messageID, senderID, mentions, messageReply } = event;

  let targetID;
  let targetName;

  if (messageReply) {
    targetID = messageReply.senderID;
    targetName = await Users.getNameUser(targetID);
  } else if (Object.keys(mentions).length > 0) {
    targetID = Object.keys(mentions)[0];
    targetName = mentions[targetID].replace("@", "");
  } else {
    return send.reply(`╭───「 ⚠️ 𝐄𝐑𝐑𝐎𝐑 」───╮
│
│ ❌ কাউকে মেনশন করুন
│    অথবা রিপ্লাই দিন!
│
│ 👉 ${config.PREFIX}kiss @User
│
╰─────────────────────╯`);
  }

  if (targetID === senderID) {
    return send.reply(`╭───「 😒 𝐋𝐎𝐋 」───╮
│
│ নিজে নিজেকে কিস করবেন?
│ আয়নায় গিয়ে করেন! 😂
│
╰─────────────────────╯`);
  }

  let senderName = "Unknown";
  try {
    senderName = await Users.getNameUser(senderID);
  } catch {}

  const links = [
    "https://i.postimg.cc/yxDKkJyH/02d4453f3eb0a76a87148433395b3ec3.gif",
    "https://i.postimg.cc/nLTf2Kdx/1483589602-6b6484adddd5d3e70b9eaaaccdf6867e.gif",
    "https://i.postimg.cc/Wpyjxnsb/574fcc797b21e-1533876813029926506824.gif",
    "https://i.postimg.cc/xdsT8SVL/kiss-anime.gif"
  ];

  const randomLink = links[Math.floor(Math.random() * links.length)];

  try {
    const cacheDir = path.join(__dirname, "cache");
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);
    
    const gifPath = path.join(cacheDir, `kiss_${Date.now()}.gif`);
    
    const response = await axios.get(randomLink, { responseType: "arraybuffer" });
    fs.writeFileSync(gifPath, Buffer.from(response.data));

    const msgBody = `╭───「 💋 𝐊𝐈𝐒𝐒 𝐄𝐕𝐄𝐍𝐓 」───╮
│
│ 👤 𝐅𝐫𝐨𝐦: ${senderName}
│ 👤 𝐓𝐨  : ${targetName}
│
│ ✨ উম্মাহ! অনেক ভালোবাসা!
│    সারা গায়ে মেখে দিলাম 😘
│
│ </> 𝐀𝐮𝐭𝐡𝐨𝐫: 𝐀𝐊𝐀𝐒𝐇 𝐇𝐀𝐒𝐀𝐍
╰─────────────────────╯`;

    return api.sendMessage({
      body: msgBody,
      attachment: fs.createReadStream(gifPath),
      mentions: [{ tag: targetName, id: targetID }]
    }, threadID, () => fs.unlinkSync(gifPath), messageID);

  } catch (error) {
    return send.reply("❌ সার্ভারে সমস্যা! পরে ট্রাই করুন।");
  }
};