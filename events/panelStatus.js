const { EmbedBuilder } = require('discord.js');
const axios = require('axios');
const fs = require('fs');
const config = require('../config.json');
const { green, red, yellow, cyan } = require('colorette');

async function fetchPanelStats() {
  const headers = {
    'Authorization': `Bearer ${config.PTERODACTYL_API_KEY}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  try {
    const nodesResponse = await axios.get(`${config.PANEL_URL}/api/application/nodes`, { headers });
    const serversResponse = await axios.get(`${config.PANEL_URL}/api/application/servers`, { headers });

    const nodeStats = nodesResponse.data.data.map(node => ({
      name: node.attributes.name,
      status: node.attributes.maintenance_mode ? ':red_circle: Offline' : ':green_circle: Online',
      memory: `${Math.round(node.attributes.memory / 1024)} GB`,
      disk: `${Math.round(node.attributes.disk / 1024)} GB`,
      servers: serversResponse.data.data.filter(server => server.attributes.node === node.attributes.id).length,
    }));

    return { nodeStats };
  } catch (error) {
    console.error(red('❌ Error fetching Pterodactyl panel stats:'), error.message);
    return null;
  }
}

async function updateEmbed(channel) {
  const stats = await fetchPanelStats();
  if (!stats) {
    console.log(red('⚠️ Could not retrieve panel stats.'));
    return;
  }

  const nodeDetails = stats.nodeStats.map(node => 
    `**${node.name}** - ${node.status}\nMemory: ${node.memory}\nDisk: ${node.disk}\nServers: ${node.servers}`
  ).join('\n\n');

  const embedContent = new EmbedBuilder()
    .setTitle(`${config.PANEL_NAME} Node Stats`)
    .setDescription(nodeDetails)
    .setColor('#5865F2')
    .setTimestamp();

  if (config.panelEmbedId) {
    try {
      const message = await channel.messages.fetch(config.panelEmbedId);
      await message.edit({ embeds: [embedContent] });
    } catch {
      console.log(red('⚠️ Previous embed not found, sending a new one.'));
      const sentMessage = await channel.send({ embeds: [embedContent] });
      config.panelEmbedId = sentMessage.id;
      fs.writeFileSync('./config.json', JSON.stringify(config, null, 2));
      console.log(green(`📌 Sent new embed (ID: ${config.panelEmbedId})`));
    }
  } else {
    console.log(yellow('📌 Sending initial embed.'));
    const sentMessage = await channel.send({ embeds: [embedContent] });
    config.panelEmbedId = sentMessage.id;
    fs.writeFileSync('./config.json', JSON.stringify(config, null, 2));
    console.log(green(`✅ Initial embed sent (ID: ${config.panelEmbedId})`));
  }
}

module.exports = {
  name: 'ready',
  async execute(client) {
    const channel = client.channels.cache.get(config.PANEL_STATUS_CHANNEL_ID);
    if (!channel) return console.log(red('❌ Error: Panel status channel not found.'));

    await updateEmbed(channel);

    setInterval(async () => {
      await updateEmbed(channel);
    }, 30000);
  },
};
