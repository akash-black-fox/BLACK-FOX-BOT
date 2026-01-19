module.exports.config = {
  name: 'decline',
  aliases: ['reject', 'dfr', 'cancelreq'],
  version: '1.0.0',
  author: 'AKASH HASAN',
  description: 'Decline friend requests (AJAX Method)',
  usage: 'decline [uid/all]',
  category: 'Friend',
  adminOnly: true,
  prefix: true
};

module.exports.confirmReq = async function(api, userID) {
  const form = {
    action: "reject",
    bot_id: userID,
    ref: "/reqs.php",
    source: "friends_tab"
  };
  return await api.httpPost("https://www.facebook.com/ajax/reqs.php", form);
};

module.exports.run = async function({ api, event, args, send, config }) {
  const { senderID, threadID } = event;
  
  if (!config.ADMINBOT.includes(senderID)) {
    return send.reply(`╭───「 ⛔ 𝐃𝐄𝐍𝐈𝐄𝐃 」───╮
│
│ ⚠️ 𝐏𝐞𝐫𝐦𝐢𝐬𝐬𝐢𝐨𝐧 𝐃𝐞𝐧𝐢𝐞𝐝
│ 👤 𝐎𝐧𝐥𝐲 𝐁𝐨𝐭 𝐀𝐝𝐦𝐢𝐧𝐬
│    𝐜𝐚𝐧 𝐮𝐬𝐞 𝐭𝐡𝐢𝐬.
│
╰─────────────────────╯`);
  }
  
  const action = args[0]?.toLowerCase();
  
  if (!action) {
    return send.reply(`╭───「 𝐇𝐄𝐋𝐏 」───╮
│
│ ➤ ${config.PREFIX}decline all
│ ➤ ${config.PREFIX}decline [UID]
│
╰─────────────────────╯`);
  }
  
  try {
    if (action === 'all') {
      const form = {
        av: api.getCurrentUserID(),
        fb_api_caller_class: 'RelayModern',
        fb_api_req_friendly_name: 'FriendingCometFriendRequestsRootQueryRelayPreloader',
        variables: JSON.stringify({ input: { scale: 3 } }),
        server_timestamps: true,
        doc_id: '4499164963466303'
      };
      
      const res = await api.httpPost('https://www.facebook.com/api/graphql/', form);
      const data = JSON.parse(res.replace('for (;;);', ''));
      
      let requests = [];
      try {
        const edges = data?.data?.viewer?.friending_possibilities?.edges || [];
        requests = edges.map(edge => ({
          userID: edge?.node?.id,
          name: edge?.node?.name || 'Unknown'
        })).filter(r => r.userID);
      } catch {
        requests = [];
      }
      
      if (requests.length === 0) {
        return send.reply(`╭───「 📂 𝐄𝐌𝐏𝐓𝐘 」───╮
│
│ ⚠️ 𝐍𝐨 𝐩𝐞𝐧𝐝𝐢𝐧𝐠
│    𝐟𝐫𝐢𝐞𝐧𝐝 𝐫𝐞𝐪𝐮𝐞𝐬𝐭𝐬.
│
╰─────────────────────╯`);
      }

      await send.reply(`╭───「 ⏳ 𝐖𝐎𝐑𝐊𝐈𝐍𝐆 」───╮
│
│ 🗑️ 𝐃𝐞𝐜𝐥𝐢𝐧𝐢𝐧𝐠 ${requests.length}
│    𝐫𝐞𝐪𝐮𝐞𝐬𝐭𝐬...
│
╰─────────────────────╯`);
      
      let declined = 0;
      
      for (const req of requests) {
        try {
          await module.exports.confirmReq(api, req.userID);
          declined++;
          await new Promise(r => setTimeout(r, 1000));
        } catch (e) {}
      }
      
      return send.reply(`╭───「 ✅ 𝐃𝐎𝐍𝐄 」───╮
│
│ 🗑️ 𝐓𝐨𝐭𝐚𝐥 𝐃𝐞𝐜𝐥𝐢𝐧𝐞𝐝
│    ➤ ${declined}/${requests.length}
│
╰─────────────────────╯`);
    }
    
    if (!/^\d+$/.test(action)) {
      return send.reply(`╭───「 ⚠️ 𝐄𝐑𝐑𝐎𝐑 」───╮
│
│ ❌ 𝐈𝐧𝐯𝐚𝐥𝐢𝐝 𝐔𝐈𝐃
│
╰─────────────────────╯`);
    }
    
    await module.exports.confirmReq(api, action);
    
    return send.reply(`╭───「 🚫 𝐑𝐄𝐉𝐄𝐂𝐓𝐄𝐃 」───╮
│
│ 👤 𝐔𝐈𝐃 : ${action}
│ 🗑️ 𝐒𝐭𝐚𝐭𝐮𝐬 : 𝐃𝐞𝐜𝐥𝐢𝐧𝐞𝐝
│
╰─────────────────────╯`);

  } catch (error) {
    return send.reply(`╭───「 ❌ 𝐅𝐀𝐈𝐋𝐄𝐃 」───╮
│
│ ⚠️ 𝐄𝐫𝐫𝐨𝐫: ${error.message}
│
╰─────────────────────╯`);
  }
};