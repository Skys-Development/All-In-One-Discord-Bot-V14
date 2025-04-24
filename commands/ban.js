const { SlashCommandBuilder, PermissionsBitField, MessageFlags } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Ban a member from the server')
    .addUserOption(option =>
      option.setName('target')
        .setDescription('The member to ban')
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

    if (!interaction.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
      return interaction.reply({
        content: 'You do not have permission to ban members.',
        flags: MessageFlags.Ephemeral
      });
    }

    if (!interaction.guild.members.me.permissions.has(PermissionsBitField.Flags.BanMembers)) {
      return interaction.reply({
        content: 'I do not have permission to ban members.',
        flags: MessageFlags.Ephemeral
      });
    }

    try {
      await member.ban({ reason: 'Banned by command' });
      return interaction.reply({
        content: `${member.user.tag} has been banned.`,
        flags: 0
      });
    } catch (error) {
      console.error(error);
      return interaction.reply({
        content: 'There was an error trying to ban this member.',
        flags: MessageFlags.Ephemeral
      });
    }
  }
};
