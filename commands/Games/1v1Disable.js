const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, PermissionFlagsBits } = require(`discord.js`);
const duelsSchema = require('../../Schemas.js/1v1Schema');
const duelsLevelSchema = require("../../Schemas.js/1v1Levels");
 
module.exports = {
    data: new SlashCommandBuilder()
    .setName('1v1-disable')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setDescription('Disable then 1v1 system. This will also RESET the leaderboard, are you sure you want to do this?'),
    async execute(interaction, client) {
 
        if (!interaction.guild) return await interaction.reply({ content: "This command is only usable in the server!", ephemeral: true });
 
        const Data = await duelsSchema.findOne({ Guild: interaction.guild.id});
 
        if (!Data) {
            const checkEmbed = new EmbedBuilder()
            .setColor("Red")
            .setTitle(`1v1 Status`)
            .setDescription(`The 1v1 system is currently **disabled**.`)
            .addFields(
              { name: "Enable Logs", value: '`/1v1-setup`', inline: true }
            );
            return await interaction.reply({ embeds: [checkEmbed], ephemeral: true });
          } else {
            await duelsSchema.deleteMany({ Guild: interaction.guild.id});
            await duelsLevelSchema.deleteMany({ Guild: interaction.guild.id});
 
            const embed = new EmbedBuilder()
            .setColor('Green')
            .setTitle(`1v1 Status`)
            .setDescription(`The 1v1 system has been **disabled**.`)
            .setThumbnail(interaction.guild.iconURL())
            .setTimestamp();
 
            await interaction.reply({ embeds: [embed] })
        }
 
    }
}
