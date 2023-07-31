const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Shows all the commands you can use.'),
  async execute (interaction, client) {

    let commands = [];

    // Map out the name and description of each command
    client.commands.forEach(command => {
      commands.push({
        name: command.data.name || "Error",
        description: command.data.description || "Error"
      });
    });

    // Map it to a list of objects, if undefined, ignore it
    const commandList = commands.map(command => {
      return {
        value: `**/${command.name}** - ${command.description}`,
        name: `\u200b` // This is an invisible character, discord doesn't like empty fields
      };
    });

    const embed = {
      color: parseInt("#00ff00".replace("#", ""), 16),
      title: `Help`,
      description: `Here are all the commands you can use!`,
      fields: commandList,
      footer: {
        text: `${client.user.username} | ${interaction.guild.name}`
      }
    };

    await interaction.reply({
      embeds: [embed]
    });
    

  }
};