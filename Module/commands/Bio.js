module.exports = {
  config: {
    name: 'bio',
    aliases: ['setbio', 'changebio'],
    description: 'Change Facebook bot bio',
    category: 'Profile',
    adminOnly: true,
    prefix: true,
    credits: 'AKASH HASAN',
    Version: '1.0.0'
  },

  async run({ api, event, args, send, config }) {
    const senderID = event.senderID

    const GIF = {
      success: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExb2M0ZGRkZTNkN2M0YjRkYzU0Y2QzYzJkYjM0M2Y3ZWRlZDYyZCZjdD1n/l0MYt5jPR6QX5pnqM/giphy.gif',
      error: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExY2VjYjRjZGE3M2Q5ZTRmODNhM2ZmNjVhNmY2NTdiNjQ1YmNjOCZjdD1n/3o6ZtaO9BZHcOjmErm/giphy.gif',
      denied: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNmI3M2UxMjE5ZTYxY2U3OWRkNmY2ZjBiMzJhMzI2MjI1MjMzYiZjdD1n/26ufdipQqU2lhNA4g/giphy.gif'
    }

    const sendBox = async (text, gif) => {
      if (gif) {
        try {
          return send.reply({
            body: text,
            attachment: await api.getStreamFromURL(gif)
          })
        } catch {
          return send.reply(text)
        }
      }
      return send.reply(text)
    }

    if (!config.ADMINBOT.includes(senderID)) {
      const msg = `╭───「 ❌ ACCESS DENIED 」───╮
│
│ Status : You are not a bot admin
│
╰─────────────────────╯`
      return sendBox(msg, GIF.denied)
    }

    const newBio = args.join(' ')

    if (!newBio) {
      const msg = `╭───「 ❗ INPUT ERROR 」───╮
│
│ Usage : ${config.PREFIX}bio [new bio]
│ Example : ${config.PREFIX}bio AKASH HASAN Official
│
╰─────────────────────╯`
      return sendBox(msg, GIF.error)
    }

    if (newBio.length > 200) {
      const msg = `╭───「 ❌ BIO TOO LONG 」───╮
│
│ Max Length : 200
│ Your Input : ${newBio.length}
│
╰─────────────────────╯`
      return sendBox(msg, GIF.error)
    }

    try {
      await api.changeBio(newBio)

      const msg = `╭───「 ✅ BIO UPDATED 」───╮
│
│ New Bio :
│ ${newBio}
│
╰─────────────────────╯

╭───「 ℹ️ HELP 」───╮
│
│ ${config.PREFIX}bio [text]
│ Change bot bio
│
│ AUTHOR : AKASH HASAN
│ LINK : m.me/akash.black.fox
│
╰─────────────────────╯`
      return sendBox(msg, GIF.success)

    } catch (err) {
      const msg = `╭───「 ❌ ERROR 」───╮
│
│ ${err.message}
│
╰─────────────────────╯`
      return sendBox(msg, GIF.error)
    }
  }
}