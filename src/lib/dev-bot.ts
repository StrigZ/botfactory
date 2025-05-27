import {
  BotService,
  type BotWorkflowWithNodesAndEdges,
} from './telegram/bot-service';

let devBotInstance: DevBotService | undefined;

export const startDevBot = async (token: string, botId: string) => {
  devBotInstance = await DevBotService.create(token, botId);
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
  constructor(
    token: string,
    botId: string,
    botWorkflow: BotWorkflowWithNodesAndEdges,
  ) {
    super(token, botId, botWorkflow);
  }

  async startDevBot() {
    console.log('Starting dev bot...');
    void this.getBot().start();
    console.log('Started dev bot!');
  }

  async stopDevBot() {
    console.log('Stopping dev bot...');
    void this.getBot().stop();
    console.log('Stopped dev bot!');
  }

  public static async create(token: string, botId: string) {
    const botWorkflow = (await super.create(token, botId)).botWorkflow;
    return new DevBotService(token, botId, botWorkflow);
  }
}
