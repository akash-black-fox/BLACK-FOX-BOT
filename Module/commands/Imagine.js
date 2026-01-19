const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

module.exports.config = {
  name: "imagine",
  version: "1.0.0",
  author: "AKASH HASAN",
  description: "Generate AI images from text",
  category: "Ai",
  usage: "imagine [prompt]",
  prefix: true,
  cooldowns: 5
};

module.exports.run = async function({ api, event, args, send }) {
  const { threadID, messageID } = event;
  const prompt = args.join(" ");

  if (!prompt) {
    return send.reply(`╭───「 ⚠️ 𝐖𝐀𝐑𝐍𝐈𝐍𝐆 」───╮
│
│ ❌ 𝐌𝐢𝐬𝐬𝐢𝐧𝐠 𝐏𝐫𝐨𝐦𝐩𝐭
│ 👉 𝐔𝐬𝐚𝐠𝐞: imagine [text]
│ 📝 𝐄𝐱: imagine cat in space
│
╰─────────────────────╯`);
  }

  await send.reply(`╭───「 ⏳ 𝐆𝐄𝐍𝐄𝐑𝐀𝐓𝐈𝐍𝐆 」───╮
│
│ 🎨 𝐂𝐫𝐞𝐚𝐭𝐢𝐧𝐠 𝐀𝐫𝐭...
│ 🖌️ 𝐏𝐫𝐨𝐦𝐩𝐭: ${prompt}
│
╰─────────────────────╯`);

  try {
    const apiUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}`;
    const cacheDir = path.join(__dirname, 'cache');
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);
    
    const filePath = path.join(cacheDir, `imagine_${Date.now()}.jpg`);
    
    const response = await axios.get(apiUrl, { responseType: 'arraybuffer' });
    fs.writeFileSync(filePath, Buffer.from(response.data));

    await api.sendMessage({
      body: `╭───「 ✅ 𝐒𝐔𝐂𝐂𝐄𝐒𝐒 」───╮
│
│ 🎨 𝐌𝐨𝐝𝐞𝐥 : Pollinations
│ 📝 𝐏𝐫𝐨𝐦𝐩𝐭 : ${prompt}
│
╰─────────────────────╯`,
      attachment: fs.createReadStream(filePath)
    }, threadID, () => fs.unlinkSync(filePath), messageID);

  } catch (error) {
    return send.reply(`╭───「 ❌ 𝐄𝐑𝐑𝐎𝐑 」───╮
│
│ ⚠️ 𝐆𝐞𝐧𝐞𝐫𝐚𝐭𝐢𝐨𝐧 𝐅𝐚𝐢𝐥𝐞𝐝
│ 🔧 𝐓𝐫𝐲 𝐚𝐠𝐚𝐢𝐧 𝐥𝐚𝐭𝐞𝐫.
│
╰─────────────────────╯`);
  }
};