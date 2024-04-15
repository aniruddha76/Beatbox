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
let player;

client.on('interactionCreate', async interaction => {
    let { commandName } = interaction

    if (commandName == "ping") {
        
        interaction.reply("Pong!!");

    } else if (commandName == "link") {

        interaction.reply(`${process.env.BOT_LINK}`);

    } else if (commandName == "play") {
        song = interaction.options.get('song').value;
        songQueue.push(song)

        userVoiceChannel = interaction.member.voice.channel;
        if (!userVoiceChannel) {
            interaction.reply('You need to be in a voice channel to use this command.');
            return;
        } 
        
        if (!player || player.state.status === 'idle') {
            const connectToVoice = await joinVoiceChannel({
                channelId: userVoiceChannel.id,
                guildId: userVoiceChannel.guild.id,
                adapterCreator: userVoiceChannel.guild.voiceAdapterCreator,
            });
            player = createAudioPlayer();
            connectToVoice.subscribe(player);
            playSong(song, interaction);
        } else {
            interaction.reply('Added to queue.');
        }
    }
});

function playSong(song, interaction) {
    const stream = ytdl(song, { filter: 'audioonly' });
    const resource = createAudioResource(stream);
    player.play(resource);
    
    interaction.reply('playing ' + song);

    player.once(AudioPlayerStatus.Idle, () => {
        songQueue.shift();

        if (songQueue.length > 0) {
            const nextSong = songQueue[0];
            playSong(nextSong, interaction);
        }
    });
}

client.login(process.env.BOT_TOKEN)