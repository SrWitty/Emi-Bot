const { Client, GatewayIntentBits, ModalBuilder, Partials, ActivityType, AttachmentBuilder, StringSelectMenuBuilder, ActionRowBuilder, ComponentType, ButtonBuilder, ButtonStyle, TextInputBuilder, TextInputStyle, EmbedBuilder, PermissionsBitField, Permissions, MessageManager, Embed, Collection, ChannelType, Events, MessageType, UserFlagsBitField, InteractionResponse, ReactionUserManager  } = require('discord.js');
const fs = require('fs');
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] }); 
const { createTranscript } = require('discord-html-transcripts');
const { CaptchaGenerator } = require('captcha-canvas');

client.commands = new Collection();

require('dotenv').config();

const functions = fs.readdirSync("./functions").filter(file => file.endsWith(".js"));
const eventFiles = fs.readdirSync("./events").filter(file => file.endsWith(".js"));
const commandFolders = fs.readdirSync("./commands");

(async () => {
    for (file of functions) {
        require(`./functions/${file}`)(client);
    }
    client.handleEvents(eventFiles, "./events");
    client.handleCommands(commandFolders, "./commands");
    client.login(process.env.token)
})();

const banschema = require("./Schemas.js/bans");


client.on("ready", async (client) => {
 
    setInterval(() => {

        let activities = [
            { type: 'Playing', name: 'in the Sky.'},
            { type: 'Playing', name: '/help.'},
            { type: 'Playing', name: 'Emi Bot'},
            { type: 'Watching', name: '/help!'},
            { type: 'Watching', name: `${client.guilds.cache.size} servers!`},
            { type: 'Watching', name: `${client.guilds.cache.reduce((a,b) => a+b.memberCount, 0)} members!`},
            { type: 'Playing', name: `with my ${client.commands.size} commands.`}
        ];

        const status = activities[Math.floor(Math.random() * activities.length)];

        if (status.type === 'Watching') {
            client.user.setPresence({ activities: [{ name: `${status.name}`, type: ActivityType.Watching }]});
        } else {
            client.user.setPresence({ activities: [{ name: `${status.name}`, type: ActivityType.Playing }]});
        }
        
    }, 5000);
})

// HANDLE ALL ERRORS!! //

process.on('unhandledRejection', (reason, promise) => {
  console.log('Unhandled Rejection at:', promise, 'reason:', reason);
});


/// TICKET SYSTEM //


client.on(Events.InteractionCreate, async (interaction) => {
    const { customId, guild, channel } = interaction;
    if (interaction.isButton()) {
        if (customId === "ticket") {
            let data = await ticketSchema.findOne({
                GuildID: interaction.guild.id,
            });

            if (!data) return await interaction.reply({ content: "Ticket system is not setup in this server", ephemeral: true })
            const role = guild.roles.cache.get(data.Role)
            const cate = data.Category;


            await interaction.guild.channels.create({
                name: `ticket-${interaction.user.username}`,
                parent: cate,
                type: ChannelType.GuildText,
                permissionOverwrites: [
                    {
                        id: interaction.guild.id,
                        deny: ["ViewChannel"]
                    },
                    {
                        id: role.id,
                        allow: ["ViewChannel", "SendMessages", "ReadMessageHistory"]
                    },
                    {
                        id: interaction.member.id,
                        allow: ["ViewChannel", "SendMessages", "ReadMessageHistory"]
                    },
                ],
            }).then(async (channel) => {
                const openembed = new EmbedBuilder()
                    .setColor("Red")
                    .setTitle("Ticket Opened")
                    .setDescription(`Welcome to your ticket ${interaction.user.username}\n React with 🔒 to close the ticket`)
                    .setThumbnail(interaction.guild.iconURL())
                    .setTimestamp()
                    .setFooter({ text: `${interaction.guild.name}'s Tickets` })

                const closeButton = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('closeticket')
                            .setLabel('Close')
                            .setStyle(ButtonStyle.Danger)
                            .setEmoji('🔒')
                    )
                await channel.send({ content: `<@&${role.id}>`, embeds: [openembed], components: [closeButton] })

                const openedTicket = new EmbedBuilder()
                    .setDescription(`Ticket created in <#${channel.id}>`)

                await interaction.reply({ embeds: [openedTicket], ephemeral: true })
            })
        }

        if (customId === "closeticket") {
            const closingEmbed = new EmbedBuilder()
                .setDescription('🔒 are you sure you want to close this ticket?')
                .setColor('Red')

            const buttons = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('yesclose')
                        .setLabel('Yes')
                        .setStyle(ButtonStyle.Danger)
                        .setEmoji('✅'),

                    new ButtonBuilder()
                        .setCustomId('nodont')
                        .setLabel('No')
                        .setStyle(ButtonStyle.Secondary)
                        .setEmoji('❌')
                )

            await interaction.reply({ embeds: [closingEmbed], components: [buttons] })
        }

        if (customId === "yesclose") {
            let data = await ticketSchema.findOne({ GuildID: interaction.guild.id });
            const transcript = await createTranscript(channel, {
                limit: -1,
                returnBuffer: false,
                filename: `ticket-${interaction.user.username}.html`,
            });

            const transcriptEmbed = new EmbedBuilder()
                .setAuthor({ name: `${interaction.guild.name}'s Transcripts`, iconURL: guild.iconURL() })
                .addFields(
                    {name: `Closed by`, value: `${interaction.user.tag}`}
                )
                .setColor('Red')
                .setTimestamp()
                .setThumbnail(interaction.guild.iconURL())
                .setFooter({ text: `${interaction.guild.name}'s Tickets` })

            const processEmbed = new EmbedBuilder()
                .setDescription(` Closing ticket in 10 seconds...`)
                .setColor('Red')

            await interaction.reply({ embeds: [processEmbed] })

            await guild.channels.cache.get(data.Logs).send({
                embeds: [transcriptEmbed],
                files: [transcript],
            });

            setTimeout(() => {
                interaction.channel.delete()
            }, 10000);
        }

        if (customId === "nodont") {
            const noEmbed = new EmbedBuilder()
                .setDescription('🔒 Ticket close cancelled')
                .setColor('Red')

            await interaction.reply({ embeds: [noEmbed], ephemeral: true })
        }
    }
})


// bans //

setInterval(async () => {
    const bans = await banschema.find();
    if (!bans) return;
    else {
      bans.forEach(async ban => {
        if (ban.Time > Date.now()) return;
  
        let server = client.guilds.cache.get(ban.Guild);
        if (!server) {
          console.log('no server');
          return await banschema.deleteMany({
            Guild: ban.Guild // Use ban.Guild directly
          });
        }
  
        await server.bans.fetch().then(async bans => {
          if (bans.size === 0) {
            console.log('bans were 0');
            return await banschema.deleteMany({
              Guild: ban.Guild // Use ban.Guild directly
            });
          } else {
            let user = client.users.cache.get(ban.User);
            if (!user) {
              console.log('no user found');
              return await banschema.deleteMany({
                User: ban.User,
                Guild: ban.Guild // Use ban.Guild directly
              });
            }
  
            await server.bans.remove(ban.User).catch(err => {
              console.log('couldnt unban');
              return;
            });
  
            await banschema.deleteMany({
              User: ban.User,
              Guild: ban.Guild // Use ban.Guild directly
            });
          }
        });
      });
    }
  }, 30000);

  // 1vs1 //

  const levelNames2 = ["Unranked", "Bronze", "Silver", "Gold", "Emerald", "Diamond", "Master", "Elite"];
const discordTranscripts = require('discord-html-transcripts');
const duelsSchema = require('./Schemas.js/1v1Schema');
const duelsLevelSchema = require("./Schemas.js/1v1Levels");
const chatSchema = require('./Schemas.js/chat');
 
client.on(Events.InteractionCreate, async i => {
  if (i.isButton()) {
    if (i.customId === 'queue') {
      
      const duelsData = await duelsSchema.findOne({ Guild: i.guild.id })
 
      if (!duelsData) {
        i.reply({ content: "The 1v1 system is currently disabled.", ephemeral: true})
        return;
      }
      
      const category = i.guild.channels.cache.get(duelsData.Category)    
      const logChannel = i.guild.channels.cache.get(duelsData.Logs)
      const transcriptsChannel = i.guild.channels.cache.get(duelsData.Transcript)
 
      const member = i.member
  
      if (!member) {
          i.reply({ content: "This command can only be used by guild members.", ephemeral: true });
          return;
      }
 
      const username = member.user.username.toLowerCase();
      const channelName = username.replace(/ /g, "-");
      const posChannel = await i.guild.channels.cache.find(c => c.name.includes(username) || c.name.includes(channelName));
 
      const openMatchmakingEmbed = new EmbedBuilder()
      .setColor("Green")
      .setAuthor({ 
          name: "Match Open 🎮",
          iconURL: client.user.avatarURL({ dynamic: true, size: 1024 }) 
      })
      .setDescription(`You are already in a match there for you cannot queue again! Wait until your match has been played out!`)
      .setTimestamp()
      .setFooter({ text: `Radiant Utilities | Matchmaking System`})
 
      const dmEmbed = new EmbedBuilder()
      .setColor("Green")
      .setAuthor({ 
          name: "Matchmaking Queue 🎮",
          iconURL: client.user.avatarURL({ dynamic: true, size: 1024 }) 
      })
      .setDescription(`You were added to the matchmaking queue. You can leave this queue at any time by clicking the 'unqueue' button on the queue message.`)
      .setTimestamp()
      .setFooter({ text: `Radiant Utilities | Matchmaking System`})
 
 
      if (posChannel) return await i.reply({ embeds: [openMatchmakingEmbed], ephemeral: true})
 
      const Data2 = await duelsLevelSchema.findOne({ Guild: i.guild.id, User: member.id });
          
      if (!Data2) {
          duelsLevelSchema.create({
              Guild: i.guild.id,
              User: member.id,
              Rank: 0,
              Level: 0
          })
      }
 
      const Data = await duelsSchema.findOne({ Guild: i.guild.id, MatchID: 0 });
      if (!Data) {
          duelsSchema.create({
              Guild: i.guild.id, 
              MatchID: 0,
              MemberOneID: member.id,
              UserID: 0
          })
 
          i.reply({ content: ":white_check_mark:  You were added to the queue!", ephemeral: true })
          member.send({ embeds: [dmEmbed] }).catch(err => {
              return;
          })
 
          const queueEmbed = new EmbedBuilder()
          .setColor("Aqua")
          .setAuthor({ 
              name: "Entered Queue",
              iconURL: client.user.avatarURL({ dynamic: true, size: 1024 }) 
          })
          .setDescription(`${member} has enterd the queue`)
          .setTimestamp()
          .setFooter({ text: "Radiant Utilities | Matchmaking System"})
          logChannel.send({ embeds: [queueEmbed] })
 
      } else if (Data.MemberOneID != member.id) {
          const memberTwo = member
          const guild = i.guild
          if (!guild) return console.log(`Couldn't find guild with ID ${guild}`);
          const memberOne = guild.members.cache.get(Data.MemberOneID);
          if (!memberOne) return i.reply({ content: 'The 1v1 queuing system is down for maintenance.' });
          const channel = await i.guild.channels.create({
              name: `1v1 ${memberOne.user.username} vs ${memberTwo.user.username}`,
              type: ChannelType.GuildText,
              parent: category
          }).catch(err => {
              i.reply({ content: 'The 1v1 queuing system is down for maintenance.' })
          })                   
 
          await duelsSchema.deleteMany({
              Guild: i.guild.id,
              MemberOneID: memberOne.id
          });
 
          const queueEmbed = new EmbedBuilder()
          .setColor("Blue")
          .setAuthor({ 
              name: "Entered Queue",
              iconURL: client.user.avatarURL({ dynamic: true, size: 1024 }) 
          })
          .setDescription(`${memberTwo} has enterd the queue`)
          .setTimestamp()
          .setFooter({ text: "Radiant Utilities | Matchmaking System"})
 
          const guildMemberOne = await channel.guild.members.fetch(memberOne.id).catch(() => null);
          if (!guildMemberOne) {
              return;
          } else {
              channel.permissionOverwrites.create(memberOne, { ViewChannel: true, SendMessages: true });
          }
 
          const guildMemberTwo = await channel.guild.members.fetch(memberTwo.id).catch(() => null);
          if (!guildMemberTwo) {
              return;
          } else {
              channel.permissionOverwrites.create(memberTwo, { ViewChannel: true, SendMessages: true });
          }
 
          i.reply({ content: `:white_check_mark:  You were added to the queue! You can see it here: ${channel}`, ephemeral: true })
          memberTwo.send({ embeds: [dmEmbed] }).catch(err => {
              return;
          })
 
          memberOne.send(`Hey ${memberOne}, your 1v1 has started, you are going against ${memberTwo}, you can view it here: ${channel}. Good luck!`).catch(err => {
              return;
          });
 
          memberTwo.send(`Hey ${memberTwo}, your 1v1 has started, you are going against ${memberOne}, you can view it here: ${channel}. Good luck!`).catch(err => {
              return;
          });
 
          if (logChannel) {
            await logChannel.send({ embeds: [queueEmbed] });
          } else {
            return;
          }
 
          const logEmbed = new EmbedBuilder()
          .setColor('Green')
          .setAuthor({ 
              name: "New Match Started",
              iconURL: client.user.avatarURL({ dynamic: true, size: 1024 }) 
          })
          .setDescription(`Match started between ${memberOne} and ${memberTwo}`)
          .setTimestamp()
          .setFooter({ text: "Radiant Utilities | Matchmaking System"})
 
          if (logChannel) {
          await logChannel.send({ embeds: [logEmbed] })
        } else {
          return;
        }
 
          const levelData = await duelsLevelSchema.findOne({ Guild: i.guild.id, User: memberOne.id});
          const levelData2 = await duelsLevelSchema.findOne({ Guild: i.guild.id, User: memberTwo.id });
 
          const embeder2 = new EmbedBuilder()
          .setColor("DarkBlue")
          .setAuthor({ 
              name: "Matchmaking",
              iconURL: client.user.avatarURL({ dynamic: true, size: 1024 }) 
          })
          .setDescription(`**A Radiant Utilities Valorant match has been found for ${memberOne} and ${memberTwo}**\n\n__**Team 1**__\nDiscord: ${memberOne}\nDiscord ID: ${memberOne.id}\nXP: ${levelData.Rank}\n\n__**Team 2**__\nDiscord: ${memberTwo}\nDiscord ID: ${memberTwo.id}\nXP: ${levelData2.Rank}\n\n__**How to play**__\nYou must tell your opponent your __Valorant__ username\nYou must play a __deathmatch in Valorant__\nThe winner is decieded by __best of 5__\n\n__**Rules**__\nYou're NOT allowed to have freinds to spectate.\n__Be respectful to your opponent!__`)
 
          const embeder = new EmbedBuilder()
          .setColor("DarkBlue")       
          .setDescription(`**When the game is over, use the reactions below to react with the __winner__**\n\n${memberOne.user.tag} **won?** 1️⃣\n\n${memberTwo.user.tag} **won?** 2️⃣\n\n**Need assistance?** React with ❓`)
          .setFooter({ text: "Radiant Utilities | Matchmaking System"})
          .setTimestamp();
 
          const message = await channel.send({ embeds: [embeder2, embeder], content: `${memberOne} ${memberTwo}` });
          await message.react('1️⃣');
          await message.react('2️⃣'); 
          await message.react('❓');
 
          let resolved = false;
          let roleHasPermissions = false;
          
          const filter = (reaction, user) => reaction.emoji.name === '1️⃣' || reaction.emoji.name === '2️⃣' || reaction.emoji.name === '❓' && !user.bot;
 
          const collector = message.createReactionCollector({ filter, max: 100 });
          
          collector.on('collect', async (collected, user) => {
          if (collected.count === 3) {
              
              if (collected.emoji.name === '1️⃣') {
 
                  const attachment = await discordTranscripts.createTranscript(channel);
 
                  channel.delete();
 
                  //XP system
 
                  duelsLevelSchema.findOne({ Guild: i.guild.id, User: memberOne.id }, async (err, data) => {
 
                      if (err) throw err;
 
                      if (!data) {
                          duelsLevelSchema.create({
                              Guild: i.guild.id, 
                              User: memberOne.id,
                              Rank: 100,
                              Level: 0
                          })
                      }
                  })
 
                  const give = Math.floor(Math.random() * 81) + 60;
 
                  const levelData = await duelsLevelSchema.findOne({ Guild: i.guild.id, User: memberOne.id});
 
                  if (!levelData) return;
 
                  const levelThresholds = [0, 300, 750, 1250, 1750, 2500, 3500, 5000, 1000000000000000]; // XP thresholds for each level
                  const currentLevel = levelData.Level;
 
                  const nextLevel = currentLevel + 1;
                  const nextLevelThreshold = levelThresholds[nextLevel];
 
                  const requiredXP = nextLevelThreshold ? nextLevelThreshold : 0;
 
                  if (levelData.Rank + give >= requiredXP) {
 
                      levelData.Rank += give;
                      levelData.Level += 1;
                      await levelData.save();
 
                  } else {
                      levelData.Rank += give;
                      levelData.save()
                  }
 
                  //XP system take
                  duelsLevelSchema.findOne({ Guild: i.guild.id, User: memberTwo.id }, async (err, data) => {
                      if (err) throw err;
                  
                      if (!data) {
                          duelsLevelSchema.create({
                              Guild: i.guild.id, 
                              Guild: guildId,
                              User: memberOne.id
                          })
                      }
                  });
                  
                  let take = Math.floor(Math.random() * 30) + 50;
                  
                  const levelData1 = await duelsLevelSchema.findOne({ Guild: i.guild.id, User: memberTwo.id });
                  
                  if (!levelData1) return;
                  
                  const levelThresholds1 = [0, 300, 750, 1250, 1750, 2500, 3500, 5000, 1000000000000000]; // XP thresholds for each level
                  const currentLevel1 = levelData1.Level;
                  
                  if (levelData1.Rank - take <= 0) {
                      take = levelData1.Rank;
                      levelData1.Rank = 0;
                      levelData1.Level = Math.max(0, currentLevel1 - 1);
                      levelData1.save();
                  } else {
                      const prevLevelThreshold = levelThresholds1[currentLevel1] || 0;
                      const requiredXP = prevLevelThreshold;
                  
                      if (levelData1.Rank - take < requiredXP && currentLevel1 > 0) {
                          levelData1.Rank -= take;
                          levelData1.Level = Math.max(0, currentLevel1 - 1);
                          await levelData1.save();
                      } else {
                          levelData1.Rank -= take;                            
                          await levelData1.save();
                      }
                  }
 
                  const memberOneWinner = new EmbedBuilder()
                  .setColor('Gold')
                  .setAuthor({ 
                      name: "Match Ended",
                      iconURL: client.user.avatarURL({ dynamic: true, size: 1024 }) 
                  })
                  .setDescription(`${memberOne} has won the match!`)
                  .addFields({ name: `${memberOne.user.tag}`, value: `+${give} (${levelData.Rank})`, inline: true})
                  .addFields({ name: `${memberTwo.user.tag}`, value: `-${take} (${levelData1.Rank})`, inline: true})
                  .setTimestamp()
                  .setFooter({ text: 'Radiant Utilities | Matchmaking System'})
 
                  const memberOneWinnerTranscripts = new EmbedBuilder()
                  .setColor('Gold')
                  .setAuthor({ 
                      name: "Match Ended",
                      iconURL: client.user.avatarURL({ dynamic: true, size: 1024 }) 
                  })
                  .setDescription(`${memberOne}'s and ${memberTwo}'s match history.`)
                  .addFields({ name: `${memberOne.user.tag}`, value: `+${give} (${levelData.Rank})`, inline: true})
                  .addFields({ name: `${memberTwo.user.tag}`, value: `-${take} (${levelData1.Rank})`, inline: true})
                  .setTimestamp()
                  .setFooter({ text: 'Radiant Utilities | Matchmaking System'})
 
                  const levelObj = await duelsLevelSchema.findOne({ Guild: i.guild.id, User: memberOne.id });
 
                  const levelName = levelNames2[levelObj.Level];                            
 
                  const levelObj2 = await duelsLevelSchema.findOne({ Guild: i.guild.id, User: memberTwo.id });
                  
                  const levelName2 = levelNames2[levelObj2.Level]; 
 
                  memberOne.send({ content: `You won the match and earned +**${give}** XP!\n\nCurrent XP: **${levelData.Rank}**\n\nCurrent rank: **${levelName}**`}).catch(err => {
                      return;
                  })
 
                  memberTwo.send({ content: `You unfortunately lost the match, queue again to gain your XP back!\n\nXP lost: -**${take}**\n\nCurrent XP: **${levelData1.Rank}**\n\nCurrent rank: **${levelName2}**`}).catch(err => {
                      return;
                  })
                  
                  if (transcriptsChannel) {
                    transcriptsChannel.send({
                        files: [attachment],
                        embeds: [memberOneWinnerTranscripts]
                    });
                  } else {
                    return;
                  }
 
                  if (logChannel) {
                    logChannel.send({ embeds: [memberOneWinner] });
                  } else {
                    return;
                  }
              } else if (collected.emoji.name === '2️⃣') {
 
                  const attachment = await discordTranscripts.createTranscript(channel);
 
                  channel.delete();
 
                  //XP system
 
                  duelsLevelSchema.findOne({ Guild: i.guild.id, User: memberTwo.id }, async (err, data) => {
 
                      if (err) throw err;
 
                      if (!data) {
                          duelsLevelSchema.create({
                              Guild: i.guild.id, 
                              User: memberTwo.id,
                              Rank: 100,
                              Level: 0
                          })
                      }
                  })
 
                  const give = Math.floor(Math.random() * 61) + 80;
 
                  const levelData = await duelsLevelSchema.findOne({ Guild: i.guild.id, User: memberTwo.id });
 
                  if (!levelData) return;
 
                  const levelThresholds = [0, 300, 750, 1250, 1750, 2500, 3500, 5000, 1000000000000000]; // XP thresholds for each level
                  const currentLevel = levelData.Level;
 
                  const nextLevel = currentLevel + 1;
                  const nextLevelThreshold = levelThresholds[nextLevel];
 
                  const requiredXP = nextLevelThreshold ? nextLevelThreshold : 0;
 
                  if (levelData.Rank + give >= requiredXP) {
 
                      levelData.Rank += give;
                      levelData.Level += 1;
                      await levelData.save();
 
                  } else {
                      levelData.Rank += give;
                      levelData.save()
                  }
 
                  //XP system take
                  duelsLevelSchema.findOne({ Guild: i.guild.id, User: memberOne.id }, async (err, data) => {
                      if (err) throw err;
                  
                      if (!data) {
                          duelsLevelSchema.create({
                              Guild: i.guild.id, 
                              User: memberOne.id
                          })
                      }
                  });
                  
                  let take = Math.floor(Math.random() * 30) + 50;
                  
                  const levelData1 = await duelsLevelSchema.findOne({ Guild: i.guild.id, User: memberOne.id });
                  
                  if (!levelData1) return;
                  
                  const levelThresholds1 = [0, 300, 750, 1250, 1750, 2500, 3500, 5000, 1000000000000000]; // XP thresholds for each level
                  const currentLevel1 = levelData1.Level;
                  
                  if (levelData1.Rank - take <= 0) {
                      take = levelData1.Rank;
                      levelData1.Rank = 0;                                
                      levelData1.Level = Math.max(0, currentLevel1 - 1);
                      levelData1.save();
                  } else {
                      const prevLevelThreshold = levelThresholds1[currentLevel1] || 0;
                      const requiredXP = prevLevelThreshold;
                  
                      if (levelData1.Rank - take < requiredXP && currentLevel1 > 0) {
                          levelData1.Rank -= take;
                          levelData1.Level = Math.max(0, currentLevel1 - 1);
                          await levelData1.save();
                      } else {
                          levelData1.Rank -= take;
                          await levelData1.save();
                      }
                  }
                  //XP system end take
 
                  const memberTwoWinner = new EmbedBuilder()
                  .setColor('Gold')
                  .setAuthor({ 
                      name: "Match Ended",
                      iconURL: client.user.avatarURL({ dynamic: true, size: 1024 }) 
                  })
                  .setDescription(`${memberTwo} has won the match!`)
                  .addFields({ name: `${memberTwo.user.tag}`, value: `+${give} (${levelData.Rank})`, inline: true})
                  .addFields({ name: `${memberOne.user.tag}`, value: `-${take} (${levelData1.Rank})`, inline: true})
                  .setTimestamp()
                  .setFooter({ text: 'Radiant Utilities | Matchmaking System'})
 
                  const memberTwoWinnerTranscripts = new EmbedBuilder()
                  .setColor('Gold')
                  .setAuthor({ 
                      name: "Match Ended",
                      iconURL: client.user.avatarURL({ dynamic: true, size: 1024 }) 
                  })
                  .setDescription(`${memberTwo}'s and ${memberOne}'s match history.`)
                  .setTimestamp()
                  .setFooter({ text: 'Radiant Utilities | Matchmaking System'})
 
                  const levelObj = await duelsLevelSchema.findOne({ Guild: i.guild.id, User: memberOne.id });
 
                  const levelName = levelNames2[levelObj.Level];                            
 
                  const levelObj2 = await duelsLevelSchema.findOne({ Guild: i.guild.id, User: memberTwo.id });
                  
                  const levelName2 = levelNames2[levelObj2.Level]; 
 
                  memberTwo.send({ content: `You won the match and earned +**${give}** XP!\n\nCurrent XP: **${levelData.Rank}**\n\nCurrent rank: **${levelName2}**`}).catch(err => {
                      return;
                  })
 
                  memberOne.send({ content: `You unfortunately lost the match, queue again to gain your XP back!\n\nXP lost: -**${take}**\n\nCurrent XP: **${levelData1.Rank}**\n\nCurrent rank: **${levelName}**`}).catch(err => {
                      return;
                  })
                  
                  if (transcriptsChannel) {
                    transcriptsChannel.send({
                        files: [attachment],
                        embeds: [memberTwoWinnerTranscripts]
                    });
                  } else {
                    return;
                  }
 
                  if (logChannel) {
                    logChannel.send({ embeds: [memberTwoWinner] });
                  } else {
                    return;
                  }
              } 
          }
 
          if (collected.emoji.name === '❓' && !resolved && !roleHasPermissions) {
              const duelsData = await duelsSchema.findOne({ Guild: i.guild.id })
 
              const role = i.guild.roles.cache.get(duelsData.Role)
              channel.permissionOverwrites.create(role, { ViewChannel: true, SendMessages: true });
              roleHasPermissions = true;
              resolved = true;
 
              const assistanceEmbed = new EmbedBuilder()
              .setColor('Orange')
              .setAuthor({ 
                  name: "Staff Assistance",
                  iconURL: client.user.avatarURL({ dynamic: true, size: 1024 }) 
              })
              .setDescription(`${user} has called for staff assistance.`)
              .setTimestamp()
              .setFooter({ text: 'Radiant Utilities | Matchmaking System'})
          
              channel.send(`${role} - ${user.tag} has called for staff assistance.`).catch(collected => {
                  channel.send('The voting system is down for maintenance.');
              });
 
              logChannel.send({ embeds: [assistanceEmbed] })
              await chatSchema.create({ 
                  Guild: i.guild.id, 
                  MemberID: user.id,
                  ChannelId: channel.id,
                  AskedForSuport: true,
              })
 
          } else if (collected.emoji.name === '❓' && resolved) {
              const member = await collected.message.guild.members.fetch(user);
              if (member === memberOne || member === memberTwo) {
                  return;
              }
              if (member.roles.cache.has(role.id)) {
 
                  const resolvedEmbed = new EmbedBuilder()
                  .setColor('Purple')
                  .setAuthor({ 
                      name: "Match Resolved",
                      iconURL: client.user.avatarURL({ dynamic: true, size: 1024 }) 
                  })
                  .setDescription(`${member} has resolved the match.`)
                  .setTimestamp()
                  .setFooter({ text: 'Radiant Utilities | Matchmaking System'})
 
                  channel.send(`${member.user.tag} has resolved the match. React to the ❓ if you need any help.`);
                  channel.permissionOverwrites.create(role, { ViewChannel: false, SendMessages: false });
 
                  if (logChannel) {
                    logChannel.send({ embeds: [resolvedEmbed] });
                  } else {
                    return;
                  }
 
                  resolved = false;
                  roleHasPermissions = false;
              }
          }
          
          });                                                             
 
      } else if (Data.MemberOneID === member.id) {
          i.reply({ content: "You have already entered a queue!", ephemeral: true})
      }  
    }
  }
})
 
client.on(Events.InteractionCreate, async i => {
  if (i.isButton()) {
      if (i.customId === 'unqueue') {
 
          const duelsData = await duelsSchema.findOne({ Guild: i.guild.id });
 
          if (!duelsData) {
              i.reply({ content: "The 1v1 system is currently disabled.", ephemeral: true });
              return;
          }
 
          const member = i.member;
 
          if (!member) {
              i.reply({ content: "This command can only be used by guild members.", ephemeral: true });
              return;
          }
 
          const username = member.user.username.toLowerCase();
          const channelName = username.replace(/ /g, "-");
          const posChannel = await i.guild.channels.cache.find(c => c.name.includes(username) || c.name.includes(channelName));
 
          const unqueueEmbed = new EmbedBuilder()
              .setColor('Red')
              .setAuthor({
                  name: "Left Queue",
                  iconURL: client.user.avatarURL({ dynamic: true, size: 1024 })
              })
              .setDescription(`${member} has left the queue`)
              .setTimestamp()
              .setFooter({ text: "Radiant Utilities | Matchmaking System" });
 
          const openMatchmakingEmbed = new EmbedBuilder()
              .setColor("Green")
              .setAuthor({
                  name: "Match Open 🎮",
                  iconURL: client.user.avatarURL({ dynamic: true, size: 1024 })
              })
              .setDescription(`You are already in a match there for you cannot unqueue!`)
              .setTimestamp()
              .setFooter({ text: `Radiant Utilities | Matchmaking System` });
 
          if (posChannel) return await i.reply({ embeds: [openMatchmakingEmbed], ephemeral: true });
 
          const inQueueEmbed = new EmbedBuilder()
              .setColor("Green")
              .setAuthor({
                  name: "Matchmaking Queue 🎮",
                  iconURL: client.user.avatarURL({ dynamic: true, size: 1024 })
              })
              .setDescription(`You have not entered a queue yet and can there for not unqueue.`)
              .setTimestamp()
              .setFooter({ text: `Radiant Utilities | Matchmaking System` });
 
          const dmUnqueue = new EmbedBuilder()
              .setColor("Red")
              .setAuthor({
                  name: "Left Queue",
                  iconURL: client.user.avatarURL({ dynamic: true, size: 1024 })
              })
              .setDescription('You have successfully left the queue!');
 
          const data = await duelsSchema.findOne({ Guild: i.guild.id, MemberOneID: member.id });
 
          if (data) {
              duelsSchema.deleteMany({ MemberOneID: member.id }, async (err, data) => {
                  i.reply({ content: ":white_check_mark: You were removed from the queue!", ephemeral: true });
                  member.send({ embeds: [dmUnqueue] }).catch(err => {
                      return;
                  });
 
                  const logChannel = i.guild.channels.cache.get(duelsData.Logs);
 
                  if (!logChannel) {
                    return;
                  } else {
                      logChannel.send({ embeds: [unqueueEmbed] });
                  }
              });
          } else {
              await i.reply({ embeds: [inQueueEmbed], ephemeral: true });
          }
 
      }
  }
});


// verifiy // 

const capschema = require('./Schemas.js/verify');
const verifyusers = require('./Schemas.js/verifyusers');
 
client.on(Events.InteractionCreate, async interaction => {
 
    if (interaction.guild === null) return;
 
    const verifydata = await capschema.findOne({ Guild: interaction.guild.id });
    const verifyusersdata = await verifyusers.findOne({ Guild: interaction.guild.id, User: interaction.user.id });
 
    if (interaction.customId === 'verify') {
 
        if (!verifydata) return await interaction.reply({ content: `The **verification system** has been disabled in this server!`, ephemeral: true});
 
        if (verifydata.Verified.includes(interaction.user.id)) return await interaction.reply({ content: 'You have **already** been verified!', ephemeral: true})
        else {
 
            let letter = ['0','1','2','3','4','5','6','7','8','9','a','A','b','B','c','C','d','D','e','E','f','F','g','G','h','H','i','I','j','J','f','F','l','L','m','M','n','N','o','O','p','P','q','Q','r','R','s','S','t','T','u','U','v','V','w','W','x','X','y','Y','z','Z',]
            let result = Math.floor(Math.random() * letter.length);
            let result2 = Math.floor(Math.random() * letter.length);
            let result3 = Math.floor(Math.random() * letter.length);
            let result4 = Math.floor(Math.random() * letter.length);
            let result5 = Math.floor(Math.random() * letter.length);
 
            const cap = letter[result] + letter[result2] + letter[result3] + letter[result4] + letter[result5];
            console.log(cap)
 
            const captcha = new CaptchaGenerator()
            .setDimension(150, 450)
            .setCaptcha({ text: `${cap}`, size: 60, color: "red"})
            .setDecoy({ opacity: 0.5 })
            .setTrace({ color: "red" })
 
            const buffer = captcha.generateSync();
 
            const verifyattachment = new AttachmentBuilder(buffer, { name: `captcha.png`});
 
            const verifyembed = new EmbedBuilder()
            .setColor('Green')
            .setAuthor({ name: `✅ Verification Proccess`})
            .setFooter({ text: `✅ Verification Captcha`})
            .setTimestamp()
            .setImage('attachment://captcha.png')
            .setThumbnail('https://media.discordapp.net/attachments/1099432836668330075/1135266004918861875/image-removebg-preview.png?width=295&height=295')
            .setTitle('> Verification Step: Captcha')
            .addFields({ name: `• Verify`, value: '> Please use the button bellow to \n> submit your captcha!'})
 
            const verifybutton = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                .setLabel('✅ Enter Captcha')
                .setStyle(ButtonStyle.Success)
                .setCustomId('captchaenter')
            )
 
            const vermodal = new ModalBuilder()
            .setTitle('Verification')
            .setCustomId('vermodal')
 
            const answer = new TextInputBuilder()
            .setCustomId('answer')
            .setRequired(true)
            .setLabel('• Please sumbit your Captcha code')
            .setPlaceholder('Your captcha code')
            .setStyle(TextInputStyle.Short)
 
            const vermodalrow = new ActionRowBuilder().addComponents(answer);
            vermodal.addComponents(vermodalrow);
 
            const vermsg = await interaction.reply({ embeds: [verifyembed], components: [verifybutton], ephemeral: true, files: [verifyattachment] });
 
            const vercollector = vermsg.createMessageComponentCollector();
 
            vercollector.on('collect', async i => {
 
                if (i.customId === 'captchaenter') {
                    i.showModal(vermodal);
                }
 
            })
 
            if (verifyusersdata) {
 
                await verifyusers.deleteMany({
                    Guild: interaction.guild.id,
                    User: interaction.user.id
                })
 
                await verifyusers.create ({
                    Guild: interaction.guild.id,
                    User: interaction.user.id,
                    Key: cap
                })
 
            } else {
 
                await verifyusers.create ({
                    Guild: interaction.guild.id,
                    User: interaction.user.id,
                    Key: cap
                })
 
            }
        } 
    }
})
 
client.on(Events.InteractionCreate, async interaction => {
 
    if (!interaction.isModalSubmit()) return;
 
    if (interaction.customId === 'vermodal') {
 
        const userverdata = await verifyusers.findOne({ Guild: interaction.guild.id, User: interaction.user.id });
        const verificationdata = await capschema.findOne({ Guild: interaction.guild.id });
 
        if (verificationdata.Verified.includes(interaction.user.id)) return await interaction.reply({ content: `You have **already** verified within this server!`, ephemeral: true});
 
        const modalanswer = interaction.fields.getTextInputValue('answer');
        if (modalanswer === userverdata.Key) {
 
            const verrole = await interaction.guild.roles.cache.get(verificationdata.Role);
 
            try {
                await interaction.member.roles.add(verrole);
            } catch (err) {
                return await interaction.reply({ content: `There was an **issue** giving you the **<@&${verificationdata.Role}>** role, try again later!`, ephemeral: true})
            }
 
            await interaction.reply({ content: 'You have been **verified!**', ephemeral: true});
            await capschema.updateOne({ Guild: interaction.guild.id }, { $push: { Verified: interaction.user.id }});
 
        } else {
            await interaction.reply({ content: `**Oops!** It looks like you **didn't** enter the valid **captcha code**!`, ephemeral: true})
        }
    }
})

// AFK System Code //

const afkSchema = require('./Schemas.js/afkschema');
const { factorialDependencies, leftShift } = require('mathjs');

client.on(Events.MessageCreate, async (message) => {

    if (message.author.bot) return;

    if (message.guild === null) return;
    const afkcheck = await afkSchema.findOne({ Guild: message.guild.id, User: message.author.id});
    if (afkcheck) {
        const nick = afkcheck.Nickname;

        await afkSchema.deleteMany({
            Guild: message.guild.id,
            User: message.author.id
        })
        
        await message.member.setNickname(`${nick}`).catch(Err => {
            return;
        })

        const m1 = await message.reply({ content: `Hey, you are **back**!`, ephemeral: true})
        setTimeout(() => {
            m1.delete();
        }, 4000)
    } else {
        
        const members = message.mentions.users.first();
        if (!members) return;
        const afkData = await afkSchema.findOne({ Guild: message.guild.id, User: members.id })

        if (!afkData) return;

        const member = message.guild.members.cache.get(members.id);
        const msg = afkData.Message;

        if (message.content.includes(members)) {
            const m = await message.reply({ content: `${member.user.tag} is currently AFK, let's keep it down.. \n> **Reason**: ${msg}`, ephemeral: true});
            setTimeout(() => {
                m.delete();
                message.delete();
            }, 4000)
        }
    }
})

// Leveling System Code //

const levelSchema = require('./Schemas.js/level');
const levelschema = require('./Schemas.js/levelsetup');

client.on(Events.MessageCreate, async (message, err) => {

    const { guild, author } = message;
    if (message.guild === null) return;
    const leveldata = await levelschema.findOne({ Guild: message.guild.id });

    if (!leveldata || leveldata.Disabled === 'disabled') return;
    let multiplier = 1;
    
    multiplier = Math.floor(leveldata.Multi);
    

    if (!guild || author.bot) return;

    levelSchema.findOne({ Guild: guild.id, User: author.id}, async (err, data) => {

        if (err) throw err;

        if (!data) {
            levelSchema.create({
                Guild: guild.id,
                User: author.id,
                XP: 0,
                Level: 0
            })
        }
    })

    const channel = message.channel;

    const give = 1;

    const data = await levelSchema.findOne({ Guild: guild.id, User: author.id});

    if (!data) return;

    const requiredXP = data.Level * data.Level * 20 + 20;

    if (data.XP + give >= requiredXP) {

        data.XP += give;
        data.Level += 1;
        await data.save();
        
        if (!channel) return;

        const levelembed = new EmbedBuilder()
        .setColor("Purple")
        .setTitle(`> ${author.username} has Leveled Up!`)
        .setFooter({ text: `⬆ ${author.username} Leveled Up`})
        .setTimestamp()
        .setThumbnail('https://media.discordapp.net/attachments/1099432836668330075/1135266004918861875/image-removebg-preview.png?width=295&height=295')
        .addFields({ name: `• New Level Unlocked`, value: `> ${author.username} is now level **${data.Level}**!`})
        .setAuthor({ name: `⬆ Level Playground`})

        await message.channel.send({ embeds: [levelembed] }).catch(err => console.log('Error sending level up message!'));
    } else {

        if(message.member.roles.cache.find(r => r.id === leveldata.Role)) {
            data.XP += give * multiplier;
        } data.XP += give;
        data.save();
    }
})