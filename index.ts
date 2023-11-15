import { Client, GatewayIntentBits, AttachmentBuilder, EmbedBuilder } from 'discord.js';
import TelegramBot from 'node-telegram-bot-api';
import EventEmitter from 'events';
import { BetaEmitter } from './src/types/common.ts';
import { DcClient } from './src/clients/dc.client.ts';
import { TgClient } from './src/clients/tg.client.ts';
import { readEnvValue } from './src/services/readEnvValue.service.ts';
require('dotenv').config();



const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });
const bot = new TelegramBot(readEnvValue('TELEGRAM_TOKEN'), { polling: true });

const betaEmitter: BetaEmitter = new EventEmitter();
const userChatIds: string[] = [];

const dcClient = new DcClient(client, betaEmitter, userChatIds);
const tgClient = new TgClient(bot, betaEmitter, userChatIds, readEnvValue('TELEGRAM_TOKEN'));

client.on('messageCreate', dcClient.processNewMessage);
client.login(readEnvValue('DISCORD_TOKEN'));

bot.on('polling_error', (error) => console.error(`Polling error: ${error}`));
bot.on('message', tgClient.processNewMessage);

betaEmitter.on('sendDiscordMessage', dcClient.sendMessage);
betaEmitter.on('sendDiscordEmbed', dcClient.sendEmbed);
betaEmitter.on('sendTelegramMessage', tgClient.sendMessage);
betaEmitter.on('sendTelegramEmbed', tgClient.sendEmbed);
