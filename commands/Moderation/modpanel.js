const { SlashCommandBuilder, Permissions, EmbedBuilder, ButtonBuilder, ActionRowBuilder, TextInputBuilder, ButtonStyle, TextInputStyle } = require('discord.js');
const warningSchema = require('../../Schemas.js/warn');

module.exports = {
    data: new SlashCommandBuilder()
        .setDMPermission(false)
        .setName('modpanel')
        .addUserOption(option => option.setName('user').setDescription('the user u want to moderate').setRequired(true))
        .setDescription('moderate members'),

    async execute(interaction) {
        if (!interaction.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR))
            return await interaction.reply({ content: `no perms`, ephemeral: true });

        const member = await interaction.options.getMember('user');

        const replyembed = new EmbedBuilder()
            .setTitle(`Moderate ${member.user.username}`)
            .setDescription('select the buttons below');

        const buttons = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('ban')
                    .setLabel('Ban')
                    .setEmoji('🚫')
                    .setStyle(ButtonStyle.SECONDARY),

                new ButtonBuilder()
                    .setCustomId('kick')
                    .setLabel('Kick')
                    .setEmoji('🚧')
                    .setStyle(ButtonStyle.SECONDARY),

                new ButtonBuilder()
                    .setCustomId('mute')
                    .setLabel('Mute')
                    .setEmoji('🔇')
                    .setStyle(ButtonStyle.SECONDARY),

                new ButtonBuilder()
                    .setCustomId('warnshow')
                    .setLabel('Show Warns')
                    .setEmoji('⚠')
                    .setStyle(ButtonStyle.SECONDARY),

                new ButtonBuilder()
                    .setCustomId('warn')
                    .setLabel('Warn')
                    .setEmoji('⚠')
                    .setStyle(ButtonStyle.SECONDARY)
            );

        const msg = await interaction.reply({ embeds: [replyembed], components: [buttons] });

        const collector = msg.createMessageComponentCollector();

        collector.on('collect', async (i) => {
            if (i.user.id !== interaction.user.id)
                return await i.reply({ content: `You cannot use this panel!`, ephemeral: true });

            if (i.customId === 'ban') {
                const buttons = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('confirm')
                            .setStyle(ButtonStyle.SECONDARY)
                            .setLabel('Confirm'),

                        new ButtonBuilder()
                            .setCustomId('decline')
                            .setStyle(ButtonStyle.SECONDARY)
                            .setLabel('Decline')
                    );

                const msg = await i.reply({ content: `Are you sure?`, components: [buttons] });
                const collector = await msg.createMessageComponentCollector();

                collector.on('collect', async (int) => {
                    if (int.user.id !== interaction.user.id)
                        return await i.reply({ content: `You cannot use this menu`, ephemeral: true });

                    if (int.customId === 'decline') {
                        await msg.delete();
                    }

                    if (int.customId === 'confirm') {
                        const reason = 'Mod panel ban';
                        try {
                            await int.guild.bans.create(member.user.id, { reason });
                        } catch (err) {
                            console.log(err);
                            return await int.reply({ content: `An error occurred`, ephemeral: true });
                        }

                        await int.reply({ content: `Success! Banned ${member}!`, ephemeral: true });
                    }
                });
            }

            if (i.customId === 'kick') {
                const buttons = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('confirm1')
                            .setStyle(ButtonStyle.SECONDARY)
                            .setLabel('Confirm'),

                        new ButtonBuilder()
                            .setCustomId('decline1')
                            .setStyle(ButtonStyle.SECONDARY)
                            .setLabel('Decline')
                    );

                const msg = await i.reply({ content: `Are you sure?`, components: [buttons] });
                const collector = await msg.createMessageComponentCollector();

                collector.on('collect', async (int) => {
                    if (int.user.id !== interaction.user.id)
                        return await i.reply({ content: `You cannot use this menu`, ephemeral: true });

                    if (int.customId === 'decline1') {
                        await msg.delete();
                    }

                    if (int.customId === 'confirm1') {
                        try {
                            await member.kick('Mod panel kick');
                        } catch {
                            return await int.reply({ content: `An error occurred`, ephemeral: true });
                        }

                        await int.reply({ content: `Success! Kicked ${member}!`, ephemeral: true });
                    }
                });
            }

            if (i.customId === 'mute') {
                const buttons = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('confirm2')
                            .setStyle(ButtonStyle.SECONDARY)
                            .setLabel('Confirm'),

                        new ButtonBuilder()
                            .setCustomId('decline2')
                            .setStyle(ButtonStyle.SECONDARY)
                            .setLabel('Decline')
                    );

                const msg = await i.reply({ content: `Are you sure?`, components: [buttons] });
                const collector = await msg.createMessageComponentCollector();

                collector.on('collect', async (int) => {
                    if (int.user.id !== interaction.user.id)
                        return await i.reply({ content: `You cannot use this menu`, ephemeral: true });

                    if (int.customId === 'decline2') {
                        await msg.delete();
                    }

                    if (int.customId === 'confirm2') {
                        try {
                            // Use the correct method to add the "mute" role
                            const muteRole = interaction.guild.roles.cache.find(role => role.name === 'Muted');
                            if (muteRole) {
                                await member.roles.add(muteRole, 'Mod panel mute');
                                // ... (existing code)
                            } else {
                                // Handle the case where the "Muted" role is not found.
                            }
                        } catch (err) {
                            console.log(err);
                            return await int.reply({ content: `An error occurred`, ephemeral: true });
                        }

                        await int.reply({ content: `Success! Muted ${member}!`, ephemeral: true });
                    }
                });
            }

            if (i.customId === 'warnshow') {
                // ... (existing code)
            }

            if (i.customId === 'warn') {
                const buttons = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('confirm4')
                            .setStyle(ButtonStyle.SECONDARY)
                            .setLabel('Confirm'),

                        new ButtonBuilder()
                            .setCustomId('decline4')
                            .setStyle(ButtonStyle.SECONDARY)
                            .setLabel('Decline')
                    );

                const msg = await i.reply({ content: `Are you sure?`, components: [buttons] });
                const collector = await msg.createMessageComponentCollector();

                collector.on('collect', async (int) => {
                    if (int.user.id !== interaction.user.id)
                        return await i.reply({ content: `You cannot use this menu`, ephemeral: true });

                    if (int.customId === 'decline4') {
                        await msg.delete();
                    }

                    if (int.customId === 'confirm4') {
                        const modal = new ModalBuilder()
                            .setTitle(`${member.user.id}`)
                            .setCustomId('warn');

                        const warn = new TextInputBuilder()
                            .setCustomId('warnreason')
                            .setRequired(false)
                            .setLabel('• Warn Reason')
                            .setStyle(TextInputStyle.SHORT);

                        const firstActionRow = new ActionRowBuilder().addComponents(warn);

                        modal.addComponents(firstActionRow);
                        int.showModal(modal);

                        const submitted = await int.awaitModalSubmit({
                            time: 600000,
                            filter: int => int.user.id === interaction.user.id,
                        }).catch(error => {
                            return null;
                        });

                        if (submitted) {
                            // ... (existing code)

                            // Instead of submitted.reply(), use await int.reply()
                            await int.reply({ embeds: [embed] });
                        }
                    }
                });
            }
        });
    },
};
