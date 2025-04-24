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
          messages: [
            {
              role: 'user',
              content: message.content,
            },
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${config.GROQ_API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const reply = response.data.choices[0].message.content;
      message.reply(reply);
    } catch (error) {
      console.error('AI error:', error.response?.data || error.message);
      message.reply("Something went wrong with the AI. Please try again!");
    }
  },
};
