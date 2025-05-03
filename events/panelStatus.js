const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const axios = require('axios');
const fs = require('fs');
const config = require('../config.json');

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
  } catch {
    return null;
  }
}

async function updateEmbed(channel, client) {
  const stats = await fetchPanelStats();
  if (!stats) return;

  const nodeDetails = stats.nodeStats.map(node => 
    `**${node.name}** - ${node.status}\nMemory: ${node.memory}\nDisk: ${node.disk}\nServers: ${node.servers}`
  ).join('\n\n');

  const embedContent = new EmbedBuilder()
    .setTitle(`William's Hosting Panel Stats`)
    .setDescription(nodeDetails)
    .setColor(config.embedColor)
    .setTimestamp()
    .setFooter({ 
      text: client.user.username, 
      iconURL: client.user.displayAvatarURL() 
    });

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setLabel('Visit Panel')
      .setURL(config.PANEL_URL)
      .setStyle(ButtonStyle.Link)
  );

  if (config.panelEmbedId) {
    try {
      const message = await channel.messages.fetch(config.panelEmbedId);
      await message.edit({ embeds: [embedContent], components: [row] });
    } catch {
      const sentMessage = await channel.send({ embeds: [embedContent], components: [row] });
      config.panelEmbedId = sentMessage.id;
      fs.writeFileSync('./config.json', JSON.stringify(config, null, 2));
    }
  } else {
    const sentMessage = await channel.send({ embeds: [embedContent], components: [row] });
    config.panelEmbedId = sentMessage.id;
    fs.writeFileSync('./config.json', JSON.stringify(config, null, 2));
  }
}

module.exports = {
  name: 'ready',
  async execute(client) {
    const channel = client.channels.cache.get(config.PANEL_STATUS_CHANNEL_ID);
    if (!channel) return;

    await updateEmbed(channel, client);
    setInterval(async () => {
      await updateEmbed(channel, client);
    }, 30000);
  },
};
