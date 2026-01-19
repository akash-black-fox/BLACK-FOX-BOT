const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const { createCanvas, loadImage } = require("canvas");

module.exports.config = {
  name: "engage",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "AKASH HASAN",
  description: "Create an engagement photo with someone",
  commandCategory: "Love",
  usages: "engage [@mention]",
  cooldowns: 10,
  prefix: true
};

module.exports.run = async ({ api, event, args, Users, Threads }) => {
  const { threadID, messageID, senderID, mentions } = event;

  const mentionKeys = Object.keys(mentions);
  let partnerID;
  let partnerName;

  if (mentionKeys.length > 0) {
    partnerID = mentionKeys[0];
    partnerName = mentions[partnerID].replace("@", "");
  } else {
    try {
      const threadInfo = await api.getThreadInfo(threadID);
      const participants = threadInfo.participantIDs.filter(id => id !== senderID && id !== api.getCurrentUserID());
      
      if (participants.length === 0) {
        return api.sendMessage(`╭───「 ⚠️ 𝐖𝐀𝐑𝐍𝐈𝐍𝐆 」───╮
│
│ ❌ 𝐍𝐨 𝐌𝐞𝐦𝐛𝐞𝐫𝐬 𝐅𝐨𝐮𝐧𝐝
│    𝐭𝐨 𝐩𝐚𝐢𝐫 𝐰𝐢𝐭𝐡!
│
╰─────────────────────╯`, threadID, messageID);
      }
      
      partnerID = participants[Math.floor(Math.random() * participants.length)];
      partnerName = await Users.getNameUser(partnerID);
    } catch (e) {
      return api.sendMessage("❌ Error finding a partner.", threadID, messageID);
    }
  }

  const senderName = await Users.getNameUser(senderID);

  const msg = `╭───「 💍 𝐄𝐍𝐆𝐀𝐆𝐄𝐃 」───╮
│
│ 🤵 𝐆𝐫𝐨𝐨𝐦 : ${senderName}
│ 👰 𝐁𝐫𝐢𝐝𝐞 : ${partnerName}
│ 💖 𝐒𝐭𝐚𝐭𝐮𝐬 : 𝐉𝐮𝐬𝐭 𝐌𝐚𝐫𝐫𝐢𝐞𝐝
│
╰─────────────────────╯
হাজার বছর বেঁচে থাকুক তোমাদের এই পবিত্র ভালোবাসা...!! শুভ পরিণয় 🥰🥀`;

  try {
    const cacheDir = path.join(__dirname, "cache");
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);
    
    const templatePath = path.join(cacheDir, "engage_bg.jpg");
    const outputPath = path.join(cacheDir, `engage_${senderID}.png`);

    const templateUrl = "https://i.ibb.co/BV3zdsDn/928f93438605.jpg"; 
    
    if (!fs.existsSync(templatePath)) {
      const getTemplate = await axios.get(templateUrl, { responseType: 'arraybuffer' });
      fs.writeFileSync(templatePath, Buffer.from(getTemplate.data));
    }

    const canvas = createCanvas(343, 275); 
    const ctx = canvas.getContext("2d");

    const background = await loadImage(templatePath);
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

    const avatar1Url = `https://graph.facebook.com/${senderID}/picture?height=512&width=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
    const avatar2Url = `https://graph.facebook.com/${partnerID}/picture?height=512&width=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;

    const avatar1 = await loadImage(avatar1Url);
    const avatar2 = await loadImage(avatar2Url);

    ctx.save();
    ctx.beginPath();
    ctx.arc(102, 145, 50, 0, Math.PI * 2, true); 
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(avatar1, 52, 95, 100, 100); 
    ctx.restore();

    ctx.save();
    ctx.beginPath();
    ctx.arc(240, 145, 50, 0, Math.PI * 2, true); 
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(avatar2, 190, 95, 100, 100);
    ctx.restore();

    const buffer = canvas.toBuffer("image/png");
    fs.writeFileSync(outputPath, buffer);

    api.sendMessage({
      body: msg,
      attachment: fs.createReadStream(outputPath)
    }, threadID, () => fs.unlinkSync(outputPath), messageID);

  } catch (error) {
    api.sendMessage(`╭───「 ❌ 𝐄𝐑𝐑𝐎𝐑 」───╮
│
│ ⚠️ 𝐅𝐚𝐢𝐥𝐞𝐝 𝐭𝐨 𝐞𝐝𝐢𝐭 𝐢𝐦𝐚𝐠𝐞.
│ 🔧 𝐓𝐫𝐲 𝐚𝐠𝐚𝐢𝐧 𝐥𝐚𝐭𝐞𝐫.
│
╰─────────────────────╯`, threadID, messageID);
  }
};