const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, PermissionFlagsBits } = require(`discord.js`);
const duelsLevelSchema = require("../../Schemas.js/1v1Levels");
 
module.exports = {
    data: new SlashCommandBuilder()
    .setName('1v1-reset')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setDescription('Reset the 1v1 XP system'),
    async execute(interaction) {
 
        if (!interaction.guild) return await interaction.reply({ content: "This command is only usable in the server!", ephemeral: true });
 
        duelsLevelSchema.deleteMany({
            Guild: interaction.guild.id
          }, async (err, data) => {
 
            const embed = new EmbedBuilder()
            .setColor("Blue")
            .setDescription(`:white_check_mark:  The 1v1 XP system has been reset!`)
 
            await interaction.reply({ embeds: [embed]})
         })
 
 
 
    }
}
