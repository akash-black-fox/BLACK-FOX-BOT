const moment = require('moment-timezone');

module.exports = {
  config: {
    name: 'group_events',
    eventType: [
      'log:thread-admins',
      'log:thread-name',
      'log:user-nickname',
      'log:thread-call',
      'log:thread-icon',
      'log:thread-color'
    ],
    description: 'Notify regarding Group changes and Admin updates'
  },
  
  async run({ api, event, send, Users }) {
    const { threadID, logMessageType, logMessageData, author } = event;
    
    const time = moment().tz('Asia/Dhaka').format('h:mm A');
    const date = moment().tz('Asia/Dhaka').format('DD/MM/YYYY');
    
 
    if (logMessageType === 'log:thread-admins') {
      const { ADMIN_EVENT, TARGET_ID } = logMessageData;
      let name = null;
      
      try {
        const info = await api.getUserInfo(TARGET_ID);
        if (info && info[TARGET_ID]) {
          const fullName = info[TARGET_ID].name;
          const firstName = info[TARGET_ID].firstName;
          const alternateName = info[TARGET_ID].alternateName;
          
          if (fullName && !fullName.toLowerCase().includes('facebook') && fullName.toLowerCase() !== 'user') {
            name = fullName;
          } else if (firstName && !firstName.toLowerCase().includes('facebook') && firstName.toLowerCase() !== 'user') {
            name = firstName;
          } else if (alternateName && !alternateName.toLowerCase().includes('facebook') && alternateName.toLowerCase() !== 'user') {
            name = alternateName;
          }
        }
      } catch {}
      
      if (!name) {
        name = await Users.getNameUser(TARGET_ID);
      }
      
      if (!name || name.toLowerCase().includes('facebook') || name === 'User') {
        name = 'Member';
      }
      
      if (ADMIN_EVENT === 'add_admin') {
        const msg = `╭──「 𝗔𝗗𝗠𝗜𝗡 𝗨𝗣𝗗𝗔𝗧𝗘 」──
│
│ 👑 𝗧𝘆𝗽𝗲 : Admin Promoted
│ 👤 𝗡𝗮𝗺𝗲 : ${name}
│ 📅 𝗗𝗮𝘁𝗲 : ${date}
│ 🕒 𝗧𝗶𝗺𝗲 : ${time}
│
╰───────────────⭓
নে বলদা তোরে এডমিন দেওয়া হলো...!! 😎`;
        return send.send(msg, threadID);

      } else if (ADMIN_EVENT === 'remove_admin') {
        const msg = `╭──「 𝗔𝗗𝗠𝗜𝗡 𝗨𝗣𝗗𝗔𝗧𝗘 」──
│
│ ⬇️ 𝗧𝘆𝗽𝗲 : Admin Demoted
│ 👤 𝗡𝗮𝗺𝗲 : ${name}
│ 📅 𝗗𝗮𝘁𝗲 : ${date}
│ 🕒 𝗧𝗶𝗺𝗲 : ${time}
│
╰───────────────⭓
পাকনামির কারনে তোকে এডমিন থেকে রিমুভ করা হলো...!! 😹`;
        return send.send(msg, threadID);
      }
    }

   
    else if (logMessageType === 'log:user-nickname') {
      const doerName = await Users.getNameUser(author);
      const targetName = await Users.getNameUser(logMessageData.participant_id);
      const newName = logMessageData.nickname || "Original Name";

      const msg = `╭──「 𝗡𝗜𝗖𝗞𝗡𝗔𝗠𝗘 」──
│
│ ✏️ 𝗗𝗼𝗲𝗿 : ${doerName}
│ 👤 𝗨𝘀𝗲𝗿 : ${targetName}
│ 🏷️ 𝗡𝗲𝘄 : ${newName}
│ 🕒 𝗧𝗶𝗺𝗲 : ${time}
│
╰───────────────⭓`;
      return send.send(msg, threadID);
    }

  
    else if (logMessageType === 'log:thread-name') {
      const doerName = await Users.getNameUser(author);
      const newName = logMessageData.name || "No Name";

      const msg = `╭──「 𝗚𝗥𝗢𝗨𝗣 𝗡𝗔𝗠𝗘 」──
│
│ ✏️ 𝗗𝗼𝗲𝗿 : ${doerName}
│ 🏷️ 𝗡𝗲𝘄 : ${newName}
│ 🕒 𝗧𝗶𝗺𝗲 : ${time}
│
╰───────────────⭓`;
      return send.send(msg, threadID);
    }

  
    else if (logMessageType === 'log:thread-icon') {
      const doerName = await Users.getNameUser(author);
      const newIcon = logMessageData.thread_icon || "👍";
      
      const msg = `╭──「 𝗘𝗠𝗢𝗝𝗜 𝗖𝗛𝗔𝗡𝗚𝗘 」──
│
│ 🧩 𝗦𝘁𝗮𝘁𝘂𝘀 : Icon Updated
│ 👤 𝗕𝘆 : ${doerName}
│ 🆕 𝗜𝗰𝗼𝗻 : ${newIcon}
│ 🕒 𝗧𝗶𝗺𝗲 : ${time}
│
╰───────────────⭓`;
      return send.send(msg, threadID);
    }

   
    else if (logMessageType === 'log:thread-color') {
      const doerName = await Users.getNameUser(author);
      
      const msg = `╭──「 𝗧𝗛𝗘𝗠𝗘 𝗖𝗛𝗔𝗡𝗚𝗘 」──
│
│ 🎨 𝗦𝘁𝗮𝘁𝘂𝘀 : Color Updated
│ 👤 𝗕𝘆 : ${doerName}
│ 🕒 𝗧𝗶𝗺𝗲 : ${time}
│
╰───────────────⭓`;
      return send.send(msg, threadID);
    }

    
    else if (logMessageType === 'log:thread-call') {
      const callType = logMessageData.event;
      
      if (callType === 'group_call_started') {
        const name = await Users.getNameUser(logMessageData.caller_id);
        const msg = `╭──「 𝗖𝗔𝗟𝗟 𝗔𝗟𝗘𝗥𝗧 」──
│
│ 📞 𝗦𝘁𝗮𝘁𝘂𝘀 : Call Started
│ 👤 𝗕𝘆 : ${name}
│ 📹 𝗧𝘆𝗽𝗲 : ${logMessageData.video ? 'Video' : 'Audio'}
│ 🕒 𝗧𝗶𝗺𝗲 : ${time}
│
╰───────────────⭓`;
        return send.send(msg, threadID);
      } 
      else if (callType === 'group_call_ended') {
        const duration = logMessageData.call_duration;
        const hours = Math.floor(duration / 3600);
        const minutes = Math.floor((duration % 3600) / 60);
        const seconds = duration % 60;
        const durationStr = `${hours > 0 ? hours + 'h ' : ''}${minutes}m ${seconds}s`;

        const msg = `╭──「 𝗖𝗔𝗟𝗟 𝗘𝗡𝗗𝗘𝗗 」──
│
│ 📞 𝗦𝘁𝗮𝘁𝘂𝘀 : Call Finished
│ ⏱️ 𝗗𝘂𝗿𝗮𝘁𝗶𝗼𝗻 : ${durationStr}
│ 🕒 𝗧𝗶𝗺𝗲 : ${time}
│
╰───────────────⭓`;
        return send.send(msg, threadID);
      }
      else if (logMessageData.joining_user) {
        const name = await Users.getNameUser(logMessageData.joining_user);
        const msg = `╭──「 𝗖𝗔𝗟𝗟 𝗝𝗢𝗜𝗡 」──
│
│ ➕ 𝗦𝘁𝗮𝘁𝘂𝘀 : User Joined
│ 👤 𝗡𝗮𝗺𝗲 : ${name}
│ 🕒 𝗧𝗶𝗺𝗲 : ${time}
│
╰───────────────⭓`;
        return send.send(msg, threadID);
      }
    }
  }
};
