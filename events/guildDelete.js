const { Events, EmbedBuilder } = require('discord.js');
const config = require('../config.json');

module.exports = {
  name: Events.GuildDelete,
  async execute(guild, client) {
    const logChannel = client.channels.cache.get(config.DEV_LOG_CHANNEL_ID);
    if (!logChannel) return;

    const embedColor = config.embedColor;

    const embed = new EmbedBuilder()
      .setTitle('🔴 Bot Removed from a Server')
      .setColor(embedColor)
      .addFields(
        { name: 'Server Name', value: guild.name, inline: true },
        { name: 'Server ID', value: guild.id, inline: true },
        { name: 'Member Count Before Removal', value: guild.memberCount.toString(), inline: true }
      )
      .setTimestamp()
      .setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL() });

    logChannel.send({ embeds: [embed] });
  }
};
