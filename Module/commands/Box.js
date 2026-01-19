module.exports.config = {
  name: "group",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "AKASH HASAN",
  description: "Parent group settings",
  commandCategory: "box",
  usages: "[name/emoji/admin/image/info]",
  cooldowns: 1,
  dependencies: {
    "request": "",
    "fs-extra": ""
  }
}

module.exports.run = async ({ api, event, args }) => {
  const fs = global.nodemodule["fs-extra"]
  const request = global.nodemodule["request"]

  if (args.length === 0) {
    const msg = `╭───「 ℹ️ GROUP COMMAND 」───╮
│
│ ${global.config.PREFIX}group name [new name]
│ ${global.config.PREFIX}group emoji [emoji]
│ ${global.config.PREFIX}group image [reply image]
│ ${global.config.PREFIX}group admin [tag/reply]
│ ${global.config.PREFIX}group info
│
╰─────────────────────╯`
    return api.sendMessage(msg, event.threadID, event.messageID)
  }

  if (args[0] === "name") {
    const content = args.join(" ")
    const name = content.slice(4) || event.messageReply?.body
    if (!name) return
    return api.setTitle(name, event.threadID)
  }

  if (args[0] === "emoji") {
    const emoji = args[1] || event.messageReply?.body
    if (!emoji) return
    return api.changeThreadEmoji(emoji, event.threadID)
  }

  if (args[0] === "me" && args[1] === "admin") {
    const threadInfo = await api.getThreadInfo(event.threadID)
    const botAdmin = threadInfo.adminIDs.find(e => e.id === api.getCurrentUserID())
    if (!botAdmin) {
      const msg = `╭───「 ❌ ERROR 」───╮
│
│ Bot must be admin first
│
╰─────────────────────╯`
      return api.sendMessage(msg, event.threadID, event.messageID)
    }

    if (!global.config.ADMINBOT.includes(event.senderID)) {
      const msg = `╭───「 ❌ ACCESS DENIED 」───╮
│
│ You are not bot admin
│
╰─────────────────────╯`
      return api.sendMessage(msg, event.threadID, event.messageID)
    }

    return api.changeAdminStatus(event.threadID, event.senderID, true)
  }

  if (args[0] === "admin") {
    let targetID
    if (event.messageReply) targetID = event.messageReply.senderID
    else if (Object.keys(event.mentions).length) targetID = Object.keys(event.mentions)[0]
    else targetID = args[1]

    if (!targetID) return

    const threadInfo = await api.getThreadInfo(event.threadID)
    const senderAdmin = threadInfo.adminIDs.find(e => e.id === event.senderID)
    const botAdmin = threadInfo.adminIDs.find(e => e.id === api.getCurrentUserID())
    if (!senderAdmin || !botAdmin) {
      const msg = `╭───「 ❌ PERMISSION 」───╮
│
│ Admin permission required
│
╰─────────────────────╯`
      return api.sendMessage(msg, event.threadID, event.messageID)
    }

    const isAdmin = threadInfo.adminIDs.find(e => e.id === targetID)
    return api.changeAdminStatus(event.threadID, targetID, !isAdmin)
  }

  if (args[0] === "image") {
    if (event.type !== "message_reply" || !event.messageReply.attachments?.length) {
      const msg = `╭───「 ❌ ERROR 」───╮
│
│ Reply to one image/video
│
╰─────────────────────╯`
      return api.sendMessage(msg, event.threadID, event.messageID)
    }

    const callback = () =>
      api.changeGroupImage(
        fs.createReadStream(__dirname + "/cache/1.png"),
        event.threadID,
        () => fs.unlinkSync(__dirname + "/cache/1.png")
      )

    return request(encodeURI(event.messageReply.attachments[0].url))
      .pipe(fs.createWriteStream(__dirname + "/cache/1.png"))
      .on("close", callback)
  }

  if (args[0] === "info") {
    const threadInfo = await api.getThreadInfo(event.threadID)

    const members = threadInfo.participantIDs.length
    const admins = threadInfo.adminIDs.length
    const messages = threadInfo.messageCount
    const emoji = threadInfo.emoji
    const name = threadInfo.threadName
    const id = threadInfo.threadID
    const approve = threadInfo.approvalMode ? "ON" : "OFF"

    let adminList = ""
    for (const a of threadInfo.adminIDs) {
      const info = await api.getUserInfo(a.id)
      adminList += `• ${info[a.id].name}\n`
    }

    const body = `╭───「 ℹ️ GROUP INFO 」───╮
│
│ Name : ${name}
│ ID : ${id}
│ Emoji : ${emoji}
│ Approval : ${approve}
│
│ Members : ${members}
│ Admins : ${admins}
│ Messages : ${messages}
│
│ Admin List :
│ ${adminList.trim()}
│
╰─────────────────────╯`

    const callback = () =>
      api.sendMessage(
        {
          body,
          attachment: fs.createReadStream(__dirname + "/cache/1.png")
        },
        event.threadID,
        () => fs.unlinkSync(__dirname + "/cache/1.png"),
        event.messageID
      )

    return request(encodeURI(threadInfo.imageSrc))
      .pipe(fs.createWriteStream(__dirname + "/cache/1.png"))
      .on("close", callback)
  }
}