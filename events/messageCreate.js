const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const axios = require('axios');
const config = require('../config.json');

module.exports = {
  name: 'messageCreate',
  async execute(message, client) {
    if (message.author.bot) return;
    if (message.channel.id !== config.AIChatChannel) return;

    try {
      await message.channel.sendTyping();
      const delay = Math.floor(Math.random() * 2000) + 2000;
      await new Promise(resolve => setTimeout(resolve, delay));

      const response = await axios.post(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          model: 'meta-llama/llama-4-scout-17b-16e-instruct',
          messages: [{ role: 'user', content: message.content }],
        },
        {
          headers: {
            Authorization: `Bearer ${config.GROQ_API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );

      let reply = response.data.choices[0].message.content;
      const maxChunkSize = 2000;
      const chunks = reply.match(new RegExp(`.{1,${maxChunkSize}}`, 'g')) || [];

      const button = new ButtonBuilder()
        .setLabel('Powered by William\'s Projects')
        .setStyle(ButtonStyle.Secondary)
        .setCustomId('disabled_button')
        .setDisabled(true);

      const row = new ActionRowBuilder().addComponents(button);

      for (let i = 0; i < chunks.length; i++) {
        await message.channel.send({
          content: chunks[i],
          components: i === chunks.length - 1 ? [row] : []
        });
      }
    } catch (error) {
      console.error('AI error:', error.response?.data || error.message);
      await message.reply({
        content: "Something went wrong with the AI. Please try again!",
        components: [new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setLabel('Powered by William\'s Projects')
            .setStyle(ButtonStyle.Secondary)
            .setCustomId('disabled_button')
            .setDisabled(true)
        )]
      });
    }
  },
};
