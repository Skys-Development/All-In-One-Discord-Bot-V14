const { Events, EmbedBuilder } = require('discord.js');
const config = require('../config.json');

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    if (!interaction.isCommand()) return;

    const logChannel = interaction.client.channels.cache.get(config.DEV_LOG_CHANNEL_ID);
    if (!logChannel) return;

    const options = interaction.options.data.map(option => {
      let value = option.value;

      if (option.type === 6) value = `<@${option.value}>`;
      if (option.type === 7) value = `<#${option.value}>`; 
      if (option.type === 8) value = `<@&${option.value}>`;
      if (option.type === 11) value = `[Attachment: ${option.value.name}]`;

      if (option.type === 1 || option.type === 2) {
        const subOptions = option.options?.map(o => `${o.name}: ${o.value}`).join(', ') || 'No options';
        return `${option.name} (${subOptions})`;
      }

      return `${option.name}: ${value}`;
    });

    const embed = new EmbedBuilder()
      .setTitle('📝 Command Executed')
      .setColor(config.embedColor || '#5865F2')
      .addFields(
        { 
          name: '👤 User Info',
          value: [
            `**Tag:** ${interaction.user.tag}`,
            `**ID:** ${interaction.user.id}`,
            `**Created:** <t:${Math.floor(interaction.user.createdTimestamp / 1000)}:R>`,
          ].join('\n'),
          inline: true 
        },
        { 
          name: '⌨️ Command Details',
          value: [
            `**Name:** \`/${interaction.commandName}\``,
            `**Options:** ${options.length ? `\`${options.join('`, `')}\`` : 'None'}`,
          ].join('\n'),
          inline: true 
        },
        { 
          name: '📍 Location',
          value: [
            `**Channel:** ${interaction.channel.name} (<#${interaction.channel.id}>)`,
            `**Category:** ${interaction.channel.parent?.name || 'None'}`,
            interaction.guild ? `**Guild:** ${interaction.guild.name}` : '**DM Channel**'
          ].join('\n'),
          inline: true 
        }
      );

    if (interaction.guild) {
      embed.addFields({
        name: '🏠 Guild Details',
        value: [
          `**Name:** ${interaction.guild.name}`,
          `**ID:** ${interaction.guild.id}`,
          `**Members:** ${interaction.guild.memberCount}`,
          `**Created:** <t:${Math.floor(interaction.guild.createdTimestamp / 1000)}:R>`
        ].join('\n'),
        inline: false
      });
    }

    if (interaction.member) {
      embed.addFields({
        name: '👥 Member Details',
        value: [
          `**Nickname:** ${interaction.member.nickname || 'None'}`,
          `**Joined:** <t:${Math.floor(interaction.member.joinedTimestamp / 1000)}:R>`,
          `**Roles:** ${interaction.member.roles.cache.size - 1}`,
          `**Permissions:** ${interaction.member.permissions.toArray().map(p => `\`${p}\``).join(', ') || 'None'}`
        ].join('\n'),
        inline: false
      });
    }

    embed
      .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
      .setTimestamp()
      .setFooter({ 
        text: `${interaction.client.user.username} • Command Logger`, 
        iconURL: interaction.client.user.displayAvatarURL() 
      });

    try {
      await logChannel.send({ embeds: [embed] });
    } catch (error) {
      console.error('Failed to send command log:', error);
    }
  }
};
