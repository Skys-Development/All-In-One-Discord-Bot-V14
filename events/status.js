const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, Events } = require('discord.js');
const fs = require('fs');
const os = require('os');
const axios = require('axios');
const config = require('../config.json');

let statusMessage = null;

function getUptime() {
    const totalSeconds = Math.floor(process.uptime());
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours}h ${minutes}m ${seconds}s`;
}

function getSystemUptime() {
    const totalSeconds = Math.floor(os.uptime());
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
}

async function checkWebsite(url) {
    try {
        const start = Date.now();
        const response = await axios.get(url, { timeout: 5000 });
        return { status: '🟢 Online', responseTime: `${Date.now() - start}ms` };
    } catch {
        return { status: '🔴 Offline', responseTime: 'N/A' };
    }
}

async function getBotEmbed(client) {
    const owner = await client.users.fetch(config.OWNER_ID);
    const commands = await client.application.commands.fetch();

    return new EmbedBuilder()
        .setTitle(`${client.user.username} Status Panel`)
        .addFields([
            { name: 'Bot Uptime', value: getUptime(), inline: true },
            { name: 'System Uptime', value: getSystemUptime(), inline: true },
            { name: 'Ping', value: `${client.ws.ping}ms`, inline: true },
            { name: 'Memory', value: `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`, inline: true },
            { name: 'Servers', value: `${client.guilds.cache.size}`, inline: true },
            { name: 'Users', value: `${client.users.cache.size}`, inline: true },
            { name: 'Owner', value: owner?.tag || 'Unknown', inline: true },
            { name: 'Commands', value: `${commands?.size || 0}`, inline: true },
            { name: 'Version', value: config.BOT_VERSION || '1.0.0', inline: true }
        ])
        .setColor(config.embedColor)
        .setTimestamp()
        .setFooter({ text: 'Click the buttons below to view other stats' });
}

async function getMCEmbed(client) {
    try {
        const response = await axios.get(`https://api.mcsrvstat.us/2/${config.MC_SERVER_IP}`);
        const data = response.data;

        return new EmbedBuilder()
            .setTitle('Minecraft Server Status')
            .setDescription(`Status: ${data.online ? '🟢 Online' : '🔴 Offline'}`)
            .addFields([
                { name: 'Server IP', value: config.MC_SERVER_IP, inline: true },
                { name: 'Players', value: `${data.players?.online || 0}/${data.players?.max || 0}`, inline: true },
                { name: 'Version', value: data.version || 'Unknown', inline: true }
            ])
            .setColor(config.embedColor)
            .setTimestamp()
            .setFooter({ text: 'Click the buttons below to view other stats' });
    } catch {
        return new EmbedBuilder()
            .setTitle('Minecraft Server Status')
            .setDescription('🔴 Unable to fetch server status')
            .setColor(config.embedColor)
            .setTimestamp();
    }
}

async function getWebsiteEmbed(client) {
    const websites = config.WEBSITES_TO_MONITOR;
    const results = await Promise.all(websites.map(checkWebsite));

    return new EmbedBuilder()
        .setTitle('Website Status')
        .addFields(
            websites.map((url, i) => ({
                name: url,
                value: `Status: ${results[i].status}\nResponse: ${results[i].responseTime}`,
                inline: false
            }))
        )
        .setColor(config.embedColor)
        .setTimestamp()
        .setFooter({ 
            text: client.user.username, 
            iconURL: client.user.displayAvatarURL() 
        });
}

function getButtons(currentPage = 'bot') {
    return new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('bot_stats')
                .setLabel('Bot Status')
                .setStyle(currentPage === 'bot' ? ButtonStyle.Success : ButtonStyle.Primary)
                .setDisabled(currentPage === 'bot'),
            new ButtonBuilder()
                .setCustomId('mc_status')
                .setLabel('MC Status')
                .setStyle(currentPage === 'mc' ? ButtonStyle.Success : ButtonStyle.Primary)
                .setDisabled(currentPage === 'mc'),
            new ButtonBuilder()
                .setCustomId('website_status')
                .setLabel('Website Status')
                .setStyle(currentPage === 'website' ? ButtonStyle.Success : ButtonStyle.Primary)
                .setDisabled(currentPage === 'website')
        );
}

async function updatePanel(type, client, channel) {
    let embed;
    switch(type) {
        case 'mc':
            embed = await getMCEmbed(client);
            break;
        case 'website':
            embed = await getWebsiteEmbed(client);
            break;
        default:
            embed = await getBotEmbed(client);
    }

    const buttons = getButtons(type);

    if (statusMessage) {
        await statusMessage.edit({ embeds: [embed], components: [buttons] });
    } else {
        try {
            if (config.STATUS_MESSAGE_ID) {
                statusMessage = await channel.messages.fetch(config.STATUS_MESSAGE_ID);
                await statusMessage.edit({ embeds: [embed], components: [buttons] });
            } else {
                statusMessage = await channel.send({ embeds: [embed], components: [buttons] });
                config.STATUS_MESSAGE_ID = statusMessage.id;
                fs.writeFileSync('./config.json', JSON.stringify(config, null, 2));
            }
        } catch {
            statusMessage = await channel.send({ embeds: [embed], components: [buttons] });
            config.STATUS_MESSAGE_ID = statusMessage.id;
            fs.writeFileSync('./config.json', JSON.stringify(config, null, 2));
        }
    }
}

module.exports = {
    name: Events.ClientReady,
    once: true,
    async execute(client) {
        const channel = client.channels.cache.get(config.STATUS_CHANNEL_ID);
        if (!channel) return;

        await updatePanel('bot', client, channel);

        // Update every 30 seconds
        setInterval(() => updatePanel('bot', client, channel), 30000);

        // Handle button interactions
        client.on(Events.InteractionCreate, async interaction => {
            if (!interaction.isButton()) return;

            const buttonId = interaction.customId;
            if (!['bot_stats', 'mc_status', 'website_status'].includes(buttonId)) return;

            await interaction.deferUpdate();

            switch(buttonId) {
                case 'bot_stats':
                    await updatePanel('bot', client, channel);
                    break;
                case 'mc_status':
                    await updatePanel('mc', client, channel);
                    break;
                case 'website_status':
                    await updatePanel('website', client, channel);
                    break;
            }
        });
    },
};
