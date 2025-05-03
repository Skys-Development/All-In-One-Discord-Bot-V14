const { EmbedBuilder } = require('discord.js');
const axios = require('axios');
const fs = require('fs');
const config = require('../config.json');

async function updateEmbed(channel, client) {
  const mcServerIp = config.MC_SERVER_IP;
  let embedContent;

  try {
    const response = await axios.get(`https://api.mcsrvstat.us/2/${mcServerIp}`);
    const data = response.data;

    if (response.status >= 500) return;

    const motd = data.motd?.clean ? data.motd.clean.join('\n') : 'No MOTD available';
    const playersOnline = data.players?.online ? `${data.players.online}` : '0';
    const maxPlayers = data.players?.max ? `${data.players.max}` : 'Unknown';
    const serverVersion = data.version || 'Unknown';
    const serverSoftware = data.software || 'Unknown';

    embedContent = new EmbedBuilder()
      .setTitle('Minecraft Server Status')
      .setDescription(data.online ? '🟢 The server is online!' : '🔴 The server is offline.')
      .addFields(
        { name: 'IP Address', value: mcServerIp, inline: true },
        { name: 'Players Online', value: `${playersOnline}/${maxPlayers}`, inline: true },
        { name: 'Version', value: serverVersion, inline: true },
        { name: 'Software', value: serverSoftware, inline: true },
        { name: 'MOTD', value: motd }
      )
      .setColor(config.embedColor)
      .setThumbnail(client.user.displayAvatarURL())
      .setTimestamp()
      .setFooter({ 
        text: client.user.username, 
        iconURL: client.user.displayAvatarURL()
      });

    if (config.MCEmbedId) {
      try {
        const message = await channel.messages.fetch(config.MCEmbedId);
        await message.edit({ embeds: [embedContent] });
      } catch {
        const sentMessage = await channel.send({ embeds: [embedContent] });
        config.MCEmbedId = sentMessage.id;
        fs.writeFileSync('./config.json', JSON.stringify(config, null, 2));
      }
    } else {
      const sentMessage = await channel.send({ embeds: [embedContent] });
      config.MCEmbedId = sentMessage.id;
      fs.writeFileSync('./config.json', JSON.stringify(config, null, 2));
    }
  } catch {
    return;
  }
}

module.exports = {
  name: 'ready',
  async execute(client) {
    const channel = client.channels.cache.get(config.MC_STATUS_CHANNEL_ID);
    if (!channel) return;

    await updateEmbed(channel, client);
    setInterval(async () => {
      await updateEmbed(channel, client);
    }, 30000);
  },
};
