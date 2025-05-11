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

      const embed = new EmbedBuilder();
      
      if (embedData.title) embed.setTitle(embedData.title);
      if (embedData.description) embed.setDescription(embedData.description);
      if (embedData.color) embed.setColor(embedData.color);
      if (embedData.fields) embed.setFields(embedData.fields);
      if (embedData.thumbnail) embed.setThumbnail(embedData.thumbnail);
      if (embedData.image) embed.setImage(embedData.image);
      if (embedData.url) embed.setURL(embedData.url);

      await interaction.reply({
        content: '✅ Done!',
        flags: MessageFlags.Ephemeral
      });

      await interaction.channel.send({ embeds: [embed] });

    } catch (error) {
      return interaction.reply({
        content: '❌ Invalid JSON format. Please check your syntax.',
        flags: MessageFlags.Ephemeral
      });
    }
  }
};
