module.exports = {
  config: {
    name: 'balance',
    aliases: ['bal', 'money', 'wallet'],
    description: 'Check your balance',
    usage: 'balance [@user/reply/uid]',
    category: 'Economy',
    prefix: true,
    author: 'AKASH HASAN',
    version: '1.0.0'
  },

  async run({ api, event, args, send, Currencies, Users, config }) {
    const { senderID, mentions, messageReply, threadID } = event;

    if (args[0] === 'help') {
      return send.reply(
`╭───「 💰 BALANCE HELP 」───╮
│
│ Commands:
│ ${config.PREFIX}balance
│ ${config.PREFIX}balance @mention
│ ${config.PREFIX}balance [uid]
│ (reply) ${config.PREFIX}balance
│
│ Description:
│ Check wallet, bank, and total balance
│
│ AUTHOR : AKASH HASAN
│ LINK   : m.me/akash.black.fox
╰────────────────────────╯`
      );
    }

    let uid = senderID;

    if (messageReply) {
      uid = messageReply.senderID;
    } else if (mentions && Object.keys(mentions).length > 0) {
      uid = Object.keys(mentions)[0];
    } else if (args[0] && /^\d+$/.test(args[0])) {
      uid = args[0];
    }

    const name = await Users.getNameUser(uid);
    const wallet = Currencies.getBalance(uid);
    const bank = Currencies.getBank(uid);
    const total = Currencies.getTotal(uid);

    return send.reply(
`╭───「 💰 BALANCE CHECK 」───╮
│
│ User : ${name}
│
│─────────────────────────
│ Wallet : $${wallet.toLocaleString()}
│ Bank   : $${bank.toLocaleString()}
│─────────────────────────
│ Total  : $${total.toLocaleString()}
╰─────────────────────────╯`
    );
  }
};