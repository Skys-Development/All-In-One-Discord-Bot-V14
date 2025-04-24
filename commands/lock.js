const { SlashCommandBuilder, PermissionsBitField, MessageFlags } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('lock')
    .setDescription('Lock a channel to prevent members from sending messages')
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('The channel to lock')
        .setRequired(true)
    ),

  async execute(interaction) {
    const channel = interaction.options.getChannel('channel');

    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
      return interaction.reply({
        content: 'You do not have permission to manage channels.',
        flags: MessageFlags.Ephemeral
      });
    }

    if (!interaction.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
      return interaction.reply({
        content: 'I do not have permission to manage channels.',
        flags: MessageFlags.Ephemeral
      });
    }

    try {
      await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, { SendMessages: false });
      return interaction.reply({
        content: `🔒 The channel ${channel.name} has been locked.`,
        flags: 0
      });
    } catch (error) {
      console.error(error);
      return interaction.reply({
        content: 'There was an error trying to lock the channel.',
        flags: MessageFlags.Ephemeral
      });
    }
  }
};
