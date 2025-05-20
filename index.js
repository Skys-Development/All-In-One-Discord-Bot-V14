const { Client, Collection, GatewayIntentBits, REST, Routes, Partials } = require('discord.js');
const fs = require('fs');
const config = require('./config.json');
const loadCommands = require('./handlers/commandHandler');
const loadEvents = require('./handlers/eventHandler');
const { cyan, green, red, yellow } = require('colorette');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,                // Basic server functionality
    GatewayIntentBits.GuildMembers,          // Access guild members
    GatewayIntentBits.GuildMessages,         // Messages in text channels
    GatewayIntentBits.MessageContent,        // Access message content
    GatewayIntentBits.DirectMessages,        // Handle DMs
    GatewayIntentBits.GuildVoiceStates,      // Voice channel states
    GatewayIntentBits.GuildPresences,        // Member presence updates
    GatewayIntentBits.GuildMessageReactions, // Message reactions
    GatewayIntentBits.DirectMessageReactions,// DM reactions
    GatewayIntentBits.GuildScheduledEvents,  // Server events
    GatewayIntentBits.GuildEmojisAndStickers // Custom emojis and stickers
  ],
  partials: [
    Partials.Message,
    Partials.Channel,
    Partials.Reaction,
    Partials.User,
    Partials.GuildMember,
    Partials.ThreadMember,
    Partials.GuildScheduledEvent
  ],
  allowedMentions: {
    parse: ['users', 'roles'],
    repliedUser: true
  }
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

  await loadEvents(client);

  console.log(cyan('🚀 Logging in...'));
  client.login(config.token);

  process.on('unhandledRejection', error => {
    console.error(red('❌ Unhandled promise rejection:'), error);
  });
})();
