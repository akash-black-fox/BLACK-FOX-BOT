const axios = require('axios');
const moment = require('moment-timezone');

module.exports.config = {
  name: "prayer",
  aliases: ["namaz", "salat"],
  version: "1.0.0",
  author: "AKASH HASAN",
  description: "Get prayer times for any city",
  category: "Utility",
  usage: "prayer [city name]",
  prefix: true
};

module.exports.run = async function({ api, event, args, send }) {
  const city = args.join(" ") || "Dhaka";
  const date = moment().tz('Asia/Dhaka').format('DD/MM/YYYY');
  const dayName = moment().tz('Asia/Dhaka').format('dddd');

  try {
    const response = await axios.get(`http://api.aladhan.com/v1/timingsByCity?city=${city}&country=Bangladesh&method=1`);
    const timings = response.data.data.timings;
    const hijri = response.data.data.date.hijri;

    const msg = `╭───「 🕌 𝐏𝐑𝐀𝐘𝐄𝐑 𝐓𝐈𝐌𝐄 」───╮
│
│ 📍 𝐋𝐨𝐜𝐚𝐭𝐢𝐨𝐧 : ${city}
│ 📅 𝐃𝐚𝐭𝐞 : ${date} (${dayName})
│ 🌙 𝐇𝐢𝐣𝐫𝐢 : ${hijri.day} ${hijri.month.en} ${hijri.year}
│
╰─────────────────────╯
╭───「 ⏳ 𝐒𝐂𝐇𝐄𝐃𝐔𝐋𝐄 」───╮
│
│ 🌄 𝐅𝐚𝐣𝐫    : ${timings.Fajr}
│ 🌅 𝐒𝐮𝐧𝐫𝐢𝐬𝐞 : ${timings.Sunrise}
│ ☀️ 𝐃𝐡𝐮𝐡𝐫   : ${timings.Dhuhr}
│ ⛅ 𝐀𝐬𝐫     : ${timings.Asr}
│ 🌇 𝐌𝐚𝐠𝐡𝐫𝐢𝐛 : ${timings.Maghrib}
│ 🌌 𝐈𝐬𝐡𝐚    : ${timings.Isha}
│
╰─────────────────────╯
নামাজ বেহেশতের চাবি...!! 🤲🖤`;

    return send.reply(msg);

  } catch (error) {
    return send.reply(`╭───「 ❌ 𝐄𝐑𝐑𝐎𝐑 」───╮
│
│ ⚠️ 𝐂𝐢𝐭𝐲 𝐧𝐨𝐭 𝐟𝐨𝐮𝐧𝐝!
│ 📝 𝐓𝐫𝐲: prayer Dhaka
│
╰─────────────────────╯`);
  }
};