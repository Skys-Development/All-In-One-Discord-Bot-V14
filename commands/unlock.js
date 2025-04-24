const { SlashCommandBuilder, PermissionsBitField, MessageFlags } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unlock')
    .setDescription('Unlock a channel to allow members to send messages')
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('The channel to unlock')
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
      await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, { SendMessages: true });
      return interaction.reply({
        content: `🔓 The channel ${channel.name} has been unlocked.`,
        flags: 0
      });
    } catch (error) {
      console.error(error);
      return interaction.reply({
        content: 'There was an error trying to unlock the channel.',
        flags: MessageFlags.Ephemeral
      });
    }
  }
};
