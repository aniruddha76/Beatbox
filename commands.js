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
    description: 'search a song to play',
    options: [
        {
          name: 'song',
          description: 'song to search',
          type: 3,
          required: true,
        }
      ]
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