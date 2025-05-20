import { type Bot } from 'grammy';

let botInstance: Bot | undefined;

export const getBotInstance = () => botInstance;
export const setBotInstance = (bot: Bot) => (botInstance = bot);
export const stopBotInstance = async () => {
  if (botInstance) {
    await botInstance.stop();
    botInstance = undefined;
  }
};
