module.exports.config = {
    name: "antiout",
    eventType: ["log:unsubscribe"],
    version: "1.0.0",
    credits: "AKASH HASAN",
    description: "Auto add members back (Kick & Admin Check Only)"
};

const axios = require('axios');

module.exports.run = async function({ api, event, Users, Threads }) {
    const { threadID, logMessageData, author } = event;
    const botID = api.getCurrentUserID();
    const leftID = logMessageData.leftParticipantFbId;

    if (leftID === botID) return;

    try {
        const data = (await Threads.getData(threadID)).data || {};
        const userName = await Users.getNameUser(leftID);
        const botName = global.config.BOTNAME || "BLACK-FOX";

        if (data.antiout) {
            
            if (leftID !== author) {
                return; 
            }

            if (global.config.ADMINBOT.includes(leftID)) {
                return;
            }

            const successGif = "https://i.ibb.co/bgQpQ4Z9/015a70eda959.gif";
            const failGif = "https://i.ibb.co/SzP5Lxr/e4843667314e.gif";

            try {
                await api.addUserToGroup([leftID], threadID);
                
                const successMsg = `╭───「 👿 𝐂𝐀𝐔𝐆𝐇𝐓 𝐘𝐎𝐔 」───╮
│
│ 👤 𝐍𝐚𝐦𝐞: ${userName}
│
│ 🗣️ কিরে বলদা আমি ${botName} থাকতে তুই ${userName} পালাতে পারবিনা....//`;

                try {
                    const stream = await axios.get(successGif, { responseType: "stream" });
                    return api.sendMessage({ body: successMsg, attachment: stream.data }, threadID);
                } catch (err) {
                    return api.sendMessage(successMsg, threadID);
                }

            } catch (e) {
                const failMsg = `╭───「 ⚠️ 𝐅𝐀𝐈𝐋𝐄𝐃 」───╮
│
│ 👤 𝐍𝐚𝐦𝐞: ${userName}
│
│ ❌ সরি বস ওর SMS অপসন নেই বা আমায় ব্লক করে দিছে তাই ADD করতে পারিনি....//`;

                try {
                    const stream = await axios.get(failGif, { responseType: "stream" });
                    return api.sendMessage({ body: failMsg, attachment: stream.data }, threadID);
                } catch (err) {
                    return api.sendMessage(failMsg, threadID);
                }
            }
        } 
        
        else {
            let threadInfo;
            try {
                threadInfo = await api.getThreadInfo(threadID);
            } catch {
                threadInfo = { threadName: 'Unknown Group', participantIDs: [] };
            }

            const groupName = threadInfo.threadName || 'Unknown Group';
            const memberCount = threadInfo.participantIDs.length;
            
            const now = new Date();
            const date = now.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
            const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

            const goodbyeMsg = `╭───「 👋 𝐆𝐎𝐎𝐃𝐁𝐘𝐄 」───╮
│
│ 👤 𝐍𝐚𝐦𝐞 : ${userName}
│ 🏚️ 𝐋𝐞𝐟𝐭 : ${groupName}
│ 👥 𝐂𝐨𝐮𝐧𝐭: ${memberCount} Members
│ 🕰️ 𝐓𝐢𝐦𝐞 : ${time}
│ 📅 𝐃𝐚𝐭𝐞 : ${date}
│
│ 🥀 𝘎𝘰𝘰𝘥𝘣𝘺𝘦, তুমি চলে গেলে তাতে আমার বা* ছেরা গেলো....!!`;

            const goodbyeGifs = ['https://gifdb.com/images/high/kakashi-hatake-anime-bye-bye-vv4xg0yxihvsb76h.webp'];

            try {
                const stream = await axios.get(goodbyeGifs[0], { responseType: "stream" });
                api.sendMessage({ body: goodbyeMsg, attachment: stream.data }, threadID);
            } catch (error) {
                api.sendMessage(goodbyeMsg, threadID);
            }
        }

    } catch (err) {
        
    }
};