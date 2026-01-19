const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "misti",
  aliases: ["sweet", "treat"],
  version: "1.0.0",
  author: "AKASH HASAN",
  description: "Give sweets to users on special occasions",
  usage: "misti [reason] | all OR reply to user",
  category: "Fun",
  prefix: true
};

module.exports.run = async function({ api, event, args, Users, Threads }) {
  const { threadID, messageID, senderID, messageReply } = event;
  
  const input = args.join(" ");
  const parts = input.split("|").map(str => str.trim());
  
  const reason = parts[0] || "কোনো কারণ ছাড়াই";
  const type = parts[1] ? parts[1].toLowerCase() : "";

  const mistiUrl = "https://i.ibb.co/nq1QDyQQ/11cc75407ffc.jpg"; 

  const cacheDir = path.join(__dirname, "cache");
  if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);
  const mistiPath = path.join(cacheDir, `misti_${Date.now()}.jpg`);

  try {
    const response = await axios.get(mistiUrl, { responseType: "arraybuffer" });
    fs.writeFileSync(mistiPath, Buffer.from(response.data));
    const attachment = fs.createReadStream(mistiPath);

    if (type === "all") {
      const threadInfo = await api.getThreadInfo(threadID);
      const participantIDs = threadInfo.participantIDs.filter(id => id !== api.getCurrentUserID());
      
      let mentions = [];
      let nameList = "";
      
      for (let i = 0; i < participantIDs.length; i++) {
        const uid = participantIDs[i];
        let name = "Member";
        try {
          name = await Users.getNameUser(uid);
        } catch (e) {}
        
        nameList += `│ ${i + 1}. ${name}\n`;
        mentions.push({ tag: name, id: uid });
      }

      const msg = `╭───「 🎊 মিষ্টি মুখ 🎊 」───╮
│
│ 🎉 উপলক্ষ : ${reason}
│ 👥 খাদক সংখ্যা : ${participantIDs.length} জন
│
╰─────────────────────╯
╭───「 খাদকদের তালিকা 」───╮
│
${nameList}╰─────────────────────╯
সবাই লাইন ধরে মিষ্টি নিয়ে যাও...!! হুরাহুরি করবা না! 😋🍬`;

      return api.sendMessage({
        body: msg,
        attachment: attachment,
        mentions: mentions
      }, threadID, () => fs.unlinkSync(mistiPath), messageID);
    } 
    
    else if (messageReply) {
      const targetID = messageReply.senderID;
      const targetName = await Users.getNameUser(targetID);
      const senderName = await Users.getNameUser(senderID);

      const msg = `╭───「 🍬 মিষ্টির হাড়ি 🍬 」───╮
│
│ 👤 দিচ্ছেন : ${senderName}
│ 👤 নিচ্ছেন : ${targetName}
│ 🎉 উপলক্ষ : ${reason}
│
╰─────────────────────╯
নে ভাই হা কর! বড় একটা রসগোল্লা খা! 
পেট খারাপ হলে কিন্তু আমি দায়ী না...!! 😹🍭`;

      return api.sendMessage({
        body: msg,
        attachment: attachment,
        mentions: [{ tag: targetName, id: targetID }]
      }, threadID, () => fs.unlinkSync(mistiPath), messageID);
    } 
    
    else {
      return api.sendMessage(`╭───「 ⚠️ 𝐖𝐀𝐑𝐍𝐈𝐍𝐆 」───╮
│
│ ❌ ভুল ব্যবহার!
│ 👉 নিয়ম:
│ ১. misti পাস করেছি | all
│ ২. misti নতুন বাইক | (Reply)
│
╰─────────────────────╯`, threadID, messageID);
    }

  } catch (error) {
    return api.sendMessage(`╭───「 ❌ 𝐄𝐑𝐑𝐎𝐑 」───╮
│
│ ⚠️ মিষ্টির দোকান বন্ধ!
│ 🔧 পরে চেষ্টা করুন।
│
╰─────────────────────╯`, threadID, messageID);
  }
};