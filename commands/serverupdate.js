const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const config = require('../config.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('serverupdate')
    .setDescription('Post a server update with an optional mention')
    .addStringOption(option =>
      option.setName('content')
        .setDescription('Enter the update text')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('mention')
        .setDescription('Choose how to notify members')
        .setRequired(false)
        .addChoices(
          { name: '@here', value: '@here' },
          { name: '@everyone', value: '@everyone' }
        )
    )
    .addRoleOption(option =>
      option.setName('role')
        .setDescription('Mention a specific role')
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const content = interaction.options.getString('content');
    const mention = interaction.options.getString('mention');
    const role = interaction.options.getRole('role');

    let mentionText = '';
    if (mention) mentionText = mention;
    if (role) mentionText = `<@&${role.id}>`;

    const embedColor = config.embedColor;

    const chunkSize = 4096;
    const contentChunks = content.match(new RegExp(`.{1,${chunkSize}}`, 'g')) || [];

    const embeds = contentChunks.map((chunk, index) => {
      return new EmbedBuilder()
        .setTitle(index === 0 ? '📢 Server Update' : '📢 Continued...')
        .setDescription(chunk)
        .setColor(embedColor)
        .setTimestamp()
        .setFooter({
          text: interaction.client.user.username,
          iconURL: interaction.client.user.displayAvatarURL()
        });
    });

    await interaction.channel.send({
      content: mentionText,
      embeds,
      allowedMentions: { parse: ['everyone', 'roles', 'users'] }
    });

    await interaction.reply({ content: '✅ Update posted successfully!', flags: 64 });
  }
};