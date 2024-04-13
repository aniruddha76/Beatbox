import { Client, GatewayIntentBits, Options } from 'discord.js';
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
        } else {

            connectToVoice = await joinVoiceChannel({
                channelId: userVoiceChannel.id,
                guildId: userVoiceChannel.guild.id,
                adapterCreator: userVoiceChannel.guild.voiceAdapterCreator,
            });

            player = createAudioPlayer();
            connectToVoice.subscribe(player);
            console.log(player.state.status)
        }

            // stream = ytdl(songQueue[0], { filter: 'audioonly' })
            // track = createAudioResource(stream);
            // player.play(track);

            // interaction.reply('playing ' + song);
            // console.log(player.state.status);

            if (player.state.status === 'idle') {
                if (songQueue.length > 0) {
                    firstSong = songQueue[0];
                    stream = ytdl(firstSong, { filter: 'audioonly' });
                    track = createAudioResource(stream);
                    player.play(track)

                    interaction.reply('playing ' + firstSong);
                    console.log(player.state.status);

                    player.on(AudioPlayerStatus.Idle, () => {
                        let nextStream = ytdl(songQueue[+1], { filter: 'audioonly' });
                        let nextTrack = createAudioResource(nextStream);
                        player.play(nextTrack);
                        interaction.channel.send('playing ' + songQueue[+1])
                    })
                }
            }

    }
});

client.login(process.env.BOT_TOKEN)