const fs = require('fs-extra');
const path = require('path');

const autosendPath = path.join(__dirname, 'data/autosend.json');
let jobs = {};

function getData() {
  try {
    fs.ensureDirSync(path.dirname(autosendPath));
    if (!fs.existsSync(autosendPath)) {
      fs.writeJsonSync(autosendPath, { schedules: [], silent: {} });
    }
    return fs.readJsonSync(autosendPath);
  } catch {
    return { schedules: [], silent: {} };
  }
}

function saveData(data) {
  fs.ensureDirSync(path.dirname(autosendPath));
  fs.writeJsonSync(autosendPath, data, { spaces: 2 });
}

function fmt(ms) {
  const m = Math.floor(ms / 60000);
  const h = Math.floor(m / 60);
  if (h > 0) return `${h} hour(s)`;
  if (m > 0) return `${m} minute(s)`;
  return `${Math.floor(ms / 1000)} second(s)`;
}

module.exports = {
  config: {
    name: 'autosend',
    aliases: ['automsg', 'schedule'],
    description: 'Advanced autosend system',
    usage: 'autosend help',
    category: 'Admin',
    adminOnly: true,
    groupOnly: true,
    prefix: true,
    Author: 'AKASH HASAN',
    Version: '1.0.0'
  },

  initSchedules(api) {
    const data = getData();
    for (const k in jobs) clearInterval(jobs[k]);
    jobs = {};

    for (const s of data.schedules) {
      if (s.active) {
        jobs[s.id] = setInterval(() => {
          api.sendMessage(s.message, s.global ? s.threadIDs : s.threadID);
        }, s.interval);
      }
    }
  },

  async run({ api, event, args, send, config }) {
    const { threadID, senderID } = event;
    const prefix = config.PREFIX || '/';

    const info = await api.getThreadInfo(threadID);
    const admins = info.adminIDs.map(a => a.id);

    if (!admins.includes(senderID) && !config.ADMINBOT.includes(senderID)) {
      return send.reply(`╭───「 ⚠️ ACCESS 」───╮
│
│ Admin only command
│
╰──────────────────╯`);
    }

    const data = getData();
    const act = args[0]?.toLowerCase();

    if (!act || act === 'help') {
      return send.reply(`╭───「 📖 AUTOSEND HELP 」───╮
│
│ ${prefix}autosend add [ms] [message]
│ ➤ Group auto message
│
│ ${prefix}autosend global add [ms] [message]
│ ➤ All groups auto message
│
│ ${prefix}autosend remove [id]
│ ➤ Delete autosend
│
│ ${prefix}autosend pause [id]
│ ➤ Pause autosend
│
│ ${prefix}autosend resume [id]
│ ➤ Resume autosend
│
│ ${prefix}autosend list
│ ➤ Show schedules
│
│ ${prefix}autosend silent on/off
│ ➤ Silent mode toggle
│
│ Interval example:
│ 60000   = 1 minute
│ 3600000 = 1 hour
│
│ AUTHOR : AKASH HASAN
│ LINK   : m.me/akash.black.fox
│
╰────────────────────────╯`);
    }

    if (act === 'silent') {
      data.silent[threadID] = args[1] === 'on';
      saveData(data);
      return send.reply(`╭───「 🔕 SILENT 」───╮
│
│ Silent mode: ${args[1] === 'on' ? 'ON' : 'OFF'}
│
╰──────────────────╯`);
    }

    if (act === 'list') {
      const list = data.schedules.filter(s => s.threadID === threadID || s.global);
      if (!list.length) {
        return send.reply(`╭───「 📭 EMPTY 」───╮
│
│ No schedules found
│
╰──────────────────╯`);
      }
      let msg = `╭───「 📋 SCHEDULES 」───╮\n│\n`;
      for (const s of list) {
        msg += `│ 🆔 ${s.id}\n│ ⏱ ${fmt(s.interval)}\n│ ${s.active ? '▶ Active' : '⏸ Paused'}\n│\n`;
      }
      msg += `╰──────────────────╯`;
      return send.reply(msg);
    }

    if (act === 'add' || act === 'global') {
      const isGlobal = act === 'global';
      const interval = parseInt(args[isGlobal ? 2 : 1]);
      const message = args.slice(isGlobal ? 3 : 2).join(' ');

      if (!interval || interval < 60000 || !message) {
        return send.reply(`╭───「 ❌ ERROR 」───╮
│
│ Invalid interval/message
│
╰──────────────────╯`);
      }

      const id = Date.now().toString(36);
      data.schedules.push({
        id,
        interval,
        message,
        active: true,
        global: isGlobal,
        threadID,
        threadIDs: [],
        createdAt: Date.now()
      });

      saveData(data);

      jobs[id] = setInterval(() => {
        api.sendMessage(message, threadID);
      }, interval);

      return send.reply(`╭───「 ✅ ADDED 」───╮
│
│ ID: ${id}
│ ${isGlobal ? 'Global' : 'Group'} autosend
│
╰──────────────────╯`);
    }

    if (act === 'pause' || act === 'resume') {
      const id = args[1];
      const s = data.schedules.find(x => x.id === id);
      if (!s) {
        return send.reply(`╭───「 ❌ NOT FOUND 」───╮
│
│ Invalid ID
│
╰──────────────────╯`);
      }
      s.active = act === 'resume';
      saveData(data);
      if (!s.active && jobs[id]) clearInterval(jobs[id]);
      return send.reply(`╭───「 ${s.active ? '▶ RESUMED' : '⏸ PAUSED'} 」───╮
│
│ ID: ${id}
│
╰──────────────────╯`);
    }

    if (act === 'remove') {
      const id = args[1];
      const i = data.schedules.findIndex(x => x.id === id);
      if (i === -1) {
        return send.reply(`╭───「 ❌ NOT FOUND 」───╮
│
│ Invalid ID
│
╰──────────────────╯`);
      }
      data.schedules.splice(i, 1);
      saveData(data);
      if (jobs[id]) clearInterval(jobs[id]);
      return send.reply(`╭───「 🗑 REMOVED 」───╮
│
│ ID: ${id}
│
╰──────────────────╯`);
    }
  }
};