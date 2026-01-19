module.exports.config = {
  name: 'allbox',
  version: '2.0.0',
  credits: "AKASH HASAN",
  hasPermssion: 2, 
  description: 'Manage joined groups (Ban/Unban/Leave/Delete Data)',
  commandCategory: 'Admin',
  usages: 'allbox [page]',
  cooldowns: 5
};

module.exports.handleReply = async function ({ api, event, args, Threads, handleReply }) {
  const { threadID, senderID, body } = event;
  
  if (parseInt(senderID) !== parseInt(handleReply.author)) return;
  
  const input = body.split(" ");
  const action = input[0]?.toLowerCase();
  const index = parseInt(input[1]);
  
  if (!action || !index || isNaN(index)) {
    return api.sendMessage(`╭───「 ❌ 𝐄𝐑𝐑𝐎𝐑 」───╮
│
│ ⚠️ 𝐈𝐧𝐯𝐚𝐥𝐢𝐝 𝐅𝐨𝐫𝐦𝐚𝐭
│ 👉 𝐔𝐬𝐞: [Action] [Number]
│ 𝐄𝐱 : ban 1, out 1
│
╰─────────────────────╯`, threadID);
  }

  const groupID = handleReply.groupIDs[index - 1];
  const groupName = handleReply.groupNames[index - 1];

  if (!groupID) {
    return api.sendMessage("❌ Invalid group number.", threadID);
  }

  switch (action) {
    case "ban":
      const banData = (await Threads.getData(groupID)).data || {};
      banData.banned = true;
      banData.dateAdded = new Date().toISOString();
      await Threads.setData(groupID, { data: banData });
      global.data.threadBanned.set(groupID, { dateAdded: banData.dateAdded });
      
      api.sendMessage(`╭───「 ⛔ 𝐁𝐀𝐍𝐍𝐄𝐃 」───╮
│
│ ⚠️ আপনার গ্রুপটি ব্যন করা হয়েছে...!!
│  ADMIN : AKASH HASAN
│  Link : m.me/akash.black.fox
╰─────────────────────╯`, groupID).catch(() => {});

      return api.sendMessage(`╭───「 𝐒𝐔𝐂𝐂𝐄𝐒𝐒 」───╮
│
│ 🔨 𝐀𝐜𝐭𝐢𝐨𝐧 : Banned
│ 📂 𝐆𝐫𝐨𝐮𝐩  : ${groupName}
│ 🆔 𝐓𝐈𝐃    : ${groupID}
│
╰─────────────────────╯`, threadID);

    case "unban":
    case "ub":
      const unbanData = (await Threads.getData(groupID)).data || {};
      unbanData.banned = false;
      unbanData.dateAdded = null;
      await Threads.setData(groupID, { data: unbanData });
      global.data.threadBanned.delete(groupID);
      
      api.sendMessage(`╭───「 ✅ 𝐔𝐍𝐁𝐀𝐍 」───╮
│
│ 🟢 𝐘𝐨𝐮𝐫 𝐠𝐫𝐨𝐮𝐩 𝐡𝐚𝐬 𝐛𝐞𝐞𝐧
│    𝐮𝐧𝐛𝐚𝐧𝐧𝐞𝐝.
│
╰─────────────────────╯`, groupID).catch(() => {});

      return api.sendMessage(`╭───「 𝐒𝐔𝐂𝐂𝐄𝐒𝐒 」───╮
│
│ 🔓 𝐀𝐜𝐭𝐢𝐨𝐧 : Unbanned
│ 📂 𝐆𝐫𝐨𝐮𝐩  : ${groupName}
│ 🆔 𝐓𝐈𝐃    : ${groupID}
│
╰─────────────────────╯`, threadID);

    case "del":
      await Threads.delData(groupID);
      return api.sendMessage(`╭───「 𝐃𝐄𝐋𝐄𝐓𝐄𝐃 」───╮
│
│ 🗑️ 𝐀𝐜𝐭𝐢𝐨𝐧 : Data Deleted
│ 📂 𝐆𝐫𝐨𝐮𝐩  : ${groupName}
│
╰─────────────────────╯`, threadID);

    case "out":
      api.sendMessage(`╭───「 𝐋𝐄𝐀𝐕𝐈𝐍𝐆 」───╮
│
│ 👋 𝐆𝐨𝐨𝐝𝐛𝐲𝐞! 𝐀𝐝𝐦𝐢𝐧 𝐨𝐫𝐝𝐞𝐫𝐞𝐝
│    𝐦𝐞 𝐭𝐨 𝐥𝐞𝐚𝐯𝐞.
│
╰─────────────────────╯`, groupID, () => {
        api.removeUserFromGroup(api.getCurrentUserID(), groupID);
      });

      return api.sendMessage(`╭───「 𝐒𝐔𝐂𝐂𝐄𝐒𝐒 」───╮
│
│ 🚪 𝐀𝐜𝐭𝐢𝐨𝐧 : Left Group
│ 📂 𝐆𝐫𝐨𝐮𝐩  : ${groupName}
│
╰─────────────────────╯`, threadID);

    default:
      return api.sendMessage("❌ Unknown action. Use: ban, unban, out, del", threadID);
  }
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID } = event;
  
  try {
    const inbox = await api.getThreadList(100, null, ["INBOX"]);
    let list = inbox.filter(group => group.isGroup && group.isSubscribed);

    list.sort((a, b) => b.messageCount - a.messageCount);

    const groupIDs = [];
    const groupNames = [];
    
    let msg = `╭───「 𝐆𝐑𝐎𝐔𝐏 𝐋𝐈𝐒𝐓 」───╮\n│\n`;

    // Pagination Logic
    let page = parseInt(args[0]) || 1;
    page = page < 1 ? 1 : page;
    let limit = 10;
    let numPage = Math.ceil(list.length / limit);
    
    if (page > numPage) page = numPage;

    for (let i = limit * (page - 1); i < limit * (page - 1) + limit; i++) {
      if (i >= list.length) break;
      let group = list[i];
      msg += `│ ${i + 1}. ${group.name}\n│    🆔 ${group.threadID}\n│    💬 𝐌𝐬𝐠𝐬: ${group.messageCount}\n│\n`;
      groupIDs.push(group.threadID);
      groupNames.push(group.name);
    }

    msg += `╰─────────────────────╯\n`;
    msg += `📄 𝐏𝐚𝐠𝐞 : ${page}/${numPage}\n`;
    msg += `👥 𝐓𝐨𝐭𝐚𝐥 : ${list.length} Groups\n\n`;
    msg += `👉 𝐑𝐞𝐩𝐥𝐲: "ban/out/del [number]"`;

    return api.sendMessage(msg, threadID, (error, info) => {
      global.client.handleReply.push({
        name: this.config.name,
        messageID: info.messageID,
        author: event.senderID,
        groupIDs,
        groupNames
      });
    }, messageID);

  } catch (e) {
    return api.sendMessage("❌ Failed to get groups: " + e.message, threadID);
  }
};