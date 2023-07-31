const { SlashCommandBuilder, EmbedBuilder, ModalBuilder, PermissionsBitField, ActionRowBuilder, TextInputBuilder, TextInputStyle, ButtonBuilder, ButtonStyle, Events } = require('discord.js');
const { QuickDB } = require('quick.db')
const db = new QuickDB();
const Voted = require("../../Schemas.js/pollSchema");

module.exports = {
    data: new SlashCommandBuilder()
    .setName('poll')
    .setDescription('Create a poll')
    .addChannelOption(option => option.setName('channel').setDescription('The channel to send the poll message to')),

    async execute (interaction, client) {
        //vars
        let channel = interaction.options.getChannel('channel') || interaction.channel
        let Btnopti1;
        let Btnopti2;
        let embedtitle;
        let embeddesc;

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) return await interaction.reply({ content: 'You do not have permission to use this command', ephemeral: true})
        
        const embed = new EmbedBuilder()
        .setTitle('Poll Embed')
        .setColor('Blue')
        .setThumbnail(interaction.guild.iconURL({dynamic: true}))
        .setFields(
            { name: `Option1`, value: `> **\`0\`** Votes`, inline:true},
            { name: `Option2`, value: `> **\`0\`** Votes`, inline:true},
            { name: `Poll Creator:`, value: `> ${interaction.user}`, inline:false}
        )

        const pollTitle = new ButtonBuilder()
        .setCustomId('poll-title')
        .setLabel('Title')
        .setEmoji(' <:edit:1131886800311422996>')
        .setStyle(ButtonStyle.Secondary)

        const pollDesc = new ButtonBuilder()
        .setCustomId('poll-desc')
        .setLabel('Description')
        .setEmoji(' <:edit:1131886800311422996>')
        .setStyle(ButtonStyle.Secondary)

        const editOptions = new ButtonBuilder()
        .setCustomId('edit-options')
        .setLabel('Edit Options')
        .setEmoji(' <:edit:1131886800311422996>')
        .setStyle(ButtonStyle.Secondary)

        const sendMsg = new ButtonBuilder()
        .setCustomId('send-msg')
        .setLabel('Send Poll')
        .setEmoji('<:send:1131886966967898133>')
        .setStyle(ButtonStyle.Primary)

        const editChannel = new ButtonBuilder()
        .setCustomId('edit-channel')
        .setLabel('Edit Channel')
        .setEmoji(' <:edit:1131886800311422996>')
        .setStyle(ButtonStyle.Secondary)

        const editingrow = new ActionRowBuilder().addComponents(pollTitle, pollDesc, editOptions)
        const sendrow = new ActionRowBuilder().addComponents(editChannel,sendMsg)

        const msg = await interaction.reply({ content: `Sending to: ${channel}`, embeds: [embed], components: [editingrow, sendrow] })
        const collector = msg.createMessageComponentCollector();

        collector.on('collect', async i => {
            if(!i.isButton()) return;
            if(interaction.user.id !== i.user.id) return await i.reply({ content: 'These buttons are not meant for you.', ephemeral: true})
            // POLL TITLE
            if(i.customId === 'poll-title') {
                const titleModal = new ModalBuilder()
                .setCustomId('title-modal')
                .setTitle('Embed Title')

                const titleOption = new TextInputBuilder()
                .setCustomId('title-option')
                .setLabel('Title Of The Embed')
                .setStyle(TextInputStyle.Short)
                .setRequired(true)

                const titleRow = new ActionRowBuilder().addComponents(titleOption)
                titleModal.addComponents(titleRow)
                i.showModal(titleModal)

                client.once(Events.InteractionCreate, async i => {
                    if (!i.isModalSubmit()) return;

                    const title = i.fields.getTextInputValue('title-option') || 'Poll Embed'
                    if(title) embed.setTitle(`${title}`)
                
                    await interaction.editReply({ embeds: [embed] })
                    await i.deferUpdate()
                })
            }
            // POLL DESCRIPTION
             if(i.customId === 'poll-desc') {
                const descModal = new ModalBuilder()
                .setCustomId('desc-modal')
                .setTitle('Embed Description')

                const descOption = new TextInputBuilder()
                .setCustomId('desc-option')
                .setLabel('Description Of The Embed')
                .setStyle(TextInputStyle.Paragraph)
                .setMaxLength(2000)
                .setRequired(true)

                const descRow = new ActionRowBuilder().addComponents(descOption)
                descModal.addComponents(descRow)
                i.showModal(descModal)
                client.once(Events.InteractionCreate, async i => {
                    if (!i.isModalSubmit()) return;

                    const desc = i.fields.getTextInputValue('desc-option')
                    if (desc) embed.setDescription(`${desc}`)
                    
                    await interaction.editReply({ embeds: [embed] })
                    await i.deferUpdate()
                })
            }
            //EDIT OPTIONS
            if(i.customId === 'edit-options') {
                const optionModal = new ModalBuilder()
                .setCustomId('edit-options')
                .setTitle('Button Options')

                const opt1 = new TextInputBuilder()
                .setCustomId('option-1')
                .setLabel('Option 1')
                .setStyle(TextInputStyle.Short)
                .setMaxLength(30)
                .setRequired(true)

                const opt2 = new TextInputBuilder()
                .setCustomId('option-2')
                .setLabel('Option 2')
                .setMaxLength(30)
                .setStyle(TextInputStyle.Short)
                .setRequired(true)
                
                const optionRow = new ActionRowBuilder().addComponents(opt1)
                const optionRow1 = new ActionRowBuilder().addComponents(opt2)

                optionModal.addComponents(optionRow, optionRow1)
                i.showModal(optionModal)
                client.once(Events.InteractionCreate, async i => {
                    if (!i.isModalSubmit()) return;

                    const opti1 = i.fields.getTextInputValue('option-1') || 'Option 1'
                    Btnopti1 = opti1
                    const opti2 = i.fields.getTextInputValue('option-2') || 'Option 2'
                    Btnopti2 = opti2

                    embed.setFields(
                        { name: `${opti1}`, value: `> **\`0\`** Votes`, inline:true},
                        { name: `${opti2}`, value: `> **\`0\`** Votes`, inline:true},
                        { name: `Poll Creator:`, value: `> ${interaction.user}`, inline:false}
                    )
                    await interaction.editReply({ embeds: [embed] })
                    await i.reply({ content: `Set option 1 to: **${opti1}**\nSet option 2 to: **${opti2}**`, ephemeral: true})
                })
            }
            // EDIT CHANNEL
            if(i.customId === 'edit-channel') {
                const channelModal = new ModalBuilder()
                .setCustomId('channel-modal')
                .setTitle('Edit Channel')

                const channelOption = new TextInputBuilder()
                .setCustomId('channel-opt')
                .setLabel('ID Of Channel')
                .setStyle(TextInputStyle.Short)
                .setRequired(true)

                const channelRow = new ActionRowBuilder().addComponents(channelOption)
                channelModal.addComponents(channelRow)
                i.showModal(channelModal)

                client.once(Events.InteractionCreate, async i => {
                    if (!i.isModalSubmit()) return;

                    channel = i.fields.getTextInputValue('channel-opt')
                    channel = await interaction.guild.channels.fetch(channel)
                    if(!channel) return await i.reply({ content: 'Invalid channel ID', ephemeral: true})
                    
                    await interaction.editReply({ content: `Sending to: ${channel}`})
                    await i.deferUpdate()
                })
            }
        if (i.customId === 'send-msg') {
            const option1Votes = await db.get(`${msg.id}_opt1Votes`) || 0
            const option2Votes = await db.get(`${msg.id}_opt2Votes`) || 0
            if(Btnopti1 == undefined) Btnopti1 = 'Option 1';
            if(Btnopti2 == undefined) Btnopti2 = 'Option 2'

           
                const pollRow = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                    .setCustomId('option1Btn')
                    .setLabel(`${Btnopti1}`)
                    .setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder()
                    .setCustomId('option2Btn')
                    .setLabel(`${Btnopti2}`)
                    .setStyle(ButtonStyle.Secondary)
                )
                embed.setFields(
                    { name: `${Btnopti2}`, value: `> **\`${option1Votes}\`** Votes`, inline:true},
                    { name: `${Btnopti2}`, value: `> **\`${option2Votes}\`** Votes`, inline:true},
                    { name: `Poll Creator:`, value: `> ${interaction.user}`, inline:false}
                )
                const pollmsg = await channel.send({ embeds: [embed], components: [pollRow] }).catch(err => {console.log(err);})
                
                i.reply({ content: 'The poll message was sent.', ephemeral: true})
                
                
                client.on(Events.InteractionCreate, async interaction => {               
                    if(!interaction.isButton()) return;
                    
                    if(interaction.customId === 'option1Btn') {

                        const data = await Voted.findOne({
                            Guild: i.guild.id,
                            User: i.user.id,
                            Message: msg.id
                        });

                        if (data) {
                            await i.user.send({
                                content: "You already voted!",
                                ephemeral: true
                            }).catch(err => {
                                console.log(err)
                            })
                        } else if (!data) {
                            await db.add(`${msg.id}_opt1Votes`, 1)
                            const newDB = await db.get(`${msg.id}_opt1Votes`)
                            const option1Votes = await db.get(`${msg.id}_opt1Votes`) || 0;
                            const option2Votes = await db.get(`${msg.id}_opt2Votes`) || 0;
                            embed.setFields(
                                { name: `${Btnopti1}`, value: `> **\`${newDB}\`** Votes`, inline:true},
                                { name: `${Btnopti2}`, value: `> **\`${option2Votes}\`** Votes`, inline:true},
                                { name: `Poll Creator:`, value: `> ${interaction.user}`, inline:false}
                            )
                            pollmsg.edit({ embeds: [embed] });
                            await Voted.create({
                                Guild: i.guild.id,
                                User: i.user.id,
                                Message: msg.id
                            });
                        }

                        interaction.deferUpdate();
                    }
                    if(interaction.customId === 'option2Btn') {

                        const data = await Voted.findOne({
                            Guild: i.guild.id,
                            User: i.user.id,
                            Message: msg.id
                        });

                        if (data) {
                            await i.user.send({
                                content: "You already voted!",
                                ephemeral: true
                            }).catch(err => {
                                console.log(err)
                            })
                        } else if (!data) {
                            await db.add(`${msg.id}_opt2Votes`, 1)
                            const newDB = await db.get(`${msg.id}_opt2Votes`)
                            const option1Votes = await db.get(`${msg.id}_opt1Votes`) || 0;
                            const option2Votes = await db.get(`${msg.id}_opt2Votes`) || 0;
                            embed.setFields(
                                { name: `${Btnopti1}`, value: `> **\`${option1Votes}\`** Votes`, inline:true},
                                { name: `${Btnopti2}`, value: `> **\`${newDB}\`** Votes`, inline:true},
                                { name: `Poll Creator:`, value: `> ${interaction.user}`, inline:false}
                            )
                            pollmsg.edit({ embeds: [embed] });
                            await Voted.create({
                                Guild: i.guild.id,
                                User: i.user.id,
                                Message: msg.id
                            });

                        }
                        interaction.deferUpdate();
                    }
                }) 
            }
        })
    }
}