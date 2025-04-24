const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('mute')
    .setDescription('Mute a member to prevent them from sending messages')
    .addUserOption(option =>
      option.setName('member')
        .setDescription('The member to mute')
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

      await member.roles.add(muteRole);
      return interaction.reply({
        content: `${member.user.tag} has been muted.`,
        ephemeral: false
      });
    } catch (error) {
      console.error(error);
      return interaction.reply({
        content: 'There was an error trying to mute the member.',
        ephemeral: true
      });
    }
  }
};
