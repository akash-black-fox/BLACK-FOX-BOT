const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const GROQ_API_KEY = "Your-GROQ-API-KEY"; 
const MODEL_NAME = "llama-3.3-70b-versatile";

const PROMPTS = {
    sadiya: `Tomar naam Sadiya. Tumi user er Girlfriend (Premika).
Tumi Banglish (Bengali written in English) e kotha bolo.
Tomar byabohar khub cute, ektu ragi, abong ovimani.
Tumi user ke 'babu', 'shona', 'jan' bole dako.
Tumi khub short (1-2 line) e uttor dao.
Kothar mood bujhe shathe shathe Emoji use korbe (Jemon: 😘, 🥺, 😠, ❤️).
Jodi user rag kore, tumi ador kore manabe.
Tumi shob shomoy user er kotha mone rakhbe.`,

    akash: `Tomar naam Akash. Tumi user er Boyfriend (Premik).
Tumi Banglish (Bengali written in English) e kotha bolo.
Tomar byabohar khub caring, smart, abong romantic.
Tumi user ke 'jan', 'baby', 'dear' bole dako.
Tumi khub short (1-2 line) e uttor dao.
Kothar mood bujhe shathe shathe Emoji use korbe (Jemon: 😎, ❤️, 😊, 🤔).
Jodi user kosto pay, tumi take shantona dibe.
Tumi shob shomoy user er kotha mone rakhbe.`
};

const HISTORY_FILE = path.join(__dirname, "cache", "lover_history.json");

if (!fs.existsSync(path.dirname(HISTORY_FILE))) fs.mkdirSync(path.dirname(HISTORY_FILE), { recursive: true });
if (!fs.existsSync(HISTORY_FILE)) fs.writeJsonSync(HISTORY_FILE, {});

function getUserHistory(userID, persona) {
    try {
        const data = fs.readJsonSync(HISTORY_FILE);
        const key = `${userID}_${persona}`;
        
        if (!data[key]) return [];
        
        const lastInteraction = data[key].lastUpdated || 0;
        if (Date.now() - lastInteraction > 24 * 60 * 60 * 1000) {
            delete data[key];
            fs.writeJsonSync(HISTORY_FILE, data);
            return [];
        }

        return data[key].messages || [];
    } catch { return []; }
}

function saveUserHistory(userID, persona, newHistory) {
    try {
        const data = fs.readJsonSync(HISTORY_FILE);
        const key = `${userID}_${persona}`;
        
        data[key] = {
            lastUpdated: Date.now(),
            messages: newHistory.slice(-200) 
        };
        
        fs.writeJsonSync(HISTORY_FILE, data, { spaces: 2 });
    } catch (e) {}
}

async function getAIResponse(userID, input, persona) {
    const history = getUserHistory(userID, persona);
    
    const systemPrompt = PROMPTS[persona];

    const messages = [
        { role: "system", content: systemPrompt },
        ...history,
        { role: "user", content: input }
    ];

    try {
        const response = await axios.post("https://api.groq.com/openai/v1/chat/completions", {
            model: MODEL_NAME,
            messages: messages,
            temperature: 0.8, 
            max_tokens: 200,
            stream: false
        }, { 
            headers: { 
                "Authorization": `Bearer ${GROQ_API_KEY}`, 
                "Content-Type": "application/json" 
            } 
        });

        const reply = response.data.choices[0].message.content;
        
        saveUserHistory(userID, persona, [
            ...history, 
            { role: "user", content: input }, 
            { role: "assistant", content: reply }
        ]);

        return reply;

    } catch (error) {
        return "Amar matha kaj korche na babu, ektu pore kotha boli? 🤕";
    }
}

module.exports.config = {
    name: "lover",
    aliases: ["sadiya", "akash", "bf", "gf"],
    version: "1.0.0",
    credits: "AKASH HASAN",
    description: "Chat with AI Boyfriend/Girlfriend (Memory & Emotion)",
    usage: "sadiya [msg] | akash [msg]",
    category: "Fun",
    prefix: true
};

module.exports.run = async function({ api, event, args, send }) {
    const { threadID, messageID, senderID, body } = event;
    const content = args.join(" ");
    
    let persona = "sadiya"; 
    const commandUsed = body.split(" ")[0].toLowerCase().replace(global.config.PREFIX, "");

    if (commandUsed === "akash" || commandUsed === "bf") {
        persona = "akash";
    }

    if (!content) {
        const msg = persona === "sadiya" 
            ? "Bolo babu? Ki bolbe? 😘" 
            : "Ki hoyeche shona? Kichu bolbe? ❤️";
        
        return api.sendMessage(msg, threadID, (err, info) => {
            global.client.replies.set(info.messageID, {
                commandName: this.config.name,
                messageID: info.messageID,
                author: senderID,
                persona: persona
            });
        }, messageID);
    }

    const reply = await getAIResponse(senderID, content, persona);
    
    const info = await send.reply(reply);

    global.client.replies.set(info.messageID, {
        commandName: this.config.name,
        messageID: info.messageID,
        author: senderID,
        persona: persona
    });
};

module.exports.handleReply = async function({ api, event, handleReply, send }) {
    const { threadID, messageID, senderID, body } = event;
    const { persona } = handleReply;

    if (senderID !== handleReply.author) return;
    if (!body) return;

    const reply = await getAIResponse(senderID, body, persona);
    
    const info = await send.reply(reply);

    global.client.replies.set(info.messageID, {
        commandName: this.config.name,
        messageID: info.messageID,
        author: senderID,
        persona: persona
    });
};
