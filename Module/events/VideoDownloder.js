const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

module.exports = {
    config: {
        name: "autodl",
        eventType: 'message',
        description: 'Auto detect and download videos from FB, IG, TikTok, YouTube',
        author: 'AKASH HASAN',
        version: '1.0.0'
    },

    async run({ api, event }) {
        const { threadID, body, messageID, senderID } = event;
        
        if (!body) return;
        
        const botID = api.getCurrentUserID();
        if (senderID === botID) return;

        const urlPatterns = {
            facebook: [
                /(?:https?:\/\/)?(?:www\.|m\.)?(?:facebook\.com|fb\.watch)\/[^\s]+/gi,
                /(?:https?:\/\/)?(?:www\.|m\.)?fb\.com\/[^\s]+/gi
            ],
            instagram: [
                /(?:https?:\/\/)?(?:www\.|m\.)?instagram\.com\/(?:p|reel|tv|stories)\/[^\s]+/gi,
                /(?:https?:\/\/)?(?:www\.|m\.)?instagr\.am\/[^\s]+/gi
            ],
            tiktok: [
                /(?:https?:\/\/)?(?:www\.|vm\.|vt\.)?tiktok\.com\/[^\s]+/gi,
                /(?:https?:\/\/)?(?:www\.)?tiktok\.com\/@[^\s]+\/video\/[^\s]+/gi,
                /(?:https?:\/\/)?vm\.tiktok\.com\/[^\s]+/gi,
                /(?:https?:\/\/)?vt\.tiktok\.com\/[^\s]+/gi
            ],
            youtube: [
                /(?:https?:\/\/)?(?:www\.|m\.)?(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)[^\s]+/gi,
                /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/[^\s]+/gi
            ]
        };

        function extractCleanUrl(text) {
            const urlRegex = /(https?:\/\/[^\s]+)/gi;
            const urls = text.match(urlRegex);
            
            if (!urls || urls.length === 0) return null;
            
            for (const rawUrl of urls) {
                let url = rawUrl.trim();
                
                url = url.replace(/[.,;!?]+$/, '');
                url = url.replace(/\)$/, '');
                
                if (url.includes('tiktok.com')) {
                    if (url.includes('This post')) {
                        const parts = url.split(' ');
                        for (const part of parts) {
                            if (part.includes('tiktok.com') && part.includes('http')) {
                                url = part;
                                break;
                            }
                        }
                    }
                    
                    try {
                        const urlObj = new URL(url);
                        const essentialParams = new URLSearchParams();
                        if (urlObj.searchParams.has('t')) essentialParams.set('t', urlObj.searchParams.get('t'));
                        if (urlObj.searchParams.has('_d')) essentialParams.set('_d', urlObj.searchParams.get('_d'));
                        
                        urlObj.search = essentialParams.toString();
                        url = urlObj.toString();
                    } catch (e) {}
                }
                
                for (const platform in urlPatterns) {
                    for (const pattern of urlPatterns[platform]) {
                        if (pattern.test(url)) {
                            return {
                                url: url,
                                platform: platform,
                                originalText: text
                            };
                        }
                    }
                }
            }
            
            return null;
        }

        const urlData = extractCleanUrl(body);
        if (!urlData) return;

        const { url, platform } = urlData;
        const NAYAN_API_BASE = "https://nayan-video-downloader.vercel.app";

        const frames = [
            "█▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒ 5%",
            "███▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒ 15%",
            "██████▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒ 30%",
            "██████████▒▒▒▒▒▒▒▒▒▒▒▒ 50%",
            "██████████████▒▒▒▒▒▒▒▒ 70%",
            "██████████████████▒▒▒▒ 85%",
            "██████████████████████ 100%"
        ];

        const platformEmojis = {
            facebook: '📘',
            instagram: '📷', 
            tiktok: '🎵',
            youtube: '📺'
        };

        const platformNames = {
            facebook: '𝐅𝐀𝐂𝐄𝐁𝐎𝐎𝐊',
            instagram: '𝐈𝐍𝐒𝐓𝐀𝐆𝐑𝐀𝐌', 
            tiktok: '𝐓𝐈𝐊𝐓𝐎𝐊',
            youtube: '𝐘𝐎𝐔𝐓𝐔𝐁𝐄'
        };

        const platformName = platformNames[platform] || platform.charAt(0).toUpperCase() + platform.slice(1);
        const emoji = platformEmojis[platform];

        const initialMsg = `╭─────「 ${emoji} ${platformName} 」─────╮
│
│ 🔍 𝐒𝐭𝐚𝐭𝐮𝐬: Link detected...
│
│ ${frames[0]}
│
│ 🎯 𝐏𝐫𝐨𝐜𝐞𝐬𝐬𝐢𝐧𝐠: ${url.substring(0, 40)}...
│
╰─────────────────────╯`;

        let statusMsg;
        try {
            statusMsg = await api.sendMessage(initialMsg, threadID);
        } catch (e) {
            return;
        }

        const maxRetries = 3;

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                const retryMsg = `╭─────「 ${emoji} ${platformName} 」─────╮
│
│ 🔄 𝐀𝐭𝐭𝐞𝐦𝐩𝐭: ${attempt}/${maxRetries}
│
│ ⏳ 𝐒𝐭𝐚𝐭𝐮𝐬: Initializing....
│
│ ${frames[Math.min(attempt, frames.length - 1)]}
│
│ 📎 𝐔𝐑𝐋: ${url.substring(0, 35)}...
│
╰─────────────────────╯`;
                
                await api.editMessage(retryMsg, statusMsg.messageID, threadID);
                
                if (attempt > 1) {
                    await new Promise(r => setTimeout(r, 2000));
                }

                const apiEndpoints = {
                    facebook: '/fb',
                    instagram: '/instagram',
                    tiktok: '/tiktok',
                    youtube: '/ytdown'
                };

                const endpoint = apiEndpoints[platform];
                if (!endpoint) {
                    throw new Error(`Unsupported platform: ${platform}`);
                }

                const updateStep1 = `╭─────「 ${emoji} ${platformName} 」─────╮
│
│ 📊 𝐒𝐓𝐄𝐏 𝟏: Fetching Video Info
│
│ ${frames[2]}
│
│ 📡 𝐂𝐨𝐧𝐧𝐞𝐜𝐭𝐢𝐧𝐠...
│
╰─────────────────────╯`;
                
                await api.editMessage(updateStep1, statusMsg.messageID, threadID);

                const infoResponse = await axios.get(`${NAYAN_API_BASE}${endpoint}`, {
                    params: { url: url },
                    timeout: 30000,
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                        'Accept': 'application/json'
                    }
                });

                if (!infoResponse.data || !infoResponse.data.data) {
                    console.log("API Response:", infoResponse.data);
                    throw new Error("Invalid API response from NAYAN");
                }

                const videoData = infoResponse.data.data;
                let videoUrl = null;
                let title = `${platformName} Video`;

                switch(platform) {
                    case 'facebook':
                        videoUrl = videoData.video || videoData.hd || videoData.sd || videoData.url;
                        title = videoData.title || videoData.caption || title;
                        break;
                    case 'instagram':
                        videoUrl = videoData.url || videoData.video || videoData.videoUrl;
                        title = videoData.caption || videoData.description || title;
                        break;
                    case 'tiktok':
                        videoUrl = videoData.video || videoData.play || videoData.url || videoData.videoUrl;
                        title = videoData.title || videoData.desc || title;
                        break;
                    case 'youtube':
                        videoUrl = videoData.video || videoData.url || videoData.videoUrl;
                        title = videoData.title || title;
                        break;
                }

                if (!videoUrl) {
                    console.log("Video data:", videoData);
                    throw new Error("No video URL found in response");
                }

                const updateStep2 = `╭─────「 ${emoji} ${platformName} 」─────╮
│
│ 📊 𝐒𝐓𝐄𝐏 𝟐: Downloading Video
│
│ 🎬 𝐓𝐢𝐭𝐥𝐞: ${title.substring(0, 30)}...
│
│ ${frames[4]}
│
│ 💾 𝐃𝐨𝐰𝐧𝐥𝐨𝐚𝐝𝐢𝐧𝐠...
│
╰─────────────────────╯`;
                
                await api.editMessage(updateStep2, statusMsg.messageID, threadID);

                const videoResponse = await axios.get(videoUrl, {
                    responseType: 'arraybuffer',
                    timeout: 120000,
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                        'Referer': url.includes('facebook') ? 'https://www.facebook.com/' :
                                  url.includes('instagram') ? 'https://www.instagram.com/' :
                                  url.includes('tiktok') ? 'https://www.tiktok.com/' :
                                  'https://www.youtube.com/'
                    }
                });

                if (!videoResponse.data || videoResponse.data.length < 1000) {
                    throw new Error("Invalid video data received");
                }

                const updateStep3 = `╭─────「 ${emoji} ${platformName}  」─────╮
│
│ 📊 𝐒𝐓𝐄𝐏 𝟑: Saving File
│
│ 📦 𝐒𝐢𝐳𝐞: ${(videoResponse.data.length / 1024 / 1024).toFixed(2)} MB
│
│ ${frames[5]}
│
│ 💿 𝐖𝐫𝐢𝐭𝐢𝐧𝐠 𝐭𝐨 𝐜𝐚𝐜𝐡𝐞...
│
╰─────────────────────╯`;
                
                await api.editMessage(updateStep3, statusMsg.messageID, threadID);

                const cacheDir = path.join(__dirname, "../commands/cache");
                await fs.ensureDir(cacheDir);

                const videoPath = path.join(cacheDir, `${platform}_${Date.now()}.mp4`);
                await fs.writeFile(videoPath, Buffer.from(videoResponse.data));

                const stats = await fs.stat(videoPath);
                const fileSizeMB = (stats.size / 1024 / 1024).toFixed(2);

                if (stats.size > 25 * 1024 * 1024) {
                    await fs.unlink(videoPath);
                    throw new Error(`File too large (${fileSizeMB}MB). Max 25MB`);
                }

                const updateStep4 = `╭─────「 ${emoji} ${platformName} 」─────╮
│
│ 📊 𝐒𝐓𝐄𝐏 𝟒: Uploading to Chat
│
│ 🚀 𝐒𝐭𝐚𝐭𝐮𝐬: Finalizing
│
│ ${frames[6]}
│
│ ⚡ 𝐀𝐥𝐦𝐨𝐬𝐭 𝐝𝐨𝐧𝐞...
│
╰─────────────────────╯`;
                
                await api.editMessage(updateStep4, statusMsg.messageID, threadID);

                const successMsg = `╭─────「 ✅ 𝐂𝐎𝐌𝐏𝐋𝐄𝐓𝐄 」─────╮
│
│ 🎬 𝐓𝐢𝐭𝐥𝐞: ${title.substring(0, 40)}...
│
│ 📦 𝐒𝐢𝐳𝐞: ${fileSizeMB} MB
│
│ ⚡ 𝐐𝐮𝐚𝐥𝐢𝐭𝐲: HD
│
│ 📅 𝐃𝐚𝐭𝐞: ${new Date().toLocaleDateString()}
│
│ 👤 𝐀𝐮𝐭𝐡𝐨𝐫: AKASH HASAN
│
╰─────────────────────╯`;

                await api.sendMessage({
                    body: successMsg,
                    attachment: fs.createReadStream(videoPath)
                }, threadID);

                setTimeout(async () => {
                    try {
                        await api.unsendMessage(statusMsg.messageID);
                        if (await fs.pathExists(videoPath)) {
                            await fs.unlink(videoPath);
                        }
                    } catch (err) {}
                }, 10000);

                return;

            } catch (error) {
                console.log(`Attempt ${attempt} failed for ${platform}:`, error.message);
                
                if (attempt === maxRetries) {
                    const errorMsg = `╭─────「 ❌ 𝐅𝐀𝐈𝐋𝐄𝐃 」─────╮
│
│ ⚠️ 𝐄𝐫𝐫𝐨𝐫: ${error.message.substring(0, 50)}...
│
│ 🔄 𝐓𝐫𝐢𝐞𝐝: ${maxRetries} times
│
│ 🔗 𝐔𝐑𝐋: ${url.substring(0, 35)}...
│
│ 💡 𝐓𝐢𝐩𝐬:
│ • Check if video is available
│ • Try different video
│ • Video might be private
│
╰─────────────────────╯`;
                    
                    try {
                        await api.editMessage(errorMsg, statusMsg.messageID, threadID);
                        
                        setTimeout(async () => {
                            try {
                                await api.unsendMessage(statusMsg.messageID);
                            } catch(e) {}
                        }, 8000);
                    } catch(e) {}
                } else {
                    await new Promise(r => setTimeout(r, 3000));
                }
            }
        }
    },

    onCommand: async function({ api, event, args }) {
        const { threadID, messageID } = event;
        
        if (!args[0]) {
            const helpMsg = `╭───「 📖 𝐀𝐔𝐓𝐎 𝐃𝐎𝐖𝐍𝐋𝐎𝐀𝐃𝐄𝐑 」───╮
│
│ 📌 𝐔𝐬𝐚𝐠𝐞:
│ • Send any video link
│ • Or use: /download [link]
│
│ ✅ 𝐒𝐮𝐩𝐩𝐨𝐫𝐭𝐞𝐝:
│ • Facebook videos
│ • Instagram reels/posts
│ • TikTok videos  
│ • YouTube videos/shorts
│
│ ⚡ 𝐅𝐞𝐚𝐭𝐮𝐫𝐞𝐬:
│ • Auto link detection
│ • Cleans messy URLs
│ • High quality downloads
│
│ 👤 𝐀𝐮𝐭𝐡𝐨𝐫: AKASH HASAN
│
╰─────────────────────╯`;
            
            return api.sendMessage(helpMsg, threadID, messageID);
        }

        const url = args[0];
        this.run({ 
            api, 
            event: { 
                ...event, 
                body: url,
                threadID,
                messageID,
                senderID: event.senderID
            } 
        });
    }
};