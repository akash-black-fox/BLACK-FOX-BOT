const fs = require('fs-extra');
const path = require('path');
const axios = require('axios');
const moment = require('moment-timezone');

const MESSAGE_LOG_FILE = path.join(__dirname, 'cache', 'message_log.json');
const RESEND_SETTINGS_FILE = path.join(__dirname, 'cache', 'resend_settings.json');

let messageLog = {};
let resendSettings = {};

async function loadMessageLog() {
    try {
        await fs.ensureDir(path.join(__dirname, 'cache'));
        if (await fs.pathExists(MESSAGE_LOG_FILE)) {
            messageLog = await fs.readJson(MESSAGE_LOG_FILE);
        }
    } catch (err) {
        messageLog = {};
    }
}

async function saveMessageLog() {
    try {
        await fs.ensureDir(path.join(__dirname, 'cache'));
        await fs.writeJson(MESSAGE_LOG_FILE, messageLog, { spaces: 2 });
    } catch (err) {}
}

async function loadResendSettings() {
    try {
        await fs.ensureDir(path.join(__dirname, 'cache'));
        if (await fs.pathExists(RESEND_SETTINGS_FILE)) {
            resendSettings = await fs.readJson(RESEND_SETTINGS_FILE);
        }
    } catch (err) {
        resendSettings = {};
    }
}

async function saveResendSettings() {
    try {
        await fs.ensureDir(path.join(__dirname, 'cache'));
        await fs.writeJson(RESEND_SETTINGS_FILE, resendSettings, { spaces: 2 });
    } catch (err) {}
}

loadMessageLog();
loadResendSettings();

setInterval(() => {
    const now = Date.now();
    const maxAge = 30 * 60 * 1000;
    let changed = false;
    
    for (const msgId in messageLog) {
        if (now - messageLog[msgId].timestamp > maxAge) {
            delete messageLog[msgId];
            changed = true;
        }
    }
    
    if (changed) saveMessageLog();
}, 5 * 60 * 1000);

module.exports.config = {
    name: "resend",
    version: "1.0.0",
    author: "AKASH HASAN",
    description: "Resends unsent messages automatically",
    permission: 1,
    prefix: true,
    category: "System",
    usages: "resend [on/off]",
    cooldowns: 0
};

module.exports.run = async function ({ api, event, args }) {
    const { threadID } = event;
    
    await loadResendSettings();
    
    if (args[0]) {
        const arg = args[0].toLowerCase();
        if (arg === 'on') {
            resendSettings[threadID] = true;
            await saveResendSettings();
            return api.sendMessage(`╭───「 𝐒𝐄𝐂𝐔𝐑𝐈𝐓𝐘 」───╮
│
│ 🔓 𝐑𝐞𝐬𝐞𝐧𝐝 : 𝐄𝐧𝐚𝐛𝐥𝐞𝐝
│ ✅ মেসেজ ডিলিট করলেই
│    ধরা খাবে...!!
│
╰─────────────────────╯`, threadID);
        } else if (arg === 'off') {
            resendSettings[threadID] = false;
            await saveResendSettings();
            return api.sendMessage(`╭───「 𝐒𝐄𝐂𝐔𝐑𝐈𝐓𝐘 」───╮
│
│ 🔒 𝐑𝐞𝐬𝐞𝐧𝐝 : 𝐃𝐢𝐬𝐚𝐛𝐥𝐞𝐝
│ ❌ এখন মেসেজ ডিলিট
│    করলে ধরা খাবে না।
│
╰─────────────────────╯`, threadID);
        }
    }
    
    const status = resendSettings[threadID] !== false ? "𝐄𝐧𝐚𝐛𝐥𝐞𝐝 ✅" : "𝐃𝐢𝐬𝐚𝐛𝐥𝐞𝐝 ❌";
    
    return api.sendMessage(`╭───「 𝐒𝐓𝐀𝐓𝐔𝐒 」───╮
│
│ ⚙️ 𝐂𝐮𝐫𝐫𝐞𝐧𝐭 : ${status}
│
│ ➤ resend on
│ ➤ resend off
│
╰─────────────────────╯`, threadID);
};

module.exports.logMessage = async function (messageID, content, attachments, senderID, threadID) {
    messageLog[messageID] = {
        content: content || '',
        attachments: attachments || [],
        senderID,
        threadID,
        timestamp: Date.now()
    };
    
    if (Object.keys(messageLog).length > 500) {
        const entries = Object.entries(messageLog);
        entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
        const toRemove = entries.slice(0, 100);
        for (const [id] of toRemove) {
            delete messageLog[id];
        }
    }
    saveMessageLog();
};

module.exports.handleUnsend = async function (api, event, Users) {
    const { threadID, messageID, senderID } = event;
    
    await loadResendSettings();
    if (resendSettings[threadID] === false) return;
    
    await loadMessageLog();
    const savedMsg = messageLog[messageID];
    if (!savedMsg) return;
    
    let senderName = 'Unknown';
    try {
        senderName = await Users.getNameUser(senderID);
    } catch (err) {}
    
    const time = moment().tz('Asia/Dhaka').format('h:mm A');
    
    const cacheDir = path.join(__dirname, 'cache');
    await fs.ensureDir(cacheDir);
    
    if (!savedMsg.attachments || savedMsg.attachments.length === 0) {
        await api.sendMessage(`╭───「 𝐔𝐍𝐒𝐄𝐍𝐃 𝐃𝐄𝐓𝐄𝐂𝐓 」───╮
│
│ 👤 𝐍𝐚𝐦𝐞 : ${senderName}
│ 🕒 𝐓𝐢𝐦𝐞 : ${time}
│
╰─────────────────────╯
📩 𝐌𝐞𝐬𝐬𝐚𝐠𝐞 :
${savedMsg.content || 'Empty Message'}

মুছে দিলেই কি পার পাবি? আমি তো সব দেখে ফেলেছি...!! 👀🐸`, threadID);
    } else {
        const attachmentStreams = [];
        let num = 0;
        
        for (const att of savedMsg.attachments) {
            if (att.url) {
                try {
                    num++;
                    const response = await axios.get(att.url, { 
                        responseType: 'arraybuffer',
                        timeout: 30000
                    });
                    
                    let ext = 'jpg';
                    if (att.type === 'video') ext = 'mp4';
                    else if (att.type === 'audio') ext = 'mp3';
                    else if (att.type === 'animated_image') ext = 'gif';
                    
                    const filePath = path.join(cacheDir, `resend_${num}_${Date.now()}.${ext}`);
                    await fs.writeFile(filePath, Buffer.from(response.data));
                    attachmentStreams.push(fs.createReadStream(filePath));
                    
                    setTimeout(() => {
                        try { fs.unlinkSync(filePath); } catch (e) {}
                    }, 60000);
                } catch (err) {}
            }
        }
        
        const contentMsg = savedMsg.content ? `\n📝 𝐂𝐚𝐩𝐭𝐢𝐨𝐧 : ${savedMsg.content}` : '';
        
        await api.sendMessage({
            body: `╭───「 𝐔𝐍𝐒𝐄𝐍𝐃 𝐃𝐄𝐓𝐄𝐂𝐓 」───╮
│
│ 👤 𝐍𝐚𝐦𝐞 : ${senderName}
│ 🕒 𝐓𝐢𝐦𝐞 : ${time}
│ 📎 𝐅𝐢𝐥𝐞𝐬 : ${savedMsg.attachments.length} Attachments
│
╰─────────────────────╯${contentMsg}

চুরি করে মেসেজ ডিলিট? ধরা খেয়ে গেলি তো...!! 😹🔥`,
            attachment: attachmentStreams.length > 0 ? attachmentStreams : undefined
        }, threadID);
    }
    
    delete messageLog[messageID];
    saveMessageLog();
};