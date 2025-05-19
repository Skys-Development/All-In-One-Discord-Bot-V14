const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('roleall')
    .setDescription('Safely assign a role to all members or bots in the server.')
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
      content: `⏳ Starting to assign ${role.name} to all ${targetText}...\n\n`
             + `ℹ️ This process will be very slow (10 seconds between each role) to ensure safety.\n`
             + `📝 Progress updates will be sent every 5 assignments.`, 
      ephemeral: true 
    });

    const members = await guild.members.fetch();
    let success = 0;
    let failed = 0;
    let skipped = 0;

    const memberArray = Array.from(members.values());

    for (let i = 0; i < memberArray.length; i++) {
      const member = memberArray[i];
      
      const shouldProcess = (target === 'both') || 
                          (target === 'members' && !member.user.bot) || 
                          (target === 'bots' && member.user.bot);

      if (!shouldProcess || member.roles.cache.has(role.id)) {
        skipped++;
        continue;
      }

      try {
        await new Promise(resolve => setTimeout(resolve, 10000));
        
        await member.roles.add(role);
        success++;
 
        if (success % 5 === 0) {
          await interaction.followUp({ 
            content: `⏳ Progress Update:\n\n`
                   + `• Processed: ${success + failed + skipped}/${memberArray.length}\n`
                   + `• Successful: ${success}\n`
                   + `• Failed: ${failed}\n`
                   + `• Skipped: ${skipped}\n\n`
                   + `🕒 Estimated time remaining: ${((memberArray.length - (success + failed + skipped)) * 10 / 60).toFixed(1)} minutes`,
            ephemeral: true 
          });
        }

      } catch (error) {
        console.error(`Failed to assign role to ${member.user.tag}:`, error.message);
        failed++;
        await new Promise(resolve => setTimeout(resolve, 10000));
      }
    }

    await interaction.followUp({ 
      content: `✅ Role Assignment Complete!\n\n`
             + `📊 Final Results:\n`
             + `• Successfully assigned to: ${success} ${targetText}\n`
             + `• Failed to assign to: ${failed} ${targetText}\n`
             + `• Skipped (already had role/not target): ${skipped} members\n\n`
             + `⏱️ Total time: ${((success + failed) * 10 / 60).toFixed(1)} minutes`, 
      ephemeral: true 
    });
  }
};
