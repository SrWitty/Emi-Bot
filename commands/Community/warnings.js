const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const warningSchema = require('../../Schemas.js/warn');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('warnings')
    .setDMPermission(false)
    .setDescription(`Gets specified user's warnings.`)
    .addUserOption(option => option.setName('user').setDescription(`Specified user's warnings will be disaplayed.`).setRequired(false)),
    async execute(interaction) {

        const { options, guildId, user } = interaction;

        const target = interaction.options.getUser('user') || interaction.user;

        const embed = new EmbedBuilder()
        const noWarns = new EmbedBuilder()


        warningSchema.findOne({ GuildID: guildId, UserID: target.id, UserTag: target.tag }, async (err, data) => {

            if (err) throw err;

            if (data) {
                embed.setColor("DarkRed")
                .setTitle(`• ${target.tag}'s Warning Log`)
                .setThumbnail('https://media.discordapp.net/attachments/1099432836668330075/1135266004918861875/image-removebg-preview.png?width=295&height=295')
                .setFooter({ text: `⚠ Warning Log`})
                .setAuthor({ name: `⚠ Warning Tool`})
                .setTimestamp()
                .setDescription(`${data.Content.map(
                    (w, i) => 
                        `
                            > **Warning**: ${i + 1}
                            |
                            > • **Warning Moderator**: ${w.ExecuterTag}
                            > • **Warn Reason**: ${w.Reason}
                        `
                ).join(`•`)}`)

                interaction.reply({ embeds: [embed] });

                if (err) return;

            } else {
                noWarns.setColor("DarkRed")
                .setTitle(`> ${target.tag}'s Warning Log`)
                .setThumbnail('https://media.discordapp.net/attachments/1099432836668330075/1135266004918861875/image-removebg-preview.png?width=295&height=295')
                .setFooter({ text: `⚠ Warning Log`})
                .setAuthor({ name: `⚠ Warning Tool`})
                .setTimestamp()
                .addFields({ name: `• Warnings`, value: `> No warnings were found`})

                interaction.reply({ embeds: [noWarns] })
            }
        });
    }
}