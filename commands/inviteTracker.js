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

      let totalInvites = 0;
      userInvites.forEach(invite => {
        totalInvites += invite.uses || 0;
      });

      const embedColor = config.embedColor;

      const embed = new EmbedBuilder()
        .setTitle(`${targetUser.username}'s Invite Stats`)
        .addFields(
          { name: 'Total Invites', value: `${totalInvites}`, inline: true }
        )
        .setFooter({
          text: `${interaction.client.user.username} • ${new Date().toLocaleTimeString()}`,
          iconURL: interaction.client.user.displayAvatarURL()
        })
        .setColor(embedColor);

      interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      return interaction.reply({ content: 'There was an error fetching invite statistics.', ephemeral: true });
    }
  }
};
