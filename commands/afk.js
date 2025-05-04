const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const config = require('../config.json');

const afkUsers = new Map();

module.exports = {
  data: new SlashCommandBuilder()
    .setName('afk')
    .setDescription('Set your AFK status')
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Enter a reason for being AFK')
        .setRequired(false)
    ),

  async execute(interaction) {
    const reason = interaction.options.getString('reason') || 'No reason provided';
    afkUsers.set(interaction.user.id, reason);

    const embedColor = config.embedColor;
    const embed = new EmbedBuilder()
      .setTitle('🌙 AFK Status Set')
      .setDescription(`You're now AFK: **${reason}**`)
      .setColor(embedColor)
      .setTimestamp()
      .setFooter({ 
        text: interaction.client.user.username, 
        iconURL: interaction.client.user.displayAvatarURL() 
      });

    await interaction.reply({ embeds: [embed], flags: 64 });
  }
};

module.exports.afkUsers = afkUsers;