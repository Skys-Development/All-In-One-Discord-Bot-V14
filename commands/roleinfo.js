const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const config = require('../config.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('roleinfo')
    .setDescription('Get detailed information about a specific role')
    .addRoleOption(option =>
      option.setName('role')
        .setDescription('Select a role to get its information')
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ViewAuditLog),

  async execute(interaction) {
    const role = interaction.options.getRole('role');
    const embedColor = config.embedColor;

    const embed = new EmbedBuilder()
      .setTitle(`Role Info: ${role.name}`)
      .setColor(embedColor)
      .addFields(
        { name: '🆔 Role ID', value: `${role.id}`, inline: true },
        { name: '🎨 Color', value: `${role.hexColor}`, inline: true },
        { name: '👤 Members with Role', value: `${role.members.size}`, inline: true },
        { name: '🔒 Mentionable', value: role.mentionable ? 'Yes' : 'No', inline: true },
        { name: '⚙️ Managed by Integration', value: role.managed ? 'Yes' : 'No', inline: true },
        { name: '🔼 Position', value: `${role.position}`, inline: true },
        { name: '🛡️ Permissions', value: `${role.permissions.toArray().join(', ') || 'None'}`, inline: false }
      )
      .setTimestamp()
      .setFooter({
        text: interaction.client.user.username,
        iconURL: interaction.client.user.displayAvatarURL()
      });

    await interaction.reply({ embeds: [embed] });
  }
};
