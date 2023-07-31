const { SlashCommandBuilder } = require('@discordjs/builders');
const { AttachmentBuilder, EmbedBuilder } = require('discord.js');
const { request } = require('undici');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('color')
    .setDescription('Get info about a color')
    .addNumberOption(option => option.setName('r').setDescription('RGB (R)').setMaxValue(255).setRequired(true))
    .addNumberOption(option => option.setName('g').setDescription('RGB (G)').setMaxValue(255).setRequired(true))
    .addNumberOption(option => option.setName('b').setDescription('RGB (B)').setMaxValue(255).setRequired(true)),

    async execute (interaction, client) {
        const op = interaction.options;
        const r = op.getNumber('r');
        const g = op.getNumber('g');
        const b = op.getNumber('b');
        //getting data
        const response = await request(`https://www.thecolorapi.com/id?format=json&rgb=${r},${g},${b}`)        
        const { hex, rgb, name, XYZ, cmyk } = await response.body.json()
        
        //sending the message
        const embed = new EmbedBuilder()
        .setTitle(`${name.value} (${rgb.r}, ${rgb.g}, ${rgb.b})`)
        .addFields(
            { name: 'Hex', value: `**\`${hex.value}\`**`, inline: true},
            { name: 'XYZ', value: `**\`${XYZ.X}, ${XYZ.Y}, ${XYZ.Z}\`**`, inline: true},
            { name: 'cmyk', value: `**\`${cmyk.c}, ${cmyk.m}, ${cmyk.y}, ${cmyk.k}\`**`, inline: true}
        )
        .setColor(`${hex.value}`)
        .setThumbnail(`https://singlecolorimage.com/get/${hex.clean}/512x512`)
        .setImage(`https://singlecolorimage.com/get/${hex.clean}/400x50`)

        await interaction.reply({ embeds: [embed] })
    }
}