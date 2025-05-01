const { EmbedBuilder } = require('discord.js');
const axios = require('axios');
const fs = require('fs');
const config = require('../config.json');
const { green, red, yellow } = require('colorette');

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
      status: node.attributes.maintenance_mode ? 'Offline' : 'Online',
      memory: `${Math.round(node.attributes.memory / 1024)} GB`,
      disk: `${Math.round(node.attributes.disk / 1024)} GB`,
      servers: serversResponse.data.data.filter(server => server.attributes.node === node.attributes.id).length,
    }));

    return { nodeStats };
  } catch (error) {
    if (error.code === 'ENOTFOUND') return null;
    console.error(red('❌ Error fetching Pterodactyl panel stats:'), error.message);
    return null;
  }
}

async function updateEmbed(channel) {
  const stats = await fetchPanelStats();
  if (!stats) return;

  const nodeDetails = stats.nodeStats.map(node => 
    `**${node.name}** - ${node.status}\nMemory: ${node.memory}\nDisk: ${node.disk}\nServers: ${node.servers}`
  ).join('\n\n');

  const embedContent = new EmbedBuilder()
    .setTitle(`${config.PANEL_NAME} Node Stats`)
    .setDescription(nodeDetails)
    .setColor(config.embedColor)
    .setTimestamp()
    .setFooter({
      text: `${config.BOT_NAME} • ${new Date().toLocaleTimeString()}`,
      iconURL: config.BOT_ICON_URL
    });

  if (config.panelEmbedId) {
    try {
      const message = await channel.messages.fetch(config.panelEmbedId);
      await message.edit({ embeds: [embedContent] });
    } catch {
      const sentMessage = await channel.send({ embeds: [embedContent] });
      config.panelEmbedId = sentMessage.id;
      fs.writeFileSync('./config.json', JSON.stringify(config, null, 2));
    }
  } else {
    const sentMessage = await channel.send({ embeds: [embedContent] });
    config.panelEmbedId = sentMessage.id;
    fs.writeFileSync('./config.json', JSON.stringify(config, null, 2));
  }
}

module.exports = {
  name: 'ready',
  async execute(client) {
    const channel = client.channels.cache.get(config.PANEL_STATUS_CHANNEL_ID);
    if (!channel) return;

    await updateEmbed(channel);
    setInterval(async () => {
      await updateEmbed(channel);
    }, 30000);
  },
};
