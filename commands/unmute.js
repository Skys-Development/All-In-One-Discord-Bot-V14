const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unmute')
    .setDescription('Unmute a member to allow them to send messages')
    .addUserOption(option =>
      option.setName('member')
        .setDescription('The member to unmute')
        .setRequired(true)
    ),

  async execute(interaction) {
    const member = interaction.options.getMember('member');

    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
      return interaction.reply({
        content: 'You do not have permission to manage roles.',
        ephemeral: true
      });
    }

    if (!interaction.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
      return interaction.reply({
        content: 'I do not have permission to manage roles.',
        ephemeral: true
      });
    }

    try {
      const muteRole = interaction.guild.roles.cache.find(role => role.name === 'Muted');
      if (!muteRole) {
        return interaction.reply({
          content: 'Muted role not found. Please create a "Muted" role with appropriate permissions.',
          ephemeral: true
        });
      }

      await member.roles.remove(muteRole);
      return interaction.reply({
        content: `${member.user.tag} has been unmuted.`,
        ephemeral: false
      });
    } catch (error) {
      console.error(error);
      return interaction.reply({
        content: 'There was an error trying to unmute the member.',
        ephemeral: true
      });
    }
  }
};
