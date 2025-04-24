const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const config = require('../config.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('serverinfo')
    .setDescription('Displays information about the server'),

  async execute(interaction) {
    const { guild } = interaction;

    const embed = new EmbedBuilder()
      .setTitle(`Server Info - ${guild.name}`)
      .setDescription(`Here is the information about the server ${guild.name}`)
      .setColor(config.embedColor)
      .setThumbnail(guild.iconURL())
      .addFields(
        { name: 'Server ID', value: guild.id, inline: true },
        { name: 'Server Name', value: guild.name, inline: true },
        { name: 'Owner', value: `<@${guild.ownerId}>`, inline: true },
        { name: 'Created On', value: guild.createdAt.toLocaleDateString(), inline: true },
        { name: 'Member Count', value: `${guild.memberCount}`, inline: true },
        { name: 'Number of Roles', value: `${guild.roles.cache.size}`, inline: true },
        { name: 'Number of Channels', value: `${guild.channels.cache.size}`, inline: true }
      )
      .setFooter({
        text: `${interaction.client.user.username} • ${new Date().toLocaleTimeString()}`,
        iconURL: interaction.client.user.displayAvatarURL()
      });

    await interaction.reply({ embeds: [embed] });
  }
};
