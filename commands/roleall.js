const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('roleall')
    .setDescription('Assign a role to all human members in the server.')
    .addRoleOption(option =>
      option.setName('role')
        .setDescription('Select the role to assign.')
        .setRequired(true)
    ),

  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
      return interaction.reply({
        content: '❌ You do not have permission to use this command.',
        ephemeral: true
      });
    }

    const guild = interaction.client.guilds.cache.get(interaction.guildId);
    if (!guild) {
      return interaction.reply({
        content: '❌ Error: Unknown Guild. Bot may have been removed.',
        ephemeral: true
      });
    }

    const role = interaction.options.getRole('role');
    if (!role) {
      return interaction.reply({
        content: '❌ Invalid role selection.',
        ephemeral: true
      });
    }

    await interaction.reply({ content: `⏳ Assigning ${role.name} to all human members...`, ephemeral: true });

    const members = await guild.members.fetch();

    members.forEach(async member => {
      if (!member.user.bot && !member.roles.cache.has(role.id)) {
        try {
          await member.roles.add(role);
        } catch (error) {
          console.error(`⚠️ Failed to assign role to ${member.user.tag}:`, error.message);
        }
      }
    });

    interaction.followUp({ content: `✅ Successfully assigned **${role.name}** to all human members.`, ephemeral: true });
  }
};
