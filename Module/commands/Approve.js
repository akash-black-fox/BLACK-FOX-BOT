const axios = require("axios");

module.exports.config = {
  name: 'approve',
  aliases: ['allow', 'accept'],
  description: 'Approve or unapprove a group',
  credits: 'AKASH HASAN',
  usage: 'approve [id] | unapprove [id]',
  category: 'Admin',
  adminOnly: true,
  prefix: true,
  version: "1.1.0"
};


async function sendWithGif(api, threadID, message, gifUrl = "") {
  if (!gifUrl) {
    return api.sendMessage(message, threadID);
  }

  try {
    const stream = await axios.get(gifUrl, {
      responseType: "stream",
      timeout: 10000
    });

    return api.sendMessage(
      { body: message, attachment: stream.data },
      threadID
    );
  } catch (e) {
    return api.sendMessage(message, threadID);
  }
}

module.exports.run = async function({ api, event, args, send, Threads, commandName }) {
  const { threadID } = event;
  const targetThread = args[0] || threadID;

  const GIF = {
    invalid: "https://i.ibb.co/C3GHZFqv/9d2881932538.gif",
    alreadyApproved: "https://i.postimg.cc/WzNR3k2C/image-search-1768366819432.gif",
    notApproved: "https://i.ibb.co/3mP8z5Cm/1cf3f10a5642.jpg",
    approved: "https://i.postimg.cc/HLDCgWLd/image-search-1768371152722.gif",
    unapproved: "https://i.ibb.co/mF6Rd738/daf880cb9b59.gif",
    started: "https://i.postimg.cc/HLDCgWLd/image-search-1768371152722.gif",
    stopped: "https://i.ibb.co/3mP8z5Cm/1cf3f10a5642.jpg"
  };

  if (!/^\d+$/.test(targetThread)) {
    return sendWithGif(api, threadID,
`╭───「 ⚠️ 𝐈𝐍𝐕𝐀𝐋𝐈𝐃 」───╮
│
│ ❌ 𝐏𝐥𝐞𝐚𝐬𝐞 𝐩𝐫𝐨𝐯𝐢𝐝𝐞 𝐚
│    𝐯𝐚𝐥𝐢𝐝 𝐆𝐫𝐨𝐮𝐩 𝐈𝐃.
│
╰─────────────────────╯`,
    GIF.invalid);
  }

  const isUnapprove = commandName === 'unapprove' || args[0] === 'unapprove';
  let groupName = 'Unknown Group';

  try {
    const info = await api.getThreadInfo(targetThread);
    groupName = info.threadName || 'Unknown Group';
  } catch {}


  if (isUnapprove) {
    if (!Threads.isApproved(targetThread)) {
      return sendWithGif(api, threadID,
`╭───「 ⚠️ 𝐄𝐑𝐑𝐎𝐑 」───╮
│
│ ❌ 𝐓𝐡𝐢𝐬 𝐠𝐫𝐨𝐮𝐩 𝐢𝐬 𝐧𝐨𝐭
│    𝐢𝐧 𝐚𝐩𝐩𝐫𝐨𝐯𝐞𝐝 𝐥𝐢𝐬𝐭.
│
╰─────────────────────╯`,
      GIF.notApproved);
    }

    await Threads.unapprove(targetThread);

    if (targetThread !== threadID) {
      await sendWithGif(api, targetThread,
`╭───「 ⛔ 𝐒𝐓𝐎𝐏𝐏𝐄𝐃 」───╮
│
│ ❌ এই গ্রুপটি Approve করা হয়নি
│    Approve করতে বস আকাশ এর
│    সাথে যোগাযোগ করুন...!!
│
│ 🔗 m.me/akash.black.fox
│
│ ⚠️ 𝐁𝐨𝐭 𝐒𝐞𝐫𝐯𝐢𝐜𝐞 : 𝐎𝐅𝐅
│
╰─────────────────────╯`,
      GIF.stopped);
    }

    return sendWithGif(api, threadID,
`╭───「 ⛔ 𝐑𝐄𝐌𝐎𝐕𝐄𝐃 」───╮
│
│ 📂 𝐍𝐚𝐦𝐞: ${groupName}
│ 🆔 𝐈𝐃  : ${targetThread}
│ ❌ 𝐒𝐭𝐚𝐭𝐮𝐬: Unapproved
│
╰─────────────────────╯`,
    GIF.unapproved);
  }


  if (Threads.isApproved(targetThread)) {
    return sendWithGif(api, threadID,
`╭───「 ⚠️ 𝐄𝐑𝐑𝐎𝐑 」───╮
│
│ ✅ 𝐓𝐡𝐢𝐬 𝐠𝐫𝐨𝐮𝐩 𝐢𝐬
│    𝐚𝐥𝐫𝐞𝐚𝐝𝐲 𝐚𝐩𝐩𝐫𝐨𝐯𝐞𝐝.
│
╰─────────────────────╯`,
    GIF.alreadyApproved);
  }

  await Threads.approve(targetThread);

  if (targetThread !== threadID) {
    const botName = global.config.BOTNAME || "BLACK-FOX";
    await sendWithGif(api, targetThread,
`╭───「 ✅ 𝐒𝐓𝐀𝐑𝐓𝐄𝐃 」───╮
│
│ 🎉 𝐓𝐡𝐢𝐬 𝐠𝐫𝐨𝐮𝐩 𝐢𝐬 𝐧𝐨𝐰
│    𝐀𝐩𝐩𝐫𝐨𝐯𝐞𝐝!
│
│ 🤖 ${botName} 𝐢𝐬 𝐫𝐞𝐚𝐝𝐲.
│
╰─────────────────────╯`,
    GIF.started);
  }

  return sendWithGif(api, threadID,
`╭───「 ✅ 𝐀𝐏𝐏𝐑𝐎𝐕𝐄𝐃 」───╮
│
│ 📂 𝐍𝐚𝐦𝐞: ${groupName}
│ 🆔 𝐈𝐃  : ${targetThread}
│ 🟢 𝐒𝐭𝐚𝐭𝐮𝐬: Active
│
╰─────────────────────╯`,
  GIF.approved);
};