const { Events, EmbedBuilder } = require('discord.js');
const config = require('../config.json');

module.exports = {
  name: Events.MessageCreate,
  async execute(message) {
    if (message.author.bot) return;

    const reviewChannelId = config.REVIEWS_CHANNEL_ID;
    if (!reviewChannelId) return;
    if (message.channel.id !== reviewChannelId) return;

    const embed = new EmbedBuilder()
      .setTitle('Thank You for Your Feedback!')
      .setDescription(
        "We appreciate your input and will review your message. \n\n" +
        "Feel free to share more thoughts as we strive to create the best server experience for you. " +
        "If support wasn't up to expectations, we're always working to improve!"
      )
      .setColor(config.embedColor)
      .setTimestamp()
      .setFooter({ 
        text: message.client.user.username, 
        iconURL: message.client.user.displayAvatarURL() 
      });

    message.reply({ embeds: [embed] });
  }
};
