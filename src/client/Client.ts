import { Command } from "../interfaces/Command";
import { Event } from "../interfaces/Event";
import consola, { Consola } from "consola";
import { Client, Intents, Collection } from "discord.js-light";
import glob from "glob";
import { promisify } from "util";
import { Config } from "../interfaces/Config";
import Constants from "../interfaces/Constants";
import Util from "../interfaces/Util";
import Mongo from "../interfaces/Database";
import EmbedConstruction from "../Classes/MainBotEmbed";
import Lottery from "../../Assets/Economy/Lottery";
import createRedisClient from "../interfaces/Redis";
import { RedisClient } from "redis";

const globPromise = promisify(glob);

class Bot extends Client {
  public logger: Consola = consola;
  public commands: Collection<string, Command> = new Collection();
  public aliases: Collection<string, string> = new Collection();
  public categories: Set<string> = new Set();
  public utils: Util = new Util(this);
  public embed: typeof EmbedConstruction = EmbedConstruction;
  public events: Collection<string, Event> = new Collection();
  public cooldowns: Collection<string, number> = new Collection();
  public config: Config;
  public redis: RedisClient;
  public constants: typeof Constants = Constants;
  public owners: string[] = ["473858248353513472"];
  public version: string = "v9.5.5";

  public constructor() {
    super({
      ws: { intents: Intents.ALL },
      messageCacheLifetime: 180,
      messageCacheMaxSize: 200,
      messageEditHistoryMaxSize: 200,
      messageSweepInterval: 180,
      cacheGuilds: true,
      cacheChannels: false,
      cacheOverwrites: false,
      cacheRoles: false,
      cacheEmojis: false,
      cachePresences: false,
    });
  }

  public async start(config: Config): Promise<void> {
    Mongo();
    this.config = config;
    this.login(config.token);
    Lottery(this);

    const commandFiles: string[] = await globPromise(
      `${__dirname}/../commands/**/*{.ts,.js}`
    );

    commandFiles.map(async (value: string) => {
      const file: Command = await import(value);
      this.commands.set(file.name, {
        cooldown: 3000,
        description: "No description found.",
        category: "Miscellaneous",
        usage: `!${file.name}`,
        premiumOnly: false,
        devOnly: false,
        guildOnly: false,
        ...file,
      });
      this.categories.add(file.category);
      if (file.aliases?.length) {
        file.aliases.map((value: string) => this.aliases.set(value, file.name));
      }
    });

    const eventFiles: string[] = await globPromise(
      `${__dirname}/../events/**/*{.ts,.js}`
    );

    eventFiles.map(async (value: string) => {
      const file: Event = await import(value);
      this.events.set(file.name, file);
      this.on(file.name, file.run.bind(null, this));
    });
  }
}

export { Bot };