const { SlashCommandBuilder } = require('@discordjs/builders');
const { PermissionsBitField, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unlock')
    .setDescription('Unlocks the current channel.')
    .addChannelOption(option => option.setName('channel').setDescription('The channel to unlock.')),
  async execute(interaction) {
    // Get the channel to unlock
    const channel = interaction.options.getChannel('channel') || interaction.channel;

    // Check if the user has permission to manage channels
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
      return interaction.reply({ content: 'You do not have permission to use this command. [PermissionsBitField.Flags.ManageChannels]', ephemeral: true });
    }

    // Check if the channel is already unlocked
    if (channel.permissionsFor(interaction.guild.roles.everyone).has(PermissionsBitField.Flags.SendMessages) === true) {
      return interaction.reply({ content: 'This channel is already unlocked.', ephemeral: true });
    }

    // Unlock the channel
    await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
        SendMessages: null
    });

    // Send an embed to confirm that the channel has been unlocked
    const embed = new EmbedBuilder()
      .setColor('#2f3136')
      .setTitle(`\`\`\`The channel has been unlocked.\`\`\``).setDescription(`Channel Name: ${channel}`)
      .setTimestamp()

    await interaction.reply({ ephemeral: true, embeds: [embed] });
  },
};
