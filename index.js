import { Client, GatewayIntentBits, EmbedBuilder } from 'discord.js';
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
let titleQueue = [];
let userVoiceChannel;
let player;
let botVoiceChannel;
let songInfo;
let songTitle;

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

            songInfo = ytdl.getBasicInfo(song);
            songTitle = (await songInfo).videoDetails.title;
            titleQueue.push(songTitle);

        } else {
            interaction.reply('Added to queue.');
            songInfo = ytdl.getBasicInfo(song);
            songTitle = (await songInfo).videoDetails.title;
            titleQueue.push(songTitle);
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
        clearQueue(interaction)

    } else if (commandName == 'queue') {

        displayQueue(interaction);

    } else if (commandName == 'remove') {

        let index = interaction.options.get('index').value;
        removeSong(index, interaction);

    }

});

async function playSong(song, interaction) {
    try {
        const stream = ytdl(song, { filter: 'audioonly' });
        const resource = createAudioResource(stream);
        player.play(resource);

        interaction.reply(`Now playing: ${song}`);

        player.once(AudioPlayerStatus.Idle, () => {
            songQueue.shift();
            if (songQueue.length > 0) {
                const nextSong = songQueue[0];
                playSong(nextSong, interaction);
            }
        });
    } catch (error) {
        console.error('Error occurred while fetching song info:', error);
        interaction.reply('An error occurred while fetching song information.');
    }
}

async function displayQueue(interaction) {
    if (songQueue.length === 0) {
        interaction.reply('The queue is currently empty.');
    } else {
        
        const embed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle('Current Queue');
        
        let promises = titleQueue.map(async (title, index) => {
            try {
                embed.addFields({ name: `Song ${index + 1}`, value: title, inline: true });
            } catch (error) {
                console.error('Error occurred while fetching song info:', error);
                embed.addFields({ name: `Song ${index + 1}`, value: 'Failed to fetch title', inline: true });
            }
        });


        if (!interaction.deferred) {
            interaction.reply({ embeds: [embed] })
        }
    }
}

function removeSong(index, interaction) {
    if (index > 0 && index <= songQueue.length) {
        const removedSong = songQueue.splice(index - 1, 1);
        titleQueue.splice(index -1, 1);
        interaction.reply(`Removed ${removedSong} from the queue.`);
    } else {
        interaction.reply('Invalid song index.');
    }
}

function clearQueue(interaction) {
    player = null;
    songQueue = [];
    titleQueue = [];
    interaction.reply('The bot has left the voice channel and queue cleared successfully!');
}

client.login(process.env.BOT_TOKEN)