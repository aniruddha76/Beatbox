import { Client, GatewayIntentBits, Options } from 'discord.js';
import { createAudioPlayer, createAudioResource, joinVoiceChannel } from '@discordjs/voice';
import dotenv from "dotenv";
dotenv.config();

import search from './songs.js'

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

let songToSearch;
let userVoiceChannel;
let connectToVoice;
let songFuntion;
let player;
let track;
let dispatcher;
let songTitle;

client.on('interactionCreate', async interaction => {
    let { commandName } = interaction

    if (commandName == "ping") {
        interaction.reply("Pong!!")
    } else if (commandName == "link") {
        interaction.reply(`${process.env.BOT_LINK}`)
    } else if (commandName == "play") {
        songToSearch = interaction.options.get('song').value;

        userVoiceChannel = interaction.member.voice.channel;
        if (!userVoiceChannel) {
            interaction.reply('You need to be in a voice channel to use this command.');
            return;
        } else {
            songFuntion = await search(songToSearch);

            connectToVoice = await joinVoiceChannel({
                channelId: userVoiceChannel.id,
                guildId: userVoiceChannel.guild.id,
                adapterCreator: userVoiceChannel.guild.voiceAdapterCreator,
            });

            player = await createAudioPlayer();
            await connectToVoice.subscribe(player);

            track = await createAudioResource(songFuntion.data[0].link);
            await player.play(track);
            
        }

    }
});

client.login(process.env.BOT_TOKEN)