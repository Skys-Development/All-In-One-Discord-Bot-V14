const { SlashCommandBuilder, PermissionsBitField, MessageFlags } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Kick a member from the server')
    .addUserOption(option =>
      option.setName('target')
        .setDescription('The member to kick')
        .setRequired(true)
    ),

  async execute(interaction) {
    const target = interaction.options.getUser('target');
    const member = await interaction.guild.members.fetch(target.id);

    if (!member) {
      return interaction.reply({
        content: 'Could not find the member.',
        flags: MessageFlags.Ephemeral
      });
    }

    if (!interaction.member.permissions.has(PermissionsBitField.Flags.KickMembers)) {
      return interaction.reply({
        content: 'You do not have permission to kick members.',
        flags: MessageFlags.Ephemeral
      });
    }

    if (!interaction.guild.members.me.permissions.has(PermissionsBitField.Flags.KickMembers)) {
      return interaction.reply({
        content: 'I do not have permission to kick members.',
        flags: MessageFlags.Ephemeral
      });
    }

    try {
      await member.kick('Kicked by command');
      return interaction.reply({
        content: `${member.user.tag} has been kicked.`,
        flags: 0
      });
    } catch (error) {
      console.error(error);
      return interaction.reply({
        content: 'There was an error trying to kick this member.',
        flags: MessageFlags.Ephemeral
      });
    }
  }
};
