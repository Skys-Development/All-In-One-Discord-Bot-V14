const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('adddomain')
    .setDescription('Add a domain (owner only)')
    .addStringOption(opt =>
      opt.setName('name')
        .setDescription('Domain name (e.g., example.com)')
        .setRequired(true))
    .addStringOption(opt =>
      opt.setName('zoneid')
        .setDescription('Cloudflare Zone ID')
        .setRequired(true))
    .addStringOption(opt =>
      opt.setName('token')
        .setDescription('Cloudflare API Token')
        .setRequired(true)),

  async execute(interaction) {
    const configPath = path.join(__dirname, '..', 'config.json');
    let config;
    
    try {
      config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    } catch (error) {
      return interaction.reply({ 
        content: '❌ Error reading config file.', 
        ephemeral: true 
      });
    }

    if (interaction.user.id !== config.OWNER_ID) {
      return interaction.reply({ 
        content: '❌ You are not authorized to use this command.', 
        ephemeral: true 
      });
    }

    const name = interaction.options.getString('name');
    const zoneId = interaction.options.getString('zoneid');
    const token = interaction.options.getString('token');

    if (!config.domains) {
      config.domains = [];
    }

    if (config.domains.some(domain => domain.name === name)) {
      return interaction.reply({ 
        content: '❌ This domain is already registered.', 
        ephemeral: true 
      });
    }

    config.domains.push({
      name,
      zoneId,
      cloudflareToken: token
    });

    try {
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
      await interaction.reply({ 
        content: `✅ Successfully added domain: \`${name}\``, 
        ephemeral: true 
      });
    } catch (error) {
      console.error('Error saving config:', error);
      await interaction.reply({ 
        content: '❌ Error saving domain configuration.', 
        ephemeral: true 
      });
    }
  }
};
