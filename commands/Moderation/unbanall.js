const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unbanall')
    .setDescription('Unban all users from the server. (Administrator Only)'),
  async execute(interaction) {
    try {
      const member = interaction.member;
      if (!member.permissions.has('ADMINISTRATOR')) {
        // If the user invoking the command doesn't have the Administrator permission, reply with an ephemeral embed message
        const embed = new EmbedBuilder()
          .setTitle('Unauthorized')
          .setDescription('You must have the "Administrator" permission to use this command.')
          .setColor('#ff0000');

        return await interaction.reply({ embeds: [embed], ephemeral: true });
      }

      // Fetch all banned users from the server
      const bannedUsers = await interaction.guild.bans.fetch();

      if (bannedUsers.size === 0) {
        const embed = new EmbedBuilder()
          .setTitle('No Banned Users')
          .setDescription('There are no users banned in this server.')
          .setColor('#00ff00');

        return await interaction.reply({ embeds: [embed], ephemeral: true });
      }

      // Unban all users
      bannedUsers.forEach(async (banInfo) => {
        try {
          await interaction.guild.members.unban(banInfo.user.id, 'Unbanned all users as requested by an administrator.');
        } catch (error) {
          console.error(`Error while unbanning user ${banInfo.user.id}:`, error);
        }
      });

      const embed = new EmbedBuilder()
        .setTitle('Unban All Users')
        .setDescription('All users have been unbanned from the server.')
        .setColor('#00ff00');

      await interaction.reply({ embeds: [embed], ephemeral: true });
    } catch (error) {
      console.error('An unexpected error occurred:', error);

      // If an unexpected error occurs, reply with an ephemeral embed message
      const embed = new EmbedBuilder()
        .setTitle('Error')
        .setDescription('An unexpected error occurred while processing the command.')
        .setColor('#ff0000');

      await interaction.reply({ embeds: [embed], ephemeral: true });
    }
  },
};
