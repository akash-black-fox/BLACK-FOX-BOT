const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "edit",
  version: "2.0.0",
  hasPermssion: 0,
  credits: "AKASH HASAN",
  description: "Edit images using NanoBanana AI",
  commandCategory: "Media",
  usages: "edit [prompt] (Reply to image)",
  prefix: true,
  cooldowns: 10
};

module.exports.run = async ({ api, event, args }) => {
  const { threadID, messageID, messageReply, type } = event;

  if (type !== "message_reply" || !messageReply) {
    return api.sendMessage(`╭───「 ⚠️ 𝐖𝐀𝐑𝐍𝐈𝐍𝐆 」───╮
│
│ ❌ 𝐍𝐨 𝐈𝐦𝐚𝐠𝐞 𝐅𝐨𝐮𝐧𝐝
│ 👉 𝐑𝐞𝐩𝐥𝐲 𝐭𝐨 𝐚𝐧 𝐢𝐦𝐚𝐠𝐞
│    𝐰𝐢𝐭𝐡 𝐲𝐨𝐮𝐫 𝐩𝐫𝐨𝐦𝐩𝐭.
│
╰─────────────────────╯`, threadID, messageID);
  }

  const attachment = messageReply.attachments[0];
  
  if (!attachment || attachment.type !== "photo") {
    return api.sendMessage(`╭───「 ❌ 𝐄𝐑𝐑𝐎𝐑 」───╮
│
│ ⚠️ 𝐈𝐧𝐯𝐚𝐥𝐢𝐝 𝐅𝐨𝐫𝐦𝐚𝐭
│ 🖼️ 𝐏𝐥𝐞𝐚𝐬𝐞 𝐫𝐞𝐩𝐥𝐲 𝐭𝐨
│    𝐚 𝐏𝐡𝐨𝐭𝐨 𝐨𝐧𝐥𝐲.
│
╰─────────────────────╯`, threadID, messageID);
  }

  const prompt = args.join(" ");
  if (!prompt) {
    return api.sendMessage(`╭───「 ⚠️ 𝐌𝐈𝐒𝐒𝐈𝐍𝐆 」───╮
│
│ ❌ 𝐍𝐨 𝐏𝐫𝐨𝐦𝐩𝐭 𝐅𝐨𝐮𝐧𝐝
│ 📝 𝐄𝐱: edit make it red
│
╰─────────────────────╯`, threadID, messageID);
  }

  const imageUrl = attachment.url;
  const cacheDir = path.join(__dirname, "cache");
  
  if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir);
  }

  const getProgressBar = (percent) => {
    const total = 10;
    const filled = Math.floor((percent / 100) * total);
    return '▓'.repeat(filled) + '░'.repeat(total - filled);
  };

  const initialMsg = `╔══[ 𝐀𝐈 𝐄𝐃𝐈𝐓𝐎𝐑 ]
╟
╟ ⏳ 𝐒𝐭𝐚𝐭𝐮𝐬 : Processing...
╟ 🎨 𝐓𝐚𝐬𝐤 : ${prompt}
╟ [${getProgressBar(20)}] 20%
╟
╚══════════════❍`;

  let statusMsg;
  try {
    statusMsg = await api.sendMessage(initialMsg, threadID);
  } catch (e) { return; }

  try {
    await api.editMessage(`╔══[ 𝐀𝐈 𝐄𝐃𝐈𝐓𝐎𝐑 ]
╟
╟ 🖌️ 𝐒𝐭𝐚𝐭𝐮𝐬 : Applying AI...
╟ 🚀 𝐄𝐧𝐠𝐢𝐧𝐞 : NanoBanana
╟ [${getProgressBar(50)}] 50%
╟
╚══════════════❍`, statusMsg.messageID, threadID);

    const cookie = "AEC=AVh_V2iyBHpOrwnn7CeXoAiedfWn9aarNoKT20Br2UX9Td9K-RAeS_o7Sg; HSID=Ao0szVfkYnMchTVfk; SSID=AGahZP8H4ni4UpnFV; APISID=SD-Q2DJLGdmZcxlA/AS8N0Gkp_b9sJC84f; SAPISID=9BY2tOwgEz4dK4dY/Acpw5_--fM7PV-aw4; __Secure-1PAPISID=9BY2tOwgEz4dK4dY/Acpw5_--fM7PV-aw4; __Secure-3PAPISID=9BY2tOwgEz4dK4dY/Acpw5_--fM7PV-aw4; SEARCH_SAMESITE=CgQI354B; SID=g.a0002wiVPDeqp9Z41WGZdsMDSNVWFaxa7cmenLYb7jwJzpe0kW3bZzx09pPfc201wUcRVKfh-wACgYKAXUSARMSFQHGX2MiU_dnPuMOs-717cJlLCeWOBoVAUF8yKpYTllPAbVgYQ0Mr_GyeXxV0076; __Secure-1PSID=g.a0002wiVPDeqp9Z41WGZdsMDSNVWFaxa7cmenLYb7jwJzpe0kW3b_Pt9L1eqcIAVeh7ZdRBOXgACgYKAYESARMSFQHGX2MicAK_Acu_-NCkzEz2wjCHmxoVAUF8yKp9xk8gQ82f-Ob76ysTXojB0076; __Secure-3PSID=g.a0002wiVPDeqp9Z41WGZdsMDSNVWFaxa7cmenLYb7jwJzpe0kW3bUudZTunPKtKbLRSoGKl1dAACgYKAYISARMSFQHGX2MimdzCEq63UmiyGU-3eyZx9RoVAUF8yKrc4ycLY7LGaJUyDXk_7u7M0076";
    
    const apiUrl = `https://anabot.my.id/api/ai/geminiOption?prompt=${encodeURIComponent(prompt)}&type=NanoBanana&imageUrl=${encodeURIComponent(imageUrl)}&cookie=${encodeURIComponent(cookie)}&apikey=freeApikey`;

    const response = await axios.get(apiUrl, {
      headers: { 'Accept': 'application/json' },
      timeout: 60000,
      validateStatus: status => status < 600
    });

    if (!response.data || !response.data.success) {
      throw new Error("AI generation failed.");
    }

    const resultUrl = response.data.data?.result?.url;
    if (!resultUrl) {
      throw new Error("No image URL returned.");
    }

    await api.editMessage(`╔══[ 𝐀𝐈 𝐄𝐃𝐈𝐓𝐎𝐑 ]
╟
╟ 📥 𝐒𝐭𝐚𝐭𝐮𝐬 : Downloading...
╟ 🖼️ 𝐑𝐞𝐬𝐮𝐥𝐭 : Generated
╟ [${getProgressBar(80)}] 80%
╟
╚══════════════❍`, statusMsg.messageID, threadID);

    const fileName = `edit_${Date.now()}.png`;
    const filePath = path.join(cacheDir, fileName);
    
    const imageResponse = await axios({
      url: resultUrl,
      method: "GET",
      responseType: "stream",
      timeout: 60000
    });

    const writer = fs.createWriteStream(filePath);
    imageResponse.data.pipe(writer);

    await new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });

    await api.editMessage(`╔══[ 𝐀𝐈 𝐄𝐃𝐈𝐓𝐎𝐑 ]
╟
╟ ✅ 𝐒𝐭𝐚𝐭𝐮𝐬 : Uploading...
╟ 📦 𝐒𝐢𝐳𝐞 : 𝐇𝐢𝐠𝐡 𝐐𝐮𝐚𝐥𝐢𝐭𝐲
╟ [${getProgressBar(100)}] 100%
╟
╚══════════════❍`, statusMsg.messageID, threadID);

    const finalMsg = `╔══[ 𝐂𝐎𝐌𝐏𝐋𝐄𝐓𝐄𝐃 ]
╟
╟ 📝 𝐏𝐫𝐨𝐦𝐩𝐭 : ${prompt}
╟ 🎨 𝐌𝐨𝐝𝐞𝐥 : NanoBanana AI
╟
╚══════════════❍`;

    await api.sendMessage({
      body: finalMsg,
      attachment: fs.createReadStream(filePath)
    }, threadID, () => {
      setTimeout(() => {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        api.unsendMessage(statusMsg.messageID);
      }, 5000);
    }, messageID);

  } catch (error) {
    api.unsendMessage(statusMsg.messageID);
    return api.sendMessage(`╭───「 ❌ 𝐅𝐀𝐈𝐋𝐄𝐃 」───╮
│
│ ⚠️ 𝐄𝐫𝐫𝐨𝐫: ${error.message}
│ 🔧 𝐓𝐫𝐲 𝐚𝐠𝐚𝐢𝐧 𝐥𝐚𝐭𝐞𝐫.
│
╰─────────────────────╯`, threadID, messageID);
  }
};