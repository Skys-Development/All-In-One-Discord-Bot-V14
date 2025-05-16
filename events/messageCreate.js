const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const axios = require('axios');
const config = require('../config.json');

// Track if the bot is currently processing a message
let isProcessing = false;
// Queue to store pending messages
const messageQueue = [];

module.exports = {
  name: 'messageCreate',
  async execute(message, client) {
    if (message.author.bot || message.channel.id !== config.AIChatChannel) return;

    // Add message to queue if bot is busy
    if (isProcessing) {
      messageQueue.push({ message, time: Date.now() });
      return message.reply({ 
        content: "⏳ I'm currently processing another message. I'll get to yours soon!",
        ephemeral: true 
      });
    }

    await processMessage(message);
  },
};

async function processMessage(message) {
  isProcessing = true;

  try {
    await message.channel.sendTyping();

    // Longer delay to prevent API overload
    await new Promise(resolve => setTimeout(resolve, Math.floor(Math.random() * 3000) + 3000));

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

    // Remove mentions
    reply = reply.replace(/<@!?[0-9]+>/g, '')
                 .replace(/<@&[0-9]+>/g, '')
                 .replace(/@everyone/g, '')
                 .replace(/@here/g, '');

    const maxChunkSize = 2000;
    const chunks = reply.match(new RegExp(`.{1,${maxChunkSize}}`, 'g')) || [];

    const buttonRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel('Powered by William\'s Projects')
        .setStyle(ButtonStyle.Secondary)
        .setCustomId('disabled_button')
        .setDisabled(true)
    );

    // Send chunks with delay between each
    for (let i = 0; i < chunks.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay between chunks
      await message.channel.send({
        content: chunks[i].trim(),
        components: i === chunks.length - 1 ? [buttonRow] : []
      });
    }

  } catch (error) {
    console.error('AI error:', error.response?.data || error.message);
    
    await message.reply({
      content: "🚨 AI processing error! Please try again later.",
      components: [new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setLabel('Powered by William\'s Projects')
          .setStyle(ButtonStyle.Secondary)
          .setCustomId('disabled_button')
          .setDisabled(true)
      )]
    });
  } finally {
    isProcessing = false;
    
    // Process next message in queue if any
    if (messageQueue.length > 0) {
      const nextMessage = messageQueue.shift();
      // Only process messages less than 5 minutes old
      if (Date.now() - nextMessage.time < 300000) {
        await processMessage(nextMessage.message);
      }
    }
  }
}
