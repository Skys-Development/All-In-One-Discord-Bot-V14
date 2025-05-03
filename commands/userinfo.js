const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const config = require('../config.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('userinfo')
    .setDescription('Displays information about a user')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user to get information about')
        .setRequired(false)
    ),

  async execute(interaction) {
    const user = interaction.options.getUser('user') || interaction.user;
    const member = await interaction.guild.members.fetch(user.id);

    const embed = new EmbedBuilder()
      .setTitle(`User Info - ${user.username}`)
      .setDescription(`Here is the information about ${user.username}`)
      .setColor(config.embedColor)
      .setThumbnail(user.displayAvatarURL())
      .addFields(
        { name: 'User ID', value: user.id, inline: true },
        { name: 'Username', value: user.username, inline: true },
        { name: 'Discriminator', value: `#${user.discriminator}`, inline: true },
        { name: 'Joined Server', value: member.joinedAt.toLocaleDateString(), inline: true },
        { name: 'Account Created', value: user.createdAt.toLocaleDateString(), inline: true },
        { name: 'Status', value: member.presence ? member.presence.status : 'Offline', inline: true }
      )
      .setTimestamp()
      .setFooter({ 
        text: interaction.client.user.username, 
        iconURL: interaction.client.user.displayAvatarURL() 
      });

    await interaction.reply({ embeds: [embed] });
  }
};
