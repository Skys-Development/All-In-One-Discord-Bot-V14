const { Events, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, PermissionFlagsBits } = require('discord.js');
const fs = require('fs').promises;
const config = require('../config.json');

let ticketCounter = 0;
const activeTickets = new Map();

module.exports = {
    name: Events.ClientReady,
    once: true,
    async execute(client) {
        const channel = await client.channels.fetch(config.TICKET_SYSTEM.TICKET_PANEL_CHANNEL_ID);
        if (!channel) return;

        const embed = new EmbedBuilder()
  .setTitle('🎫 Support Tickets')
  .setDescription('Need help? Click the button below to create a ticket!')
  .setColor(config.embedColor)
  .setFooter({ 
    text: client.user.username, 
    iconURL: client.user.displayAvatarURL()
  })
  .setTimestamp();

        const button = new ButtonBuilder()
            .setCustomId('create_ticket')
            .setLabel('Create Ticket')
            .setEmoji('🎫')
            .setStyle(ButtonStyle.Primary);

        const row = new ActionRowBuilder().addComponents(button);

        try {
            const message = await channel.messages.fetch(config.TICKET_SYSTEM.TICKET_MESSAGE_ID);
            await message.edit({ embeds: [embed], components: [row] });
        } catch {
            const newMessage = await channel.send({ embeds: [embed], components: [row] });
            config.TICKET_SYSTEM.TICKET_MESSAGE_ID = newMessage.id;
            await fs.writeFile('./config.json', JSON.stringify(config, null, 2));
        }

        client.on('interactionCreate', async interaction => {
            if (!interaction.isButton()) return;

            if (interaction.customId === 'create_ticket') {
                if (activeTickets.has(interaction.user.id)) {
                    return await interaction.reply({ 
                        content: 'You already have an active ticket!', 
                        flags: ['Ephemeral'] 
                    });
                }

                await interaction.deferReply({ flags: ['Ephemeral'] });
                ticketCounter++;

                try {
                    const ticketChannel = await interaction.guild.channels.create({
                        name: `ticket-${ticketCounter}-${interaction.user.username}`,
                        type: ChannelType.GuildText,
                        parent: config.TICKET_SYSTEM.TICKET_CATEGORY_ID,
                        permissionOverwrites: [
                            {
                                id: interaction.guild.id,
                                deny: [PermissionFlagsBits.ViewChannel],
                            },
                            {
                                id: interaction.user.id,
                                allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages],
                            },
                            {
                                id: config.TICKET_SYSTEM.SUPPORT_ROLE_ID,
                                allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages],
                            }
                        ],
                    });

                    const ticketEmbed = new EmbedBuilder()
                        .setTitle(`Ticket #${ticketCounter}`)
                        .setDescription('Support will be with you shortly.\nTo close this ticket, click the button below.')
                        .addFields(
                            { name: 'Created By', value: interaction.user.tag, inline: true },
                            { name: 'Created At', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true }
                        )
                        .setColor(config.embedColor)
                        .setFooter({ text: 'Support Ticket' });

                    const closeButton = new ButtonBuilder()
                        .setCustomId('close_ticket')
                        .setLabel('Close Ticket')
                        .setEmoji('🔒')
                        .setStyle(ButtonStyle.Danger);

                    const row = new ActionRowBuilder().addComponents(closeButton);

                    await ticketChannel.send({
                        content: `${interaction.user} Welcome to your ticket! <@&${config.TICKET_SYSTEM.SUPPORT_ROLE_ID}>`,
                        embeds: [ticketEmbed],
                        components: [row]
                    });

                    activeTickets.set(interaction.user.id, ticketChannel.id);
                    await interaction.editReply({ 
                        content: `Your ticket has been created: ${ticketChannel}`,
                        flags: ['Ephemeral']
                    });

                    const logChannel = await client.channels.fetch(config.TICKET_SYSTEM.TICKET_LOG_CHANNEL_ID);
                    if (logChannel) {
                        const logEmbed = new EmbedBuilder()
                            .setTitle('Ticket Created')
                            .setDescription(`Ticket #${ticketCounter} has been created`)
                            .addFields(
                                { name: 'User', value: interaction.user.tag, inline: true },
                                { name: 'Channel', value: ticketChannel.name, inline: true }
                            )
                            .setColor(config.embedColor)
                            .setTimestamp();

                        await logChannel.send({ embeds: [logEmbed] });
                    }
                } catch (error) {
                    await interaction.editReply({ 
                        content: 'There was an error creating your ticket!',
                        flags: ['Ephemeral']
                    });
                }
            }

            if (interaction.customId === 'close_ticket') {
                const ticketChannel = interaction.channel;
                if (!ticketChannel.name.startsWith('ticket-')) {
                    return await interaction.reply({ 
                        content: 'This command can only be used in ticket channels!',
                        flags: ['Ephemeral']
                    });
                }

                await interaction.deferReply();

                try {
                    const logChannel = await client.channels.fetch(config.TICKET_SYSTEM.TICKET_LOG_CHANNEL_ID);
                    if (logChannel) {
                        const logEmbed = new EmbedBuilder()
                            .setTitle('Ticket Closed')
                            .setDescription(`Ticket ${ticketChannel.name} has been closed`)
                            .addFields(
                                { name: 'Closed By', value: interaction.user.tag, inline: true },
                                { name: 'Closed At', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true }
                            )
                            .setColor(config.embedColor)
                            .setTimestamp();

                        await logChannel.send({ embeds: [logEmbed] });
                    }

                    const userId = Array.from(activeTickets.entries())
                        .find(([_, channelId]) => channelId === ticketChannel.id)?.[0];
                    if (userId) activeTickets.delete(userId);

                    await interaction.editReply('Closing ticket...');
                    await ticketChannel.delete();
                } catch (error) {
                    await interaction.editReply('There was an error closing the ticket!');
                }
            }
        });
    },
};
