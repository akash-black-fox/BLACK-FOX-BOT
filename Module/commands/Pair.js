const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "pair",
  version: "1.1.0",
  credits: "AKASH HASAN",
  description: "Find your soulmate in the group",
  commandCategory: "Love",
  usages: "pair [@mention/reply]",
  cooldowns: 10,
  prefix: true
};

const cacheDir = path.join(__dirname, "cache");

async function downloadImage(url, filePath) {
  try {
    const response = await axios.get(url, { responseType: "arraybuffer" });
    fs.writeFileSync(filePath, Buffer.from(response.data));
    return true;
  } catch (e) {
    return false;
  }
}

module.exports.run = async function({ api, event, Users, send }) {
  const { threadID, messageID, senderID, mentions, messageReply } = event;
  const timestamp = Date.now();

  try {
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

    let partnerID;
    let partnerName;

    if (messageReply) {
      partnerID = messageReply.senderID;
      partnerName = await Users.getNameUser(partnerID);
    } else if (Object.keys(mentions).length > 0) {
      partnerID = Object.keys(mentions)[0];
      partnerName = mentions[partnerID].replace("@", "");
    } else {
      const threadInfo = await api.getThreadInfo(threadID);
      const members = threadInfo.participantIDs.filter(id => id !== senderID && id !== api.getCurrentUserID());
      
      if (members.length === 0) {
        return send.reply(`╭───「 ❌ 𝐒𝐎𝐑𝐑𝐘 」───╮
│
│ ⚠️ গ্রুপে আর কোনো মেম্বার নেই!
│    কার সাথে পেয়ার করবো? 😒
│
╰─────────────────────╯`);
      }

      partnerID = members[Math.floor(Math.random() * members.length)];
      try {
        partnerName = await Users.getNameUser(partnerID);
      } catch {
        partnerName = "Unknown Lover";
      }
    }

    if (partnerID === senderID) {
      return send.reply(`╭───「 😒 𝐋𝐎𝐋 」───╮
│
│ নিজে নিজের সাথে পেয়ার?
│ এটা সম্ভব না ব্রো! 😂
│
╰─────────────────────╯`);
    }

    const senderName = await Users.getNameUser(senderID);
    const loveLevel = Math.floor(Math.random() * (100 - 50) + 50);

    const avatar1 = path.join(cacheDir, `avt1_${timestamp}.jpg`);
    const avatar2 = path.join(cacheDir, `avt2_${timestamp}.jpg`);
    const gifPath = path.join(cacheDir, `love_${timestamp}.gif`);

    const avt1Url = `https://graph.facebook.com/${senderID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
    const avt2Url = `https://graph.facebook.com/${partnerID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
    const gifUrl = "https://i.ibb.co/wC2JJBb/trai-tim-lap-lanh.gif";

    await Promise.all([
      downloadImage(avt1Url, avatar1),
      downloadImage(avt2Url, avatar2),
      downloadImage(gifUrl, gifPath)
    ]);

    const msgBody = `╭───「 💑 𝐏𝐀𝐈𝐑𝐈𝐍𝐆 」───╮
│
│ 🤵 𝐍𝐚𝐦𝐞: ${senderName}
│ 👰 𝐍𝐚𝐦𝐞: ${partnerName}
│
│ 💘 𝐋𝐨𝐯𝐞: ${loveLevel}%
│
│ ❝ তোমাকে দেখেই মনে হলো,
│   তুমিই আমার সেই মানুষ! ❞
│
│ </> 𝐀𝐮𝐭𝐡𝐨𝐫: 𝐀𝐊𝐀𝐒𝐇 𝐇𝐀𝐒𝐀𝐍
╰─────────────────────╯`;

    const attachments = [];
    if (fs.existsSync(avatar1)) attachments.push(fs.createReadStream(avatar1));
    if (fs.existsSync(gifPath)) attachments.push(fs.createReadStream(gifPath));
    if (fs.existsSync(avatar2)) attachments.push(fs.createReadStream(avatar2));

    await api.sendMessage({
      body: msgBody,
      mentions: [
        { tag: senderName, id: senderID },
        { tag: partnerName, id: partnerID }
      ],
      attachment: attachments
    }, threadID, () => {
      try {
        if (fs.existsSync(avatar1)) fs.unlinkSync(avatar1);
        if (fs.existsSync(avatar2)) fs.unlinkSync(avatar2);
        if (fs.existsSync(gifPath)) fs.unlinkSync(gifPath);
      } catch(e) {}
    }, messageID);

  } catch (error) {
    return send.reply(`❌ পেয়ার করতে সমস্যা হচ্ছে বস!`);
  }
};