const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require(`discord.js`);
const duelsSchema = require('../../Schemas.js/1v1Schema');
 
module.exports = {
    data: new SlashCommandBuilder()
    .setName('1v1-close')
    .setDescription('Close a 1v1 match'),
    async execute(interaction, client) {
 
        if (!interaction.guild) return await interaction.reply({ content: "This command is only usable in the server!", ephemeral: true });
 
        const membermissing = new EmbedBuilder()
        .setColor('#ff0000')
        .setDescription(`You do not have permissions to use this command!`)
  
      const staffSchema = await duelsSchema.findOne({ Guild: interaction.guild.id });
      if (!staffSchema) {
        return await interaction.reply({ content: 'The 1v1 system has not been setup, ask an administrator setup the 1v1 system using `/1v1-setup`.', ephemeral: true })
      }
  
      const staffRole = interaction.guild.roles.cache.get(staffSchema.Role);
      if (!interaction.member.roles.cache.has(staffRole.id) && interaction.member.roles.highest.comparePositionTo(staffRole) <= 0) return interaction.reply({
        embeds: [membermissing],
        ephemeral: true
      })
  
        const user = interaction.user
 
        const duels = await duelsSchema.findOne({ Guild: interaction.guild.id });
 
        const logChannel = interaction.guild.channels.cache.get(duels.Logs)
        const category = interaction.guild.channels.cache.get(duels.Category)        
 
        const closeEmbed = new EmbedBuilder()
        .setColor('NotQuiteBlack')
        .setAuthor({ 
            name: "Match Closed 🎮",
            iconURL: client.user.avatarURL({ dynamic: true, size: 1024 }) 
        })
        .setDescription(`${user} has closed a match`)
        .setTimestamp()
        .setFooter({ text: `Radiant Utilities | Matchmaking System`})
 
        if (interaction.channel.parent.id === category.id) {
 
            interaction.reply({ content: "You have closed the match.", ephemeral: true })
 
            interaction.channel.send(`${user.tag} has closed the match, the match will be deleted in 3 seconds.`);
 
            setTimeout(() => {
                interaction.channel.delete();
            }, 3000);
 
            if (!logChannel) {
                return;
              } else {
                logChannel.send({ embeds: [closeEmbed] })
              }
        } else {
            return interaction.reply({ content: "This command can only be used to close a match!", ephemeral: true })
        }
 
    }
}
