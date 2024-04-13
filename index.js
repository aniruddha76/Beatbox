import { Application, Client, GatewayIntentBits, Options, VoiceChannel } from 'discord.js';
import { createAudioPlayer, createAudioResource, joinVoiceChannel, AudioPlayerStatus } from '@discordjs/voice';
import ytdl from 'ytdl-core';
import dotenv from "dotenv";
dotenv.config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates,
    ]
});

import { setupCommands } from './commands.js';
setupCommands(client);

let song;
let songQueue = [];
let userVoiceChannel;
let connectToVoice;
let player;
let track;
let stream;
let firstSong;

client.on('interactionCreate', async interaction => {
    let { commandName } = interaction

    if (commandName == "ping") {
        interaction.reply("Pong!!")
    } else if (commandName == "link") {
        interaction.reply(`${process.env.BOT_LINK}`)
    } else if (commandName == "play") {
        song = interaction.options.get('song').value;
        songQueue.push(song)

        userVoiceChannel = interaction.member.voice.channel;
        if (!userVoiceChannel) {
            interaction.reply('You need to be in a voice channel to use this command.');
            return;
        } else if (songQueue.length > 1) {
            interaction.reply('Added to queue')
        } else {
            connectToVoice = await joinVoiceChannel({
                channelId: userVoiceChannel.id,
                guildId: userVoiceChannel.guild.id,
                adapterCreator: userVoiceChannel.guild.voiceAdapterCreator,
            });

            player = createAudioPlayer();
            connectToVoice.subscribe(player);

            if (player.state.status === 'idle') {
                firstSong = songQueue[0];
                stream = ytdl(firstSong, { filter: 'audioonly' });
                track = createAudioResource(stream);
                player.play(track)

                interaction.reply('playing ' + firstSong);
            }
        }
        for (let i = 1; i <= songQueue.length-1; i++) {

            player.on(AudioPlayerStatus.Idle, async () => {
                let nextStream = await ytdl(songQueue[i], { filter: 'audioonly' });
                let nextTrack = await createAudioResource(nextStream);
                await player.play(nextTrack);
                await interaction.channel.send('playing ' + songQueue[i])
            })
        }
    }
});

client.login(process.env.BOT_TOKEN)