const fs = require('fs-extra');
const path = require('path');

module.exports = {
  config: {
    name: 'file',
    aliases: ['files', 'cmdfile', 'manager'],
    version: '1.0.0',
    author: 'AKASH HASAN',
    description: 'Manage command files (List/Read/Delete)',
    usage: 'file [list/read/delete] [filename]',
    category: 'Admin',
    adminOnly: true,
    prefix: true
  },
  
  async run({ api, event, args, send, config }) {
    const { senderID, messageID } = event;
    
    if (!config.ADMINBOT.includes(senderID)) {
      return send.reply(`╭───「 ⛔ 𝐃𝐄𝐍𝐈𝐄𝐃 」───╮
│
│ ⚠️ 𝐏𝐞𝐫𝐦𝐢𝐬𝐬𝐢𝐨𝐧 𝐃𝐞𝐧𝐢𝐞𝐝
│ 👤 𝐎𝐧𝐥𝐲 𝐁𝐨𝐭 𝐀𝐝𝐦𝐢𝐧𝐬
│    𝐜𝐚𝐧 𝐮𝐬𝐞 𝐭𝐡𝐢𝐬.
│
╰─────────────────────╯`);
    }
    
    const commandsDir = path.join(__dirname);
    const action = args[0]?.toLowerCase();
    
    if (!action || action === 'list') {
      try {
        const files = fs.readdirSync(commandsDir).filter(f => f.endsWith('.js'));
        
        let msg = `╭───「 𝐅𝐈𝐋𝐄 𝐋𝐈𝐒𝐓 」───╮\n│\n`;
        
        for (let i = 0; i < files.length; i++) {
          const filePath = path.join(commandsDir, files[i]);
          const stats = fs.statSync(filePath);
          const size = (stats.size / 1024).toFixed(2);
          
          msg += `│ ${i + 1}. ${files[i]}\n│    💾 ${size} KB\n│\n`;
        }
        
        msg += `╰─────────────────────╯\n`;
        msg += `📁 𝐓𝐨𝐭𝐚𝐥 𝐅𝐢𝐥𝐞𝐬: ${files.length}\n`;
        msg += `👉 𝐑𝐞𝐩𝐥𝐲 𝐰𝐢𝐭𝐡 𝐧𝐮𝐦𝐛𝐞𝐫 𝐭𝐨 𝐬𝐞𝐥𝐞𝐜𝐭.`;
        
        const sentMsg = await send.reply(msg);
        
        if (global.client && global.client.replies) {
          global.client.replies.set(sentMsg.messageID, {
            commandName: 'file',
            author: senderID,
            data: { files: files, type: 'select' }
          });
        }
        return;
      } catch (error) {
        return send.reply(`❌ Failed to list files.`);
      }
    }
    
    if (action === 'read') {
      const filename = args[1];
      if (!filename) return send.reply(`❌ Filename needed! Ex: file read help.js`);
      
      const filePath = path.join(commandsDir, filename.endsWith('.js') ? filename : filename + '.js');
      if (!fs.existsSync(filePath)) return send.reply(`❌ File not found: ${filename}`);
      
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        return send.reply(`╭───「 𝐑𝐄𝐀𝐃 𝐌𝐎𝐃𝐄 」───╮
│
│ 📂 𝐅𝐢𝐥𝐞 : ${filename}
│
╰─────────────────────╯\n\n${content.substring(0, 1500)}...`);
      } catch (error) { return send.reply(`❌ Read Failed.`); }
    }
    
    if (action === 'delete') {
      const filename = args[1];
      if (!filename) return send.reply(`❌ Filename needed! Ex: file delete test.js`);
      
      const protectedFiles = ['help.js', 'admin.js', 'file.js', 'reload.js'];
      if (protectedFiles.includes(filename)) return send.reply(`⚠️ Cannot delete protected file.`);
      
      const filePath = path.join(commandsDir, filename.endsWith('.js') ? filename : filename + '.js');
      if (!fs.existsSync(filePath)) return send.reply(`❌ File not found: ${filename}`);
      
      try {
        fs.unlinkSync(filePath);
        return send.reply(`╭───「 𝐃𝐄𝐋𝐄𝐓𝐄𝐃 」───╮
│
│ 🗑️ 𝐅𝐢𝐥𝐞 : ${filename}
│ ✅ 𝐒𝐭𝐚𝐭𝐮𝐬 : Removed
│
╰─────────────────────╯`);
      } catch (error) { return send.reply(`❌ Delete Failed.`); }
    }
  },
  
  async handleReply({ api, event, send, data }) {
    const { body, messageReply, senderID } = event;
    const commandsDir = path.join(__dirname);
    
    if (data.type === 'select') {
      const num = parseInt(body);
      if (isNaN(num) || num < 1 || num > data.files.length) return send.reply(`❌ Invalid number.`);
      
      const selectedFile = data.files[num - 1];
      const msg = await send.reply(`📂 𝐒𝐞𝐥𝐞𝐜𝐭𝐞𝐝: ${selectedFile}\n\n1️⃣ Read File\n2️⃣ Delete File\n\n👉 Reply 1 or 2`);
      
      if (global.client.replies) {
        global.client.replies.delete(messageReply.messageID);
        global.client.replies.set(msg.messageID, {
          commandName: 'file',
          author: senderID,
          data: { file: selectedFile, type: 'action' }
        });
      }
    } else if (data.type === 'action') {
      const selectedFile = data.file;
      const filePath = path.join(commandsDir, selectedFile);
      
      if (body === '1') {
        const content = fs.readFileSync(filePath, 'utf8');
        return send.reply(`╭───「 𝐑𝐄𝐀𝐃 𝐌𝐎𝐃𝐄 」───╮\n│ 📂 𝐅𝐢𝐥𝐞 : ${selectedFile}\n╰─────────────────────╯\n\n${content.substring(0, 1500)}...`);
      } else if (body === '2') {
        const protectedFiles = ['help.js', 'admin.js', 'file.js', 'reload.js'];
        if (protectedFiles.includes(selectedFile)) return send.reply(`⚠️ Protected File!`);
        
        fs.unlinkSync(filePath);
        return send.reply(`✅ File Deleted: ${selectedFile}`);
      }
    }
  }
};