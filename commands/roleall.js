const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('roleall')
    .setDescription('Assign a role to all members or bots in the server.')
    .addRoleOption(option =>
      option.setName('role')
        .setDescription('Select the role to assign.')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('target')
        .setDescription('Choose who to assign the role to')
        .setRequired(true)
        .addChoices(
          { name: 'Members Only', value: 'members' },
          { name: 'Bots Only', value: 'bots' },
          { name: 'Both Members & Bots', value: 'both' }
        )
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
    const target = interaction.options.getString('target');

    if (!role) {
      return interaction.reply({
        content: '❌ Invalid role selection.',
        ephemeral: true
      });
    }

    const targetText = {
      members: 'human members',
      bots: 'bots',
      both: 'members and bots'
    }[target];

    await interaction.reply({ 
      content: `⏳ Starting to assign ${role.name} to all ${targetText}... This may take a while.`, 
      ephemeral: true 
    });

    const members = await guild.members.fetch();
    let success = 0;
    let failed = 0;
    let skipped = 0;

    const memberArray = Array.from(members.values());

    for (let i = 0; i < memberArray.length; i++) {
      const member = memberArray[i];
      
      // Check if member should be processed based on target selection
      const shouldProcess = (target === 'both') || 
                          (target === 'members' && !member.user.bot) || 
                          (target === 'bots' && member.user.bot);

      if (!shouldProcess || member.roles.cache.has(role.id)) {
        skipped++;
        continue;
      }

      try {
        await member.roles.add(role);
        success++;
        
        // Update progress every 10 successful assignments
        if (success % 10 === 0) {
          await interaction.followUp({ 
            content: `⏳ Progress: ${success + failed + skipped}/${memberArray.length} processed...`, 
            ephemeral: true 
          });
        }

        // Rate limiting delay
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.error(`Failed to assign role to ${member.user.tag}:`, error.message);
        failed++;
      }
    }

    // Final status report with target-specific message
    await interaction.followUp({ 
      content: `✅ Role assignment complete!\n\n`
             + `• Successfully assigned to: ${success} ${targetText}\n`
             + `• Failed to assign to: ${failed} ${targetText}\n`
             + `• Skipped (already had role/not target): ${skipped} members`, 
      ephemeral: true 
    });
  }
};
