const { Events } = require('discord.js');
const config = require('../config.json');

module.exports = {
  name: Events.MessageCreate,
  async execute(message) {
    if (message.author.bot) return;

    const reviewChannelId = config.REVIEWS_CHANNEL_ID;
    if (!reviewChannelId) return console.error('❌ Review channel ID is missing in config.json');
    if (message.channel.id !== reviewChannelId) return;

    message.reply("Thank you for your feedback! We will look into it. Feel free to share more thoughts as we strive to create the best server experience for you. Sorry if support wasn't up to expectations—we're always working to improve!");
  }
};
