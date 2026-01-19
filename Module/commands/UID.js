module.exports.config = {
  name: 'uid',
  aliases: ['id', 'userid', 'myid'],
  description: 'Get user ID',
  credits: 'AKASH HASAN',
  usage: 'uid [@user/reply]',
  category: 'Utility',
  prefix: true,
  version: "1.0.0"
};

module.exports.run = async function({ api, event, args, send, Users }) {
  const { senderID, mentions, messageReply } = event;
  
  let targetID = senderID;
  let targetName = "";
  
  if (Object.keys(mentions).length > 0) {
    targetID = Object.keys(mentions)[0];
    targetName = mentions[targetID].replace("@", "");
  } else if (messageReply) {
    targetID = messageReply.senderID;
  }
  
  if (!targetName) {
    try {
      targetName = await Users.getNameUser(targetID);
    } catch {
      targetName = "Facebook User";
    }
  }
  
  return send.reply(`╭───「 🆔 𝐔𝐒𝐄𝐑 𝐈𝐃 」───╮
│
│ 👤 𝐍𝐚𝐦𝐞: ${targetName}
│ 🆔 𝐔𝐈𝐃 : ${targetID}
│
│ 🌐 𝐅𝐁 𝐋𝐢𝐧𝐤:
│ facebook.com/${targetID}
│
│ </> 𝐀𝐮𝐭𝐡𝐨𝐫: 𝐀𝐊𝐀𝐒𝐇 𝐇𝐀𝐒𝐀𝐍
╰─────────────────────╯`);
};