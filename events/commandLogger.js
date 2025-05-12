const { Events, EmbedBuilder } = require('discord.js');
const config = require('../config.json');

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    if (!interaction.isCommand()) return;

    const logChannel = interaction.client.channels.cache.get(config.DEV_LOG_CHANNEL_ID);
    if (!logChannel) return;

    const embedColor = config.embedColor;

    const embed = new EmbedBuilder()
      .setTitle('📝 Command Used')
      .setColor(embedColor)
      .addFields(
        { name: 'User', value: `${interaction.user.tag} (${interaction.user.id})`, inline: true },
        { name: 'Command', value: `/${interaction.commandName}`, inline: true },
        { name: 'Channel', value: `${interaction.channel.name} (${interaction.channel.id})`, inline: true },
        { name: 'Guild', value: interaction.guild ? `${interaction.guild.name} (${interaction.guild.id})` : 'DMs', inline: true }
      )
      .setTimestamp()
      .setFooter({ text: interaction.client.user.username, iconURL: interaction.client.user.displayAvatarURL() });

    logChannel.send({ embeds: [embed] });
  }
};
