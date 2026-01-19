const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

module.exports.config = {
  name: 'gif',
  aliases: ['giphy', 'anim'],
  version: '1.0.0',
  author: 'AKASH HASAN',
  description: 'Search and send random GIF',
  usage: 'gif [keyword]',
  category: 'Media',
  prefix: true
};

module.exports.run = async function({ api, event, args, send }) {
  const { threadID, messageID } = event;
  const query = args.join(" ");

  if (!query) {
    return send.reply(`╭───「 ⚠️ 𝐖𝐀𝐑𝐍𝐈𝐍𝐆 」───╮
│
│ ❌ 𝐌𝐢𝐬𝐬𝐢𝐧𝐠 𝐊𝐞𝐲𝐰𝐨𝐫𝐝
│ 👉 𝐔𝐬𝐚𝐠𝐞: gif [text]
│ 📝 𝐄𝐱: gif funny cat
│
╰─────────────────────╯`);
  }

  try {
    const response = await axios.get(`https://g.tenor.com/v1/search?q=${encodeURIComponent(query)}&key=LIVDSRZULELA&limit=20`);
    const results = response.data.results;

    if (!results || results.length === 0) {
      return send.reply(`╭───「 ❌ 𝐄𝐑𝐑𝐎𝐑 」───╮
│
│ ⚠️ 𝐍𝐨 𝐆𝐈𝐅 𝐟𝐨𝐮𝐧𝐝 𝐟𝐨𝐫:
│    "${query}"
│
╰─────────────────────╯`);
    }

    const randomGif = results[Math.floor(Math.random() * results.length)];
    const gifUrl = randomGif.media[0].gif.url;
    
    const cacheDir = path.join(__dirname, 'cache');
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);
    const gifPath = path.join(cacheDir, `gif_${Date.now()}.gif`);

    const imageResponse = await axios.get(gifUrl, { responseType: 'arraybuffer' });
    fs.writeFileSync(gifPath, Buffer.from(imageResponse.data));

    await api.sendMessage({
      body: `╭───「 𝐆𝐈𝐅 𝐅𝐎𝐔𝐍𝐃 」───╮
│
│ 🔍 𝐒𝐞𝐚𝐫𝐜𝐡 : ${query}
│ 🎨 𝐏𝐫𝐨𝐯𝐢𝐝𝐞𝐫 : Tenor
│
╰─────────────────────╯`,
      attachment: fs.createReadStream(gifPath)
    }, threadID, () => fs.unlinkSync(gifPath), messageID);

  } catch (error) {
    return send.reply(`╭───「 ❌ 𝐅𝐀𝐈𝐋𝐄𝐃 」───╮
│
│ ⚠️ 𝐀𝐏𝐈 𝐄𝐫𝐫𝐨𝐫
│ 🔧 𝐓𝐫𝐲 𝐚𝐠𝐚𝐢𝐧 𝐥𝐚𝐭𝐞𝐫.
│
╰─────────────────────╯`);
  }
};