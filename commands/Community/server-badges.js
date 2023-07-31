const { CommandInteraction, MessageEmbed, MessageActionRow, MessageSelectMenu, SlashCommandBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("badges")
        .setDescription("Veja todas as insígnias que os membros possuem neste servidor"),
    async execute(interaction) {
        let badges = [];
        let counts = {};

        for (const member of interaction.guild.members.cache.values()) {
            const user = await interaction.client.users.fetch(member.user.id);
            badges = badges.concat(user.flags?.toArray());
        }

        for (const badge of badges) {
            if (counts[badge]) {
                counts[badge]++;
            } else {
                counts[badge] = 1;
            }
        }

        let embed1 = new MessageEmbed()
            .setColor("Purple")
            .setAuthor({ name: `Badges - ${interaction.guild.name}`, iconURL: interaction.client.user.displayAvatarURL() })
            .setThumbnail(`${interaction.guild.iconURL({ dynamic: true })}`)
            .setDescription(`
            <:Discord_Staff:1116618574929342526> Discord Staff: \`${counts['STAFF'] || 0}\`
            <:Partner:1116633016454893638> Partner: \`${counts['PARTNER'] || 0}\`
            <:Certified_Moderator:1116618322952331276> Certified Moderator: \`${counts['CERTIFIED_MODERATOR'] || 0}\`
            <:HypeSquad_Events:1116618816680624159> HypeSquad Events: \`${counts['HYPESQUAD_EVENTS'] || 0}\`
            <:HypeSquad_Bravery:1116618771084345384> HypeSquad Bravery: \`${counts['HOUSE_BRAVERY'] || 0}\`
            <:HypeSquad_Brilliance:1116618789962907668> HypeSquad Brilliance: \`${counts['HOUSE_BRILLIANCE'] || 0}\`
            <:HypeSquad_Balance:1116618747919216640> HypeSquad Balance: \`${counts['HOUSE_BALANCE'] || 0}\`
            <:Bug_Hunter:1116618281835581450> Bug Hunter: \`${counts['BUGHUNTER_LEVEL_1'] || 0}\`
            <:Bug_Hunter_Gold:1116618300600889404> Bug Hunter Gold: \`${counts['BUGHUNTER_LEVEL_2'] || 0}\`
            <:Active_Developer:1116618034287751241> Active Developer: \`${counts['EARLY_VERIFIED_BOT_DEVELOPER'] || 0}\`
            <:Early_Verified_Bot_Developer:1116618702826242088> Early Verified Bot Developer: \`${counts['VERIFIED_BOT_DEVELOPER'] || 0}\`
            <:Early_Supporter:1116618595271704606> Early Supporter: \`${counts['EARLY_SUPPORTER'] || 0}\``);

        const row = new MessageActionRow()
            .addComponents(
                new MessageSelectMenu()
                    .setCustomId("badges")
                    .setPlaceholder("Badges")
                    .addOptions([
                        {
                            label: `Discord Staff (${counts['STAFF'] || 0})`,
                            emoji: "<:Discord_Staff:1116618574929342526>",
                            value: "STAFF",
                        },
                        // Add other options similarly
                    ])
            );

        await interaction.reply({ embeds: [embed1], components: [row] });

        const collector = interaction.channel.createMessageComponentCollector({
            componentType: "SELECT_MENU"
        });

        collector.on('collect', async (menuInteraction) => {
            const check = menuInteraction.values[0];

            const members = interaction.guild.members.cache.filter(member => {
                return member.user.flags?.toArray().includes(check);
            }).map(member => member.user.tag);

            const embed = new MessageEmbed()
                .setColor("RANDOM")
                .setTitle(`${check} (${counts[check] || 0})`)
                .setDescription(`The people with this badge within the server: \n\n> ${members.join('\n> ')}`);

            await menuInteraction.reply({ embeds: [embed], ephemeral: true });
        });
    },
};
  