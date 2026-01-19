const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

module.exports.config = {
  name: 'user',
  aliases: ['userinfo', 'whois', 'info'],
  description: 'Show user information and profile picture',
  credits: 'AKASH HASAN',
  usage: 'user [mention/reply/uid]',
  category: 'Utility',
  prefix: true,
  version: "1.0.0"
};

module.exports.run = async function({ api, event, args, send, Users, Currencies }) {
  const { senderID, mentions, messageReply, threadID } = event;
  
  let uid = senderID;
  
  if (Object.keys(mentions).length > 0) {
    uid = Object.keys(mentions)[0];
  } else if (args[0] && /^\d+$/.test(args[0])) {
    uid = args[0];
  } else if (messageReply) {
    uid = messageReply.senderID;
  }
  
  const loadingMsg = await send.reply("⏳ দারাও বস, কুষ্ঠি বের করছি...");
  
  try {
    const info = await api.getUserInfo(uid);
    const userData = info[uid];
    
    if (!userData) {
      return send.reply("❌ ইউজার খুঁজে পাওয়া যায়নি বস!");
    }
    
    const name = userData.name || 'Ghost';
    const gender = userData.gender === 2 ? "Male ♂️" : (userData.gender === 1 ? "Female ♀️" : "Unknown");
    const vanity = userData.vanity || "Not Set";
    const isFriend = userData.isFriend ? "Yes ✅" : "No ❌";
    const profileUrl = userData.profileUrl || `facebook.com/${uid}`;
    
    let balance = 0;
    let exp = 0;
    
    try {
      const moneyData = await Currencies.getData(uid);
      if (moneyData) {
        balance = moneyData.money || 0;
        exp = moneyData.exp || 0;
      }
    } catch (e) {}

    const msg = `╭───「 👤 𝐔𝐒𝐄𝐑 𝐈𝐍𝐅𝐎 」───╮
│
│ 📛 𝐍𝐚𝐦𝐞 : ${name}
│ 🆔 𝐔𝐈𝐃  : ${uid}
│ 🚻 𝐒𝐞𝐱  : ${gender}
│ 🤝 𝐅𝐫𝐢𝐞𝐧𝐝: ${isFriend}
│ 🔗 𝐋𝐢𝐧𝐤 : ${vanity}
│
│ 💰 𝐌𝐨𝐧𝐞𝐲: ${balance} ৳
│ 🕯️ 𝐄𝐱𝐩  : ${exp}
│
│ </> 𝐀𝐮𝐭𝐡𝐨𝐫: 𝐀𝐊𝐀𝐒𝐇 𝐇𝐀𝐒𝐀𝐍
╰─────────────────────╯`;

    const cacheDir = path.join(__dirname, 'cache');
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });
    
    const avatarPath = path.join(cacheDir, `avt_${uid}.jpg`);
    const avatarUrl = `https://graph.facebook.com/${uid}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;

    const image = await axios.get(avatarUrl, { responseType: "arraybuffer" });
    fs.writeFileSync(avatarPath, Buffer.from(image.data));
    
    await api.unsendMessage(loadingMsg.messageID);

    await api.sendMessage({
      body: msg,
      attachment: fs.createReadStream(avatarPath)
    }, threadID, () => {
      fs.unlinkSync(avatarPath);
    }, event.messageID);

  } catch (error) {
    return send.reply("❌ সার্ভারে সমস্যা হচ্ছে বস! পরে ট্রাই করুন।");
  }
};