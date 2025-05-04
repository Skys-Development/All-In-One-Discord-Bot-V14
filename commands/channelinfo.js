const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const config = require('../config.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('channelinfo')
    .setDescription('Get information about a specific channel')
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('Select a channel to get its information')
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ViewChannel),

  async execute(interaction) {
    const channel = interaction.options.getChannel('channel');
    const embedColor = config.embedColor;

    const embed = new EmbedBuilder()
      .setTitle(`Channel Info: ${channel.name}`)
      .setColor(embedColor)
      .addFields(
        { name: '🆔 Channel ID', value: `${channel.id}`, inline: true },
        { name: '📢 Type', value: `${channel.type}`, inline: true },
        { name: '🔒 NSFW', value: channel.nsfw ? 'Yes' : 'No', inline: true },
        { name: '💬 Topic', value: channel.topic || 'No topic set', inline: false },
        { name: '📅 Created On', value: `<t:${Math.floor(channel.createdTimestamp / 1000)}:R>`, inline: true }
      )
      .setTimestamp()
      .setFooter({
        text: interaction.client.user.username,
        iconURL: interaction.client.user.displayAvatarURL()
      });

    await interaction.reply({ embeds: [embed] });
  }
};
