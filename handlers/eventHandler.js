const fs = require('fs');
const path = require('path');
const { green } = require('colorette');

module.exports = async (client) => {
  const eventFiles = fs.readdirSync(path.join(__dirname, '../events')).filter(file => file.endsWith('.js'));

  for (const file of eventFiles) {
    const event = require(`../events/${file}`);
    if (event.once) {
      client.once(event.name, (...args) => event.execute(...args, client));
    } else {
      client.on(event.name, (...args) => event.execute(...args, client));
    }
  }

  console.log(green(`✔ Loaded ${eventFiles.length} events.`));
};
