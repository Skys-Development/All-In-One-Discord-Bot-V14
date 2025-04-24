const { EmbedBuilder } = require('discord.js');
const config = require('../config.json');

module.exports = {
  name: 'guildMemberAdd',

  async execute(member) {
    const channel = member.guild.channels.cache.get(config.WELCOME_CHANNEL_ID);

    if (!channel) return;

    const embed = new EmbedBuilder()
      .setTitle('🎉 Welcome to the Server!')
      .setDescription(`Hi ${member.user}, welcome to **${member.guild.name}**! We're glad to have you here.`)
      .setColor(config.embedColor)
      .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
      .addFields(
        { name: '👋 Getting Started', value: 'Feel free to introduce yourself and explore the server!' },
        { name: '📚 Rules & Guidelines', value: 'Check out the rules channel to stay informed.' },
        { name: '🎮 Have Fun!', value: 'We hope you enjoy your stay with us!' }
      )
      .setFooter({
        text: `User joined: ${member.user.tag}`,
        iconURL: member.user.displayAvatarURL({ dynamic: true })
      })
      .setTimestamp();

    channel.send({ embeds: [embed] });
  },
};
