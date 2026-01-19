module.exports.config = {
  name: 'ping',
  aliases: ['p', 'speed', 'latency'],
  description: 'Check bot response speed',
  credits: 'AKASH HASAN',
  usage: 'ping',
  category: 'Utility',
  prefix: true,
  version: "1.0.0"
};

module.exports.run = async function({ api, event, send }) {
  const start = Date.now();
  
  const info = await send.reply("⏳ দারাও বস, স্পিড চেক করি...");
  
  const latency = Date.now() - start;
  
  let status = "🚀 Super Fast";
  let comment = "বট তো রকেটের গতিতে চলছে! 😎";
  
  if (latency > 200) {
    status = "⚡ Fast";
    comment = "মোটামুটি ভালোই চলছে বস!";
  }
  if (latency > 600) {
    status = "🐢 Slow";
    comment = "নেটওয়ার্ক একটু স্লো বস!";
  }
  if (latency > 1000) {
    status = "☠️ Lagging";
    comment = "সার্ভার মনে হয় গাজা খাইছে! 🥴";
  }
  
  api.editMessage(`╭───「 🏓 𝐏𝐎𝐍𝐆 」───╮
│
│ 📶 𝐏𝐢𝐧𝐠   : ${latency}ms
│ ⚡ 𝐒𝐭𝐚𝐭𝐮𝐬 : ${status}
│
│ 💬 ${comment}
│
│ </> 𝐀𝐮𝐭𝐡𝐨𝐫: 𝐀𝐊𝐀𝐒𝐇 𝐇𝐀𝐒𝐀𝐍
╰─────────────────────╯`, info.messageID);
};