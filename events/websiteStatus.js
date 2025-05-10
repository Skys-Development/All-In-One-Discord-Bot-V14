const { EmbedBuilder } = require('discord.js');
const axios = require('axios');
const fs = require('fs');
const config = require('../config.json');

async function checkWebsite(url) {
  try {
    const start = Date.now();
    const response = await axios.get(url, { timeout: 5000 });
    const responseTime = Date.now() - start;

    return {
      status: '🟢 Online',
      responseTime: `${responseTime}ms`
    };
  } catch {
    return {
      status: '🔴 Offline',
      responseTime: 'N/A'
    };
  }
}

async function updateEmbed(client, channel) {
  const websites = config.WEBSITES_TO_MONITOR;
  const results = await Promise.all(websites.map(checkWebsite));

  const websiteFields = websites.map((url, index) => ({
    name: url,
    value: `**Status:** ${results[index].status}\n**Response Time:** ${results[index].responseTime}`,
    inline: false
  }));

  const botIcon = client.user.displayAvatarURL();

  const embedContent = new EmbedBuilder()
    .setTitle('Website Status')
    .setDescription('Monitoring website availability and response times.')
    .addFields(websiteFields)
    .setColor(config.embedColor)
    .setTimestamp()
    .setFooter({ 
        text: client.user.username, 
        iconURL: client.user.displayAvatarURL()
      });

  if (config.websiteEmbedId) {
    try {
      const message = await channel.messages.fetch(config.websiteEmbedId);
      await message.edit({ embeds: [embedContent] });
    } catch {
      const sentMessage = await channel.send({ embeds: [embedContent] });
      config.websiteEmbedId = sentMessage.id;
      fs.writeFileSync('./config.json', JSON.stringify(config, null, 2));
    }
  } else {
    const sentMessage = await channel.send({ embeds: [embedContent] });
    config.websiteEmbedId = sentMessage.id;
    fs.writeFileSync('./config.json', JSON.stringify(config, null, 2));
  }
}

module.exports = {
  name: 'ready',
  async execute(client) {
    const channel = client.channels.cache.get(config.WEBSITE_STATUS_CHANNEL_ID);
    if (!channel) return;

    await updateEmbed(client, channel);
    setInterval(async () => {
      await updateEmbed(client, channel);
    }, 60000);
  },
};
