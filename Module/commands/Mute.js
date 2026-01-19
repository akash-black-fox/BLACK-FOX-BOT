module.exports = {
  config: {
    name: 'mute',
    aliases: ['mutethread', 'silence'],
    description: 'Simulated mute/unmute notifications',
    credits: 'AKASH HASAN',
    usage: 'mute [time] (1h/1d/forever) or mute off',
    category: 'Utility',
    prefix: true
  },
  
  async run({ api, event, args, send, config }) {
    const { threadID, senderID } = event;
    
    if (!config.ADMINBOT.includes(senderID)) {
      return send.reply(`╭───「 🔒 𝐏𝐄𝐑𝐌𝐈𝐒𝐒𝐈𝐎𝐍 」───╮
│
│ ❌ This command is for admins only!
│
│ 📌 Only bot admins can use this command
│
╰─────────────────────╯`);
    }
    
    const arg = args[0]?.toLowerCase() || '1h';
    
    let muteSeconds;
    let muteText;
    let muteEmoji;
    
    // Parse time argument
    if (arg === 'off' || arg === 'unmute' || arg === '0') {
      muteSeconds = 0;
      muteText = 'Unmuted successfully';
      muteEmoji = '🔊';
    } else if (arg === 'forever' || arg === 'permanent' || arg === '-1') {
      muteSeconds = -1;
      muteText = 'Permanently muted';
      muteEmoji = '🔇';
    } else if (arg === '1m' || arg === '1min') {
      muteSeconds = 60;
      muteText = 'Muted for 1 minute';
      muteEmoji = '⏱️';
    } else if (arg === '1h' || arg === '1hour') {
      muteSeconds = 3600;
      muteText = 'Muted for 1 hour';
      muteEmoji = '⏰';
    } else if (arg === '1d' || arg === '1day') {
      muteSeconds = 86400;
      muteText = 'Muted for 1 day';
      muteEmoji = '📅';
    } else if (arg === '1w' || arg === '1week') {
      muteSeconds = 604800;
      muteText = 'Muted for 1 week';
      muteEmoji = '🗓️';
    } else {
      const num = parseInt(arg);
      if (!isNaN(num) && num > 0) {
        muteSeconds = num;
        muteText = `Muted for ${num} seconds`;
        muteEmoji = '⏲️';
      } else {
        muteSeconds = 3600;
        muteText = 'Muted for 1 hour';
        muteEmoji = '⏰';
      }
    }
    
    try {
      // Check available API functions
      let muteSuccess = false;
      let methodUsed = '';
      
      // Method 1: Try muteThread if exists
      if (api.muteThread && typeof api.muteThread === 'function') {
        try {
          await api.muteThread(threadID, muteSeconds);
          muteSuccess = true;
          methodUsed = 'muteThread';
        } catch (e) {
          console.log('muteThread failed:', e.message);
        }
      }
      
      // Method 2: Try changeThreadSettings
      if (!muteSuccess && api.changeThreadSettings && typeof api.changeThreadSettings === 'function') {
        try {
          const muteUntil = muteSeconds === -1 ? 
            253402300800 : // Year 9999 timestamp
            (muteSeconds === 0 ? 0 : Math.floor(Date.now() / 1000) + muteSeconds);
          
          await api.changeThreadSettings(threadID, { mute_until: muteUntil });
          muteSuccess = true;
          methodUsed = 'changeThreadSettings';
        } catch (e) {
          console.log('changeThreadSettings failed:', e.message);
        }
      }
      
      // Method 3: Try send message as notification
      if (!muteSuccess) {
        // Since API doesn't support mute, show simulated message
        methodUsed = 'simulated';
        muteSuccess = true; // Treat as success for user experience
      }
      
      if (!muteSuccess) {
        return send.reply(`╭───「 ⚠️ 𝐅𝐄𝐀𝐓𝐔𝐑𝐄 」───╮
│
│ ❌ Mute feature not supported!
│
│ 📌 Your bot API doesn't support thread muting
│
│ 💡 Try using Facebook's built-in mute feature
│
╰─────────────────────╯`);
      }
      
      // Success message based on action
      let actionMessage = '';
      
      if (muteSeconds === 0) {
        actionMessage = `╭───「 🔊 𝐔𝐍𝐌𝐔𝐓𝐄𝐃 」───╮
│
│ ✅ ${muteText}
│
│ 📌 Notifications are now enabled
│
│ 🔧 Method: ${methodUsed === 'simulated' ? 'Simulated (Use FB settings)' : methodUsed}
│
╰─────────────────────╯`;
      } else if (muteSeconds === -1) {
        actionMessage = `╭───「 🔇 𝐏𝐄𝐑𝐌𝐀𝐍𝐄𝐍𝐓 」───╮
│
│ ✅ ${muteText}
│
│ 📌 Notifications disabled forever
│
│ 🔧 Method: ${methodUsed === 'simulated' ? 'Simulated (Use FB settings)' : methodUsed}
│
╰─────────────────────╯`;
      } else {
        const timeFormats = {
          60: '1 minute',
          3600: '1 hour',
          86400: '1 day',
          604800: '1 week'
        };
        
        const timeDisplay = timeFormats[muteSeconds] || `${muteSeconds} seconds`;
        
        actionMessage = `╭───「 ${muteEmoji} 𝐌𝐔𝐓𝐄𝐃 」───╮
│
│ ✅ ${muteText}
│
│ 📌 Duration: ${timeDisplay}
│
│ 🔧 Method: ${methodUsed === 'simulated' ? 'Simulated (Use FB settings)' : methodUsed}
│
╰─────────────────────╯`;
      }
      
      // Add note for simulated method
      if (methodUsed === 'simulated') {
        actionMessage = actionMessage.replace('╰─────────────────────╯', 
`│
│ ⚠️ Note: This is simulated
│    Use Facebook settings to actually mute
│
╰─────────────────────╯`);
      }
      
      return send.reply(actionMessage);
      
    } catch (error) {
      console.error('Mute command error:', error);
      
      // Simple error message without accessing undefined properties
      return send.reply(`╭───「 ❌ 𝐄𝐑𝐑𝐎𝐑 」───╮
│
│ ⚠️ Command execution failed!
│
│ 📌 Mute feature might not be supported
│
│ 💡 Use Facebook's built-in mute settings
│
╰─────────────────────╯`);
    }
  }
};