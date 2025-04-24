const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const fs = require('fs');
const path = require('path');
const config = require('../config.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Lists all available commands'),

  async execute(interaction) {
    const commandsPath = path.join(__dirname);
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

    const allCommands = [];

    for (const file of commandFiles) {
      const command = require(`./${file}`);
      if (command.data?.name && command.data?.description && command.data.name !== 'help') {
        allCommands.push({
          name: `/${command.data.name}`,
          description: command.data.description
        });
      }
    }

    const itemsPerPage = 5;
    let currentPage = 0;

    function generateEmbed(page) {
      const start = page * itemsPerPage;
      const end = Math.min(start + itemsPerPage, allCommands.length);
      const fields = allCommands.slice(start, end).map(cmd => ({
        name: cmd.name,
        value: cmd.description,
        inline: true
      }));

      return new EmbedBuilder()
        .setTitle('📖・Help Menu')
        .setDescription('Here are all available slash commands:')
        .addFields(fields)
        .setColor(config.embedColor)
        .setFooter({
          text: `${interaction.client.user.username} • ${new Date().toLocaleTimeString()}`,
          iconURL: interaction.client.user.displayAvatarURL()
        });
    }

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('previous')
        .setLabel('◀️ Previous')
        .setStyle(ButtonStyle.Primary)
        .setDisabled(currentPage === 0),
      new ButtonBuilder()
        .setCustomId('next')
        .setLabel('Next ▶️')
        .setStyle(ButtonStyle.Primary)
        .setDisabled(currentPage === Math.floor(allCommands.length / itemsPerPage))
    );

    await interaction.reply({
      embeds: [generateEmbed(currentPage)],
      components: [row]
    });

    const filter = i => i.user.id === interaction.user.id;
    const message = await interaction.fetchReply();

    const collector = message.createMessageComponentCollector({ filter, time: 60000 });

    collector.on('collect', async i => {
      if (i.customId === 'next') {
        currentPage++;
      } else if (i.customId === 'previous') {
        currentPage--;
      }

      await i.update({
        embeds: [generateEmbed(currentPage)],
        components: [
          new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setCustomId('previous')
              .setLabel('◀️ Previous')
              .setStyle(ButtonStyle.Primary)
              .setDisabled(currentPage === 0),
            new ButtonBuilder()
              .setCustomId('next')
              .setLabel('Next ▶️')
              .setStyle(ButtonStyle.Primary)
              .setDisabled(currentPage === Math.floor(allCommands.length / itemsPerPage))
          )
        ]
      });
    });

    collector.on('end', () => {
      message.edit({
        components: [
          new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setCustomId('previous')
              .setLabel('◀️ Previous')
              .setStyle(ButtonStyle.Secondary)
              .setDisabled(true),
            new ButtonBuilder()
              .setCustomId('next')
              .setLabel('Next ▶️')
              .setStyle(ButtonStyle.Secondary)
              .setDisabled(true)
          )
        ]
      });
    });
  }
};
