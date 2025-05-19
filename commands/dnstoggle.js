const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('dnstoggle')
    .setDescription('Toggle DNS creation lock status')
    .addStringOption(option =>
      option.setName('action')
        .setDescription('Choose to lock or unlock DNS creation')
        .setRequired(true)
        .addChoices(
          { name: '🔒 Lock DNS Creation', value: 'lock' },
          { name: '🔓 Unlock DNS Creation', value: 'unlock' }
        )
    ),

  async execute(interaction) {
    const configPath = path.join(__dirname, '..', 'config.json');
    let config;

    try {
      config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    } catch (error) {
      return interaction.reply({
        content: '❌ Error reading configuration file.',
        ephemeral: true
      });
    }

    if (interaction.user.id !== config.OWNER_ID) {
      return interaction.reply({
        content: '❌ Only the bot owner can toggle DNS creation lock.',
        ephemeral: true
      });
    }

    const action = interaction.options.getString('action');
    const shouldLock = action === 'lock';

    if (shouldLock === config.dnsLocked) {
      return interaction.reply({
        content: `❌ DNS creation is already ${shouldLock ? 'locked' : 'unlocked'}.`,
        ephemeral: true
      });
    }

    config.dnsLocked = shouldLock;

    try {
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
      return interaction.reply({
        content: `✅ DNS creation has been ${shouldLock ? '🔒 locked' : '🔓 unlocked'}.`,
        ephemeral: true
      });
    } catch (error) {
      return interaction.reply({
        content: '❌ Error saving configuration.',
        ephemeral: true
      });
    }
  }
};
