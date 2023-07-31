const { SlashCommandBuilder, ChannelType, EmbedBuilder, PermissionsBitField } = require('discord.js');
const notifyschema = require('../../Schemas.js/notifyschema');
const Parser = require('rss-parser');
const parser = new Parser();
 
module.exports = {
    data: new SlashCommandBuilder()
    .setName('youtube-notification')
    .setDescription('Configure your YouTube notification system.')
    .addSubcommand(command => command.setName('add').setDescription('Set up the YouTube notification system.').addStringOption(option => option.setName('channel-id').setDescription('The ID of your YouTube channel.').setRequired(true)).addChannelOption(option => option.setName('channel').setDescription('The channel to send the notification.').setRequired(true).addChannelTypes(ChannelType.GuildText)).addStringOption(option => option.setName('message').setDescription('A custom message for your notification. Use {author}, {link}, {title}').setRequired(false)).addRoleOption(option => option.setName('role').setDescription('The role you want to be ping.').setRequired(false)))
    .addSubcommand(command => command.setName('remove').setDescription('Remove a channel from the YouTube Notification System').addStringOption(option => option.setName('channel-id').setDescription('The ID of the YouTube channel you want to remove.').setRequired(true))),
    async execute (interaction) {
 
        const { options } = interaction;
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) return await interaction.reply({ content: 'You dont have permissions to use this command.', ephemeral: true});
 
        const sub = options.getSubcommand();
        const data = await notifyschema.find({ Guild: interaction.guild.id});
 
        switch (sub) {
            case 'add':
 
            if (data.length) {
                if (data.length >= 5) {
                    return await interaction.reply({ content: 'You can only have 5 active notifications setup at once.', ephemeral: true})
                }
            }
 
            const ID = options.getString('channel-id');
            const channel = options.getChannel('channel');
            const pingrole = options.getRole('role');
            const message = options.getString('message');
 
            let role = 'non';
 
            if (pingrole) {
                role = pingrole.id;
            }
 
            let checkdata = await notifyschema.findOne({ Guild: interaction.guild.id, ID: ID});
            if (checkdata) {
                await interaction.deferReply({ ephemeral: true });
 
                let author = '';
                const videodata = await parser.parseURL(`https://www.youtube.com/feeds/videos.xml?channel_id=${ID}`);
                if (videodata) {
                    author = videodata.items[0].author;
                } else {
                    author = 'Unknown';
                }
 
                return await interaction.editReply({ content: `You already have a YouTube Notification Setup for **${author}**`, ephemeral: true});
            } else {
                await interaction.deferReply({ ephemeral: true });
            }
            try {
                const videodata = await parser.parseURL(`https://www.youtube.com/feeds/videos.xml?channel_id=${ID}`);
 
                let author = '';
                if (videodata) {
                    author = videodata.items[0].author;
                } else {
                    author = 'Unknown';
                }
 
                const embed = new EmbedBuilder()
                .setColor('#00c7fe')
                .setTitle('Youtube Notification Enabled')
                .addFields({ name: 'Channel', value: `**${author}**`})
                .addFields({ name: 'Notification Channel', value: `${channel}`})
                .setDescription(`<:frecix_tick:1115887380155609140> Successfully enabled YouTube notification system.`)
 
                if (pingrole) {
                    embed.addFields({ name: `Ping Role`, value: `${pingrole}`});
 
                }
 
                if (message) {
                    embed.addFields({ name: 'Message', value: `${message.replace('{author}', 'Channel').replace('{link}', 'youtube.com').replace('{title}', 'your title')}`});
                }
 
                await interaction.editReply({ embeds: [embed], ephemeral: true });
            } catch {
                return await interaction.editReply({ content: `The channel with the ID of ${ID} does not exist.`, ephemeral: true });
            }
 
            await notifyschema.create({
                Guild: interaction.guild.id,
                Channel: channel.id,
                ID: ID,
                Latest: 'none',
                Message: message || '',
                PingRole: role || ''
            });
 
            break;
            case 'remove':
 
            if (!data) return await interaction.reply({ content: 'You do not have the YouTube notification system setup.', ephemeral: true});
            else {
 
                const ID = options.getString('channel-id');
                let checkdata = await notifyschema.findOne({ Guild: interaction.guild.id, ID: ID});
                if (!checkdata) return await interaction.reply({ content: 'That YouTube Notifier does not exist here', ephemeral: true});
 
                const embed = new EmbedBuilder()
                .setColor('#00c7fe')
                .setDescription(`<:frecix_tick:1115887380155609140> Successfully disabled YouTube notification system.`)
                
                await interaction.reply({ embeds: [embed] });
                await notifyschema.deleteMany({ Guild: interaction.guild.id, ID: ID});
                
            }
        }
    }
}