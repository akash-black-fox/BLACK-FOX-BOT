module.exports.config = {
  name: 'work',
  aliases: ['job', 'earn', 'kaj'],
  description: 'Work to earn money',
  credits: 'AKASH HASAN',
  usage: 'work',
  category: 'Economy',
  prefix: true,
  version: "1.0.0"
};

const cooldowns = new Map();

module.exports.run = async function({ api, event, send, Currencies, Users }) {
  const { senderID, threadID } = event;
  
  const cooldownTime = 30 * 60 * 1000; 
  const data = cooldowns.get(senderID);
  
  if (data && Date.now() - data < cooldownTime) {
    const remainingTime = Math.ceil((cooldownTime - (Date.now() - data)) / 60000);
    return send.reply(`╭───「 ⏳ 𝐂𝐎𝐎𝐋𝐃𝐎𝐖𝐍 」───╮
│
│ ❌ আরে ভাই থামেন!
│    এত কাজ করলে মরে যাবেন।
│
│ 🕒 আবার কাজ পাবেন:
│    ${remainingTime} মিনিট পর।
│
│ 😴 এখন একটু রেস্ট নেন।
│
╰─────────────────────╯`);
  }
  
  const jobs = [
    "রিকশা চালিয়ে",
    "মানুষের পকেট মেরে",
    "রাস্তায় বাদাম বিক্রি করে",
    "কোডিং করে",
    "বট বানিয়ে",
    "ফেসবুকে দালালি করে",
    "গার্লফ্রেন্ডের বকা খেয়ে",
    "বাসার থালাবাসন মেজে",
    "জুতা সেলাই করে",
    "মসজিদে ভিক্ষা করে",
    "টিকটক ভিডিও বানিয়ে",
    "মুরগি চুরি করে"
  ];
  
  const job = jobs[Math.floor(Math.random() * jobs.length)];
  const amount = Math.floor(Math.random() * 500) + 100; 
  
  try {
    await Currencies.increaseMoney(senderID, amount);
    const balance = await Currencies.getData(senderID);
    const total = balance && balance.money ? balance.money : amount;
    
    cooldowns.set(senderID, Date.now());
    
    const name = await Users.getNameUser(senderID);

    return send.reply(`╭───「 💼 𝐖𝐎𝐑𝐊 𝐃𝐎𝐍𝐄 」───╮
│
│ 👤 𝐍𝐚𝐦𝐞: ${name}
│ 🛠️ 𝐖𝐨𝐫𝐤: ${job}
│ 💰 𝐄𝐚𝐫𝐧: ${amount} ৳
│
│ 🏦 𝐓𝐨𝐭𝐚𝐥: ${total} ৳
│
│ </> 𝐀𝐮𝐭𝐡𝐨𝐫: 𝐀𝐊𝐀𝐒𝐇 𝐇𝐀𝐒𝐀𝐍
╰─────────────────────╯`);

  } catch (error) {
    return send.reply(`❌ কাজ করতে গিয়ে সমস্যা হয়েছে বস!`);
  }
};