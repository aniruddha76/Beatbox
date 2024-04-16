import { Application, Client, GatewayIntentBits, Options, VoiceChannel } from 'discord.js';
import { createAudioPlayer, createAudioResource, joinVoiceChannel, AudioPlayerStatus, AudioPlayer } from '@discordjs/voice';
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
let botVoiceChannel;

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

            botVoiceChannel = connectToVoice;
            player = createAudioPlayer();
            connectToVoice.subscribe(player);
            playSong(song, interaction);
        } else {
            interaction.reply('Added to queue.');
        }

    } else if (commandName == 'pause') {

        player.pause();
        interaction.reply('Music paused!')

    } else if (commandName == 'resume') {

        player.unpause();
        interaction.reply(`And we're back! Time to groove again!`)

    } else if (commandName == 'skip') {

        songQueue.shift();
        let afterSkip = songQueue[0];
        interaction.channel.send('Next song coming up!')
        playSong(afterSkip, interaction);

    } else if (commandName == 'leave') {

        botVoiceChannel.disconnect();
        interaction.reply('The bot has left the voice channel. Until next time!');
        songQueue = [];

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