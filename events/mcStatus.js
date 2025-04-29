const { EmbedBuilder } = require('discord.js');
const axios = require('axios');
const fs = require('fs');
const config = require('../config.json');
const { cyan, green, red, yellow } = require('colorette');

async function updateEmbed(channel) {
  const mcServerIp = config.MC_SERVER_IP;
  let embedContent;

  try {
    const response = await axios.get(`https://api.mcsrvstat.us/2/${mcServerIp}`);
    const data = response.data;

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
      .setColor(data.online ? '#00FF00' : '#FF0000')
      .setThumbnail(data.online ? `https://api.mcsrvstat.us/icon/${mcServerIp}` : null)
      .setTimestamp();

    if (config.embedId) {
      try {
        const message = await channel.messages.fetch(config.embedId);
        await message.edit({ embeds: [embedContent] });
      } catch {
        console.log(red('⚠️ Previous embed not found, sending a new one.'));
        const sentMessage = await channel.send({ embeds: [embedContent] });
        config.embedId = sentMessage.id;
        fs.writeFileSync('./config.json', JSON.stringify(config, null, 2));
        console.log(green(`📌 Sent new embed (ID: ${config.embedId})`));
      }
    } else {
      console.log(yellow('📌 Sending initial embed.'));
      const sentMessage = await channel.send({ embeds: [embedContent] });
      config.embedId = sentMessage.id;
      fs.writeFileSync('./config.json', JSON.stringify(config, null, 2));
      console.log(green(`✅ Initial embed sent (ID: ${config.embedId})`));
    }
  } catch (error) {
    console.error(red('❌ Error updating Minecraft status:'), error);
  }
}

module.exports = {
  name: 'ready',
  async execute(client) {
    const channel = client.channels.cache.get(config.MC_STATUS_CHANNEL_ID);
    if (!channel) return console.log(red('❌ Error: Minecraft status channel not found.'));

    await updateEmbed(channel);
    setInterval(async () => {
      await updateEmbed(channel);
    }, 30000);
  },
};
