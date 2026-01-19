const os = require("os");
const fs = require("fs-extra");
const axios = require("axios");
const path = require("path");
const moment = require("moment-timezone");

const startTime = Date.now();

module.exports.config = {
  name: "uptime",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "AKASH HASAN",
  description: "Check bot system uptime and stats",
  commandCategory: "Utility",
  usages: "uptime",
  cooldowns: 5,
  prefix: true
};

module.exports.run = async function ({ api, event }) {
  try {
    const currentTime = Date.now();
    const uptimeInSeconds = (currentTime - startTime) / 1000;

    const days = Math.floor(uptimeInSeconds / (3600 * 24));
    const hours = Math.floor((uptimeInSeconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((uptimeInSeconds % 3600) / 60);
    const seconds = Math.floor(uptimeInSeconds % 60);

    const uptimeFormatted = `${days}d ${hours}h ${minutes}m ${seconds}s`;

    const totalMemoryGB = (os.totalmem() / 1024 ** 3).toFixed(2);
    const freeMemoryGB = (os.freemem() / 1024 ** 3).toFixed(2);
    const usedMemoryGB = (totalMemoryGB - freeMemoryGB).toFixed(2);

    const timeStart = Date.now();
    await api.sendMessage({ body: "⚡ পিং চেক করা হচ্ছে..." }, event.threadID);
    const ping = Date.now() - timeStart;

    const date = moment().tz("Asia/Dhaka").format("DD/MM/YYYY");
    const time = moment().tz("Asia/Dhaka").format("hh:mm:ss A");

    const systemInfo = `╭───「 𝐔𝐏𝐓𝐈𝐌𝐄 」───╮
│
│ ⏳ 𝐑𝐮𝐧𝐧𝐢𝐧𝐠: ${uptimeFormatted}
│ ⚡ 𝐒𝐩𝐞𝐞𝐝  : ${ping}ms
│
│ 🖥️ 𝐒𝐲𝐬𝐭𝐞𝐦 𝐈𝐧𝐟𝐨:
│ 📼 𝐑𝐀𝐌    : ${usedMemoryGB}/${totalMemoryGB} GB
│ ⚙️ 𝐂𝐏𝐔    : ${os.cpus()[0].model.substring(0, 15)}...
│ 🐧 𝐎𝐒     : ${os.type()} ${os.arch()}
│
│ 📅 ${date} | ${time}
│
│ </> 𝐀𝐮𝐭𝐡𝐨𝐫: 𝐀𝐊𝐀𝐒𝐇 𝐇𝐀𝐒𝐀𝐍
╰─────────────────────╯`;

    const imgPath = path.join(__dirname, "cache", "uptime.gif");
    const imgUrl = "https://i.ibb.co/TqwtBwF2/2c307b069cfd.gif";

    if (!fs.existsSync(path.join(__dirname, "cache"))) {
      fs.mkdirSync(path.join(__dirname, "cache"));
    }

    const response = await axios.get(imgUrl, { responseType: "arraybuffer" });
    fs.writeFileSync(imgPath, Buffer.from(response.data));

    api.sendMessage(
      {
        body: systemInfo,
        attachment: fs.createReadStream(imgPath),
      },
      event.threadID,
      () => {
         fs.unlinkSync(imgPath);
      }
    );

  } catch (error) {
    api.sendMessage("❌ সিস্টেম ইনফো লোড করা যাচ্ছে না।", event.threadID);
  }
};