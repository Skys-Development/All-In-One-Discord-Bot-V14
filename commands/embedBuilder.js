const { SlashCommandBuilder, PermissionsBitField, MessageFlags, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('embed')
    .setDescription('Send a custom embed using JSON format')
    .addStringOption(option =>
      option.setName('json')
        .setDescription('Provide embed JSON')
        .setRequired(true)
    ),

  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
      return interaction.reply({
        content: '❌ You do not have permission to use this command.',
        flags: MessageFlags.Ephemeral
      });
    }

    if (!interaction.guild.members.me.permissions.has(PermissionsBitField.Flags.SendMessages)) {
      return interaction.reply({
        content: '❌ I do not have permission to send messages.',
        flags: MessageFlags.Ephemeral
      });
    }

    const jsonInput = interaction.options.getString('json');

    let embedData;
    try {
      embedData = JSON.parse(jsonInput);

      if (!embedData.description) {
        embedData.description = ' ';
      }
    } catch (error) {
      return interaction.reply({
        content: '❌ Invalid JSON format. Please check your syntax.',
        flags: MessageFlags.Ephemeral
      });
    }

    const embed = new EmbedBuilder(embedData);

    try {
      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      return interaction.reply({
        content: '❌ There was an error generating the embed.',
        flags: MessageFlags.Ephemeral
      });
    }
  }
};
