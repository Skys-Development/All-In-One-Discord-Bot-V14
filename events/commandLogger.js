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
      .setTitle('Command Executed')
      .setColor(config.embedColor || '#5865F2')
      .addFields(
        { 
          name: '👤 User',
          value: `${interaction.user.tag}\n${interaction.user.id}`,
          inline: true 
        },
        { 
          name: '⌨️ Command',
          value: `/${interaction.commandName}`,
          inline: true 
        },
        { 
          name: '📍 Channel',
          value: `${interaction.channel.name}\n${interaction.channel.id}`,
          inline: true 
        },
        {
          name: '🔧 Options',
          value: options.length ? options.join('\n') : 'None',
          inline: true
        },
        {
          name: '⏰ Created',
          value: `<t:${Math.floor(interaction.user.createdTimestamp / 1000)}:R>`,
          inline: true
        }
      );

    if (interaction.guild) {
      embed.addFields(
        {
          name: '🏠 Server',
          value: `${interaction.guild.name}\n${interaction.guild.id}`,
          inline: true
        },
        {
          name: '👥 Members',
          value: `${interaction.guild.memberCount}`,
          inline: true
        },
        {
          name: '📅 Joined',
          value: `<t:${Math.floor(interaction.member.joinedTimestamp / 1000)}:R>`,
          inline: true
        },
        {
          name: '📋 Nickname',
          value: interaction.member.nickname || 'None',
          inline: true
        },
        {
          name: '💫 Roles',
          value: `${interaction.member.roles.cache.size - 1}`,
          inline: true
        }
      );
    }

    embed
      .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
      .setTimestamp()
      .setFooter({ 
        text: `${interaction.client.user.username}`, 
        iconURL: interaction.client.user.displayAvatarURL() 
      });

    try {
      await logChannel.send({ embeds: [embed] });
    } catch (error) {
      console.error('Failed to send command log:', error);
    }
  }
};
