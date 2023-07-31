const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const warningSchema = require('../../Schemas.js/warn');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('warn')
    .setDMPermission(false)
    .setDescription('Warns specified user for specified reason.')
    .addSubcommand(command => command.setName('add').setDescription('Warns specified user for specified reason.').addUserOption(option => option.setName('user').setDescription('Specified user will be warned.').setRequired(true)).addStringOption(option => option.setName('reason').setDescription('The reason as to why you are warning specified user.').setRequired(false).setMaxLength(500)))
    .addSubcommand(command => command.setName('clear').setDescription(`Clears all specified user's warnings.`).addUserOption(option => option.setName('user').setDescription('Specified user will have their warning cleared.').setRequired(true))),
    async execute(interaction) {

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.KickMembers)) return await interaction.reply({ content: 'You **do not** have the permission to do that!', ephemeral: true});
        const sub = interaction.options.getSubcommand();

        switch (sub) {
            
            case 'add':

            const { options, guildId, user } = interaction;

        const target = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason') || 'No reason provided :(';

        const userTag = `${target.username}#${target.discriminator}`

        warningSchema.findOne({ GuildID: guildId, UserID: target.id, UserTag: userTag }, async (err, data) => {

            if (err) throw err;

            if (!data) {
                data = new warningSchema({
                    GuildID: guildId,
                    UserID: target.id,
                    UserTag: userTag,
                    Content: [
                        {
                            ExecuterId: user.id,
                            ExecuterTag: user.tag,
                            Reason: reason
                        }
                    ],
                });
 
            } else {
                const warnContent = {
                    ExecuterId: user.id,
                    ExecuterTag: user.tag,
                    Reason: reason
                }
                data.Content.push(warnContent);
            }
            data.save()
        });

        const dmembed = new EmbedBuilder()
        .setTimestamp()
        .setColor("DarkRed")
        .setThumbnail('https://media.discordapp.net/attachments/1099432836668330075/1135266004918861875/image-removebg-preview.png?width=295&height=295')
        .setAuthor({ name: `⚠ Warning Tool`})
        .setFooter({ text: `⚠ Warning Recieved`})
        .setTitle(`> You were warned in ${interaction.guild.name}`)
        .addFields({ name: `• Reason`, value: `> ${reason}`})

        const embed = new EmbedBuilder()
        .setTimestamp()
        .setColor("DarkRed")
        .setThumbnail('https://media.discordapp.net/attachments/1099432836668330075/1135266004918861875/image-removebg-preview.png?width=295&height=295')
        .setAuthor({ name: `⚠ Warning Tool`})
        .setFooter({ text: `⚠ Warning Sent`})
        .setTitle(`> Warned a Member`)
        .addFields({ name: `• Warned User`, value: `> ${target.tag}`})
        .addFields({ name: `• Reason`, value: `> ${reason}`})

        target.send({ embeds: [dmembed] }).catch(err => {
            return;
        })

        interaction.reply({ embeds: [embed] })

        break;
        case 'clear':

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.KickMembers) && interaction.user.id !== '619944734776885276') return await interaction.reply({ content: 'You **do not** have the permission to do that!', ephemeral: true});

        const target1 = interaction.options.getUser('user');

        const embed1 = new EmbedBuilder()

        warningSchema.findOne({ GuildID: interaction.guild.id, UserID: target1.id, UserTag: target1.tag }, async (err, data) => {

            if (err) throw err;

            if (data) {
                await warningSchema.findOneAndDelete({ GuildID: interaction.guild.id, UserID: target1.id, UserTag: target1.tag })

                embed1.setColor("DarkRed")
                .setTimestamp()
                .setFooter({ text: `⚠ Warning Brush`})
                .setAuthor({ name: `⚠ Warning Tool`})
                .setTitle(`> Cleared a user's warnings`)
                .addFields({ name: `• Warnings Cleared`, value: `> **${target1.tag}** had their \n> warnings cleared`})
                .setThumbnail('https://media.discordapp.net/attachments/1099432836668330075/1135266004918861875/image-removebg-preview.png?width=295&height=295')

                interaction.reply({ embeds: [embed1] });
            } else {
                interaction.reply({ content: `**${target1.tag}** has no warnings, can't clear **nothing**!`, ephemeral: true})
            }
        });
        }
    }
}