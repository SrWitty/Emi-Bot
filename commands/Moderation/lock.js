const { SlashCommandBuilder } = require('@discordjs/builders');
const { PermissionsBitField, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('lock')
    .setDescription('Locks the current channel.')
    .addChannelOption(option => option.setName('channel').setDescription('The channel to lock.')),
  async execute(interaction) {
    // Get the channel to lock
    const channel = interaction.options.getChannel('channel') || interaction.channel;

    // Check if the user has permission to manage channels
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
      return interaction.reply({ content: 'You do not have permission to use this command. [PermissionsBitField.Flags.ManageChannels]', ephemeral: true });
    }

    // Check if the channel is already locked
    if (channel.permissionsFor(interaction.guild.roles.everyone).has(PermissionsBitField.Flags.SendMessages) === false) {
      return interaction.reply({ content: 'This channel is already locked.', ephemeral: true });
    }

    // Lock the channel
    await channel.permissionOverwrites.create(interaction.guild.roles.everyone, {
        SendMessages: false
    });

    // Send an embed to confirm that the channel has been locked
    const embed = new EmbedBuilder()
      .setColor('#2f3136')
      .setTitle(`\`\`\`The channel has been locked.\`\`\``)
      .setDescription(`Channel Name: ${channel}`)
      .setTimestamp()

    await interaction.reply({ ephemeral: true, embeds: [embed] });
  },
};