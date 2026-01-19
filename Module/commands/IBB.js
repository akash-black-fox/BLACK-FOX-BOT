const axios = require('axios');

module.exports.config = {
  name: "ibb",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "AKASH HASAN",
  description: "Upload multiple images to ImgBB and get links",
  commandCategory: "Utility",
  usages: "[reply to one or more images]",
  cooldowns: 5
};

module.exports.run = async ({ api, event }) => {
  try {
    if (!event.messageReply || !event.messageReply.attachments || event.messageReply.attachments.length === 0) {
      return api.sendMessage(`╭───「 ⚠️ 𝐄𝐑𝐑𝐎𝐑 」───╮
│
│ ❌ Please reply to one or more images!
│
│ 📌 Usage: Reply to images with .ibb
│
╰─────────────────────╯`, event.threadID, event.messageID);
    }

    const apiKey = 'e17a15dd6af452cbe53747c0b2b0866d';
    const uploadUrl = 'https://api.imgbb.com/1/upload';
    const uploadedUrls = [];
    const attachments = event.messageReply.attachments;
    const totalImages = attachments.length;

    let loadingMsg = await api.sendMessage(`╭───「 ⏳ 𝐔𝐏𝐋𝐎𝐀𝐃𝐈𝐍𝐆 」───╮
│
│ 📤 Total: ${totalImages} image(s)
│ ▰▱▱▱▱▱▱▱▱▱ 10%
│
│ 🔄 Processing...
│
╰─────────────────────╯`, event.threadID);

    for (let i = 0; i < totalImages; i++) {
      const attachment = attachments[i];
      const progress = Math.floor(((i + 1) / totalImages) * 100);
      const progressBar = "▰".repeat(Math.floor(progress / 10)) + "▱".repeat(10 - Math.floor(progress / 10));
      
      try {
        await api.editMessage(`╭───「 ⏳ 𝐔𝐏𝐋𝐎𝐀𝐃𝐈𝐍𝐆 」───╮
│
│ 📤 Total: ${totalImages} image(s)
│ ${progressBar} ${progress}%
│
│ 🖼️ Image ${i + 1}/${totalImages}
│ 📊 Status: Uploading...
│
╰─────────────────────╯`, loadingMsg.messageID, event.threadID);

        const response = await axios.get(attachment.url, { 
          responseType: 'arraybuffer',
          timeout: 30000 
        });
        
        const imageBuffer = Buffer.from(response.data, 'binary');
        const base64Image = imageBuffer.toString('base64');

        const formData = new URLSearchParams();
        formData.append('key', apiKey);
        formData.append('image', base64Image);

        const uploadResponse = await axios.post(uploadUrl, formData, {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          timeout: 30000
        });

        uploadedUrls.push({
          url: uploadResponse.data.data.url,
          success: true,
          index: i + 1
        });

      } catch (err) {
        console.error('Error uploading image:', err);
        uploadedUrls.push({
          url: `❌ Failed to upload image ${i + 1}`,
          success: false,
          index: i + 1
        });
      }
    }

    const successCount = uploadedUrls.filter(url => url.success).length;
    const failedCount = uploadedUrls.filter(url => !url.success).length;

    let message = `╭───「 ✅ 𝐂𝐎𝐌𝐏𝐋𝐄𝐓𝐄 」───╮
│
│ 📊 Total: ${totalImages} image(s)
│ ✅ Success: ${successCount}
│ ⚠️ Failed: ${failedCount}
│
╰─────────────────────╯

`;

    uploadedUrls.forEach((item) => {
      if (item.success) {
        const shortUrl = item.url.length > 50 ? item.url.substring(0, 47) + '...' : item.url;
        message += `🔗 Image ${item.index}: ${shortUrl}\n`;
      } else {
        message += `❌ Image ${item.index}: Failed to upload\n`;
      }
    });

    const repliedAttachment = event.messageReply.attachments[0];
    
    if (repliedAttachment && (repliedAttachment.type === "photo" || repliedAttachment.type === "animated_image")) {
      try {
        await api.editMessage({ 
          body: message,
          attachment: await axios.get(repliedAttachment.url, { responseType: 'stream' }).then(res => res.data)
        }, loadingMsg.messageID, event.threadID);
      } catch (err) {
        console.log("Failed to attach image, sending text only:", err.message);
        await api.editMessage(message, loadingMsg.messageID, event.threadID);
      }
    } else {
      await api.editMessage(message, loadingMsg.messageID, event.threadID);
    }

  } catch (error) {
    console.error('Error:', error);
    
    if (typeof loadingMsg !== 'undefined' && loadingMsg.messageID) {
      await api.editMessage(`╭───「 ⚠️ 𝐄𝐑𝐑𝐎𝐑 」───╮
│
│ ❌ An error occurred while processing!
│
│ 🔍 𝐏𝐨𝐬𝐬𝐢𝐛𝐥𝐞 𝐫𝐞𝐚𝐬𝐨𝐧𝐬:
│ • Image too large
│ • Network issue
│ • ImgBB API limit
│
│ 🔄 Please try again later
│
╰─────────────────────╯`, loadingMsg.messageID, event.threadID);
    } else {
      await api.sendMessage(`╭───「 ⚠️ 𝐄𝐑𝐑𝐎𝐑 」───╮
│
│ ❌ An error occurred while processing!
│
╰─────────────────────╯`, event.threadID, event.messageID);
    }
  }
};