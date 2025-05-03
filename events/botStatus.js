const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const os = require('os');
const config = require('../config.json');

function getUptime() {
  const totalSeconds = Math.floor(process.uptime());
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${hours}h ${minutes}m ${seconds}s`;
}

function getSystemUptime() {
  const totalSeconds = Math.floor(os.uptime());
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
}

async function updateEmbed(client, channel) {
  const botPing = Math.round(client.ws.ping);
  const apiLatency = client.ws.shards.first()?.ping || 'Unknown';
  const websocketStatus = client.ws.status === 0 ? 'Connected' : 'Disconnected';
  const owner = await client.users.fetch(config.OWNER_ID);
  const servers = client.guilds.cache.size;
  const users = client.users.cache.filter(user => !user.bot).size;
  const commands = await client.application.commands.fetch();
  const totalSlashCommands = commands?.size || 0;
  const memoryUsage = `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`;
  const botCreationDate = `<t:${Math.floor(client.user.createdTimestamp / 1000)}:D>`;
  const discordJsVersion = require('discord.js').version;
  const botVersion = config.BOT_VERSION;
  const systemOS = `${os.type()} (${os.arch()})`;
  const systemUptime = getSystemUptime();
  const totalRoles = client.guilds.cache.reduce((acc, guild) => acc + guild.roles.cache.size, 0);
  const totalChannels = client.guilds.cache.reduce((acc, guild) => acc + guild.channels.cache.size, 0);
  const totalEmojis = client.guilds.cache.reduce((acc, guild) => acc + guild.emojis.cache.size, 0);

  const embedContent = new EmbedBuilder()
    .setTitle(`${client.user.username} Bot Status`)
    .addFields([
      { name: 'Uptime', value: getUptime(), inline: true },
      { name: 'System Uptime', value: systemUptime, inline: true },
      { name: 'Ping', value: `${botPing}ms`, inline: true },
      { name: 'API Latency', value: `${apiLatency}ms`, inline: true },
      { name: 'WebSocket Status', value: websocketStatus, inline: true },
      { name: 'Memory Usage', value: memoryUsage, inline: true },
      { name: 'Owner', value: owner ? `${owner.tag}` : 'Unknown', inline: true },
      { name: 'Servers', value: `${servers}`, inline: true },
      { name: 'Users', value: `${users}`, inline: true },
      { name: 'Total Roles Managed', value: `${totalRoles}`, inline: true },
      { name: 'Total Channels', value: `${totalChannels}`, inline: true },
      { name: 'Total Emojis', value: `${totalEmojis}`, inline: true },
      { name: 'Total Slash Commands', value: `${totalSlashCommands}`, inline: true },
      { name: 'Bot Version', value: botVersion || 'Unknown', inline: true },
      { name: 'Discord.js Version', value: discordJsVersion || 'Unknown', inline: true },
      { name: 'Created On', value: botCreationDate, inline: true },
      { name: 'System OS', value: systemOS || 'Unknown', inline: true }
    ])
    .setColor(config.embedColor)
    .setTimestamp()
      .setFooter({ 
        text: client.user.username, 
        iconURL: client.user.displayAvatarURL()
      });

  if (config.botEmbedId) {
    try {
      const message = await channel.messages.fetch(config.botEmbedId);
      await message.edit({ embeds: [embedContent] });
    } catch {
      const sentMessage = await channel.send({ embeds: [embedContent] });
      config.botEmbedId = sentMessage.id;
      fs.writeFileSync('./config.json', JSON.stringify(config, null, 2));
    }
  } else {
    const sentMessage = await channel.send({ embeds: [embedContent] });
    config.botEmbedId = sentMessage.id;
    fs.writeFileSync('./config.json', JSON.stringify(config, null, 2));
  }
}

module.exports = {
  name: 'ready',
  async execute(client) {
    const channel = client.channels.cache.get(config.BOT_STATUS_CHANNEL_ID);
    if (!channel) return;

    await updateEmbed(client, channel);
    setInterval(async () => {
      await updateEmbed(client, channel);
    }, 30000);
  },
};
