const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const axios = require('axios');
const config = require('../config.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('fortniteitemshop')
    .setDescription('View the latest Fortnite Item Shop'),

  async execute(interaction) {
    const embedColor = config.embedColor;
    const fortniteApiKey = config.FORTNITE_API_KEY;

    if (!fortniteApiKey) {
      return interaction.reply({ content: 'Fortnite API key is missing from config.', flags: 64 });
    }

    try {
      const response = await axios.get(`https://fortnite-api.com/v2/shop?access_token=${fortniteApiKey}`);
      let shopData = response.data.data.entries;

      if (!shopData || shopData.length === 0) {
        return interaction.reply({ content: 'No item shop data available.', flags: 64 });
      }

      shopData = shopData.filter(item => {
        const itemType = item.brItems?.[0]?.type?.displayValue;
        const itemName = item.devName.split(" x ")[1] || "Unknown Item";
        return itemType && itemType !== "Unknown Type" && itemType !== "MtxCurrency (Unknown)" && itemType !== "MtxCurrency" && !itemName.toLowerCase().includes("placeholder") && !itemName.toLowerCase().includes("(unknown)");
      });

      let page = 0;
      const itemsPerPage = 5;
      const totalPages = Math.ceil(shopData.length / itemsPerPage);

      const generateEmbed = (page) => {
        const start = page * itemsPerPage;
        const end = start + itemsPerPage;
        const currentItems = shopData.slice(start, end);

        const embed = new EmbedBuilder()
          .setTitle('Fortnite Item Shop')
          .setDescription(`Page ${page + 1} of ${totalPages}`)
          .setColor(embedColor)
          .setTimestamp()
          .setFooter({
            text: interaction.client.user.username,
            iconURL: interaction.client.user.displayAvatarURL()
          });

        currentItems.forEach((item) => {
          const itemType = item.brItems?.[0]?.type?.displayValue || 'Unknown';
          const itemName = item.devName.split(" x ")[1] || "Unknown Item";
          const itemImage = item.bundle?.image || item.images?.icon;

          let imageLink = itemImage ? `[View Image](${itemImage})\n` : '';

          embed.addFields({ 
            name: `${itemName} (${itemType})`, 
            value: `${imageLink}**Price:** ${item.finalPrice} V-Bucks`, 
            inline: true 
          });
        });

        return embed;
      };

      const buttons = (currentPage) => {
        return new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setLabel('Previous')
            .setStyle(ButtonStyle.Primary)
            .setCustomId(`prev-${currentPage}`)
            .setDisabled(currentPage === 0),
          new ButtonBuilder()
            .setLabel('Next')
            .setStyle(ButtonStyle.Primary)
            .setCustomId(`next-${currentPage}`)
            .setDisabled(currentPage === totalPages - 1)
        );
      };

      const msg = await interaction.reply({ embeds: [generateEmbed(page)], components: [buttons(page)] });

      const collector = msg.createMessageComponentCollector({ time: 60000 });

      collector.on('collect', async (buttonInteraction) => {
        if (buttonInteraction.customId.startsWith('prev')) {
          page = Math.max(0, page - 1);
        } else if (buttonInteraction.customId.startsWith('next')) {
          page = Math.min(totalPages - 1, page + 1);
        }

        await buttonInteraction.update({ embeds: [generateEmbed(page)], components: [buttons(page)] });
      });

      collector.on('end', async () => {
        await msg.edit({ components: [new ActionRowBuilder().addComponents(
          new ButtonBuilder().setLabel('Previous').setStyle(ButtonStyle.Primary).setDisabled(true),
          new ButtonBuilder().setLabel('Next').setStyle(ButtonStyle.Primary).setDisabled(true)
        )] });
      });

    } catch (error) {
      console.error('Fortnite API Error:', error.response?.data || error.message);
      await interaction.reply({ content: 'Error fetching Fortnite Item Shop.', flags: 64 });
    }
  }
};
