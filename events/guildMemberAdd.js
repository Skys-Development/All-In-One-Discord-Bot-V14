const { EmbedBuilder } = require('discord.js');
const config = require('../config.json');

module.exports = {
  name: 'guildMemberAdd',
  async execute(member) {
    if (member.user.bot) return;
    if (config.MEMBER_ROLE_ID) {
      try {
        await member.roles.add(config.MEMBER_ROLE_ID);
      } catch (error) {
        console.error('Failed to add member role:', error);
      }
    }
    const channel = member.guild.channels.cache.get(config.WELCOME_CHANNEL_ID);
    if (!channel) return;

    const embed = new EmbedBuilder()
      .setTitle('Welcome!')
      .setDescription(`Welcome to the server, ${member}! 🎉`)
      .setColor(config.embedColor || '#2F3136')
      .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
      .setTimestamp()
      .setFooter({ 
        text: member.user.tag, 
        iconURL: member.user.displayAvatarURL() 
      });

    try {
      await channel.send({ embeds: [embed] });
    } catch (error) {
      console.error('Failed to send welcome message:', error);
    }
  },
};
