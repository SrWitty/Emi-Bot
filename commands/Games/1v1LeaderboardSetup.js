const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, PermissionFlagsBits, ChannelType } = require(`discord.js`);
const levelSchema = require('../../Schemas.js/1v1Levels');
 
module.exports = {
    data: new SlashCommandBuilder()
    .setName('1v1-lb-setup')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addChannelOption(option => option.setName('channel').setDescription(`The channel you want the leaderboard to be sent in`).addChannelTypes(ChannelType.GuildText).setRequired(true))
    .setDescription('Setup the leaderboard for the 1v1 system'),
    async execute(interaction, client) {
 
        if (!interaction.guild) return await interaction.reply({ content: "This command is only usable in the server!", ephemeral: true });
 
        const levelNames = ["Unranked", "Bronze", "Silver", "Gold", "Emerald", "Diamond", "Master", "Elite"];
 
        const channel = interaction.options.getChannel('channel')
 
        const text2 = await pickPresence3();
        const embed6 = new EmbedBuilder()
        .setColor("NotQuiteBlack")
        .setTitle(`${interaction.guild.name}'s 1v1 Leaderboard`)
        .setDescription(`\`\`\`js\n${text2}\`\`\``)
        .setTimestamp()
        .setFooter({ text: "1v1 Leaderboard"});
        channel.send({ embeds: [embed6] }).then((msg) => {
            setTimeout(() => {
                try {
                    msg.delete();
                } catch (err) {
                    return;
                }
            }, 1000 * 60 * 10);
        });
        
 
        interaction.reply({ content: `The 1v1 leaderboard has been setup and is now avalible in ${channel}`, ephemeral: true})
    
        var receivedEmbed2;
    
        setInterval(async () => {
            let text2 = await pickPresence3();
            let embed6 = new EmbedBuilder()
                .setColor("NotQuiteBlack")
                .setTitle(`${interaction.guild.name}'s 1v1 Leaderboard`)
                .setDescription(`\`\`\`js\n${text2}\`\`\``)
                .setTimestamp()
                .setFooter({ text: "1v1 Leaderboard"});
                if (channel) {
                    channel.send({ embeds: [embed6] }).then((msg) => {
                        setTimeout(() => {
                            try {
                                msg.delete();
                            } catch (err) {
                                return;
                            }
                        }, 1000 * 60 * 10);
                    });
                } else {
                    return;
                }
            receivedEmbed2 = embed6;
        }, 1000 * 60 * 10);
    
        async function pickPresence3 () {
            const Data = await levelSchema.find({ Guild: interaction.guild.id, Rank: { $gt: 0 } })
                .sort({
                    Rank: -1,
                    Level: -1
                })
                .limit(10)
        
            if (Data.length === 0) {
                return ` #   Member   XP   Rank\n\n`;
            }
        
            let longestMember = 0;
            let longestXP = 0;
            let longestRank = 0;
            for (let data of Data) {
                let { User, Rank, Level } = data;
                const value = await client.users.fetch(User) || "Unknown Member";
                const member = value.tag;
                const levelName = levelNames[Level];
                if (member.length > longestMember) longestMember = member.length;
                if (Rank.toString().length > longestXP) longestXP = Rank.toString().length;
                if (levelName.length > longestRank) longestRank = levelName.length;
            }
        
            let table = ` #   Member${" ".repeat(longestMember - 6)}   XP${" ".repeat(
                longestXP - 2
            )}   Rank${" ".repeat(longestRank - 4)}\n\n`;
        
            for (let counter = 0; counter < Data.length; ++counter) {
                let { User, Rank, Level } = Data[counter];
                const value = await client.users.fetch(User) || "Unknown Member";
                const member = value.tag;
                const levelName = levelNames[Level];
                table += ` ${counter + 1}   ${member.padEnd(longestMember)}   ${Rank.toString().padEnd(longestXP)}   ${levelName.padEnd(longestRank)}\n`;
            } 
        
            return table;           
        }  
    
    }
}
