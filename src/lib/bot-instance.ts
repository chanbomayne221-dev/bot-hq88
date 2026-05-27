import type TelegramBot from "node-telegram-bot-api";

let botInstance: TelegramBot | null = null;

export function setBotInstance(bot: TelegramBot) {
  botInstance = bot;
}

export function getBotInstance(): TelegramBot | null {
  return botInstance;
}
