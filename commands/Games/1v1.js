const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, PermissionFlagsBits, ChannelType, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require(`discord.js`);
const duelsSchema = require('../../Schemas.js/1v1Schema');
 
module.exports = {
    data: new SlashCommandBuilder()
    .setName('1v1-setup')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addChannelOption(option => option.setName('channel').setDescription(`The channel you want the 1v1 queuing system to be sent in`).addChannelTypes(ChannelType.GuildText).setRequired(true))
    .addChannelOption(option => option.setName('category').setDescription(`The category you want the 1v1 matches to start in`).addChannelTypes(ChannelType.GuildCategory).setRequired(true))
    .addChannelOption(option => option.setName('logs-channel').setDescription(`The channel you want the 1v1 logs to be sent in`).addChannelTypes(ChannelType.GuildText).setRequired(true))
    .addChannelOption(option => option.setName('transcripts-channel').setDescription(`The channel you want the 1v1 transcripts to be sent in`).addChannelTypes(ChannelType.GuildText).setRequired(true))
    .addRoleOption(option => option.setName('mod-role').setDescription(`The role you want to be able to moderate the 1v1 conflicts`).setRequired(true))
    .setDescription('Setup the 1v1 queuing system'),
    async execute(interaction, client) {
 
        if (!interaction.guild) return await interaction.reply({ content: "This command is only usable in the server!", ephemeral: true });
 
        const channel = interaction.options.getChannel('channel');
        const category = interaction.options.getChannel('category');
        const logChannel = interaction.options.getChannel('logs-channel');
        const transcriptsChannel = interaction.options.getChannel('transcripts-channel');
        const role = interaction.options.getRole('mod-role');
        
        if (!channel || !category || !logChannel || !transcriptsChannel || !role) {
            interaction.reply({ content: "One or more required options are missing.", ephemeral: true });
            return;
        }
        
        try {
            let Data5 = await duelsSchema.findOne({ Guild: interaction.guild.id });
        
            if (!Data5) {
                const newData = new duelsSchema({
                    Guild: interaction.guild.id,
                    Channel: channel.id,
                    Category: category.id,
                    Logs: logChannel.id,
                    Transcript: transcriptsChannel.id,
                    Role: role.id
                });
                await newData.save();
        
                Data5 = newData;
            } else {
                interaction.reply({ content: "You already have the 1v1 system set up. `/1v1-disable` to disable the system.", ephemeral: true });
                return;
            }
 
        } catch (error) {
            console.error("Error occurred while handling 1v1 data:", error);
            interaction.reply({ content: "An error occurred while setting up the 1v1 system.", ephemeral: true });
            return;
        }           
        
        const duelEmbed = new EmbedBuilder()
        .setColor("DarkPurple")
        .setTitle('1v1 Matchmaking')
        .setAuthor({ 
            name: "Matchmaking",
            iconURL: client.user.avatarURL({ dynamic: true, size: 1024 }) 
        })
        .setDescription(`Battle against other players in 1v1s to grind our ranks and reach the top of the server!\n\nYou will be randomly matched up against a member from our server in a 1v1 game. All games are best of 5, good luck!\n\n**Ranks**\n😴 • Unranked (0 XP)\n🥉 • Bronze (300 XP)\n🥈 • Silver (750 XP)\n🥇 • Gold (1250 XP)\n🐉 • Emerald (1750 XP)\n💎 • Diamond (2500 XP)\n🎓 • Master (3500 XP)\n🏆 • Elite (5000 XP)`)
 
        const embedSent = new EmbedBuilder()
        .setColor('Green')
        .setAuthor({ 
            name: "Duels Sent",
            iconURL: client.user.avatarURL({ dynamic: true, size: 1024 }) 
        })
        .setDescription(`The 1v1 embed has been sent to ${channel}!`)
 
        interaction.reply({ embeds: [embedSent], ephemeral: true })
 
        const queue = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
            .setCustomId('queue')
            .setLabel('Queue')
            .setStyle(ButtonStyle.Secondary),
        )
        .addComponents(
            new ButtonBuilder()
            .setCustomId('unqueue')
            .setLabel('Unqueue')
            .setStyle(ButtonStyle.Danger),
        )
 
        channel.send({ embeds: [duelEmbed], components: [queue] })
 
    }
}