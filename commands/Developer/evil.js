const { SlashCommandBuilder } = require('discord.js');
const { inspect } = require('util');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, AttachmentBuilder, ComponentType } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('eval')
        .setDescription('Evaluates code')
        .addStringOption(option =>
            option.setName('code')
                .setDescription('The code to evaluate')
                .setRequired(true)
        ),
    async execute(interaction, client) {
        const owners = [
            "1091118468155314306",
            "992111921048342611"
        ];

        if (!owners.includes(interaction.user.id)) return;

        const code = interaction.options.getString('code');
        const tokenfilter = new RegExp(`${client.token.split("").join("[^]{0,2}")}|${client.token.split("").reverse().join("[^]{0,2}")}`, "g");

        try {
            let output = eval(code);
            if (output instanceof Promise || (Boolean(output) && typeof output.then === "function" && typeof output.catch === "function")) output = await output;
            output = inspect(output);
            output = output.replace(tokenfilter, "no");
            const row = new ActionRowBuilder().addComponent(
                new ButtonBuilder()
                    .setCustomId("delete-evaluated-output")
                    .setEmoji("957597580806717470")
                    .setLabel('Delete Output')
                    .setStyle(ButtonStyle.Danger)
            );

            let end;
            let start;

            start = new Date();
            for (let i = 0; i < 1000; i++) {
                Math.sqrt(i);
            }
            end = new Date();

            if (output.length < 1800) {
                interaction.reply({ components: [[row]], content: `Output\n\`\`\`${output.replace(/'/g, '')}\`\`\`\n\nTime\nOperation took ${end?.getTime() - start?.getTime()} millisecond${end?.getTime() - start?.getTime() > 1 ? 's' : ''}.` });
            } else {
                const result = new AttachmentBuilder(Buffer.from(output), { name: 'output.js' })
                interaction.reply({ components: [[row]], content: `Time*\nOperation took ${end?.getTime() - start?.getTime()} millisecond${end?.getTime() - start?.getTime() > 1 ? 's' : ''}.\n\nOutput`, files: [result] });
            }

            const filter = (i) => {
                if (i.user.id === interaction.user.id) return true;
                i.reply({ content: `This button is not for you.`, ephemeral: true });
                return false;
            }

            const collector = await interaction.channel.createMessageComponentCollector({
                filter,
                componentType: ComponentType.Button
            });

            collector.on("collect", async (i) => {
                i.deferUpdate();
                if (i.customId === "delete-evaluated-output") {
                    await i.message.delete();
                }
            });

        } catch (error) {
            interaction.channel.send({ content: ` \`\`\`js\n${error}\`\`\` ` });
        }
    }
};
