const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType
} = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('listdomains')
    .setDescription('Lists all available domains'),

  async execute(interaction) {
    const config = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'config.json'), 'utf8'));
    const domains = config.domains || [];
    const pageSize = 5;
    let currentPage = 0;

    if (!domains.length) {
      return interaction.reply({
        content: '❌ No domains are available.',
        ephemeral: true
      });
    }

    const generateEmbed = (page) => {
      const start = page * pageSize;
      const end = start + pageSize;
      const sliced = domains.slice(start, end);

      const embed = new EmbedBuilder()
        .setTitle('🌐 Available Domains')
        .setColor(config.embedColor || '#5865F2')
        .setDescription(
          sliced.map((d, i) => `\`${start + i + 1}.\` ${d.name}`).join('\n')
        )
        .setFooter({ 
          text: `Page ${page + 1} of ${Math.ceil(domains.length / pageSize)} • Total Domains: ${domains.length}` 
        })
        .setTimestamp();

      return embed;
    };

    const getButtons = (page) => {
      return new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('prev_page')
          .setLabel('Previous')
          .setEmoji('◀️')
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(page === 0),
        new ButtonBuilder()
          .setCustomId('next_page')
          .setLabel('Next')
          .setEmoji('▶️')
          .setStyle(ButtonStyle.Secondary)
          .setDisabled((page + 1) * pageSize >= domains.length)
      );
    };

    const response = await interaction.reply({
      embeds: [generateEmbed(currentPage)],
      components: [getButtons(currentPage)]
    });

    const collector = interaction.channel.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 60000,
      filter: i => i.user.id === interaction.user.id && i.message.interaction.id === interaction.id
    });

    collector.on('collect', async i => {
      if (i.customId === 'prev_page') {
        currentPage--;
      } else if (i.customId === 'next_page') {
        currentPage++;
      }

      await i.update({
        embeds: [generateEmbed(currentPage)],
        components: [getButtons(currentPage)]
      });
    });

    collector.on('end', async () => {
      try {
        const embed = generateEmbed(currentPage);
        embed.setFooter({ 
          text: `${embed.data.footer.text} • Buttons Expired` 
        });

        await interaction.editReply({
          embeds: [embed],
          components: []
        });
      } catch (error) {
        console.error('Error updating message:', error);
      }
    });
  }
};
