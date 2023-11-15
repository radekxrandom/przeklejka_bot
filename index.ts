import { Client, GatewayIntentBits, AttachmentBuilder, EmbedBuilder } from 'discord.js';
import TelegramClient from 'node-telegram-bot-api';
import EventEmitter from 'events';
import { BetaEmitter } from './src/types/common.ts';
import { DiscordBot } from './src/bots/dc.bot.ts';
import { TelegramBot } from './src/bots/tg.bot.ts';
import { readEnvValue } from './src/services/readEnvValue.service.ts';
require('dotenv').config();

const discordClient = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });
const telegramClient = new TelegramClient(readEnvValue('TELEGRAM_TOKEN'), { polling: true });

const betaEmitter: BetaEmitter = new EventEmitter();
const userChatIds: string[] = [];

const discordBot = new DiscordBot(discordClient, betaEmitter, userChatIds);
const telegramBot = new TelegramBot(telegramClient, betaEmitter, userChatIds, readEnvValue('TELEGRAM_TOKEN'));

discordClient.on('messageCreate', discordBot.processNewMessage);
discordClient.login(readEnvValue('DISCORD_TOKEN'));

telegramClient.on('polling_error', (error) => console.error(`Polling error: ${error}`));
telegramClient.on('message', telegramBot.processNewMessage);

betaEmitter.on('sendDiscordMessage', discordBot.sendMessage);
betaEmitter.on('sendDiscordEmbed', discordBot.sendEmbed);
betaEmitter.on('sendTelegramMessage', telegramBot.sendMessage);
betaEmitter.on('sendTelegramEmbed', telegramBot.sendEmbed);
