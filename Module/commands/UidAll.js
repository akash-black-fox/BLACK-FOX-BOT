module.exports.config = {
  name: 'uidall',
  aliases: ['alluid', 'memberuids', 'uids'],
  description: 'Get all member UIDs',
  credits: 'AKASH HASAN',
  usage: 'uidall',
  category: 'Group',
  groupOnly: true,
  prefix: true,
  version: "1.0.0"
};

module.exports.run = async function({ api, event, send }) {
  const { threadID } = event;
  
  await send.reply("⏳ দারাও বস, সবার কুষ্ঠি বের করছি...");
  
  try {
    const threadInfo = await api.getThreadInfo(threadID);
    const { participantIDs, userInfo } = threadInfo;
    
    let msg = `╭───「 👥 𝐌𝐄𝐌𝐁𝐄𝐑𝐒 」───╮\n│\n`;
    
    let count = 0;
    const limit = 20;

    for (const uid of participantIDs) {
      if (count >= limit) break;
      
      const user = userInfo.find(u => u.id == uid);
      const name = user ? user.name : "Facebook User";
      
      msg += `│ ${count + 1}. ${name.substring(0, 15)}\n`;
      msg += `│    🆔 ${uid}\n│\n`;
      
      count++;
    }
    
    msg += `╰─────────────────────╯
📊 𝐓𝐨𝐭𝐚𝐥: ${participantIDs.length} Members
⚠️ লিস্ট অনেক বড় তাই প্রথম
   ${limit} জন দেখানো হলো।
</> 𝐀𝐮𝐭𝐡𝐨𝐫: 𝐀𝐊𝐀𝐒𝐇 𝐇𝐀𝐒𝐀𝐍`;
    
    return send.reply(msg);
    
  } catch (error) {
    return send.reply("❌ মেম্বার লিস্ট লোড করতে সমস্যা হচ্ছে!");
  }
};