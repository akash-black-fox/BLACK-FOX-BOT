const moment = require("moment-timezone");

module.exports.config = {
  name: 'daily',
  aliases: ['claim', 'bonus'],
  version: '1.0.0',
  author: 'AKASH HASAN',
  description: 'Claim daily reward (24h cooldown)',
  usage: 'daily',
  category: 'Economy',
  prefix: true
};

module.exports.run = async function({ api, event, send, Currencies, Users }) {
  const { senderID, threadID } = event;
  const cooldown = 24 * 60 * 60 * 1000;
  const rewardAmount = Math.floor(Math.random() * (1000 - 500 + 1)) + 500;

  let data = await Currencies.getData(senderID);
  let lastClaimed = data.data?.lastClaimedDaily || 0;
  
  const currentTime = Date.now();

  if (currentTime - lastClaimed < cooldown) {
    const remainingTime = cooldown - (currentTime - lastClaimed);
    const hours = Math.floor((remainingTime / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((remainingTime / (1000 * 60)) % 60);
    const seconds = Math.floor((remainingTime / 1000) % 60);

    return send.reply(`╭───「 ⏳ 𝐂𝐎𝐎𝐋𝐃𝐎𝐖𝐍 」───╮
│
│ ⚠️ 𝐘𝐨𝐮 𝐚𝐥𝐫𝐞𝐚𝐝𝐲 𝐜𝐥𝐚𝐢𝐦𝐞𝐝!
│ 🕒 𝐖𝐚𝐢𝐭 : ${hours}h ${minutes}m ${seconds}s
│
╰─────────────────────╯`);
  }

  await Currencies.increaseMoney(senderID, rewardAmount);
  
  data.data = data.data || {}; 
  data.data.lastClaimedDaily = currentTime;
  await Currencies.setData(senderID, { data: data.data });

  const name = await Users.getNameUser(senderID);
  const newBalance = await Currencies.getBalance(senderID);

  return send.reply(`╭───「 💰 𝐃𝐀𝐈𝐋𝐘 𝐁𝐎𝐍𝐔𝐒 」───╮
│
│ 👤 𝐔𝐬𝐞𝐫 : ${name}
│ 💵 𝐀𝐝𝐝𝐞𝐝 : $${rewardAmount}
│ 🏦 𝐓𝐨𝐭𝐚𝐥 : $${newBalance}
│
╰─────────────────────╯`);
};