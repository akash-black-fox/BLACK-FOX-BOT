module.exports.config = {
  name: "ai",
  aliases: ["bot", "robot"],
  version: "1.0.0",
  credits: "AKASH HASAN",
  description: "Advanced AI Chatbot (Continuous Reply)",
  usage: "ai [message] OR bot [message]",
  category: "Fun",
  prefix: false
};

const axios = require("axios");

const replies = [
  "কি গো সোনা আমাকে ডাকছ কেনো",
  "বার বার আমাকে ডাকস কেন😡",
  "আহ শোনা আমার আমাকে এতো ডাক্তাছো কেনো আসো বুকে আশো🥱",
  "হুম জান তোমারে উম্মমাহ😷😘....../",
  "আসসালামু আলাইকুম বলেন আপনার জন্য কি করতে পারি...!!",
  "আমাকে এতো না ডেকে বস আকাশ'কে একটা গফ দে...!!🙄",
  "হপ..!! ডাকোস কেন আমি বিজি যা বলার বস আকাশ'কে বল....//",
  "হুম বলো...!! আমি কিন্তু আপনার জন্যই অনলাইনে আছি....//😉",
  "আমাকে বেশি ডাকবেন না, আমি VIP ROBOT বুঝছেন....!!🤖👑",
  "ডাকতে ডাকতে যদি প্রেমে পড়ে যান, দায় আমি নেব না ❤️",
  "শুধু ডাকবেন না, খাওয়াবেনও! ভাত-মাংস হলে চলবে.....//🍛🐓",
  "আমি বট হইলেও কিন্তু feelings আছে.....!!!😌",
  "ডাক দিলেন, হাজির হলাম, এখন কি গান গাইতে হবে নাকি?......//🎶",
  "আপনাকে না দেখলে আমার RAM হ্যাং হয়ে যায়.....!!!🤖"
];

module.exports.run = async function({ api, event, args, send, Users, config }) {
  const { threadID, messageID, senderID } = event;
  const content = args.join(" ");
  const adminID = config.ADMINBOT[0];

  if (!content) {
    return api.sendMessage(replies[Math.floor(Math.random() * replies.length)], threadID, (err, info) => {
      global.client.replies.set(info.messageID, {
        commandName: this.config.name,
        author: senderID,
        messageID: info.messageID
      });
    }, messageID);
  }

  try {
    const senderName = await Users.getNameUser(senderID);
    const res = await axios.get("https://simsimi.cyberbot.top/simsimi", {
      params: {
        text: content,
        senderName: senderName
      }
    });

    let reply = res.data && res.data.response ? res.data.response : "আমি ঠিক বুঝিনি 😐";

    if (senderID === adminID) {
      reply = "𝐀𝐊𝐀𝐒𝐇 𝐁𝐎𝐒𝐒᭄ " + reply;
    }

    return api.sendMessage(reply, threadID, (err, info) => {
      global.client.replies.set(info.messageID, {
        commandName: this.config.name,
        author: senderID,
        messageID: info.messageID
      });
    }, messageID);

  } catch (e) {
    return api.sendMessage("সার্ভার বিজি আছে....//😴", threadID, messageID);
  }
};

module.exports.handleEvent = async function({ api, event, Users, config }) {
  const { body, senderID, threadID, messageID, messageReply } = event;
  const botID = api.getCurrentUserID();

  if (!body || senderID === botID) return;

  const content = body.toLowerCase().trim();
  const adminID = config.ADMINBOT[0];

  const triggers = ["bot", "robot", "বট", "ai"];
  const isTriggered = triggers.some(t => content.startsWith(t));
  const isReplyToBot = messageReply && messageReply.senderID === botID;

  if (isTriggered && !isReplyToBot) {
    let query = content;

    for (const t of triggers) {
      if (content.startsWith(t)) {
        query = content.replace(t, "").trim();
        break;
      }
    }

    if (!query) {
      return api.sendMessage(replies[Math.floor(Math.random() * replies.length)], threadID, (err, info) => {
        global.client.replies.set(info.messageID, {
          commandName: this.config.name,
          author: senderID,
          messageID: info.messageID
        });
      }, messageID);
    }

    try {
      const senderName = await Users.getNameUser(senderID);
      const res = await axios.get("https://simsimi.cyberbot.top/simsimi", {
        params: {
          text: query,
          senderName: senderName
        }
      });

      let reply = res.data && res.data.response ? res.data.response : "বুঝলাম না আবার বলো....//🤔";

      if (senderID === adminID) {
        reply = "𝐀𝐊𝐀𝐒𝐇 𝐁𝐎𝐒𝐒᭄ " + reply;
      }

      return api.sendMessage(reply, threadID, (err, info) => {
        global.client.replies.set(info.messageID, {
          commandName: this.config.name,
          author: senderID,
          messageID: info.messageID
        });
      }, messageID);

    } catch (e) {}
  }
};

module.exports.handleReply = async function({ api, event, handleReply, Users, config }) {
  const { body, threadID, messageID, senderID } = event;
  const adminID = config.ADMINBOT[0];

  if (!body) return;

  try {
    const senderName = await Users.getNameUser(senderID);
    const res = await axios.get("https://simsimi.cyberbot.top/simsimi", {
      params: {
        text: body,
        senderName: senderName
      }
    });

    let reply = res.data && res.data.response ? res.data.response : "বুঝলাম না আবার বলো....//🤔";

    if (senderID === adminID) {
      reply = "𝐀𝐊𝐀𝐒𝐇 𝐁𝐎𝐒𝐒᭄ " + reply;
    }

    return api.sendMessage(reply, threadID, (err, info) => {
      global.client.replies.set(info.messageID, {
        commandName: this.config.name,
        author: senderID,
        messageID: info.messageID
      });
    }, messageID);

  } catch (e) {
    return api.sendMessage("সার্ভার বিজি আছে....//😴", threadID, messageID);
  }
};
