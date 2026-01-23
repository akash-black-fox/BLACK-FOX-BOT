const { createCanvas, loadImage } = require('canvas');
const fs = require('fs-extra');
const path = require('path');
const axios = require('axios');

module.exports.config = {
  name: 'cover',
  aliases: ['banner', 'coverfb'],
  description: 'Create professional FB Cover with Profile Pic',
  credits: 'AKASH HASAN',
  usage: 'cover Name | Bio | Phone | Email | Color',
  category: 'Media',
  prefix: true,
  version: "1.0.0"
};

module.exports.run = async function({ api, event, args, send }) {
  const { threadID, messageID, senderID } = event;
  const input = args.join(' ');

  if (!input) {
    return send.reply(`╭───「 🎨 𝐂𝐎𝐕𝐄𝐑 𝐌𝐀𝐊𝐄𝐑 」───╮
│
│ ❌ 𝐖𝐫𝐨𝐧𝐠 𝐅𝐨𝐫𝐦𝐚𝐭!
│
│ 👉 𝐔𝐬𝐚𝐠𝐞:
│ ${global.config.PREFIX}cover Name | Bio | Phone | Email | Color
│
│ 👉 𝐄𝐱𝐚𝐦𝐩𝐥𝐞:
│ ${global.config.PREFIX}cover Akash | Web Dev | +88017XX | mail@test.com | Cyan
│
╰─────────────────────╯`);
  }

  const parts = input.split('|').map(s => s.trim());
  const name = parts[0];
  const bio = parts[1] || 'Professional Bot User';
  const phone = parts[2] || '+8801XXXXXXXXX';
  const email = parts[3] || 'username@gmail.com';
  const colorName = parts[4] || 'Cyan';

  send.reply("🎨 𝐆𝐞𝐧𝐞𝐫𝐚𝐭𝐢𝐧𝐠 𝐏𝐫𝐞𝐦𝐢𝐮𝐦 𝐂𝐨𝐯𝐞𝐫...");

  try {
    const colorMap = {
      'red': '#ff4757', 'blue': '#1e90ff', 'green': '#2ed573',
      'yellow': '#ffa502', 'cyan': '#00d2d3', 'pink': '#ff6b81',
      'purple': '#5352ed', 'orange': '#ff7f50', 'black': '#2f3542',
      'white': '#ffffff', 'gold': '#eccc68', 'silver': '#ced6e0'
    };

    const mainColor = colorMap[colorName.toLowerCase()] || '#00d2d3';

    const width = 1640;
    const height = 624;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#1e1e1e');
    gradient.addColorStop(1, '#000000');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    ctx.beginPath();
    ctx.moveTo(600, 0);
    ctx.lineTo(800, height);
    ctx.lineTo(width, height);
    ctx.lineTo(width, 0);
    ctx.closePath();
    ctx.fillStyle = `${mainColor}22`; 
    ctx.fill();

    ctx.fillStyle = mainColor;
    ctx.fillRect(50, 200, 5, 250);

    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 20;

    ctx.font = 'bold 90px Sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'left';
    ctx.fillText(name.toUpperCase(), 80, 280);

    ctx.font = '40px Sans-serif';
    ctx.fillStyle = mainColor;
    ctx.fillText(bio, 80, 340);

    ctx.font = '30px Sans-serif';
    ctx.fillStyle = '#dddddd';
    ctx.fillText(`📞 ${phone}`, 80, 410);
    ctx.fillText(`📧 ${email}`, 80, 450);

    try {
      const avatarUrl = `https://graph.facebook.com/${senderID}/picture?height=720&width=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
      const avatar = await loadImage(avatarUrl);

      const circleX = 1350;
      const circleY = 312;
      const radius = 220;

      ctx.save();
      ctx.beginPath();
      ctx.arc(circleX, circleY, radius, 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(avatar, circleX - radius, circleY - radius, radius * 2, radius * 2);
      ctx.restore();

      ctx.beginPath();
      ctx.arc(circleX, circleY, radius, 0, Math.PI * 2, true);
      ctx.lineWidth = 15;
      ctx.strokeStyle = mainColor;
      ctx.stroke();

    } catch (e) {
      ctx.font = '30px Sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText("NO PHOTO", 1300, 312);
    }

    ctx.font = 'bold 25px Sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.shadowBlur = 0;
    ctx.fillText('DESIGNED BY BLACK FOX', width / 2, height - 30);

    const cacheDir = path.join(__dirname, 'cache');
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);
    const filePath = path.join(cacheDir, `cover_${senderID}.png`);

    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(filePath, buffer);

    await api.sendMessage({
      body: `╭───「 ✅ 𝐂𝐑𝐄𝐀𝐓𝐄𝐃 」───╮
│
│ 👤 𝐍𝐚𝐦𝐞 : ${name}
│ 🎨 𝐓𝐡𝐞𝐦𝐞: ${colorName.toUpperCase()}
│
╰─────────────────────╯`,
      attachment: fs.createReadStream(filePath)
    }, threadID, () => fs.unlinkSync(filePath), messageID);

  } catch (error) {
    return send.reply(`❌ Error: ${error.message}`);
  }
};
