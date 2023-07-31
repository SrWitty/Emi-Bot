const { Interaction, EmbedBuilder } = require("discord.js");
const Blacklist = require('../Schemas.js/blacklistModel');

module.exports = {
    name: 'interactionCreate',
    async execute(interaction, client) {
        if (!interaction.isCommand()) return;

        const command = client.commands.get(interaction.commandName);

        if (!command) return;

        // Get the user ID of the person executing the command
        const userId = interaction.user.id;

        // Check if the user is blacklisted
        try {
            const blacklistedUser = await Blacklist.findOne({ userId });

            if (blacklistedUser) {
                // If the user is blacklisted, send a reply as an embed visible only to the user
                const embed = new EmbedBuilder()
                    .setTitle('Blacklist Notice')
                    .setDescription('You are blacklisted and cannot use commands.')
                    .setColor('#ff0000');

                return await interaction.reply({ embeds: [embed], ephemeral: true });
            }

            // If the user is not blacklisted, execute the command
            await command.execute(interaction, client);
        } catch (error) {
            console.log(error);
            // Send an error reply as an embed visible only to the user
            const embed = new EmbedBuilder()
                .setTitle('Error')
                .setDescription('There was an error while executing this command!')
                .setColor('#ff0000');

            await interaction.reply({ embeds: [embed], ephemeral: true });
        }
    },
};
