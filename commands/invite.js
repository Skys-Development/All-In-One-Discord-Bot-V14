const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const config = require('../config.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('invite')
    .setDescription('Get the bot invite link'),

  async execute(interaction) {
    const embedColor = config.embedColor;
    const botInviteUrl = `https://discord.com/oauth2/authorize?client_id=${interaction.client.user.id}&permissions=8&scope=bot+applications.commands`;

    const embed = new EmbedBuilder()
      .setTitle('Invite the Bot')
      .setDescription('Click the button below to invite the bot to your server.')
      .setColor(embedColor)
      .setTimestamp()
      .setFooter({
        text: interaction.client.user.username,
        iconURL: interaction.client.user.displayAvatarURL()
      });

    const button = new ButtonBuilder()
      .setLabel('Invite Bot')
      .setStyle(ButtonStyle.Link)
      .setURL(botInviteUrl);

    const row = new ActionRowBuilder().addComponents(button);

    await interaction.reply({ embeds: [embed], components: [row] });
  }
};
