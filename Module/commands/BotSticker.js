const axios = require('axios')
const fs = require('fs-extra')
const path = require('path')

module.exports = {
  config: {
    name: 'botsticker',
    aliases: ['bsticker', 'botreact'],
    description: 'Send bot stickers on bot related words',
    usage: 'botsticker [on/off/send]',
    category: 'Fun',
    prefix: true,
    credits: 'AKASH HASAN',
    Version: '1.0.0'
  },

  onMessage: async function ({ api, event, Threads }) {
    const { threadID, body } = event
    if (!body) return

    const settings = Threads.getSettings(threadID)
    if (!settings.botsticker) return

    const botWords = ['black fox', 'BLACK FOX', 'baby', 'Black Fox']
    const lowerBody = body.toLowerCase()

    const hasWord = botWords.some(word =>
      lowerBody === word ||
      lowerBody.startsWith(word + ' ') ||
      lowerBody.endsWith(' ' + word) ||
      lowerBody.includes(' ' + word + ' ')
    )

    if (!hasWord) return

    try {
      const apis = [
        'https://api.tenor.com/v1/random?q=cute+anime+reaction&key=LIVDSRZULELA&limit=1',
        'https://api.tenor.com/v1/random?q=kawaii+sticker&key=LIVDSRZULELA&limit=1'
      ]

      const res = await axios.get(apis[Math.floor(Math.random() * apis.length)], { timeout: 10000 })
      if (!res.data.results || !res.data.results.length) return

      const gifUrl = res.data.results[0].media[0].gif.url
      const cacheDir = path.join(__dirname, 'cache')
      fs.ensureDirSync(cacheDir)

      const filePath = path.join(cacheDir, `botsticker_${Date.now()}.gif`)
      const gifData = await axios.get(gifUrl, { responseType: 'arraybuffer' })
      fs.writeFileSync(filePath, Buffer.from(gifData.data))

      await api.sendMessage(
        { attachment: fs.createReadStream(filePath) },
        threadID
      )

      setTimeout(() => {
        try { fs.unlinkSync(filePath) } catch {}
      }, 10000)
    } catch {}
  },

  async run ({ api, event, args, send, Threads, config }) {
    const { threadID, senderID } = event
    const action = args[0]?.toLowerCase()
    const settings = Threads.getSettings(threadID)

    const threadInfo = await api.getThreadInfo(threadID)
    const adminIDs = threadInfo.adminIDs.map(e => e.id)
    const isGroupAdmin = adminIDs.includes(senderID)
    const isBotAdmin = config.ADMINBOT.includes(senderID)

    if (!action || action === 'status') {
      const msg = `╭───「 ℹ️ BOT STICKER 」───╮
│
│ Status : ${settings.botsticker ? 'ON' : 'OFF'}
│ Trigger : bot / goi / baby / sardar
│
│ Usage :
│ ${config.PREFIX}botsticker on
│ ${config.PREFIX}botsticker off
│ ${config.PREFIX}botsticker send
│
╰─────────────────────╯`
      return send.reply(msg)
    }

    if (action === 'send' || action === 'now') {
      try {
        const res = await axios.get(
          'https://api.tenor.com/v1/random?q=cute+reaction&key=LIVDSRZULELA&limit=1',
          { timeout: 10000 }
        )

        if (!res.data.results || !res.data.results.length) return

        const gifUrl = res.data.results[0].media[0].gif.url
        const cacheDir = path.join(__dirname, 'cache')
        fs.ensureDirSync(cacheDir)

        const filePath = path.join(cacheDir, `botsticker_${Date.now()}.gif`)
        const gifData = await axios.get(gifUrl, { responseType: 'arraybuffer' })
        fs.writeFileSync(filePath, Buffer.from(gifData.data))

        await api.sendMessage(
          { attachment: fs.createReadStream(filePath) },
          threadID
        )

        setTimeout(() => {
          try { fs.unlinkSync(filePath) } catch {}
        }, 10000)
      } catch (err) {
        const msg = `╭───「 ❌ ERROR 」───╮
│
│ Failed to send sticker
│ ${err.message}
│
╰─────────────────────╯`
        return send.reply(msg)
      }
      return
    }

    if (!isGroupAdmin && !isBotAdmin) {
      const msg = `╭───「 ❌ ACCESS DENIED 」───╮
│
│ Only admins can toggle bot sticker
│
╰─────────────────────╯`
      return send.reply(msg)
    }

    if (action === 'on' || action === 'enable') {
      Threads.setSettings(threadID, { botsticker: true })
      const msg = `╭───「 ✅ ENABLED 」───╮
│
│ Bot sticker is now ON
│
╰─────────────────────╯`
      return send.reply(msg)
    }

    if (action === 'off' || action === 'disable') {
      Threads.setSettings(threadID, { botsticker: false })
      const msg = `╭───「 ❎ DISABLED 」───╮
│
│ Bot sticker is now OFF
│
╰─────────────────────╯`
      return send.reply(msg)
    }

    const msg = `╭───「 ℹ️ USAGE 」───╮
│
│ ${config.PREFIX}botsticker on
│ ${config.PREFIX}botsticker off
│ ${config.PREFIX}botsticker send
│
╰─────────────────────╯`
    return send.reply(msg)
  }
}