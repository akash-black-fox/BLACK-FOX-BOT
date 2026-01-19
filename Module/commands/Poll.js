module.exports.config = {
  name: 'poll',
  aliases: ['vote', 'voting', 'pol'],
  description: 'Create a poll in the group',
  credits: 'AKASH HASAN',
  usage: 'poll [Question] | [Opt1] | [Opt2]',
  category: 'Group',
  groupOnly: true,
  prefix: true,
  version: "1.0.0"
};

module.exports.run = async function({ api, event, args, send, config }) {
  const { threadID, senderID } = event;
  
  const threadInfo = await api.getThreadInfo(threadID);
  const adminIDs = threadInfo.adminIDs.map(a => a.id);
  
  const isGroupAdmin = adminIDs.includes(senderID);
  const isBotAdmin = config.ADMINBOT.includes(senderID);
  
  if (!isGroupAdmin && !isBotAdmin) {
    return send.reply(`╭───「 ⚠️ 𝐖𝐀𝐑𝐍𝐈𝐍𝐆 」───╮
│
│ ❌ 𝐀𝐜𝐜𝐞𝐬𝐬 𝐃𝐞𝐧𝐢𝐞𝐝!
│
│ আপনি তো এডমিন না বস!
│ পোল খুলে কি করবেন?
│
│ দূরে গিয়ে মুড়ি খান! 😒
│
╰─────────────────────╯`);
  }
  
  const input = args.join(' ');
  const parts = input.split('|').map(p => p.trim()).filter(p => p);
  
  if (parts.length < 2) {
    return send.reply(`╭───「 ⚠️ 𝐄𝐑𝐑𝐎𝐑 」───╮
│
│ ❌ ফরম্যাট ভুল হয়েছে!
│
│ 👉 ${config.PREFIX}poll প্রশ্ন | অপশন ১ | অপশন ২
│
│ 📝 উদা: ${config.PREFIX}poll খেলা হবে? | হ্যা | না
│
╰─────────────────────╯`);
  }
  
  const question = parts[0];
  const optionsList = parts.slice(1);
  
  const options = {};
  optionsList.forEach(opt => {
    options[opt] = false;
  });
  
  try {
    await api.createPoll(question, threadID, options);
    
    return send.reply(`╭───「 ✅ 𝐒𝐔𝐂𝐂𝐄𝐒𝐒 」───╮
│
│ 📊 পোল তৈরি করা হয়েছে!
│
│ ❓ প্রশ্ন: ${question}
│ 🗳️ অপশন: ${optionsList.length} টি
│
│ ভোট শুরু হোক! দেখা যাক
│ কে জিতে! 😎
│
│ </> 𝐀𝐮𝐭𝐡𝐨𝐫: 𝐀𝐊𝐀𝐒𝐇 𝐇𝐀𝐒𝐀𝐍
╰─────────────────────╯`);

  } catch (error) {
    return send.reply(`❌ পোল খুলতে পারলাম না বস! এপিআই সাপোর্ট করছে না।`);
  }
};