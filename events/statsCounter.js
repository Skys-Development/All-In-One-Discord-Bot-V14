const { Events } = require('discord.js');
const config = require('../config.json');

module.exports = {
  name: Events.ClientReady,
  async execute(client) {
    async function updateServerStats() {
      const guild = client.guilds.cache.get(config.GUILD_ID);
      if (!guild) return;

      try {
        const members = await guild.members.fetch();
        const counters = {
          members: {
            id: config.COUNTER_IDS.members,
            count: members.filter(member => !member.user.bot).size,
            format: count => `👤・ Members: ${count}`
          },
          bots: {
            id: config.COUNTER_IDS.bots,
            count: members.filter(member => member.user.bot).size,
            format: count => `🤖・ Bots: ${count}`
          },
          boosts: {
            id: config.COUNTER_IDS.boosts,
            count: guild.premiumSubscriptionCount,
            format: count => `🚀・ Boosts: ${count}`
          }
        };

        for (const [type, data] of Object.entries(counters)) {
          const channel = guild.channels.cache.get(data.id);
          if (channel) {
            await channel.setName(data.format(data.count)).catch(console.error);
          }
        }

      } catch (error) {
        console.error('Error updating server stats:', error);
      }
    }

    await updateServerStats();
    setInterval(updateServerStats, 5 * 60 * 1000);
    client.on(Events.GuildMemberAdd, () => updateServerStats());
    client.on(Events.GuildMemberRemove, () => updateServerStats());
    client.on(Events.GuildBoostLevelUp, () => updateServerStats());
    client.on(Events.GuildBoostLevelDown, () => updateServerStats());
  }
};
