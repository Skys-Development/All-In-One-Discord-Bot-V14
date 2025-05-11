const { cyan, green, bold, magenta } = require('colorette');

module.exports = {
  name: 'ready',
  once: true,
  execute(client) {
    console.log(magenta('💖 Ready'), green('•'), cyan(`Logged in as `) + bold(client.user.tag));
    client.user.setPresence({
      activities: [{ name: `${client.guilds.cache.size} servers`, type: 3 }],
      status: 'online'
    });
  }
};
