const Parser = require('rss-parser');
const parser = new Parser();
const notifyschema = require('../Schemas.js/notifyschema');

module.exports = (client) => {
    client.checkUpdates = async () => {
        let setups = await notifyschema.find();

        if (!setups) return;
        if (setups.length > 1) {
            await Promise.all(setups.map(async (data) => {
                setTimeout(async () => {
                    try {
                        let videodata = await parser.parseURL(`https://www.youtube.com/feeds/videos.xml?channel_id=${data.ID}`);
                        if (!videodata) return;

                        let guild = await client.guilds.cache.get(`${data.Guild}`);
                        if (!guild) return;

                        let channel = await guild.channels.cache.get(`${data.Channel}`);
                        if (!channel) return;

                        let { link, author, title, id } = videodata.items[0];
                        if (data.Latest.includes(id)) return;
                        else {
                            await notifyschema.updateOne({ Guild: data.Guild, ID: data.ID }, { $push: { Latest: id } });
                        }

                        let pingrole = data.PingRole;
                        if (pingrole) {
                            if (pingrole === data.Guild) pingrole = `@everyone`;
                            else pingrole = `<@&${data.PingRole}>`;
                        } else {
                            pingrole = 'non';
                        }

                        if (data.Message) {
                            if (pingrole !== 'non') {
                                await channel.send({ content: `${pingrole} ${data.Message.replace('{author}', author).replace('{title}', title).replace('{link}', link)}` });
                            } else {
                                await channel.send({ content: `**${author}** just uploaded "**${title}**!" ${link}` });
                            }
                        } else {
                            if (pingrole !== 'non') {
                                await channel.send({ content: `${pingrole} **${author}** just uploaded "**${title}**" ${link}` });
                            } else {
                                await channel.send({ content: `**${author}** just uploaded "**${title}**"! ${link}` });
                            }
                        }
                    } catch (error) {
                        console.error(error);
                    }
                }, 5000);
            }));
        } else {
            try {
                let videodata = await parser.parseURL(`https://www.youtube.com/feeds/videos.xml?channel_id=${setups[0].ID}`);
                if (!videodata) return;

                let guild = await client.guilds.cache.get(`${setups[0].Guild}`);
                if (!guild) return;

                let channel = await guild.channels.cache.get(`${setups[0].Channel}`);
                if (!channel) return;

                let { link, author, title, id } = videodata.items[0];
                if (setups[0].Latest.includes(id)) return;
                else {
                    await notifyschema.updateOne({ Guild: setups[0].Guild, ID: setups[0].ID }, { $push: { Latest: id } });
                }

                let pingrole = setups[0].PingRole;
                if (pingrole) {
                    if (pingrole === setups[0].Guild) pingrole = `@everyone`;
                    else pingrole = `<@$${setups[0].PingRole}>`;
                } else {
                    pingrole = 'non';
                }

                if (setups[0].Message) {
                    if (pingrole !== 'non') {
                        await channel.send({ content: `${pingrole} ${setups[0].Message.replace('{author}', author).replace('{title}', title).replace('{link}', link)}` });
                    } else {
                        await channel.send({ content: `${setups[0].Message.replace('{author}', author).replace('{title}', title).replace('{link}', link)}` });
                    }
                } else {
                    if (pingrole !== 'non') {
                        await channel.send({ content: `${pingrole} **${author}** just uploaded "**${title}**" ${link}` });
                    } else {
                        await channel.send({ content: `**${author}** just uploaded "**${title}**"! ${link}` });
                    }
                }
            } catch (error) {
                console.error(error);
            }
        }
    };
};
