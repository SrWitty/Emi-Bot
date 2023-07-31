const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('unban')
    .setDMPermission(false)
    .setDescription('Unbans specified user.')
    .addUserOption(option => option.setName('user').setDescription('Specify the user you want to ban.').setRequired(true))
    .addStringOption(option => option.setName('reason').setDescription('Reason as to why you want to unban specified user.').setRequired(false)),
    async execute(interaction, client) {
        
        const userID = interaction.options.getUser('user');

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.BanMembers)) return await interaction.reply({ content: 'You **do not** have the permission to do that!', ephemeral: true});
        if (interaction.member.id === userID) return await interaction.reply({ content: 'You **cannot** use the hammer on you, silly goose..'});

        let reason = interaction.options.getString('reason');
        if (!reason) reason = 'No reason provided :('

        const embed = new EmbedBuilder()
        .setColor("DarkRed")
        .setAuthor({ name: '🔨 Ban Tool'})
        .setTitle(`> User was unbanned!`)
        .addFields({ name: '• User', value: `> ${userID}`, inline: true})
        .addFields({ name: '• Reason', value: `> ${reason}`, inline: true})
        .setThumbnail('https://media.discordapp.net/attachments/1099432836668330075/1135266004918861875/image-removebg-preview.png?width=295&height=295')
        .setFooter({ text: '🔨 The ban hammer missed'})

        await interaction.guild.bans.fetch() 
        .then(async bans => {

            if (bans.size == 0) return await interaction.reply({ content: 'There is **no one** to unban.', ephemeral: true})
            let bannedID = bans.find(ban => ban.user.id == userID);
            if (!bannedID ) return await interaction.reply({ content: 'That user **is not** banned.', ephemeral: true})

            await interaction.guild.bans.remove(userID, reason).catch(err => {
                return interaction.reply({ content: `**Couldn't** unban user specified!`, ephemeral: true})
            })
        })

        await interaction.reply({ embeds: [embed] });
    }
}