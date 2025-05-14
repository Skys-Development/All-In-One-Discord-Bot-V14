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

    const role = interaction.options.getRole('role');

    if (!role) {
      return interaction.reply({
        content: '❌ Invalid role selection.',
        ephemeral: true
      });
    }

    await interaction.reply({ content: `⏳ Assigning ${role.name} to all human members...`, ephemeral: true });

    const members = await interaction.guild.members.fetch();

    members.forEach(async member => {
      if (!member.user.bot && !member.roles.cache.has(role.id)) {
        await member.roles.add(role).catch(console.error);
      }
    });

    interaction.followUp({ content: `✅ Successfully assigned **${role.name}** to all human members.`, ephemeral: true });
  }
};
