const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

module.exports.config = {
  name: 'say',
  aliases: ['tts', 'speak', 'voice', 'kotha'],
  description: 'Convert text to voice (Bengali)',
  credits: 'AKASH HASAN',
  usage: 'say [message]',
  category: 'Media',
  prefix: true,
  version: "1.0.0"
};

module.exports.run = async function({ api, event, args, send }) {
  const { messageReply } = event;
  
  let text = args.join(' ');
  
  if (!text && messageReply) {
    text = messageReply.body;
  }
  
  if (!text) {
    return send.reply(`╭───「 ⚠️ 𝐖𝐀𝐑𝐍𝐈𝐍𝐆 」───╮
│
│ ❌ কি বলবো সেটা তো লিখেন?
│    বোবার মতো বসে থাকবো? 😒
│
│ 👉 ${config.PREFIX}say আমি তোমাকে ভালোবাসি
│
╰─────────────────────╯`);
  }
  
  if (text.length > 500) {
    return send.reply(`╭───「 ⚠️ 𝐋𝐈𝐌𝐈𝐓 」───╮
│
│ ❌ এত বড় লেখা পড়া সম্ভব না!
│    গলা ব্যথা করবে বস।
│
│ 📉 ৫০০ অক্ষরের মধ্যে লিখুন।
│
╰─────────────────────╯`);
  }
  
  try {
    const encodedText = encodeURIComponent(text);
    const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodedText}&tl=bn&client=tw-ob`;
    
    const cacheDir = path.join(__dirname, 'cache');
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);
    
    const audioPath = path.join(cacheDir, `tts_${Date.now()}.mp3`);
    
    const response = await axios.get(ttsUrl, {
      responseType: 'arraybuffer',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 30000
    });
    
    fs.writeFileSync(audioPath, Buffer.from(response.data));
    
    await api.sendMessage({
      body: ``,
      attachment: fs.createReadStream(audioPath)
    }, event.threadID, () => {
        fs.unlinkSync(audioPath);
    }, event.messageID);
    
  } catch (error) {
    return send.reply(`╭───「 ⚠️ 𝐄𝐑𝐑𝐎𝐑 」───╮
│
│ ❌ ভয়েস জেনারেট করতে
│    পারলাম না।
│
│ 🌐 গুগল সার্ভারে সমস্যা।
│
╰─────────────────────╯`);
  }
};