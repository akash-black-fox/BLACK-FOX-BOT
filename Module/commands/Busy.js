const fs = require('fs-extra');
const path = require('path');
const moment = require('moment-timezone');

const busyDataPath = path.join(__dirname, 'data/busy_data.json');

function getBusyData() {
  try {
    fs.ensureDirSync(path.dirname(busyDataPath));
    if (!fs.existsSync(busyDataPath)) {
      fs.writeJsonSync(busyDataPath, { threads: {} });
    }
    return fs.readJsonSync(busyDataPath);
  } catch {
    return { threads: {} };
  }
}

function saveBusyData(data) {
  try {
    fs.ensureDirSync(path.dirname(busyDataPath));
    fs.writeJsonSync(busyDataPath, data, { spaces: 2 });
  } catch (err) {}
}

module.exports = {
  config: {
    name: 'busy',
    aliases: ['afk', 'away'],
    description: 'Record mentions when admin is busy',
    credits: 'AKASH HASAN',
    usage: 'busy [on/off/check]',
    category: 'Admin',
    groupOnly: true,
    prefix: true,
    version: "1.0.0"
  },
  
  recordMention: function(threadID, senderID, senderName, message) {
    const data = getBusyData();
    
    if (!data.threads[threadID] || !data.threads[threadID].active) return;
    
    const adminID = data.threads[threadID].adminID;
    if (senderID === adminID) return;
    
    if (!data.threads[threadID].mentions) {
      data.threads[threadID].mentions = [];
    }
    
    data.threads[threadID].mentions.push({
      senderID,
      senderName,
      message: message.substring(0, 200),
      time: Date.now()
    });
    
    saveBusyData(data);
  },
  
  checkBusy: function(threadID, senderID) {
    const data = getBusyData();
    
    if (!data.threads[threadID]) return null;
    if (!data.threads[threadID].active) return null;
    if (data.threads[threadID].adminID !== senderID) return null;
    
    return data.threads[threadID];
  },
  
  clearBusy: function(threadID) {
    const data = getBusyData();
    if (data.threads[threadID]) {
      data.threads[threadID].active = false;
      data.threads[threadID].mentions = [];
      saveBusyData(data);
    }
  },
  
  async run({ api, event, args, send, config }) {
    const { threadID, senderID } = event;
    
    const threadInfo = await api.getThreadInfo(threadID);
    const adminIDs = threadInfo.adminIDs.map(a => a.id);
    const isGroupAdmin = adminIDs.includes(senderID);
    const isBotAdmin = config.ADMINBOT.includes(senderID);
    
    if (!isGroupAdmin && !isBotAdmin) {
      return send.reply(`╭───「 ⚠️ 𝐃𝐄𝐍𝐈𝐄𝐃 」───╮
│
│ ❌ আরে ভাই আপনি কে?
│    এটা শুধু এডমিনদের জন্য!
│
╰─────────────────────╯`);
    }
    
    const action = args[0]?.toLowerCase();
    const data = getBusyData();
    
    if (!action || action === 'status') {
      const threadData = data.threads[threadID];
      const isActive = threadData?.active ? '🟢 Active' : '🔴 Inactive';
      const mentionCount = threadData?.mentions?.length || 0;
      
      return send.reply(`╭───「 📊 𝐒𝐓𝐀𝐓𝐔𝐒 」───╮
│
│ 🛡️ 𝐌𝐨𝐝𝐞: ${isActive}
│ 📥 𝐌𝐞𝐧𝐭𝐢𝐨𝐧𝐬: ${mentionCount}
│
│ 📝 𝐔𝐬𝐚𝐠𝐞:
│ • ${config.PREFIX}busy on
│ • ${config.PREFIX}busy off
│ • ${config.PREFIX}usy check
│
╰─────────────────────╯`);
    }
    
    if (action === 'on' || action === 'enable') {
      if (!data.threads[threadID]) {
        data.threads[threadID] = {};
      }
      
      data.threads[threadID] = {
        active: true,
        adminID: senderID,
        startTime: Date.now(),
        mentions: []
      };
      
      saveBusyData(data);
      
      let name = 'Admin';
      try {
        const info = await api.getUserInfo(senderID);
        name = info[senderID]?.name || 'Admin';
      } catch {}
      
      return send.reply(`╭───「 🟢 𝐁𝐔𝐒𝐘 𝐎𝐍 」───╮
│
│ 👤 বস ${name} এখন বিজি আছেন!
│    ডিস্টার্ব করবেন না...
│
│ 🤖 কেউ মেনশন দিলে আমি
│    লিখে রাখবো বস।
│
╰─────────────────────╯`);
    }
    
    if (action === 'off' || action === 'disable') {
      this.clearBusy(threadID);
      return send.reply(`╭───「 🔴 𝐁𝐔𝐒𝐘 𝐎𝐅𝐅 」───╮
│
│ ✅ স্বাগতম বস! ফিরে আসার
│    জন্য ধন্যবাদ।
│
│ 🗑️ সব মেনশন লিস্ট ক্লিয়ার
│    করে দিয়েছি।
│
╰─────────────────────╯`);
    }
    
    if (action === 'check' || action === 'report') {
      const threadData = data.threads[threadID];
      
      if (!threadData || !threadData.mentions || threadData.mentions.length === 0) {
        return send.reply(`╭───「 📭 𝐄𝐌𝐏𝐓𝐘 」───╮
│
│ ❌ শান্তি আর শান্তি!
│
│ 😴 আপনি না থাকার সময়
│    কেউ আপনাকে জ্বালায়নি।
│
╰─────────────────────╯`);
      }
      
      let msg = `╭───「 📥 𝐑𝐄𝐏𝐎𝐑𝐓 」───╮
│
│ 📊 স্যার, এই লোকগুলো আপনাকে
│    খুঁজছিল: (${threadData.mentions.length})
│
`;
      
      for (let i = 0; i < Math.min(threadData.mentions.length, 10); i++) {
        const m = threadData.mentions[i];
        const time = moment(m.time).tz("Asia/Dhaka").format("hh:mm A");
        msg += `│ 👤 ${m.senderName} (${time})\n│ 💬 "${m.message}"\n│\n`;
      }
      
      if (threadData.mentions.length > 10) {
        msg += `│ ... আরও ${threadData.mentions.length - 10} জন আছে\n`;
      }
      
      msg += `╰─────────────────────╯`;
      
      this.clearBusy(threadID);
      return send.reply(msg);
    }
    
    return send.reply(`╭───「 ❓ 𝐇𝐄𝐋𝐏 」───╮
│
│ 👉 ${config.PREFIX}busy on
│ 👉 ${config.PREFIX}busy off
│ 👉 ${config.PREFIX}busy check
│
╰─────────────────────╯`);
  }
};
