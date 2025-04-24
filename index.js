const { Client, Collection, GatewayIntentBits, REST, Routes } = require('discord.js');
const fs = require('fs');
const config = require('./config.json');
const loadCommands = require('./handlers/commandHandler');
const loadEvents = require('./handlers/eventHandler');
const { cyan, green, red, yellow } = require('colorette');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,                // Required for basic server functionality
    GatewayIntentBits.GuildMembers,         // Access guild members for moderation commands
    GatewayIntentBits.GuildMessages,        // Listen for messages in text channels
    GatewayIntentBits.MessageContent,       // Access message content for processing commands
    GatewayIntentBits.DirectMessages        // Handle direct messages (if required)
  ],
  partials: [
    'MESSAGE', 'CHANNEL', 'REACTION'
  ]
});

client.commands = new Collection();

(async () => {
  const commands = await loadCommands(client);

  const rest = new REST({ version: '10' }).setToken(config.token);

  try {
    console.log(yellow('🔁 Registering global slash commands...'));
    await rest.put(
      Routes.applicationCommands(config.clientId),
      {
        body: commands.map(cmd => cmd.data.toJSON())
      }
    );

    console.log(green('✅ Slash commands registered globally!'));
  } catch (err) {
    console.error(red('❌ Error registering commands:'), err);
  }

  // Load events handler
  await loadEvents(client);

  console.log(cyan('🚀 Logging in...'));
  client.login(config.token);
})();
