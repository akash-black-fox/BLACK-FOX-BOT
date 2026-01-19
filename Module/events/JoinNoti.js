module.exports.config = {
    name: "joinNoti",
    eventType: ["log:subscribe"],
    version: "1.0.0",
    credits: "AKASH HASAN",
    description: "Send message when bot joins group"
};

const axios = require('axios');
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

module.exports.run = async function({ api, event }) {
    const { threadID } = event;
    
    if (event.logMessageData.addedParticipants.some(i => i.userFbId == api.getCurrentUserID())) {
        const botnick = global.config.BOTNICK || `{ ${global.config.PREFIX} } × ${global.config.BOTNAME || "BLACK-FOX"}`;
        
        try {
            await api.changeNickname(botnick, threadID, api.getCurrentUserID());
        } catch (e) {
            
        }
        
        const msg1 = "🔄 𝐁𝐋𝐀𝐂𝐊 𝐅𝐎𝐗 𝐂𝐨𝐧𝐧𝐞𝐜𝐭𝐢𝐧𝐠...";
        const msgFull = "▰▰▰▰▰▰▰▰▰▰ 𝟏𝟎𝟎%";
        const finalMsg = "✅ 𝐁𝐋𝐀𝐂𝐊 𝐅𝐎𝐗 𝐁𝐎𝐓 𝐂𝐨𝐧𝐧𝐞𝐜𝐭𝐞𝐝 𝐒𝐮𝐜𝐜𝐞𝐬𝐬𝐟𝐮𝐥𝐥𝐲!";

        api.sendMessage(msg1, threadID, async (err, info) => {
            if (err) return;
            const msgID = info.messageID;

            await sleep(3000); 
            await api.editMessage(msgFull, msgID);
            
            await sleep(2000); 
            await api.editMessage(finalMsg, msgID);

            await sleep(3000);

            const welcomeGif = "https://i.postimg.cc/ZqQQ0BRK/GIF-20260112-200102-547.gif"; 
            
            const welcomeText = `
╔════════════════════╗
║            🦊 𝐖𝐄𝐋𝐂𝐎𝐌𝐄 🦊          ║
╚════════════════════╝

✨ ❝ আসসালামু আলাইকুম ❞ ✨

• কেমন আছেন সবাই? আশা করি সবাই ভালো আছেন। আমি 𝐁𝐋𝐀𝐂𝐊 𝐅𝐎𝐗 𝐁𝐎𝐓.
• আমার ভিতর ভালো খারাপ সব কিছু আছে, আপনি যেমন ব্যবহার করবেন আমার আচরন তেমন হবে।
• ভুল করে কারো সাথে খারাপ আচরন করলে ক্ষমা সুন্দর দৃষ্টিতে দেখবেন, আমি রোবট বুঝতে পারিনা।
• সো আনলিমিটেড মজা হবে সবার সাথে আশা করি! 🤗

╭─── 🎮 𝐇𝐨𝐰 𝐓𝐨 𝐔𝐬𝐞 ───╮
│
│ ➤ ${global.config.PREFIX}admin
│ ➤ ${global.config.PREFIX}help
│ ➤ ${global.config.PREFIX}help all
│
╰─────────────────────╯

╭─── 👑 𝐀𝐝𝐦𝐢𝐧 𝐈𝐧𝐟𝐨 ────╮
│
│ 👤 Author   : AKASH HASAN
│ 🌐 Facebook : AKASH HASAN 🩷🪽
│ 📞 WhatsApp : +8801980871152
│ 📧 Email    : akash.max4x@gmail.com
│
╰─────────────────────╯`;

            try {
                const response = await axios.get(welcomeGif, { responseType: "stream" });
                await api.sendMessage({
                    body: welcomeText,
                    attachment: response.data
                }, threadID);
            } catch (e) {
                await api.sendMessage(welcomeText, threadID);
            }
        });
    }
}