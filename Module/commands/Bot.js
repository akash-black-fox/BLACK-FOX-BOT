const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');


const API_KEYS = ['csk-tvwj69tef4vwywxh3nrxkwhwv8hy93tr6tv695ydvkrcv6yd']; 

const CEREBRAS_API_URL = 'https://api.cerebras.ai/v1/chat/completions';

const BOY_OWNERS = {
  '100071539569680': { name: 'AKASH', gender: 'boy' }
};

const GIRL_OWNERS = {
  // 'UID': { name: 'Name', gender: 'girl' } 
};

const BOT_NAME = 'BLACK FOX';



const CACHE_DIR = path.join(__dirname, 'cache');
const CHAT_HISTORY_FILE = path.join(CACHE_DIR, 'chat_history.json');
const USER_DATA_FILE = path.join(CACHE_DIR, 'user_data.json');
const MAX_HISTORY = 10;

let userData = {};


const GIRL_NAMES = ['fatima', 'ayesha', 'sara', 'nila', 'sumaiya', 'tanisha', 'mim', 'sadia', 'faria'];
const BOY_NAMES = ['akash', 'rahim', 'karim', 'shuvo', 'sagor', 'fahim', 'tanvir', 'hasan'];

function detectGender(name) {
  if (!name) return 'unknown';
  const cleanName = name.toLowerCase();
  
  if (GIRL_NAMES.some(n => cleanName.includes(n))) return 'girl';
  if (BOY_NAMES.some(n => cleanName.includes(n))) return 'boy';
  
  return 'unknown';
}

async function loadUserData() {
  try {
    await fs.ensureDir(CACHE_DIR);
    if (await fs.pathExists(USER_DATA_FILE)) {
      userData = await fs.readJson(USER_DATA_FILE);
    }
  } catch (err) { userData = {}; }
}

async function saveUserData() {
  try {
    await fs.writeJson(USER_DATA_FILE, userData, { spaces: 2 });
  } catch (err) {}
}

function getUserInfo(userID) { return userData[userID] || null; }

function setUserInfo(userID, name, gender) {
  userData[userID] = { name, gender, lastSeen: Date.now() };
  saveUserData();
}

function isOwner(userID) { return BOY_OWNERS[userID] || GIRL_OWNERS[userID]; }


function getPersona(userName, isOwnerUser, ownerGender) {
  if (isOwnerUser) {
    const title = ownerGender === 'girl' ? 'Malkin' : '𝐁𝐎𝐒𝐒᭄ ';
    return `You are ${BOT_NAME}, an advanced AI assistant created by Akash Hasan.
    You are talking to your OWNER (${userName}). Call them "${title}".
    Always be respectful, obedient, and loyal to them. 
    Use Bengali/English mix (Banglish). Use emojis.
    Never argue with the owner.`;
  } else {
    return `You are ${BOT_NAME}, a friendly and funny AI chatbot.
    You are talking to ${userName}.
    Be helpful but sometimes funny and savage.
    Use Bengali/English mix (Banglish). Use emojis.
    If they ask about your creator, say "AKASH HASAN".`;
  }
}

async function getChatHistory(userID) {
  try {
    if (await fs.pathExists(CHAT_HISTORY_FILE)) {
      const data = await fs.readJson(CHAT_HISTORY_FILE);
      return data[userID] || [];
    }
  } catch (err) {}
  return [];
}

async function saveChatHistory(userID, history) {
  try {
    let allHistory = {};
    if (await fs.pathExists(CHAT_HISTORY_FILE)) {
      allHistory = await fs.readJson(CHAT_HISTORY_FILE);
    }
    allHistory[userID] = history.slice(-MAX_HISTORY);
    await fs.writeJson(CHAT_HISTORY_FILE, allHistory, { spaces: 2 });
  } catch (err) {}
}

async function getAIResponse(userMessage, chatHistory, userName, userID) {
  const apiKey = API_KEYS[Math.floor(Math.random() * API_KEYS.length)];
  
 
  if (!apiKey || apiKey === 'YOUR_CEREBRAS_API_KEY_HERE') {
    return `API Key set kora nai boss! Config check koren. 😅`;
  }

  const ownerInfo = isOwner(userID);
  const persona = getPersona(userName, !!ownerInfo, ownerInfo?.gender);

  const messages = [
    { role: "system", content: persona },
    ...chatHistory,
    { role: "user", content: userMessage }
  ];

  try {
    const response = await axios.post(
      CEREBRAS_API_URL,
      {
        messages: messages,
        model: "llama-3.3-70b",
        max_completion_tokens: 150,
        temperature: 0.9
      },
      {
        headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" }
      }
    );

    return response.data?.choices?.[0]?.message?.content || "Server busy ache, pore try koro!";
  } catch (error) {
    console.error("AI Error:", error.message);
    return "Ektu somossa hocche, pore kotha boli? 🤒";
  }
}

module.exports = {
  config: {
    name: 'ai',
    aliases: ['bot', 'chat', 'gpt'],
    version: '1.0.0',
    author: 'AKASH HASAN',
    description: 'Smart AI Chatbot',
    usage: 'ai [message]',
    category: 'Utility',
    prefix: false,
    cooldowns: 5
  },

  async run({ api, event, send, Users }) {
    const { threadID, senderID, body, messageID } = event;
    if (!body) return;

    
    const trigger = new RegExp(`^(${BOT_NAME}|bot|fox)\\s*`, 'i');
    if (!trigger.test(body)) return;

    const userMessage = body.replace(trigger, '').trim();
    
    if (!userMessage) {
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
        const randomReply = replies[Math.floor(Math.random() * replies.length)];
        return send.reply(randomReply);
    }

    api.setMessageReaction("⏳", messageID, () => {}, true);

    let userName = await Users.getNameUser(senderID);
    let history = await getChatHistory(senderID);

    const reply = await getAIResponse(userMessage, history, userName, senderID);

    history.push({ role: "user", content: userMessage });
    history.push({ role: "assistant", content: reply });
    await saveChatHistory(senderID, history);

    api.setMessageReaction("✅", messageID, () => {}, true);
    

    api.sendMessage(reply, threadID, messageID);
  },

  
  async handleReply({ api, event, send, Users }) {
    const { threadID, senderID, body, messageID } = event;
    if (!body) return;

    api.setMessageReaction("⏳", messageID, () => {}, true);

    let userName = await Users.getNameUser(senderID);
    let history = await getChatHistory(senderID);

    const reply = await getAIResponse(body, history, userName, senderID);

    history.push({ role: "user", content: body });
    history.push({ role: "assistant", content: reply });
    await saveChatHistory(senderID, history);

    api.setMessageReaction("✅", messageID, () => {}, true);
    
  
    const info = await api.sendMessage(reply, threadID, messageID);
    
    global.client.handleReply.push({
      name: this.config.name,
      messageID: info.messageID,
      author: senderID
    });
  }
};

loadUserData();