const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const { createCanvas, loadImage } = require('canvas');

module.exports = {
  config: {
    name: 'Welcome',
    version: '1.0.0',
    author: 'AKASH HASAN',
    eventType: 'log:subscribe',
    description: 'Welcome with Custom Image Card'
  },

  async run({ api, event, Users, Threads }) {
    const { threadID, logMessageData } = event;
    const addedParticipants = logMessageData.addedParticipants || [];
    const botID = api.getCurrentUserID();

    const settings = Threads.getSettings(threadID);

    if (settings.antijoin) {
      for (const participant of addedParticipants) {
        if (participant.userFbId === botID) continue;
        try {
          await api.removeUserFromGroup(participant.userFbId, threadID);
        } catch {}
      }
      return;
    }

    const newMembers = addedParticipants.filter(p => p.userFbId !== botID);
    if (newMembers.length === 0) return;

    let threadInfo;
    try {
      threadInfo = await api.getThreadInfo(threadID);
    } catch {
      threadInfo = { threadName: 'Unknown Group', participantIDs: [], userInfo: [] };
    }

    const groupName = threadInfo.threadName || 'Unknown Group';
    const memberCount = threadInfo.participantIDs?.length || 0;
    
    let boyCount = 0;
    let girlCount = 0;
    try {
      if (threadInfo.userInfo) {
        threadInfo.userInfo.forEach(u => {
          if (u.gender === 'MALE') boyCount++;
          else if (u.gender === 'FEMALE') girlCount++;
        });
      }
    } catch (e) {}

    const now = new Date();
    const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    for (const member of newMembers) {
      let name = member.fullName;
      if (!name) {
        name = await Users.getNameUser(member.userFbId);
      }
      Users.create(member.userFbId, name);
      
      const welcomeMsg = `╭─────「 𝐖𝐄𝐋𝐂𝐎𝐌𝐄 」─────╮\n\n` +
      `⦿ আপনাকে ${groupName} গ্রুপে স্বাগতম আশা করি গ্রুপের সব রুলস মেনে চলবেন...!!\n` +
      `⦿ কাউকে গালিগালাজ করবেন না...!!\n` +
      `⦿ সবার সাথে ভালো ব্যাবহার করবেন.....!!\n` +
      `⦿ গ্রুপে মেয়েদের সাথে মজা করেন তবে কেউ বিরক্ত হয় এমন কিছু করবেন না....!!\n\n` +
      `╰─────────────────────╯\n\n` +
      `╭─── 𝐆𝐫𝐨𝐮𝐩 𝐈𝐧𝐟𝐨 ───╮\n` +
      `│ 📛 𝐍𝐚𝐦𝐞 : ${groupName}\n` +
      `│ 👥 𝐌𝐞𝐦𝐛𝐞𝐫𝐬 : ${memberCount}\n` +
      `│ 👦 𝐌𝐚𝐥𝐞 : ${boyCount}\n` +
      `│ 👧 𝐅𝐞𝐦𝐚𝐥𝐞 : ${girlCount}\n` +
      `│ 🕰️ 𝐓𝐢𝐦𝐞 : ${time}\n` +
      `╰──────────────╯\n\n` +
      `╭─── 𝐇𝐨𝐰 𝐓𝐨 𝐔𝐬𝐞 ───╮\n` +
      `│ ➤ ${global.config.PREFIX}admin\n` +
      `│ ➤ ${global.config.PREFIX}help\n` +
      `│ ➤ ${global.config.PREFIX}help all\n` +
      `╰───────────────╯`;

      try {
        const bgUrl = "https://i.ibb.co.com/20mW4cgx/1768291989109.png";
        
        const avatarUrl = `https://graph.facebook.com/${member.userFbId}/picture?height=720&width=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;

        const canvas = createCanvas(1280, 720);
        const ctx = canvas.getContext('2d');

        const background = await loadImage(bgUrl);
        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.save();
        ctx.beginPath();
        ctx.arc(640, 280, 160, 0, Math.PI * 2, true);
        ctx.lineWidth = 10;
        ctx.strokeStyle = "#ffffff";
        ctx.stroke();
        ctx.closePath();
        ctx.clip();
        
        try {
          const avatar = await loadImage(avatarUrl);
          ctx.drawImage(avatar, 480, 120, 320, 320);
        } catch (e) {
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(480, 120, 320, 320);
        }
        ctx.restore();

        ctx.font = "bold 90px sans-serif";
        ctx.fillStyle = "#ffffff";
        ctx.textAlign = "center";
        ctx.shadowColor = "black";
        ctx.shadowBlur = 20;
        ctx.fillText("WELCOME", 640, 560);

        ctx.font = "60px sans-serif";
        ctx.fillStyle = "#FFD700";
        ctx.fillText(name.toUpperCase(), 640, 650);

        const imageBuffer = canvas.toBuffer();
        const pathImg = path.join(__dirname, `../cache/welcome_${member.userFbId}.png`);
        fs.writeFileSync(pathImg, imageBuffer);

        await api.sendMessage({
          body: welcomeMsg,
          attachment: fs.createReadStream(pathImg)
        }, threadID);

        setTimeout(() => {
          fs.unlinkSync(pathImg);
        }, 5000);

      } catch (error) {
        await api.sendMessage(welcomeMsg, threadID);
      }
    }
  }
};