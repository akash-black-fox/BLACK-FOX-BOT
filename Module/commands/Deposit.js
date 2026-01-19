module.exports.config = {
  name: 'deposit',
  aliases: ['dep', 'save'],
  version: '1.0.0',
  author: 'AKASH HASAN',
  description: 'Deposit money from wallet to bank',
  usage: 'deposit [amount/all]',
  category: 'Economy',
  prefix: true
};

module.exports.run = async function({ api, event, args, send, Currencies, Users }) {
  const { senderID } = event;
  
  const userData = await Currencies.getData(senderID);
  const wallet = userData.money || 0;
  
  let bankData = userData.data || {};
  let bank = bankData.bank || 0;

  if (args.length === 0) {
    return send.reply(`╭───「 ⚠️ 𝐖𝐀𝐑𝐍𝐈𝐍𝐆 」───╮
│
│ ❌ 𝐌𝐢𝐬𝐬𝐢𝐧𝐠 𝐀𝐦𝐨𝐮𝐧𝐭
│ 👉 𝐔𝐬𝐚𝐠𝐞: deposit [amount]
│    𝐎𝐫: deposit all
│
╰─────────────────────╯`);
  }

  let amount;
  if (args[0].toLowerCase() === 'all') {
    amount = wallet;
  } else {
    amount = parseInt(args[0]);
  }

  if (!amount || isNaN(amount) || amount <= 0) {
    return send.reply(`╭───「 ❌ 𝐄𝐑𝐑𝐎𝐑 」───╮
│
│ ⚠️ 𝐈𝐧𝐯𝐚𝐥𝐢𝐝 𝐀𝐦𝐨𝐮𝐧𝐭
│ 🔢 𝐄𝐧𝐭𝐞𝐫 𝐚 𝐯𝐚𝐥𝐢𝐝 𝐧𝐮𝐦𝐛𝐞𝐫.
│
╰─────────────────────╯`);
  }

  if (amount > wallet) {
    return send.reply(`╭───「 ⛔ 𝐃𝐄𝐍𝐈𝐄𝐃 」───╮
│
│ ⚠️ 𝐍𝐨𝐭 𝐞𝐧𝐨𝐮𝐠𝐡 𝐦𝐨𝐧𝐞𝐲!
│ 👛 𝐖𝐚𝐥𝐥𝐞𝐭 : $${wallet.toLocaleString()}
│
╰─────────────────────╯`);
  }

  try {
    await Currencies.decreaseMoney(senderID, amount);
    
    bankData.bank = bank + amount;
    await Currencies.setData(senderID, { data: bankData });

    const name = await Users.getNameUser(senderID);

    return send.reply(`╭───「 ✅ 𝐃𝐄𝐏𝐎𝐒𝐈𝐓 」───╮
│
│ 👤 𝐔𝐬𝐞𝐫 : ${name}
│ 📥 𝐀𝐝𝐝𝐞𝐝 : $${amount.toLocaleString()}
│
│ 👛 𝐖𝐚𝐥𝐥𝐞𝐭 : $${(wallet - amount).toLocaleString()}
│ 🏦 𝐁𝐚𝐧𝐤   : $${bankData.bank.toLocaleString()}
│
╰─────────────────────╯`);

  } catch (error) {
    return send.reply(`╭───「 ❌ 𝐅𝐀𝐈𝐋𝐄𝐃 」───╮
│
│ ⚠️ 𝐓𝐫𝐚𝐧𝐬𝐚𝐜𝐭𝐢𝐨𝐧 𝐄𝐫𝐫𝐨𝐫
│ 🔧 𝐓𝐫𝐲 𝐚𝐠𝐚𝐢𝐧 𝐥𝐚𝐭𝐞𝐫.
│
╰─────────────────────╯`);
  }
};