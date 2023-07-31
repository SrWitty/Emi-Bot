const { SlashCommandBuilder } = require('@discordjs/builders');
const ytdl = require('ytdl-core');

const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
  StreamType,
} = require('@discordjs/voice');

const queue = new Map();

async function execute(interaction, song) {
  const member = interaction.member;
  if (!member) {
    await interaction.reply('Something went wrong. Please try again.');
    return;
  }

  const voiceChannel = member.voice.channel;
  if (!voiceChannel) {
    await interaction.reply('You need to be in a voice channel to play music!');
    return;
  }

  const permissions = voiceChannel.permissionsFor(interaction.client.user);
  if (!permissions.has('CONNECT') || !permissions.has('SPEAK')) {
    await interaction.reply('I need the permissions to join and speak in your voice channel!');
    return;
  }

  let songData;
  try {
    const songInfo = await ytdl.getInfo(song);
    songData = {
      title: songInfo.videoDetails.title,
      url: songInfo.videoDetails.video_url,
    };
  } catch (error) {
    // If ytdl-core couldn't fetch video details, assume it's a video ID
    songData = {
      title: `Song with ID: ${song}`,
      url: `https://www.youtube.com/watch?v=${song}`,
    };
  }

  const serverQueue = queue.get(interaction.guild.id);
  if (!serverQueue) {
    const queueContruct = {
      textChannel: interaction.channel,
      voiceChannel: voiceChannel,
      connection: null,
      songs: [],
      volume: 5,
      playing: true,
      player: null,
    };

    queue.set(interaction.guild.id, queueContruct);
    queueContruct.songs.push(songData);

    try {
      const connection = joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId: interaction.guild.id,
        adapterCreator: voiceChannel.guild.voiceAdapterCreator,
      });
      queueContruct.connection = connection;

      const player = createAudioPlayer();
      queueContruct.player = player;

      connection.subscribe(player);
      play(interaction.guild, queueContruct.songs[0]);
    } catch (err) {
      console.error(err);
      queue.delete(interaction.guild.id);
      await interaction.reply(err.message);
    }
  } else {
    serverQueue.songs.push(songData);
    await interaction.reply(`${songData.title} has been added to the queue!`);
  }
}

function play(guild, song) {
  const serverQueue = queue.get(guild.id);
  if (!song) {
    serverQueue.voiceChannel.leave();
    queue.delete(guild.id);
    return;
  }

  const resource = createAudioResource(ytdl(song.url, { filter: 'audioonly' }), { inputType: StreamType.Arbitrary });
  serverQueue.player.play(resource);

  serverQueue.player.on(AudioPlayerStatus.Idle, () => {
    serverQueue.songs.shift();
    play(guild, serverQueue.songs[0]);
  });

  serverQueue.player.on('error', (error) => {
    console.error(error);
  });

  serverQueue.textChannel.send(`Now playing: **${song.title}**`);
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('play')
    .setDescription('Play a song in the voice channel')
    .addStringOption((option) =>
      option
        .setName('song')
        .setDescription('The name or URL of the song to play')
        .setRequired(true)
    ),
  execute,
};
