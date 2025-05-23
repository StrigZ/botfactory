import { BotService } from './telegram/bot-service';

let devBotInstance: DevBotService | undefined;

export const startDevBot = async (token: string, botId: string) => {
  devBotInstance = new DevBotService(token, botId);
  await devBotInstance.startDevBot();
  return true;
};

export const stopDevBot = async () => {
  if (devBotInstance) {
    await devBotInstance.stopDevBot();
    devBotInstance = undefined;
    return true;
  }
  return false;
};

export const getDevBot = async () => devBotInstance;

export class DevBotService extends BotService {
  constructor(token: string, botId: string) {
    super(token, botId);
  }

  async startDevBot() {
    console.log('Starting dev bot...');
    void this.bot.start();
    console.log('Started dev bot!');
  }

  async stopDevBot() {
    console.log('Stopping dev bot...');
    void this.bot.stop();
    console.log('Stopped dev bot!');
  }
}
