const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');
const config = require('../config.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('youtube')
    .setDescription('Search for a video on YouTube')
    .addStringOption(option =>
      option.setName('query')
        .setDescription('Enter your search query')
        .setRequired(true)
    ),

  async execute(interaction) {
    const query = interaction.options.getString('query');
    const embedColor = config.embedColor;
    const youtubeApiKey = config.YOUTUBE_API_KEY;
    
    if (!youtubeApiKey) {
      return interaction.reply({ content: '❌ YouTube API key is missing from config.', flags: 64 });
    }

    try {
      const response = await axios.get(`https://www.googleapis.com/youtube/v3/search`, {
        params: {
          q: query,
          key: youtubeApiKey,
          part: 'snippet',
          maxResults: 1,
          type: 'video'
        }
      });

      const video = response.data.items[0];
      if (!video) {
        return interaction.reply({ content: '❌ No results found.', flags: 64 });
      }

      const embed = new EmbedBuilder()
        .setTitle(video.snippet.title)
        .setURL(`https://www.youtube.com/watch?v=${video.id.videoId}`)
        .setDescription(video.snippet.description || 'No description available.')
        .setImage(video.snippet.thumbnails.high.url)
        .setColor(embedColor)
        .setTimestamp()
        .setFooter({
          text: interaction.client.user.username,
          iconURL: interaction.client.user.displayAvatarURL()
        });

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      await interaction.reply({ content: '❌ Error fetching YouTube results.', flags: 64 });
    }
  }
};
