const { SlashCommandBuilder, MessageEmbed } = require('discord.js');
const Blacklist = require('../../Schemas.js/blacklistModel');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('blacklist')
    .setDescription('Blacklist or remove users from the bot\'s blacklist')
    .addSubcommand(subcommand =>
      subcommand
        .setName('add')
        .setDescription('Blacklist a user')
        .addUserOption(option => option.setName('user').setDescription('The user to be blacklisted').setRequired(true))
        .addStringOption(option => option.setName('reason').setDescription('Reason for blacklisting'))
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('remove')
        .setDescription('Remove a user from the blacklist')
        .addUserOption(option => option.setName('user').setDescription('The user to be removed from the blacklist').setRequired(true))
    ),
  async execute(interaction) {
    try {
      const userId = interaction.user.id;
      const botDeveloperIds = ['1091118468155314306', '992111921048342611'];

      if (!botDeveloperIds.includes(userId)) {
        // If the user is not a bot developer, reply with an ephemeral embed message
        const embed = new MessageEmbed()
          .setTitle('Unauthorized')
          .setDescription('You are not authorized to use this command.')
          .setColor('#ff0000');

        return await interaction.reply({ embeds: [embed], ephemeral: true });
      }

      const subcommand = interaction.options.getSubcommand();

      if (subcommand === 'add') {
        const user = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason');

        try {
          const existingEntry = await Blacklist.findOne({ userId: user.id });

          if (existingEntry) {
            // If the user is already blacklisted, reply with an ephemeral embed message
            const embed = new MessageEmbed()
              .setTitle('Already Blacklisted')
              .setDescription(`${user.username} is already blacklisted.`)
              .setColor('#ff0000');

            await interaction.reply({ embeds: [embed], ephemeral: true });
          } else {
            const newEntry = new Blacklist({ userId: user.id, reason });
            await newEntry.save();

            // Send a DM to the user to inform them about being blacklisted
            const dmEmbed = new MessageEmbed()
              .setTitle('Blacklisted from using the bot')
              .setDescription(`You have been blacklisted from using the bot. Reason: ${reason}`)
              .setColor('#ff0000');

            await user.send({ embeds: [dmEmbed] });

            // If the user is successfully blacklisted, reply with an ephemeral embed message
            const embed = new MessageEmbed()
              .setTitle('Blacklisted')
              .setDescription(`${user.username} has been blacklisted. Reason: ${reason}`)
              .setColor('#00ff00');

            await interaction.reply({ embeds: [embed], ephemeral: true });
          }
        } catch (error) {
          console.error('Error occurred while adding user to blacklist:', error);

          // If an error occurs while blacklisting, reply with an ephemeral embed message
          const embed = new MessageEmbed()
            .setTitle('Error')
            .setDescription('An error occurred while adding the user to the blacklist.')
            .setColor('#ff0000');

          await interaction.reply({ embeds: [embed], ephemeral: true });
        }
      } else if (subcommand === 'remove') {
        const user = interaction.options.getUser('user');

        try {
          const removedEntry = await Blacklist.findOneAndDelete({ userId: user.id });

          if (removedEntry) {
            // If the user is removed from the blacklist, reply with an ephemeral embed message
            const embed = new MessageEmbed()
              .setTitle('Removed from Blacklist')
              .setDescription(`${user.username} has been removed from the blacklist.`)
              .setColor('#00ff00');

            await interaction.reply({ embeds: [embed], ephemeral: true });

            // Send a DM to the user to inform them about being unblacklisted
            const dmEmbed = new MessageEmbed()
              .setTitle('Unblacklisted from using the bot')
              .setDescription(`You have been unblacklisted from using the bot.`)
              .setColor('#00ff00');

            await user.send({ embeds: [dmEmbed] });

            // Send a DM to the bot owner to inform about the unblacklisting
            const botOwner = interaction.guild.members.cache.get(botDeveloperIds[0]); // Assuming the first bot developer ID is the owner
            if (botOwner) {
              const ownerDmEmbed = new MessageEmbed()
                .setTitle('User Unblacklisted')
                .setDescription(`${user.username} has been unblacklisted from the bot.`)
                .setColor('#00ff00');

              await botOwner.send({ embeds: [ownerDmEmbed] });
            }
          } else {
            // If the user is not blacklisted, reply with an ephemeral embed message
            const embed = new MessageEmbed()
              .setTitle('Not Blacklisted')
              .setDescription(`${user.username} is not blacklisted.`)
              .setColor('#ff0000');

            await interaction.reply({ embeds: [embed], ephemeral: true });
          }
        } catch (error) {
          console.error('Error occurred while removing user from blacklist:', error);

          // If an error occurs while removing from the blacklist, reply with an ephemeral embed message
          const embed = new MessageEmbed()
            .setTitle('Error')
            .setDescription('An error occurred while removing the user from the blacklist.')
            .setColor('#ff0000');

          await interaction.reply({ embeds: [embed], ephemeral: true });
        }
      }
    } catch (error) {
      console.error('An unexpected error occurred:', error);
    }
  },
};
