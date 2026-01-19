const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

module.exports.config = {
  name: 'owner',
  aliases: ['admin'],
  description: 'Show bot owner information',
  credits: 'AKASH HASAN',
  usage: 'owner',
  category: 'Info',
  prefix: false,
  version: "1.1.0"
};

module.exports.run = async function({ api, event, send }) {
  const { threadID, messageID } = event;

  const ownerPics = [
    'https://i.ibb.co/M5sDdgbs/bf2c3c34a42c.jpg'
    ];

  const randomPic = ownerPics[Math.floor(Math.random() * ownerPics.length)];

  const ownerInfo = `╭───「 👑 𝐎𝐖𝐍𝐄𝐑 」───╮
│
│ 👤 𝐍𝐚𝐦𝐞 : AKASH HASAN
│ ☪️ 𝐑𝐞𝐥𝐢 : Islam
│ 💔 𝐑𝐞𝐥𝐢 : Single
│ 🛠️ 𝐖𝐨𝐫𝐤 : Not Found
│ 🏠 𝐀𝐝𝐝𝐫 : Mymensingh, Bangladesh
│
│ 🌐 𝐅𝐚𝐜𝐞𝐛𝐨𝐨𝐤:
│ m.me/akash.black.fox
│ 📞 𝐖𝐡𝐚𝐭𝐬𝐀𝐩𝐩:
│ +8801980871152
│ ✈️ 𝐓𝐞𝐥𝐞𝐠𝐫𝐚𝐦:
│ t.me/akash.black.fox
│
╰─────────────────────╯`;

  try {
    const cacheDir = path.join(__dirname, 'cache');
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);
    
    const imgPath = path.join(cacheDir, `owner_${Date.now()}.jpg`);
    const response = await axios.get(randomPic, { responseType: 'arraybuffer' });
    
    fs.writeFileSync(imgPath, Buffer.from(response.data));

    api.sendMessage(
      {
        body: ownerInfo,
        attachment: fs.createReadStream(imgPath)
      },
      threadID,
      () => {
        fs.unlinkSync(imgPath);
      },
      messageID
    );

  } catch (error) {
    return send.reply(ownerInfo);
  }
};