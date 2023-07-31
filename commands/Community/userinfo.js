const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('user-info')   
        .setDescription(`Find information about a user in the guild`)
        .setDMPermission(false)
        .addUserOption(option => option 
            .setName('user')
            .setDescription(`The user you want to get information about`)
            .setRequired(false)
        ),
        async execute(interaction) {
            try {

                // Change the emojis down below
                const badges = {
                    BugHunterLevel1: '<:BugHunterLevel1:1110066533994086410>',
                    BugHunterLevel2: '<:BugHunter2:1107753078079357070>',
                    Partner: '<:Partner:1110066532890984479>',
                    PremiumEarlySupporter: '<:PremiumEarlySupporter:1110066524812759040>',
                    Staff: '<:Staff:1110066531699798136>',
                    VerifiedDeveloper: '<:VerifiedDeveloper:1110066526654058647>',
                    ActiveDeveloper: '<:ActiveDeveloper:1110068693762850889>',
                };
    
                const user = interaction.options.getUser('user') || interaction.user;
                const member = await interaction.guild.members.fetch(user.id);
                const userAvatar = user.displayAvatarURL({ size: 32 });
                const userBadges = user.flags.toArray().map(badge => badges[badge]).join(' ') || 'None';
                const nick = member.displayName || 'None';
                const botStatus = user.bot ? 'Yes' : 'No';
    
                const embed = new EmbedBuilder()
                    .setTitle(`${user.username}'s Information`) 
                    .setColor('Red')
                    .setThumbnail(userAvatar)
                    .setTimestamp()
                    .setFooter({ text: `User ID: ${user.id}` })
                    .addFields({
                        name: '<:join:1109644278872944740> Joined Discord',
                        value: `<t:${Math.floor(user.createdAt.getTime() / 1000)}:R>`,
                        inline: true,
                    })
                    .addFields({
                        name: '<:join:1109644278872944740> Joined Server',
                        value: `<t:${Math.floor(member.joinedAt.getTime() / 1000)}:R>`,
                        inline: true,
                    })
                    .addFields({
                        name: '<:Name:1110072592997556314> Nickname:',
                        value: nick,
                        inline: false,
                    })
                    .addFields({
                        name: '<:boosterbadge:1109644281876054038> Boosted Server',
                        value: member.premiumSince ? 'Yes' : 'No',
                        inline: false,
                    })
                    .addFields({ 
                        name: '<:bot:1109644280655511612> BOT',
                        value: botStatus,
                        inline: false,
                    })
                    .addFields({ 
                        name: '<:verifiedbadge:1109644282689753090> Badges',
                        value: userBadges,
                        inline: false,
                    })
    
                await interaction.reply({ embeds: [embed], ephemeral: true });
            } catch (error) {
                console.error(error);
                await interaction.reply({ content: 'An error occurred while executing the command.', ephemeral: true });
            }
        },
};