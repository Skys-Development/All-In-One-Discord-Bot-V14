const { Events, EmbedBuilder } = require('discord.js');
const config = require('../config.json');

module.exports = {
  name: Events.GuildCreate,
  async execute(guild, client) {
    const logChannel = client.channels.cache.get(config.DEV_LOG_CHANNEL_ID);
    if (!logChannel) return;

    const embedColor = config.embedColor;
    const owner = await guild.fetchOwner();
    const invite = await generateInvite(guild);

    const embed = new EmbedBuilder()
      .setTitle('🟢 Bot Added to a Server')
      .setColor(embedColor)
      .addFields(
        { name: 'Server Name', value: guild.name, inline: true },
        { name: 'Server ID', value: guild.id, inline: true },
        { name: 'Owner', value: `${owner.user.tag} (${owner.user.id})`, inline: true },
        { name: 'Member Count', value: guild.memberCount.toString(), inline: true },
        { name: 'Invite Link', value: invite || 'Failed to generate', inline: false }
      )
      .setTimestamp()
      .setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL() });

    logChannel.send({ embeds: [embed] });
  }
};

async function generateInvite(guild) {
  try {
    const channels = guild.channels.cache.filter(channel => channel.type === 0);
    const firstChannel = channels.first();
    if (!firstChannel) return null;

    const invite = await firstChannel.createInvite({ maxAge: 0, maxUses: 1 });
    return invite.url;
  } catch {
    return null;
  }
}
