const { EmbedBuilder } = require('discord.js');
const { afkUsers } = require('../commands/afk');
const config = require('../config.json');

module.exports = {
  name: 'messageCreate',
  async execute(message) {
    if (message.author.bot) return;

    const mentionedUser = message.mentions.users.first();
    if (mentionedUser && afkUsers.has(mentionedUser.id)) {
      const reason = afkUsers.get(mentionedUser.id);
      const embedColor = config.embedColor;

      const embed = new EmbedBuilder()
        .setTitle('⚠️ AFK Notice')
        .setDescription(`**${mentionedUser.username}** is AFK: ${reason}`)
        .setColor(embedColor)
        .setTimestamp()
        .setFooter({
          text: message.client.user.username,
          iconURL: message.client.user.displayAvatarURL()
        });

      await message.reply({ embeds: [embed] });
    }

    if (afkUsers.has(message.author.id)) {
      afkUsers.delete(message.author.id);
      const embed = new EmbedBuilder()
        .setTitle('✅ AFK Status Removed')
        .setDescription('Welcome back! Your AFK status has been cleared.')
        .setColor(embedColor)
        .setTimestamp()
        .setFooter({
          text: message.client.user.username,
          iconURL: message.client.user.displayAvatarURL()
        });

      await message.reply({ embeds: [embed] });
    }
  }
};