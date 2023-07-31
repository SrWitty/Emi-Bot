const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const fetch = require("node-fetch")
const ms = require('ms');
const bans = require('../../Schemas.js/bans');
 
module.exports = {
    data: new SlashCommandBuilder()
    .setName('ban')
    .setDMPermission(false)
    .setDescription('Bans specified user.')
    .addUserOption(option => option.setName('user').setDescription('Specify the user you want to ban.').setRequired(true))
    .addStringOption(option => option.setName('time').setDescription(`Specified amount of time will be the ban's time. Leave empty for a permenant ban.`))
    .addStringOption(option => option.setName('reason').setDescription('Reason as to why you want to ban specified user.').setRequired(false)),
    async execute(interaction, client) {
 
        const users = interaction.options.getUser('user');
        const ID = users.id;
        const banUser = client.users.cache.get(ID);
        const banmember = interaction.options.getMember('user');
        const optiontime = interaction.options.getString('time');
 
        let time = ``;
        if (!optiontime) {
            time = `notime`;
        } else {
            time = ms(optiontime);
        }
 
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.BanMembers)) return await interaction.reply({ content: 'You **do not** have the permission to do that!', ephemeral: true});
        if (interaction.member.id === ID) return await interaction.reply({ content: 'You **cannot** use the hammer on you, silly goose..', ephemeral: true});
        if (!banmember) return await interaction.reply({ content: `That user **does not** exist within your server.`, ephemeral: true});
 
        let reason = interaction.options.getString('reason');
        if (!reason) reason = 'No reason provided :('
 
        const dmembed = new EmbedBuilder()
        .setColor("DarkRed")
        .setAuthor({ name: '🔨 Ban Tool'})
        .setTitle(`> You were banned from "${interaction.guild.name}"`)
        .addFields({ name: '• Server', value: `> ${interaction.guild.name}`, inline: true})
        .addFields({ name: '• Reason', value: `> ${reason}`, inline: true})
        .setFooter({ text: '🔨 The ban hammer strikes again'})
        .setTimestamp()
        .setThumbnail('https://media.discordapp.net/attachments/1099432836668330075/1135266004918861875/image-removebg-preview.png?width=295&height=295')
 
        const embed = new EmbedBuilder()
        .setColor("DarkRed")
        .setAuthor({ name: '🔨 Ban Tool'})
        .setTitle(`> User was bannished!`)
        .addFields({ name: '• User', value: `> ${banUser.tag}`, inline: true})
        .addFields({ name: '• Reason', value: `> ${reason}`, inline: true})
        .setThumbnail('https://media.discordapp.net/attachments/1099432836668330075/1135266004918861875/image-removebg-preview.png?width=295&height=295')
        .setFooter({ text: '🔨 The ban hammer strikes again'})
        .setTimestamp()
 
        if (time !== 'notime') {
            embed.addFields({ name: `• Time`, value: `> <t:${Math.floor(Date.now()/1000 + time/1000)}:R>`})
            dmembed.addFields({ name: `• Time`, value: `> <t:${Math.floor(Date.now()/1000 + time/1000)}:R>`})
        }
 
        try {
            await interaction.guild.bans.create(banUser.id, {reason})
        } catch {
            return interaction.reply({ content: `**Couldn't** ban this member! Check my **role position** and try again.`, ephemeral: true})
        }
 
        await banUser.send({ embeds: [dmembed] }).catch();
        await interaction.reply({ embeds: [embed] });
 
        if (time === 'notime') return;
        else {
            const settime = Date.now() + time;
            await bans.create({
                Guild: interaction.guild.id,
                User: banUser.id,
                Time: settime
            })
        }
    }
}