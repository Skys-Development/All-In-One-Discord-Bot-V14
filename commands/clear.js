const { SlashCommandBuilder, PermissionsBitField, MessageFlags } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('clear')
    .setDescription('Delete up to 100 messages in the channel')
    .addIntegerOption(option =>
      option.setName('amount')
        .setDescription('Number of messages to delete (1-100)')
        .setRequired(true)
    ),

  async execute(interaction) {
    const amount = interaction.options.getInteger('amount');

    if (amount < 1 || amount > 100) {
      return interaction.reply({
        content: 'Please specify a number between 1 and 100.',
        flags: MessageFlags.Ephemeral
      });
    }

    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
      return interaction.reply({
        content: 'You do not have permission to delete messages.',
        flags: MessageFlags.Ephemeral
      });
    }

    if (!interaction.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
      return interaction.reply({
        content: 'I do not have permission to delete messages.',
        flags: MessageFlags.Ephemeral
      });
    }

    try {
      const deletedMessages = await interaction.channel.bulkDelete(amount, true);
      return interaction.reply({
        content: `Successfully deleted ${deletedMessages.size} messages.`,
        flags: MessageFlags.Ephemeral
      });
    } catch (error) {
      console.error(error);
      return interaction.reply({
        content: 'There was an error trying to delete messages.',
        flags: MessageFlags.Ephemeral
      });
    }
  }
};
