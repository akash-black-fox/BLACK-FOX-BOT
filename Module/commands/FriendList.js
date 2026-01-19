module.exports.config = {
  name: 'friendlist',
  aliases: ['friends', 'myfr', 'flist'],
  version: '1.0.0',
  author: 'AKASH HASAN',
  description: 'Show bot friend list with pagination',
  usage: 'friendlist [page]',
  category: 'Friend',
  adminOnly: true,
  prefix: true
};

module.exports.run = async function({ api, event, args, send, config }) {
  const { senderID } = event;
  
  if (!config.ADMINBOT.includes(senderID)) {
    return send.reply(`╭───「 ⛔ 𝐃𝐄𝐍𝐈𝐄𝐃 」───╮
│
│ ⚠️ 𝐏𝐞𝐫𝐦𝐢𝐬𝐬𝐢𝐨𝐧 𝐃𝐞𝐧𝐢𝐞𝐝
│ 👤 𝐎𝐧𝐥𝐲 𝐁𝐨𝐭 𝐀𝐝𝐦𝐢𝐧𝐬
│    𝐜𝐚𝐧 𝐮𝐬𝐞 𝐭𝐡𝐢𝐬.
│
╰─────────────────────╯`);
  }
  
  await send.reply(`╭───「 ⏳ 𝐋𝐎𝐀𝐃𝐈𝐍𝐆 」───╮
│
│ 📂 𝐅𝐞𝐭𝐜𝐡𝐢𝐧𝐠 𝐃𝐚𝐭𝐚...
│ 👥 𝐆𝐞𝐭𝐭𝐢𝐧𝐠 𝐅𝐫𝐢𝐞𝐧𝐝𝐬...
│
╰─────────────────────╯`);
  
  try {
    const friends = await api.getFriendsList();
    
    if (!friends || friends.length === 0) {
      return send.reply(`╭───「 📂 𝐄𝐌𝐏𝐓𝐘 」───╮
│
│ ⚠️ 𝐍𝐨 𝐅𝐫𝐢𝐞𝐧𝐝𝐬 𝐅𝐨𝐮𝐧𝐝.
│ 💔 𝐁𝐨𝐭 𝐢𝐬 𝐥𝐨𝐧𝐞𝐥𝐲...
│
╰─────────────────────╯`);
    }
    
    const page = parseInt(args[0]) || 1;
    const perPage = 10;
    const totalPages = Math.ceil(friends.length / perPage);
    
    if (page > totalPages) {
      return send.reply(`╭───「 ⚠️ 𝐖𝐀𝐑𝐍𝐈𝐍𝐆 」───╮
│
│ ❌ 𝐏𝐚𝐠𝐞 ${page} 𝐧𝐨𝐭 𝐟𝐨𝐮𝐧𝐝!
│ 📄 𝐓𝐨𝐭𝐚𝐥 𝐏𝐚𝐠𝐞𝐬: ${totalPages}
│
╰─────────────────────╯`);
    }

    const startIdx = (page - 1) * perPage;
    const endIdx = Math.min(startIdx + perPage, friends.length);
    const pageFriends = friends.slice(startIdx, endIdx);
    
    let msg = `╭───「 𝐅𝐑𝐈𝐄𝐍𝐃 𝐋𝐈𝐒𝐓 」───╮\n│\n`;
    
    for (let i = 0; i < pageFriends.length; i++) {
      const friend = pageFriends[i];
      const name = friend.fullName || friend.name || 'Unknown';
      
      let gender = '';
      if (friend.gender === 2) gender = '👨';
      else if (friend.gender === 1) gender = '👩';
      else gender = '🤖';

      msg += `│ ${startIdx + i + 1}. ${name} ${gender}\n`;
      msg += `│    🆔 ${friend.userID}\n│\n`;
    }
    
    msg += `╰─────────────────────╯\n`;
    msg += `📄 𝐏𝐚𝐠𝐞 : ${page}/${totalPages}\n`;
    msg += `👥 𝐓𝐨𝐭𝐚𝐥 : ${friends.length} Friends\n`;
    msg += `👉 𝐔𝐬𝐞: ${config.PREFIX}friendlist [page]`;
    
    return send.reply(msg);

  } catch (error) {
    return send.reply(`╭───「 ❌ 𝐅𝐀𝐈𝐋𝐄𝐃 」───╮
│
│ ⚠️ ডাটা লোড হয়নি বস!
│ 🔧 বটের এপিআই সমস্যা
│    করছে মনে হয়...!! 😿
│
╰─────────────────────╯`);
  }
};