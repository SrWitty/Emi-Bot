const {EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, Events, ModalBuilder, TextInputBuilder, TextInputStyle, TextInputComponent} = require('discord.js');
const embedSchema = require('../Schemas.js/embedSchema');


module.exports = {
    name: Events.InteractionCreate,
    nick: 'embedBuilder',
    async execute(interaction, client) {
            const { customId, guild, channel, member, message } = interaction;   
            if (!interaction.isButton()) return;
            
            const data = await embedSchema.findOne({
              Guild: guild.id,
              MessageID: message.id
            });


            if (customId === 'title') {

                const modal1 = new ModalBuilder()
			.setCustomId('titlemodal')
			.setTitle('Title');

		const TitleInput = new TextInputBuilder()
			.setCustomId('titleinput')
			.setLabel("Embed's title")
			.setStyle(TextInputStyle.Short);

		const ActionRow1 = new ActionRowBuilder().addComponents(TitleInput);

		modal1.addComponents(ActionRow1);

		await interaction.showModal(modal1);
            }

            if (customId === 'description') {

                const modal2 = new ModalBuilder()
                .setCustomId('desmodal')
                .setTitle(`Description`);

                const DesInput = new TextInputBuilder()
                .setCustomId(`desinput`)
                .setLabel(`Description of Embed`)
                .setStyle(TextInputStyle.Paragraph);

                const ColorInput = new TextInputBuilder()
                .setCustomId(`colorinput`)
                .setLabel(`Color of Embed (HEX CODE)`)
                .setStyle(TextInputStyle.Short)
                .setRequired(false);


        const ActionRow1 = new ActionRowBuilder().addComponents(DesInput);
        const ActionRow2 = new ActionRowBuilder().addComponents(ColorInput);

        modal2.addComponents(ActionRow1, ActionRow2);

        await interaction.showModal(modal2);
            }

            if (customId === 'footer') {

                const modal3 = new ModalBuilder()
                .setCustomId('footermodal')
                .setTitle(`Footer`);

                const FooterInput = new TextInputBuilder()
                .setCustomId(`footerinput`)
                .setLabel(`Embed's Footer`)
                .setStyle(TextInputStyle.Short);

        const ActionRow3 = new ActionRowBuilder().addComponents(FooterInput);

        modal3.addComponents(ActionRow3);

        await interaction.showModal(modal3);
            }

            if (customId === 'author') {

                const modal4 = new ModalBuilder()
                .setCustomId('authormodal')
                .setTitle(`Author`);

                const AuthorInput = new TextInputBuilder()
                .setCustomId(`authorinput`)
                .setLabel(`Author of Embed`)
                .setStyle(TextInputStyle.Short);

        const ActionRow4 = new ActionRowBuilder().addComponents(AuthorInput);

        modal4.addComponents(ActionRow4);

        await interaction.showModal(modal4);
            }

            if (customId === 'image') {

                const modal5 = new ModalBuilder()
                .setCustomId('imagermodal')
                .setTitle(`Image`);

                const ImageInput = new TextInputBuilder()
                .setCustomId(`imageinput`)
                .setLabel(`Image of Embed (Link PNG)`)
                .setStyle(TextInputStyle.Paragraph);

        const ActionRow5 = new ActionRowBuilder().addComponents(ImageInput);

        modal5.addComponents(ActionRow5);

        await interaction.showModal(modal5);
            }

            if (customId === 'thumbnail') {

                const modal6 = new ModalBuilder()
                .setCustomId('thumbnailmodal')
                .setTitle(`Thumbnail`);

                const ThumbnailInput = new TextInputBuilder()
                .setCustomId(`thumbnailinput`)
                .setLabel(`Embed's Thumbnail (Link PNG)`)
                .setStyle(TextInputStyle.Paragraph);

        const ActionRow6 = new ActionRowBuilder().addComponents(ThumbnailInput);

        modal6.addComponents(ActionRow6);

        await interaction.showModal(modal6);
            }

            if (customId === 'timestamp') {

                const modal6 = new ModalBuilder()
                .setCustomId('timestampmodal')
                .setTitle(`Timestamp`);

                const TimestampInput = new TextInputBuilder()
                .setCustomId(`timestampinput`)
                .setLabel(`Enable Timestamp for Embed (Yes/No)`)
                .setStyle(TextInputStyle.Short);

        const ActionRow6 = new ActionRowBuilder().addComponents(TimestampInput);

        modal6.addComponents(ActionRow6);

        await interaction.showModal(modal6);
            }

            if (customId === 'send') {
                const modal = new ModalBuilder()
                .setCustomId(`sendmodal`)
                .setTitle(`Send`);

                const ChannelInput = new TextInputBuilder()
                .setCustomId(`channelinput`)
                .setLabel(`Channel you want to send (ID CHANNEL)`)
                .setStyle(TextInputStyle.Short);

        const ActionRow = new ActionRowBuilder().addComponents(ChannelInput);

        modal.addComponents(ActionRow);

        await interaction.showModal(modal);
            }   
            if (customId === 'clear') {

            const check = await embedSchema.findOne({MessageID: interaction.message.id, GuildID: interaction.guild.id, UserID: interaction.user.id})

            if (!check) {
                return interaction.reply({content:`You cannot clear this embed! Only the creator can use this function`, ephemeral:true});
            }

            const kua = await embedSchema.findOneAndUpdate({MessageID: interaction.message.id, GuildID: interaction.guild.id, UserID: interaction.user.id},
                {Title: `Embed Builder`, Author: ` `, Description: ' ', Footer: 'Spring, summer, autumn, winter', Timestamp: `0`, Image: ` `, Thumbnail: ' ', Color: ' '}, {new:true});

                console.log(kua);

                const embedd = new EmbedBuilder()
                .setTitle(kua.Title)

    if (kua.Footer !== ' ') {
        embedd.setFooter({text: kua.Footer})
    }

    if (kua.Title !== ' ') {
        embedd.setTitle(kua.Title)
    }

    if (kua.Color !== ' ') {
        embedd.setColor(kua.Color)
    }

    if (kua.Description !== ' ') {
        embedd.setDescription(kua.Description)
    }

    if (kua.Author !== ' ') {
        embedd.setAuthor({name: kua.Author})
    }

    if (kua.Image !== ' ') {
        embedd.setImage(kua.Image)
    }

    if (kua.Timestamp !== '1') {
        embedd.setTimestamp()
    }

    const row1 = new ActionRowBuilder()
    .addComponents(
    new ButtonBuilder()
    .setLabel(`Title`)
    .setCustomId(`title`)
    .setStyle(ButtonStyle.Secondary),
    
    new ButtonBuilder()
    .setLabel(`Author`)
    .setCustomId(`author`)
    .setStyle(ButtonStyle.Secondary),
    
    new ButtonBuilder()
    .setLabel(`Description`)
    .setCustomId(`description`)
    .setStyle(ButtonStyle.Secondary),
    
    new ButtonBuilder()
    .setLabel(`Footer`)
    .setCustomId(`footer`)
    .setStyle(ButtonStyle.Secondary)
    )
    
    const row2 = new ActionRowBuilder()
    .addComponents(
    new ButtonBuilder()
    .setLabel(`Image`)
    .setCustomId(`image`)
    .setStyle(ButtonStyle.Secondary),
    
    new ButtonBuilder()
    .setLabel(`Thumbnail`)
    .setCustomId(`thumbnail`)
    .setStyle(ButtonStyle.Secondary),
    
    new ButtonBuilder()
    .setLabel(`TimeStamp`)
    .setCustomId(`timestamp`)
    .setStyle(ButtonStyle.Secondary)
    )
    
    const row3 = new ActionRowBuilder()
    .addComponents(
    new ButtonBuilder()
    .setLabel(`Send`)
    .setCustomId(`send`)
    .setStyle(ButtonStyle.Success),
    
    new ButtonBuilder()
    .setLabel(`Clear`)
    .setCustomId(`clear`)
    .setStyle(ButtonStyle.Primary),
    
    new ButtonBuilder()
    .setLabel(`Delete`)
    .setCustomId(`delete`)
    .setStyle(ButtonStyle.Danger)
    )
    
    const channel = await client.channels.fetch(kua.ChannelID);
    const message = await channel.messages.fetch(kua.MessageID);
    
    await message.edit({embeds: [embedd], components: [row1, row2, row3]})

    interaction.reply({content:`Đã clear thành công embed!` , ephemeral:true});





            }

            if (customId === 'delete') {

            const data = await embedSchema.findOne({MessageID: interaction.message.id, UserID: interaction.user.id})

            if (!data) {
                return interaction.reply({content:`You cannot delete this embed! Only the creator can use this function`, ephemeral:true});
            }

            const channel = await client.channels.fetch(data.ChannelID);
            const message = await channel.messages.fetch(data.MessageID);

            await embedSchema.findOneAndDelete({MessageID: interaction.message.id, UserID: interaction.user.id, GuildID: interaction.guild.di});

            message.delete();

            interaction.reply({content:`Successfully deleted embed`, ephemeral:true});

        }
    }
}