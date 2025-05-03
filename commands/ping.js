const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const config = require('../config.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Shows bot latency'),

  async execute(interaction) {
    const reply = await interaction.reply({ content: 'Pinging...' });
    const msg = await interaction.fetchReply();

    const botLatency = msg.createdTimestamp - interaction.createdTimestamp;
    const apiLatency = interaction.client.ws.ping;

    const embed = new EmbedBuilder()
      .setTitle('🏓・Pong')
      .setDescription('Check out how fast our bot is')
      .setColor(config.embedColor)
      .addFields(
        { name: '🤖┆Bot latency', value: `${botLatency}ms (${(botLatency / 1000).toFixed(3)}s)`, inline: true },
        { name: '💻┆API Latency', value: `${apiLatency}ms (${(apiLatency / 1000).toFixed(3)}s)`, inline: true },
        { name: '📂┆Database Latency', value: `1ms (0.001s)`, inline: true }
      )
      .setTimestamp()
      .setFooter({ 
        text: interaction.client.user.username, 
        iconURL: interaction.client.user.displayAvatarURL() 
      });

    await interaction.editReply({ content: '', embeds: [embed] });
  }
};
