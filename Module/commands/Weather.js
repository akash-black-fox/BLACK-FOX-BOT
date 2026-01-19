const axios = require('axios');

module.exports.config = {
  name: 'weather',
  aliases: ['abhawa', 'weather'],
  description: 'Check weather forecast',
  credits: 'AKASH HASAN',
  usage: 'weather [city]',
  category: 'Utility',
  prefix: true,
  version: "1.0.0"
};

module.exports.run = async function({ api, event, args, send }) {
  const location = args.join(" ");

  if (!location) {
    return send.reply(`╭───「 ⚠️ 𝐖𝐀𝐑𝐍𝐈𝐍𝐆 」───╮
│
│ ❌ জায়গার নাম কই?
│    আকাশের আবহাওয়া দেখবো?
│
│ 👉 .weather Dhaka
│
╰─────────────────────╯`);
  }

  try {
    const res = await axios.get(`https://api.popcat.xyz/weather?q=${encodeURIComponent(location)}`);
    const data = res.data[0];

    if (!data || !data.location) {
      return send.reply(`╭───「 ❌ 𝐄𝐑𝐑𝐎𝐑 」───╮
│
│ ⚠️ এই জায়গা খুঁজে পাচ্ছি না!
│    বানান ঠিক করে লিখুন।
│
╰─────────────────────╯`);
    }

    const { location: loc, current, forecast } = data;

    const msg = `╭───「 ☁️ 𝐖𝐄𝐀𝐓𝐇𝐄𝐑 」───╮
│
│ 📍 𝐋𝐨𝐜 : ${loc.name}
│ 🌡️ 𝐓𝐞𝐦𝐩: ${current.temperature}°C
│ 🤒 𝐅𝐞𝐞𝐥: ${current.feelslike}°C
│ ☁️ 𝐒𝐤𝐲 : ${current.skytext}
│ 💧 𝐇𝐮𝐦 : ${current.humidity}%
│ 💨 𝐖𝐢𝐧𝐝: ${current.winddisplay}
│
│ 💡 ৩ দিনের রিপোর্ট দেখতে
│    মেসেজে ❤️ রিয়েক্ট দিন।
│
│ </> 𝐀𝐮𝐭𝐡𝐨𝐫: 𝐀𝐊𝐀𝐒𝐇 𝐇𝐀𝐒𝐀𝐍
╰─────────────────────╯`;

    const info = await send.reply(msg);

    global.client.handleReaction.push({
      name: this.config.name,
      messageID: info.messageID,
      author: event.senderID,
      forecast: forecast,
      location: loc.name
    });

  } catch (err) {
    return send.reply(`❌ সার্ভারে সমস্যা হচ্ছে বস!`);
  }
};

module.exports.handleReaction = async function({ api, event, handleReaction }) {
  if (event.userID != handleReaction.author) return;
  if (event.reaction != "❤") return;

  const { forecast, location } = handleReaction;

  let msg = `╭───「 📅 𝐅𝐎𝐑𝐄𝐂𝐀𝐒𝐓 」───╮
│
│ 📍 𝐋𝐨𝐜: ${location}
│\n`;

  const days = forecast.slice(1, 4);

  days.forEach(day => {
    msg += `│ 🗓️ ${day.day} (${day.date})
│ 🌡️ ${day.low}°C ➝ ${day.high}°C
│ ☁️ ${day.skytextday}
│\n`;
  });

  msg += `╰─────────────────────╯`;

  api.sendMessage(msg, event.threadID, () => {
    api.unsendMessage(handleReaction.messageID);
  });
};