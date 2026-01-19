const axios = require('axios');

module.exports.config = {
  name: 'translate',
  aliases: ['trans', 'tr', 'anubad', 'ortho'],
  description: 'Translate text to any language',
  credits: 'AKASH HASAN',
  usage: 'tr [lang] [text]',
  category: 'Utility',
  prefix: true,
  version: "1.0.0"
};

module.exports.run = async function({ api, event, args, send }) {
  const { threadID, messageID, messageReply } = event;

  const langCodes = {
    'bangla': 'bn', 'bn': 'bn', 'bengali': 'bn',
    'english': 'en', 'en': 'en',
    'urdu': 'ur', 'ur': 'ur',
    'hindi': 'hi', 'hi': 'hi',
    'arabic': 'ar', 'ar': 'ar',
    'spanish': 'es', 'es': 'es',
    'japanese': 'ja', 'ja': 'ja',
    'chinese': 'zh', 'zh': 'zh',
    'korean': 'ko', 'ko': 'ko',
    'russian': 'ru', 'ru': 'ru',
    'french': 'fr', 'fr': 'fr',
    'german': 'de', 'de': 'de',
    'italian': 'it', 'it': 'it',
    'tamil': 'ta', 'ta': 'ta'
  };

  let targetLang = 'bn';
  let textToTranslate = '';

  if (messageReply) {
    textToTranslate = messageReply.body;
    if (args[0]) {
      targetLang = langCodes[args[0].toLowerCase()] || args[0];
    }
  } else {
    if (args.length === 0) {
      return send.reply(`╭───「 ⚠️ 𝐖𝐀𝐑𝐍𝐈𝐍𝐆 」───╮
│
│ ❌ কি অনুবাদ করবো?
│    লিখে দিন অথবা রিপ্লাই দিন।
│
│ 👉 ${config.PREFIX}tr I love you
│ 👉 ${config.PREFIX}tr en আমি তোমাকে ভালোবাসি
│
╰─────────────────────╯`);
    }

    if (langCodes[args[0].toLowerCase()] || args[0].length === 2) {
      targetLang = langCodes[args[0].toLowerCase()] || args[0];
      textToTranslate = args.slice(1).join(' ');
    } else {
      textToTranslate = args.join(' ');
    }
  }

  if (!textToTranslate) {
    return send.reply(`╭───「 ⚠️ 𝐄𝐑𝐑𝐎𝐑 」───╮
│
│ ❌ টেক্সট খুঁজে পাচ্ছি না!
│
╰─────────────────────╯`);
  }

  try {
    api.setMessageReaction('⏳', messageID, () => {}, true);

    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(textToTranslate)}`;
    
    const response = await axios.get(url);
    
    if (!response.data || !response.data[0]) {
      throw new Error('Translation failed');
    }

    let translatedText = '';
    for (const part of response.data[0]) {
      if (part[0]) translatedText += part[0];
    }

    const detectedLang = response.data[2] || 'Auto';

    api.setMessageReaction('✅', messageID, () => {}, true);

    return send.reply(`╭───「 🔄 𝐓𝐑𝐀𝐍𝐒𝐋𝐀𝐓𝐄𝐃 」───╮
│
│ 📝 𝐎𝐫𝐢𝐠𝐢𝐧𝐚𝐥 (${detectedLang}):
│ ${textToTranslate.substring(0, 100)}
│
│ 🌐 𝐓𝐚𝐫𝐠𝐞𝐭 (${targetLang}):
│ ${translatedText}
│
│ </> 𝐀𝐮𝐭𝐡𝐨𝐫: 𝐀𝐊𝐀𝐒𝐇 𝐇𝐀𝐒𝐀𝐍
╰─────────────────────╯`);

  } catch (error) {
    api.setMessageReaction('❌', messageID, () => {}, true);
    return send.reply(`❌ অনুবাদ করতে সমস্যা হচ্ছে বস!`);
  }
};