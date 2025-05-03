const { SlashCommandBuilder, PermissionsBitField, EmbedBuilder } = require('discord.js');
const config = require('../config.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('invites')
    .setDescription('Check a user\'s invite statistics')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user to check invites for')
        .setRequired(false)
    ),

  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
      return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
    }

    const targetUser = interaction.options.getUser('user') || interaction.user;

    try {
      const invites = await interaction.guild.invites.fetch();
      const userInvites = invites.filter(invite => invite.inviter.id === targetUser.id);

      let totalInvites = userInvites.reduce((total, invite) => total + (invite.uses || 0), 0);

      const embed = new EmbedBuilder()
        .setTitle(`${targetUser.username}'s Invite Stats`)
        .addFields({ name: 'Total Invites', value: `${totalInvites}`, inline: true })
        .setColor(config.embedColor)
        .setTimestamp()
        .setFooter({ 
          text: interaction.client.user.username, 
          iconURL: interaction.client.user.displayAvatarURL() 
        });

      interaction.reply({ embeds: [embed] });
    } catch {
      return interaction.reply({ content: 'There was an error fetching invite statistics.', ephemeral: true });
    }
  }
};
