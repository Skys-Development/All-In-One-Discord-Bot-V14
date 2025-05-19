const {
  SlashCommandBuilder,
  StringSelectMenuBuilder,
  ActionRowBuilder,
  ComponentType,
  StringSelectMenuOptionBuilder
} = require('discord.js');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('removerecord')
    .setDescription('Remove a DNS record from a selected domain (owner only)')
    .addStringOption(option =>
      option.setName('domain')
        .setDescription('Enter the domain to remove a record from')
        .setRequired(true)
    ),

  async execute(interaction) {
    const config = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'config.json'), 'utf8'));
    
    if (interaction.user.id !== config.OWNER_ID) {
      return interaction.reply({
        content: '❌ Only the bot owner can remove records.',
        ephemeral: true
      });
    }

    const domainName = interaction.options.getString('domain');
    const domainData = config.domains.find(d => d.name === domainName);
    
    if (!domainData) {
      return interaction.reply({
        content: '❌ Domain not found in configuration.',
        ephemeral: true
      });
    }

    await interaction.deferReply({ ephemeral: true });

    try {
      const res = await axios.get(
        `https://api.cloudflare.com/client/v4/zones/${domainData.zoneId}/dns_records`,
        {
          headers: {
            Authorization: `Bearer ${domainData.cloudflareToken}`
          }
        }
      );
      
      const records = res.data.result;

      if (records.length === 0) {
        return interaction.editReply({ 
          content: `❌ No DNS records found for \`${domainName}\`.` 
        });
      }

      const menu = new StringSelectMenuBuilder()
        .setCustomId('select_record_to_remove')
        .setPlaceholder('Select a record to remove')
        .addOptions(
          records.slice(0, 25).map(r =>
            new StringSelectMenuOptionBuilder()
              .setLabel(`${r.type} - ${r.name}`)
              .setDescription(`Content: ${r.content || 'N/A'}`)
              .setValue(r.id)
          )
        );

      const row = new ActionRowBuilder().addComponents(menu);

      await interaction.editReply({
        content: `📄 Choose a record to remove from \`${domainName}\`:`,
        components: [row]
      });

      const selection = await interaction.channel.awaitMessageComponent({
        componentType: ComponentType.StringSelect,
        time: 30000,
        filter: i => i.user.id === interaction.user.id
      }).catch(() => null);

      if (!selection) {
        return interaction.editReply({
          content: '⏱️ Selection timed out. No record was removed.',
          components: []
        });
      }

      const recordId = selection.values[0];
      const record = records.find(r => r.id === recordId);

      try {
        await axios.delete(
          `https://api.cloudflare.com/client/v4/zones/${domainData.zoneId}/dns_records/${recordId}`,
          {
            headers: {
              Authorization: `Bearer ${domainData.cloudflareToken}`
            }
          }
        );

        await selection.update({
          content: `✅ Successfully removed record:\n• Name: \`${record.name}\`\n• Type: \`${record.type}\`\n• Content: \`${record.content || 'N/A'}\``,
          components: []
        });
      } catch (err) {
        await selection.update({
          content: `❌ Failed to remove record: ${err.message}`,
          components: []
        });
      }
    } catch (err) {
      return interaction.editReply({ 
        content: `❌ Failed to fetch records from Cloudflare: ${err.message}` 
      });
    }
  }
};
