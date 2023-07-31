const {
    SlashCommandBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder,
  } = require("discord.js");
  const allowedUserIds = ["1091118468155314306", "992111921048342611"];
   
  module.exports = {
    data: new SlashCommandBuilder()
      .setName("servers-list")
      .setDescription("a list of the server the bot is in"),
    async execute(interaction, client) {
      if (!allowedUserIds.includes(interaction.user.id)) {
        return await interaction.reply({
          content: "You are not authorized to use this command",
          ephemeral: true,
        });
      }
   
      try {
        const servers = interaction.client.guilds.cache.map(async (guild) => {
          return {
            ownerN: guild.ownerId
              ? interaction.client.users.cache.get(guild.ownerId)?.tag ||
                "Unknown"
              : "Unknown",
            ownerId: guild.ownerId
              ? interaction.client.users.cache.get(guild.ownerId)?.id || "Unknown"
              : "Unknown",
            guildName: guild.name,
            guildId: guild.id,
            createdOn: `<t:${parseInt(guild. createdTimestamp / 1000)}:R>`,
          };
        });
   
        const serverDetails = await Promise.all(servers);
   
        function createServerEmbed(serverIndex) {
          const server = serverDetails[serverIndex];
          const embed = new EmbedBuilder()
            .setTitle(`Server Details:`)
            .setColor("DarkBlue")
            .setDescription(
              `**Server Name:** ${server.guildName}\n**Server ID:** ${server.guildId}\n**Owner:** ${server.ownerN} | ${server.ownerId}\n**Created On:** ${server.createdOn}`
            )
            .setTimestamp();
   
          return embed;
        }
   
        let currentPageIndex = 0;
        const maxPages = serverDetails.length;
   
        const initialEmbed = createServerEmbed(currentPageIndex);
   
        const previousButton = new ButtonBuilder()
          .setCustomId("previous")
          .setLabel("Previous")
          .setStyle(ButtonStyle.Danger);
   
        const nextButton = new ButtonBuilder()
          .setCustomId("next")
          .setLabel("Next")
          .setStyle(ButtonStyle.Success);
   
        const buttonRow = new ActionRowBuilder().addComponents(
          previousButton,
          nextButton
        );
   
        // Send the initial message with buttons
        const reply = await interaction.reply({
          embeds: [initialEmbed],
          components: [buttonRow],
          ephemeral: true,
        });
   
        const filter = (interaction) =>
          interaction.customId === "previous" || interaction.customId === "next";
        const collector = interaction.channel.createMessageComponentCollector({
          filter,
          time: 60000,
        });
   
        collector.on("collect", async (buttonInteraction) => {
          if (buttonInteraction.customId === "previous") {
            currentPageIndex = Math.max(0, currentPageIndex - 1);
          } else if (buttonInteraction.customId === "next") {
            currentPageIndex = Math.min(currentPageIndex + 1, maxPages - 1);
          }
   
          const newEmbed = createServerEmbed(currentPageIndex);
          await buttonInteraction.update({ embeds: [newEmbed] });
        });
   
        collector.on("end", () => {
          const finalButtonRow = new ActionRowBuilder().addComponents(
            previousButton.setDisabled(true),
            nextButton.setDisabled(true)
          );
   
          reply.edit({ components: [finalButtonRow] });
        });
      } catch (error) {
        console.error("Error fetching guilds:", error);
      }
    },
  };
   