const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

module.exports.config = {
  name: "lyrics",
  version: "1.0.0",
  author: "AKASH HASAN",
  description: "Get song lyrics with image",
  category: "Media",
  usage: "lyrics [song name]",
  prefix: true
};

module.exports.run = async function({ api, event, args, send }) {
  const { threadID, messageID } = event;
  const songName = args.join(" ");

  if (!songName) {
    return send.reply(`╭───「 ⚠️ 𝐖𝐀𝐑𝐍𝐈𝐍𝐆 」───╮
│
│ ❌ 𝐌𝐢𝐬𝐬𝐢𝐧𝐠 𝐒𝐨𝐧𝐠 𝐍𝐚𝐦𝐞
│ 👉 𝐔𝐬𝐚𝐠𝐞: lyrics [song]
│
╰─────────────────────╯`);
  }

  await send.reply(`╭───「 ⏳ 𝐒𝐄𝐀𝐑𝐂𝐇𝐈𝐍𝐆 」───╮
│
│ 🎵 𝐋𝐨𝐨𝐤𝐢𝐧𝐠 𝐟𝐨𝐫 𝐥𝐲𝐫𝐢𝐜𝐬...
│ 🎧 𝐒𝐨𝐧𝐠 : ${songName}
│
╰─────────────────────╯`);

  try {
    const response = await axios.get(`https://api.popcat.xyz/lyrics?song=${encodeURIComponent(songName)}`);
    const data = response.data;

    if (!data.lyrics) {
      return send.reply(`╭───「 ❌ 𝐍𝐎𝐓 𝐅𝐎𝐔𝐍𝐃 」───╮
│
│ ⚠️ 𝐋𝐲𝐫𝐢𝐜𝐬 𝐧𝐨𝐭 𝐟𝐨𝐮𝐧𝐝.
│ 🔧 𝐓𝐫𝐲 𝐚𝐧𝐨𝐭𝐡𝐞𝐫 𝐬𝐨𝐧𝐠.
│
╰─────────────────────╯`);
    }

    const lyricsText = data.lyrics.length > 3000 ? data.lyrics.substring(0, 3000) + "...(More)" : data.lyrics;
    
    const msg = `╭───「 🎵 𝐋𝐘𝐑𝐈𝐂𝐒 」───╮
│
│ 🎶 𝐓𝐢𝐭𝐥𝐞 : ${data.title}
│ 🎤 𝐀𝐫𝐭𝐢𝐬𝐭 : ${data.artist}
│
╰─────────────────────╯

${lyricsText}`;

    const cacheDir = path.join(__dirname, 'cache');
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);
    const imgPath = path.join(cacheDir, `lyrics_${Date.now()}.jpg`);

    try {
      const imageRes = await axios.get(data.image, { responseType: 'arraybuffer' });
      fs.writeFileSync(imgPath, Buffer.from(imageRes.data));

      await api.sendMessage({
        body: msg,
        attachment: fs.createReadStream(imgPath)
      }, threadID, () => fs.unlinkSync(imgPath), messageID);

    } catch (err) {
      return send.reply(msg);
    }

  } catch (error) {
    return send.reply(`╭───「 ❌ 𝐄𝐑𝐑𝐎𝐑 」───╮
│
│ ⚠️ 𝐀𝐏𝐈 𝐄𝐫𝐫𝐨𝐫
│ 🔧 𝐓𝐫𝐲 𝐚𝐠𝐚𝐢𝐧 𝐥𝐚𝐭𝐞𝐫.
│
╰─────────────────────╯`);
  }
};