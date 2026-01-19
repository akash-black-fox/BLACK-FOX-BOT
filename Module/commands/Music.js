const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const yts = require('yt-search');

const musicCache = new Map();

module.exports.config = {
    name: "music",
    version: "1.0.0",
    permission: 0,
    prefix: true,
    premium: false,
    category: "Media",
    credits: "AKASH HASAN",
    description: "Download music from YouTube",
    commandCategory: "Media",
    usages: "music [song name]",
    cooldowns: 5
};

module.exports.run = async function ({ api, event, args, send }) {
    const threadID = event.threadID;
    const userID = event.senderID;
    const cacheKey = `${threadID}_${userID}`;

    if (args.length === 0) {
        return send.reply(`╭───「 🎵 𝐌𝐔𝐒𝐈𝐂 」───╮
│
│ 🎧 Usage: ${config.PREFIX}music [song name]
│
│ 📝 Example: ${config.PREFIX}music shape of you
│
╰─────────────────────╯`);
    }

    const input = args.join(" ").trim();

    if (/^[1-9]|10$/.test(input)) {
        const selectedNum = parseInt(input);
        
        if (!musicCache.has(cacheKey)) {
            return send.reply(`╭───「 ⚠️ 𝐄𝐑𝐑𝐎𝐑 」───╮
│
│ ❌ No selection list found!
│ First search for a song
│
│ 👉 ${config.PREFIX}music [song name]
│
╰─────────────────────╯`);
        }

        const songData = musicCache.get(cacheKey);
        
        if (!songData.songs || !songData.songs[selectedNum - 1]) {
            musicCache.delete(cacheKey);
            return send.reply(`╭───「 ⚠️ 𝐄𝐑𝐑𝐎𝐑 」───╮
│
│ ❌ Selection expired!
│ Search again
│
╰─────────────────────╯`);
        }

        const selectedSong = songData.songs[selectedNum - 1];
        musicCache.delete(cacheKey);
        return await processSelectedSong(api, event, selectedSong, send, userID);
    }

    return await searchSongs(api, event, input, send, userID);
};

function wrapText(text, maxLength) {
    const words = text.split(' ');
    const lines = [];
    let currentLine = '';

    for (const word of words) {
        if ((currentLine + ' ' + word).length > maxLength) {
            if (currentLine) lines.push(currentLine);
            currentLine = word;
        } else {
            currentLine += (currentLine ? ' ' : '') + word;
        }
    }
    
    if (currentLine) {
        lines.push(currentLine);
    }
    
    return lines;
}

async function searchSongs(api, event, query, send, userID) {
    const threadID = event.threadID;
    const cacheKey = `${threadID}_${userID}`;
    
    const frames = ["▒▒▒▒▒▒▒▒▒▒ 0%", "██▒▒▒▒▒▒▒▒ 20%", "████▒▒▒▒▒▒ 40%", "██████▒▒▒▒ 60%", "████████▒▒ 80%", "██████████ 100%"];
    
    const searchMsg = await send.reply(`╭───「 🔍 𝐒𝐄𝐀𝐑𝐂𝐇𝐈𝐍𝐆 」───╮
│
│ 🔎 Searching: "${query}"
│ ${frames[0]}
│
╰─────────────────────╯`);

    try {
        const searchResults = await yts(query);
        const videos = searchResults.videos;
        
        if (!videos || videos.length === 0) {
            api.unsendMessage(searchMsg.messageID);
            return send.reply(`╭───「 ❌ 𝟒𝟎𝟒 」───╮
│
│ ⚠️ No song found!
│ Check spelling
│
╰─────────────────────╯`);
        }

        const topSongs = videos.slice(0, 10);
        
        let songListMessage = `╭───「 🎵 𝐂𝐇𝐎𝐎𝐒𝐄 𝐀 𝐒𝐎𝐍𝐆 」───╮
│
│ 🔍 Search: "${query}"
│ 📊 Found: ${videos.length} results
│
│ 📋 Song List (1-10):
│`;
        
        topSongs.forEach((song, index) => {
            const wrappedTitle = wrapText(song.title, 28);
            
            songListMessage += `
│ ${index + 1}️⃣ ${wrappedTitle[0]}`;
            
            for (let i = 1; i < wrappedTitle.length; i++) {
                songListMessage += `
│    ${wrappedTitle[i]}`;
            }
            
            songListMessage += `
│`;
        });
        
        songListMessage += `
│
│ 🎯 Instructions:
│ Select by number: ${config.PREFIX}music [1-10]
│ Example: ${config.PREFIX}music 7
│
│ ⏳ Select within 2 minutes
╰─────────────────────╯`;

        const songData = {
            timestamp: Date.now(),
            query: query,
            songs: topSongs.map(song => ({
                url: song.url,
                title: song.title,
                author: song.author.name,
                duration: song.timestamp,
                thumbnail: song.thumbnail
            }))
        };
        
        musicCache.set(cacheKey, songData);
        
        setTimeout(() => {
            if (musicCache.has(cacheKey)) {
                musicCache.delete(cacheKey);
            }
        }, 120000);

        await api.editMessage(songListMessage, searchMsg.messageID, threadID);

    } catch (error) {
        try {
            api.unsendMessage(searchMsg.messageID);
        } catch (e) {}
        
        return send.reply(`╭───「 ⚠️ 𝐄𝐑𝐑𝐎𝐑 」───╮
│
│ ❌ Search failed!
│ ${error.message || 'Unknown error'}
│
│ 🔄 Try again...
╰─────────────────────╯`);
    }
}

async function processSelectedSong(api, event, song, send, userID) {
    const threadID = event.threadID;
    const frames = ["▒▒▒▒▒▒▒▒▒▒ 0%", "██▒▒▒▒▒▒▒▒ 20%", "████▒▒▒▒▒▒ 40%", "██████▒▒▒▒ 60%", "████████▒▒ 80%", "██████████ 100%"];
    
    const processingMsg = await send.reply(`╭───「 ⏳ 𝐏𝐑𝐎𝐂𝐄𝐒𝐒𝐈𝐍𝐆 」───╮
│
│ 🎵 "${song.title.slice(0, 25)}..."
│ 🔄 Preparing download...
│ ${frames[0]}
│
╰─────────────────────╯`);

    try {
        const videoUrl = song.url;
        const title = song.title;
        const author = song.author;
        const duration = song.duration;
        const thumbnail = song.thumbnail;

        await api.editMessage(`╭───「 📥 𝐅𝐎𝐔𝐍𝐃 」───╮
│
│ ✅ Song selected!
│ 🔄 Processing link...
│ ${frames[2]}
│
╰─────────────────────╯`, processingMsg.messageID, threadID);

        const nayanApiUrl = `https://nayan-video-downloader.vercel.app/ytdown?url=${encodeURIComponent(videoUrl)}`;
        let downloadUrl = null;

        try {
            const nayanResponse = await axios.get(nayanApiUrl, { timeout: 15000 });
            
            if (nayanResponse.data && nayanResponse.data.data && nayanResponse.data.data.audio) {
                downloadUrl = nayanResponse.data.data.audio;
            } else if (nayanResponse.data && nayanResponse.data.audio) {
                downloadUrl = nayanResponse.data.audio;
            } else if (nayanResponse.data && nayanResponse.data.download) {
                downloadUrl = nayanResponse.data.download;
            }
        } catch (error) {
            throw new Error("API failed");
        }

        if (!downloadUrl) {
            throw new Error("Download link not found");
        }

        await api.editMessage(`╭───「 📥 𝐃𝐎𝐖𝐍𝐋𝐎𝐀𝐃𝐈𝐍𝐆 」───╮
│
│ ✅ Got link from BLACK FOX!
│ 📥 Downloading file...
│ ${frames[4]}
│
╰─────────────────────╯`, processingMsg.messageID, threadID);

        const cacheDir = path.join(__dirname, "cache");
        if (!fs.existsSync(cacheDir)) {
            fs.mkdirSync(cacheDir, { recursive: true });
        }
        
        const audioPath = path.join(cacheDir, `${Date.now()}_${userID}_music.mp3`);
        const thumbPath = path.join(cacheDir, `${Date.now()}_${userID}_thumb.jpg`);

        try {
            const thumbResponse = await axios.get(thumbnail, { 
                responseType: 'arraybuffer', 
                timeout: 10000 
            });
            fs.writeFileSync(thumbPath, Buffer.from(thumbResponse.data));
        } catch (err) {}

        const response = await axios.get(downloadUrl, {
            responseType: 'arraybuffer',
            timeout: 60000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });
        
        fs.writeFileSync(audioPath, Buffer.from(response.data));

        const stat = fs.statSync(audioPath);
        
        if (stat.size < 1024) {
            fs.unlinkSync(audioPath);
            if (fs.existsSync(thumbPath)) fs.unlinkSync(thumbPath);
            api.unsendMessage(processingMsg.messageID);
            throw new Error("Empty file");
        }

        if (stat.size > 26214400) {
            fs.unlinkSync(audioPath);
            if (fs.existsSync(thumbPath)) fs.unlinkSync(thumbPath);
            api.unsendMessage(processingMsg.messageID);
            throw new Error("File too large");
        }

        if (fs.existsSync(thumbPath)) {
            await api.sendMessage({
                body: `╭───「 🎵 𝐒𝐄𝐋𝐄𝐂𝐓𝐄𝐃 𝐌𝐔𝐒𝐈𝐂 」───╮
│
│ 🎧 𝐓𝐢𝐭𝐥𝐞: ${title}
│ 🎤 𝐀𝐫𝐭𝐢𝐬𝐭: ${author}
│ ⏰ 𝐓𝐢𝐦𝐞: ${duration}
│ 📦 𝐒𝐢𝐳𝐞: ${(stat.size / 1024 / 1024).toFixed(2)} MB
│ 👤 𝐔𝐬𝐞𝐫: ${userID}
│
│ </> 𝐀𝐮𝐭𝐡𝐨𝐫: 𝐀𝐊𝐀𝐒𝐇 𝐇𝐀𝐒𝐀𝐍
╰─────────────────────╯`,
                attachment: fs.createReadStream(thumbPath)
            }, threadID);
        } else {
            await api.sendMessage({
                body: `╭───「 🎵 𝐒𝐄𝐋𝐄𝐂𝐓𝐄𝐃 𝐌𝐔𝐒𝐈𝐂 」───╮
│
│ 🎧 𝐓𝐢𝐭𝐥𝐞: ${title}
│ 🎤 𝐀𝐫𝐭𝐢𝐬𝐭: ${author}
│ ⏰ 𝐓𝐢𝐦𝐞: ${duration}
│ 📦 𝐒𝐢𝐳𝐞: ${(stat.size / 1024 / 1024).toFixed(2)} MB
│ 👤 𝐔𝐬𝐞𝐫: ${userID}
│
│ </> 𝐀𝐮𝐭𝐡𝐨𝐫: 𝐀𝐊𝐀𝐒𝐇 𝐇𝐀𝐒𝐀𝐍
╰─────────────────────╯`
            }, threadID);
        }

        await api.sendMessage({
            attachment: fs.createReadStream(audioPath)
        }, threadID, (err) => {
            if (fs.existsSync(audioPath)) fs.unlinkSync(audioPath);
            if (fs.existsSync(thumbPath)) fs.unlinkSync(thumbPath);
            api.unsendMessage(processingMsg.messageID);
            if (err) {
                send.reply(`╭───「 ⚠️ 𝐄𝐑𝐑𝐎𝐑 」───╮
│
│ ❌ Failed to send audio!
│ ${err.message}
│
╰─────────────────────╯`);
            }
        });

    } catch (error) {
        try {
            api.unsendMessage(processingMsg.messageID);
        } catch (e) {}
        
        return send.reply(`╭───「 ⚠️ 𝐄𝐑𝐑𝐎𝐑 」───╮
│
│ ❌ Failed to process song!
│ ${error.message || 'Unknown error'}
│
│ 🔄 Try another song...
╰─────────────────────╯`);
    }
}