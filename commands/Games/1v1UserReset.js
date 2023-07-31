const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, PermissionFlagsBits } = require(`discord.js`);
const levelSchema = require('../../Schemas.js/1v1Levels');
const duelsSchema = require('../../Schemas.js/1v1Schema');
 
module.exports = {
    data: new SlashCommandBuilder()
    .setName('1v1-user-reset')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setDescription('Resets a members 1v1 xp')
    .addUserOption(option => option.setName('user').setDescription('The member you want to remove the xp from').setRequired(true)),
    async execute(interaction) {
 
        if (!interaction.guild) return await interaction.reply({ content: "This command is only usable in the server!", ephemeral: true });
 
         const { guildId } = interaction;
 
         const target = interaction.options.getUser('user');
 
         const data = await duelsSchema.findOne({ Guild: guildId })
         const channel = await interaction.guild.channels.cache.get(data.Logs);
 
         levelSchema.deleteMany({ Guild: guildId, User: target.id}, async (err, data) => {
 
            const embed = new EmbedBuilder()
            .setColor("Blue")
            .setDescription(`:white_check_mark:  ${target.tag}'s 1v1 xp has been reset!`)
 
            const embed2 = new EmbedBuilder()
            .setColor("Blue")
            .setDescription(`:white_check_mark: ${target}'s XP was reset by ${interaction.user}`);
 
            await interaction.reply({ embeds: [embed]})
 
            if (!channel) {
                return;
              } else {
                await channel.send({ embeds: [embed2] });
              }
         })
 
 
 
    }
}
