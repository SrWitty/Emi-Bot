const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, AttachmentBuilder } = require('discord.js');
const levelSchema = require ("../../Schemas.js/level");
const Canvacord = require('canvacord');
const levelschema = require('../../Schemas.js/levelsetup');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('rank')
    .setDMPermission(false)
    .addUserOption(option => option.setName('user').setDescription(`Specified user's rank will be displayed.`).setRequired(false))
    .setDescription(`Displays specified user's current rank (level).`),
    async execute(interaction) {

        const levelsetup = await levelschema.findOne({ Guild: interaction.guild.id });
        if (!levelsetup || levelsetup.Disabled === 'disabled') return await interaction.reply({ content: `The **Administrators** of this server **have not** set up the **leveling system** yet!`, ephemeral: true});

        const { options, user, guild } = interaction;

        const Member = options.getMember('user') || user;

        const member = guild.members.cache.get(Member.id);

        const Data = await levelSchema.findOne({ Guild: guild.id, User: member.id});

        const embednoxp = new EmbedBuilder()
        .setColor("Purple")
        .setThumbnail('https://media.discordapp.net/attachments/1099432836668330075/1135266004918861875/image-removebg-preview.png?width=295&height=295')
        .setTimestamp()
        .setTitle(`> ${Member.username}'s Rank`)
        .setFooter({ text: `⬆ ${Member.username}'s Ranking`})
        .setAuthor({ name: `⬆ Level Playground`})
        .addFields({ name: `• Level Details`, value: `> Specified member has not gained any XP`})

        if (!Data) return await interaction.reply({ embeds: [embednoxp] });

        await interaction.deferReply();

        const Required = Data.Level * Data.Level * 20 + 20;

        const rank = new Canvacord.Rank()
        .setAvatar(member.displayAvatarURL({ forceStatic: true}))
        .setBackground("IMAGE", 'https://cdn.discordapp.com/attachments/1080219392337522718/1083370383874478220/rankbackground.png')
        .setCurrentXP(Data.XP)
        .setRequiredXP(Required)
        .setOverlay("#A020F0", 0, false)
        .setRank(1, "Rank", false)
        .setLevel(Data.Level, "Level")
        .setUsername(member.user.username)
        .setDiscriminator(member.user.discriminator)

        const Card = await rank.build();

        const attachment = new AttachmentBuilder(Card, { name: "rank.png"});

        await interaction.editReply({ files: [attachment] })

    }
}