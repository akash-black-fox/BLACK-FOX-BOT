const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

if (!global.proposeData) global.proposeData = new Map();

module.exports.config = {
  name: "propose",
  aliases: ["marry", "loverequest"],
  version: "1.0.0",
  author: "AKASH HASAN",
  description: "Propose someone to marry",
  usage: "propose [mention] | propose accept/reject",
  category: "Love",
  prefix: true
};

module.exports.run = async function({ api, event, args, send, Users, config }) {
  const { threadID, messageID, senderID, mentions, messageReply } = event;
  const commandPrefix = config.PREFIX || "/";

  const action = args[0]?.toLowerCase();

  if (action === "accept" || action === "reject") {
    const data = global.proposeData.get(threadID);

    if (!data) {
      return send.reply(`╭───「 ⚠️ 𝐄𝐑𝐑𝐎𝐑 」───╮
│
│ ❌ বর্তমানে কোনো প্রপোজাল
│    পেন্ডিং নেই!
│
╰─────────────────────╯`);
    }

    if (data.targetID !== senderID) {
      return send.reply(`╭───「 ⛔ 𝐃𝐄𝐍𝐈𝐄𝐃 」───╮
│
│ ⚠️ এই প্রপোজালটি তোমার
│    জন্য নয়!
│ 👤 𝐓𝐚𝐫𝐠𝐞𝐭 : ${data.targetName}
│
╰─────────────────────╯`);
    }

    if (action === "accept") {
      const msg = `╭───「 💖 𝐌𝐀𝐑𝐑𝐈𝐄𝐃 」───╮
│
│ 🎉 𝐂𝐨𝐧𝐠𝐫𝐚𝐭𝐮𝐥𝐚𝐭𝐢𝐨𝐧𝐬!
│ 💑 𝐂𝐨𝐮𝐩𝐥𝐞 : ${data.proposerName} ❤️ ${data.targetName}
│
╰─────────────────────╯
আলহামদুলিল্লাহ! কবুল! কবুল! কবুল! 💍✨
আজ থেকে তোমরা অফিসিয়াল কাপল...!! 🥰🥀`;

      const coupleUrl = "https://i.ibb.co/Vp9LyvTt/545240baadac.gif";
      const cacheDir = path.join(__dirname, "cache");
      const couplePath = path.join(cacheDir, `married_${threadID}.gif`);

      try {
        const response = await axios.get(coupleUrl, { responseType: "arraybuffer" });
        fs.writeFileSync(couplePath, Buffer.from(response.data));

        api.sendMessage({
          body: msg,
          attachment: fs.createReadStream(couplePath)
        }, threadID, () => fs.unlinkSync(couplePath), messageID);
      } catch (e) {
        api.sendMessage(msg, threadID, messageID);
      }

      global.proposeData.delete(threadID);
    } 
    
    else if (action === "reject") {
      const msg = `╭───「 💔 𝐑𝐄𝐉𝐄𝐂𝐓𝐄𝐃 」───╮
│
│ 🥀 𝐒𝐭𝐚𝐭𝐮𝐬 : 𝐁𝐫𝐨𝐤𝐞𝐧 𝐇𝐞𝐚𝐫𝐭
│ 😢 𝐑𝐞𝐚𝐬𝐨𝐧 : 𝐍𝐨 𝐅𝐞𝐞𝐥𝐢𝐧𝐠𝐬
│
╰─────────────────────╯
স্যরি ব্রো! ${data.targetName} তোমাকে রিজেক্ট করে দিয়েছে! 
বলেছে- "আমার বয়ফ্রেন্ড আছে, ভাগো এখান থেকে!" 🙄😒💔`;

      const sadUrl = "https://i.ibb.co/vCv6yQW6/33e44abfa1ef.gif"; 
      const cacheDir = path.join(__dirname, "cache");
      const sadPath = path.join(cacheDir, `sad_${threadID}.gif`);

      try {
        const response = await axios.get(sadUrl, { responseType: "arraybuffer" });
        fs.writeFileSync(sadPath, Buffer.from(response.data));

        api.sendMessage({
          body: msg,
          attachment: fs.createReadStream(sadPath)
        }, threadID, () => fs.unlinkSync(sadPath), messageID);
      } catch (e) {
        api.sendMessage(msg, threadID, messageID);
      }

      global.proposeData.delete(threadID);
    }
    return;
  }

  if (global.proposeData.has(threadID)) {
    return send.reply(`╭───「 ⚠️ 𝐖𝐀𝐈𝐓 」───╮
│
│ ❌ একটি প্রপোজাল ইতিমধ্যে
│    চলছে! আগে সেটার উত্তর দাও।
│
╰─────────────────────╯`);
  }

  let targetID = null;
  let targetName = "";

  if (Object.keys(mentions).length > 0) {
    targetID = Object.keys(mentions)[0];
    targetName = mentions[targetID].replace("@", "");
  } else if (messageReply) {
    targetID = messageReply.senderID;
    targetName = await Users.getNameUser(targetID);
  } else {
    return send.reply(`╭───「 ⚠️ 𝐖𝐀𝐑𝐍𝐈𝐍𝐆 」───╮
│
│ ❌ 𝐍𝐨 𝐏𝐞𝐫𝐬𝐨𝐧 𝐅𝐨𝐮𝐧𝐝
│ 👉 𝐌𝐞𝐧𝐭𝐢𝐨𝐧 𝐨𝐫 𝐑𝐞𝐩𝐥𝐲
│    𝐭𝐨 𝐲𝐨𝐮𝐫 𝐜𝐫𝐮𝐬𝐡!
│
╰─────────────────────╯`);
  }

  if (targetID === senderID) {
    return send.reply(`╭───「 ⚠️ 𝐋𝐎𝐍𝐄𝐋𝐘 」───╮
│
│ ❌ নিজের সাথে বিয়ে?
│    পাগল নাকি ভাই? 🐸
│
╰─────────────────────╯`);
  }

  const senderName = await Users.getNameUser(senderID);

  global.proposeData.set(threadID, {
    proposerID: senderID,
    proposerName: senderName,
    targetID: targetID,
    targetName: targetName
  });

  const msg = `╭───「 💍 𝐏𝐑𝐎𝐏𝐎𝐒𝐀𝐋 」───╮
│
│ 🤵 𝐏𝐫𝐨𝐩𝐨𝐬𝐞𝐫 : ${senderName}
│ 👰 𝐓𝐚𝐫𝐠𝐞𝐭   : ${targetName}
│
╰─────────────────────╯
ওগো শুনছো? ${senderName} তোমাকে বিয়ে করতে চায়! তুমি কি রাজি? 🙈💕

👉 রাজি থাকলে লিখো : ${config.PREFIX}propose accept
👉 রাজি না থাকলে লিখো : ${config.PREFIX}propose reject`;

  const ringUrl = "https://i.ibb.co/V03fks7z/ad8dc6a97f12.jpg";
  const cacheDir = path.join(__dirname, "cache");
  if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);
  const ringPath = path.join(cacheDir, `ring_${threadID}.jpg`);

  try {
    const response = await axios.get(ringUrl, { responseType: "arraybuffer" });
    fs.writeFileSync(ringPath, Buffer.from(response.data));

    return api.sendMessage({
      body: msg,
      attachment: fs.createReadStream(ringPath),
      mentions: [{ tag: targetName, id: targetID }]
    }, threadID, () => fs.unlinkSync(ringPath), messageID);

  } catch (error) {
    global.proposeData.delete(threadID);
    return send.reply("❌ Error sending proposal.");
  }
};