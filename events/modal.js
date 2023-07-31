const {EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, Events, Embed} = require('discord.js');
const embedSchema = require('../Schemas.js/embedSchema');

module.exports = {
    name: Events.InteractionCreate,
    nick: 'modalBuilder',
    async execute(interaction, client) {
        if (!interaction.isModalSubmit()) return;

    if (interaction.customId === 'titlemodal') {

            interaction.deferUpdate();

            const data = await embedSchema.findOne({MessageID: interaction.message.id, GuildID: interaction.guild.id});

            const title = interaction.fields.getTextInputValue('titleinput');
	        
            if (!data) return;

            const kua = await embedSchema.findOneAndUpdate({MessageID: interaction.message.id, GuildID: interaction.guild.id}, {Title: title}, {new: true});
            console.log(kua);

            const embed1 = new EmbedBuilder()
            .setTitle(title)

            if (data.Author !== ' ') {
                embed1.setAuthor({name: data.Author})
            }

            if (data.Description !== ' ') {
                embed1.setDescription(data.Description)
            }

            if (data.Footer !== ' ') {
                embed1.setFooter({text: data.Footer})
            }

            if (data.Image!== ' ') {
                embed1.setImage(data.Image)
            }

            if (data.Thumbnail!== ' ') {
                embed1.setThumbnail(data.Thumbnail)
            }

            if (data.Timestamp !== '1') {
                embed1.setTimestamp()
            }

            if (data.Color !== ' ') {
                embed1.setColor(data.Color)
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

        const channel = await client.channels.fetch(data.ChannelID);
        const message = await channel.messages.fetch(data.MessageID);

        await message.edit({embeds: [embed1], components: [row1, row2, row3]})
}

    if (interaction.customId === 'desmodal') {

        interaction.deferUpdate();

        const data = await embedSchema.findOne({MessageID: interaction.message.id, GuildID: interaction.guild.id});

        const des = interaction.fields.getTextInputValue('desinput');
        const color = interaction.fields.getTextInputValue('colorinput');
        
        if (!data) return;

        const kua = await embedSchema.findOneAndUpdate({MessageID: interaction.message.id, GuildID: interaction.guild.id}, {Description: des}, {new: true});

        console.log(kua);

        if (color) {
            await embedSchema.findOneAndUpdate(
                { MessageID: interaction.message.id, GuildID: interaction.guild.id },
                { Color: color },
                { new: true }
            );
        }

        const embed1 = new EmbedBuilder()
        .setDescription(des)

        if (data.Author !== ' ') {
            embed1.setAuthor({name: data.Author})
        }

        if (data.Title !== ' ') {
            embed1.setTitle(data.Title)
        }

        if (data.Footer) {
            embed1.setFooter({text: data.Footer})
        }

        if (data.Image!== ' ') {
            embed1.setImage(data.Image)
        }

        if (data.Thumbnail!== ' ') {
            embed1.setThumbnail(data.Thumbnail)
        }

        if (data.Color !== ' ') {
            embed1.setColor(data.Color)
        }

        if (data.Timestamp !== '1') {
            embed1.setTimestamp()
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

    const channel = await client.channels.fetch(data.ChannelID);
    const message = await channel.messages.fetch(data.MessageID);

    await message.edit({embeds: [embed1], components: [row1, row2, row3]})

}
    
    if (interaction.customId === 'footermodal') {

        interaction.deferUpdate();

    const data = await embedSchema.findOne({MessageID: interaction.message.id, GuildID: interaction.guild.id});

    const footer = interaction.fields.getTextInputValue('footerinput');
    
    if (!data) return;

    const kua = await embedSchema.findOneAndUpdate({MessageID: interaction.message.id, GuildID: interaction.guild.id}, {Footer: footer}, {new: true});
    console.log(kua);

    const embed1 = new EmbedBuilder()
    .setFooter({text: footer})

    if (data.Author !== ' ') {
        embed1.setAuthor({name: data.Author})
    }

    if (data.Color !== ' ') {
        embed1.setColor(data.Color)
    }

    if (data.Title !== ' ') {
        embed1.setTitle(data.Title)
    }

    if (data.Description !== ' ') {
        embed1.setDescription(data.Description)
    }

    if (data.Image!== ' ') {
        embed1.setImage(data.Image)
    }

    if (data.Thumbnail!== ' ') {
        embed1.setThumbnail(data.Thumbnail)
    }

    if (data.Timestamp !== '1') {
        embed1.setTimestamp()
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

const channel = await client.channels.fetch(data.ChannelID);
const message = await channel.messages.fetch(data.MessageID);

await message.edit({embeds: [embed1], components: [row1, row2, row3]})

}

    if (interaction.customId === 'authormodal') {

        interaction.deferUpdate();

    const data = await embedSchema.findOne({MessageID: interaction.message.id, GuildID: interaction.guild.id});

    const author = interaction.fields.getTextInputValue('authorinput');
    
    if (!data) return;

    const kua = await embedSchema.findOneAndUpdate({MessageID: interaction.message.id, GuildID: interaction.guild.id}, {Author: author}, {new: true});
    console.log(kua);

    const embed1 = new EmbedBuilder()
    .setAuthor({name: author})

    if (data.Footer !== ' ') {
        embed1.setFooter({text: data.Footer})
    }

    if (data.Color !== ' ') {
        embed1.setColor(data.Color)
    }

    if (data.Title !== ' ') {
        embed1.setTitle(data.Title)
    }

    if (data.Description !== ' ') {
        embed1.setDescription(data.Description)
    }

    if (data.Image!== ' ') {
        embed1.setImage(data.Image)
    }

    if (data.Thumbnail!== ' ') {
        embed1.setThumbnail(data.Thumbnail)
    }

    if (data.Timestamp !== '1') {
        embed1.setTimestamp()
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

const channel = await client.channels.fetch(data.ChannelID);
const message = await channel.messages.fetch(data.MessageID);

await message.edit({embeds: [embed1], components: [row1, row2, row3]})

}  

    if (interaction.customId === 'imagermodal') {

        interaction.deferUpdate();

    const data = await embedSchema.findOne({MessageID: interaction.message.id, GuildID: interaction.guild.id});

    const image = interaction.fields.getTextInputValue('imageinput');
    
    if (!data) return;

    const kua = await embedSchema.findOneAndUpdate({MessageID: interaction.message.id, GuildID: interaction.guild.id}, {Image: image}, {new: true});
    console.log(kua);

    const embed1 = new EmbedBuilder()
    .setImage(image)

    if (data.Footer !== ' ') {
        embed1.setFooter({text: data.Footer})
    }

    if (data.Title !== ' ') {
        embed1.setTitle(data.Title)
    }

    if (data.Color !== ' ') {
        embed1.setColor(data.Color)
    }

    if (data.Description !== ' ') {
        embed1.setDescription(data.Description)
    }

    if (data.Author !== ' ') {
        embed1.setAuthor({name: data.Author})
    }

    if (data.Thumbnail!== ' ') {
        embed1.setThumbnail(data.Thumbnail)
    }

    if (data.Timestamp !== '1') {
        embed1.setTimestamp()
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

const channel = await client.channels.fetch(data.ChannelID);
const message = await channel.messages.fetch(data.MessageID);

await message.edit({embeds: [embed1], components: [row1, row2, row3]})

}

    if (interaction.customId === 'thumbnailmodal') {

        interaction.deferUpdate();

    const data = await embedSchema.findOne({MessageID: interaction.message.id, GuildID: interaction.guild.id});

    const thumbnail = interaction.fields.getTextInputValue('thumbnailinput');
    
    if (!data) return;

    const kua = await embedSchema.findOneAndUpdate({MessageID: interaction.message.id, GuildID: interaction.guild.id}, {Thumbnail: thumbnail}, {new: true});
    console.log(kua);

    const embed1 = new EmbedBuilder()
    .setThumbnail(thumbnail)

    if (data.Footer !== ' ') {
        embed1.setFooter({text: data.Footer})
    }

    if (data.Title !== ' ') {
        embed1.setTitle(data.Title)
    }

    if (data.Color !== ' ') {
        embed1.setColor(data.Color)
    }

    if (data.Description !== ' ') {
        embed1.setDescription(data.Description)
    }

    if (data.Author !== ' ') {
        embed1.setAuthor({name: data.Author})
    }

    if (data.Image !== ' ') {
        embed1.setImage(data.Image)
    }

    if (data.Timestamp !== '1') {
        embed1.setTimestamp()
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

const channel = await client.channels.fetch(data.ChannelID);
const message = await channel.messages.fetch(data.MessageID);

await message.edit({embeds: [embed1], components: [row1, row2, row3]})

}

    if (interaction.customId === `timestampmodal`) {

        interaction.deferUpdate();

    const data = await embedSchema.findOne({MessageID: interaction.message.id, GuildID: interaction.guild.id});

    const timestamp = interaction.fields.getTextInputValue('timestampinput');

    let timest;

    if (timestamp === 'Có' || timestamp === 'có') {
        timest = '0';
    } else if (timestamp === 'Không' || timestamp === 'không') {
        timest = '1';
    } else { 
        timest = '0';
    }
    
    if (!data) return;

    const kua = await embedSchema.findOneAndUpdate({MessageID: interaction.message.id, GuildID: interaction.guild.id}, {Timestamp: timest}, {new: true});
    console.log(kua);

    const embed1 = new EmbedBuilder()

    if (data.Footer !== ' ') {
        embed1.setFooter({text: data.Footer})
    }

    if (data.Title !== ' ') {
        embed1.setTitle(data.Title)
    }

    if (data.Description !== ' ') {
        embed1.setDescription(data.Description)
    }

    if (data.Author !== ' ') {
        embed1.setAuthor({name: data.Author})
    }

    if (data.Image !== ' ') {
        embed1.setImage(data.Image)
    }

    if (data.Thumbnail !== ' ') {
        embed1.setImage(data.Thumbnail)
    }

    if (data.Timestamp !== '0') {
        embed1.setTimestamp()
    }

    if (data.Color !== ' ') {
        embed1.setColor(data.Color)
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

const channel = await client.channels.fetch(data.ChannelID);
const message = await channel.messages.fetch(data.MessageID);

await message.edit({embeds: [embed1], components: [row1, row2, row3]})



    }

    if (interaction.customId === `sendmodal`) {

        interaction.deferUpdate();

        const data = await embedSchema.findOne({MessageID: interaction.message.id, GuildID: interaction.guild.id});

        const channelid = interaction.fields.getTextInputValue('channelinput');

        const channel = await client.channels.fetch(channelid);

        const embed = new EmbedBuilder()

        if (data.Title !== ' ') {
            embed.setTitle(data.Title)
        }

        if (data.Author !== ' ') {
            embed.setAuthor({name: data.Author})
        }

        if (data.Description !== ' ') {
            embed.setDescription(data.Description)
        }

        if (data.Footer !== ' ') {
            embed.setFooter({text: data.Footer})
        }

        if (data.Image !== ' ') {
            embed.setImage(data.Image)
        }

        if (data.Thumbnail !== ' ') {
            embed.setThumbnail(data.Thumbnail)
        }

        if (data.Timestamp !== '1') {
            embed.setTimestamp()
        }

        channel.send({embeds: [embed]})
        



    
    }


    }
}