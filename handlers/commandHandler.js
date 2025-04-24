const fs = require('fs');
const path = require('path');
const { green, yellow, cyan, bold } = require('colorette');

module.exports = async (client) => {
  const commands = [];
  const commandFiles = fs.readdirSync(path.join(__dirname, '../commands')).filter(file => file.endsWith('.js'));

  for (const file of commandFiles) {
    const command = require(`../commands/${file}`);
    client.commands.set(command.data.name, command);
    commands.push(command);

    console.log(green('✔ Loaded command:'), cyan(bold(command.data.name)), yellow(`(${file})`));
  }

  return commands;
};
