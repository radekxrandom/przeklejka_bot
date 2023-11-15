import { Client, GatewayIntentBits, AttachmentBuilder, EmbedBuilder } from 'discord.js';
import TelegramBot from 'node-telegram-bot-api';
import EventEmitter from 'events';
import { BetaEmitter } from './types/common';
import { DcClient } from './clients/dc.client';
import { TgClient } from './clients/tg.client';

require('dotenv').config();

const tgToken = require('./services/tg.configGenerator.service.ts');
const dcToken = require('./services/dc.configGenerator.service.ts');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });
const bot = new TelegramBot(tgToken, { polling: true });

const betaEmitter: BetaEmitter = new EventEmitter();
const userChatIds: string[] = [];

const dcClient = new DcClient(client, betaEmitter, userChatIds);
const tgClient = new TgClient(bot, betaEmitter, userChatIds, tgToken);

client.on('messageCreate', dcClient.processNewMessage);
client.login(dcToken);

bot.on('polling_error', (error) => console.error(`Polling error: ${error}`));
bot.on('message', tgClient.processNewMessage);

betaEmitter.on('sendDiscordMessage', dcClient.sendMessage);
betaEmitter.on('sendDiscordEmbed', dcClient.sendEmbed);
betaEmitter.on('sendTelegramMessage', tgClient.sendMessage);
betaEmitter.on('sendTelegramEmbed', tgClient.sendEmbed);
