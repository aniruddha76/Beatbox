import { REST, Routes } from 'discord.js';
import dotenv from "dotenv";
dotenv.config();

const commands = [
  {
    name: 'ping',
    description: 'Replies with Pong!',
  },
  {
    name: 'link',
    description: 'Get invite link'
  },
  {
    name: 'play',
    description: 'send youtube link to play',
    options: [
        {
          name: 'song',
          description: 'song to play',
          type: 3,
          required: true,
        }
      ]
  },
  {
    name: 'pause',
    description: 'pause current playing song'
  },
  {
    name: 'resume',
    description: 'resume last playing song'
  },
  {
    name: 'skip',
    description: 'skip a song'
  },
  {
    name: 'leave',
    description: 'Stop and leave the voice channel'
  },
];

const rest = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN);

async function setupCommands() {

  try {
    console.log('Started refreshing application (/) commands.');

    await rest.put(Routes.applicationCommands(process.env.CLIENT_TOKEN), { body: commands });

    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(error);
  }
}

export { setupCommands };