import {
	AkairoClient,
	AkairoOptions,
	CommandHandler,
	ListenerHandler,
  } from "discord-akairo";
  import {
	ClientOptions,
	MessageEmbedOptions,
	MessageEmbed,
  } from "discord.js";

  import { createConnection, Connection, getConnectionManager } from "typeorm";
  import { SnakeNamingStrategy } from "typeorm-naming-strategies";
  import path from "path";
  import dotenv from "dotenv";
  dotenv.config();
  import Logger from "../util/Logger";
  import config from "../config"

  import Redis, { RedisOptions } from "ioredis";
  import RedisConfig from './../redis-config';
//   import { RedisClient } from './SporkVoiceClient';

  let RedisOptions: RedisOptions = { lazyConnect: true };
//   export const RedisClient = new Redis({ host: RedisConfig.Host, port: RedisConfig.Port, lazyConnect: true });
  interface ICustomClientOptions {
	ownerId: string;
	defaultPrefix: string;
	botVersion: string;
	token: string | undefined;
  }

  export default class SporkVoiceClient extends AkairoClient {
	options!: AkairoOptions & ClientOptions & ICustomClientOptions;
	public logger: Logger;
	public db!: Connection;
	// public cache!: RedisClient;

	public commandHandler!: CommandHandler;
	private listenerHandler!: ListenerHandler;
	// private inhibitorHandler!: InhibitorHandler;
  
	constructor(
	  options?: AkairoOptions & ClientOptions & ICustomClientOptions,
	  clientOptions?: ClientOptions
	) {
	  super(options, clientOptions);
	  this.options.defaultPrefix = config.defaultPrefix;
	  this.options.botVersion = config.botVersion;
		
	  this.logger = new Logger();
	  this.init();
	}
  
	private async init() {
		try {
			this.db = await createConnection({
				name: "default",
				type: "postgres",
				url: process.env.POSTGRES_URL,
				synchronize: true,
				entities: [path.join(__dirname, "..", "entity", "*.entity.{ts,js}")],
				namingStrategy: new SnakeNamingStrategy(),
			});
		} catch (err) {
			// If AlreadyHasActiveConnectionError occurs, return already existent connection
			if (err.name === "AlreadyHasActiveConnectionError") {
				const existentConn = getConnectionManager().get("default");
				return existentConn;
			}
		}
		// try {
		// 	await RedisClient.connect(() => {});
		// 	this.cache = await new Redis({ host: RedisConfig.Host, port: RedisConfig.Port, lazyConnect: true });
		// 	console.log(`Connection opened to redis server`);
		// } catch (error) {
		// 	console.error('Error with the redis database connection', error);
		// }
  
	//   setInterval(async () => {

	//   }, 1000 * 10);
	  this.logger.info("Connected to DB", { tag: "Database" });
	  this.logger.log("Loading Commands....", { tag: "Command" });
	  this.commandHandler = await new CommandHandler(this, {
		prefix: ";",
		directory: path.join(__dirname, "..", "commands"),
		allowMention: true,
	  });
	  this.logger.info("Loaded Commands!", { tag: "Command" });

	  this.logger.log("Loading Listeners....", { tag: "Listener" });
	  this.listenerHandler = new ListenerHandler(this, {
		directory: path.join(__dirname, "..", "events"),
	  });
	  this.logger.info("Loaded Listeners!", { tag: "Listener" });
	//   this.logger.info("Loading Inhibitors....");
	//   this.inhibitorHandler = new InhibitorHandler(this, {
	// 	directory: path.join(__dirname, "..", "inhibitors"),
	//   });
  
	  this.commandHandler.useListenerHandler(this.listenerHandler);
	//   this.commandHandler.useInhibitorHandler(this.inhibitorHandler);
	//   this.inhibitorHandler.loadAll();
	  this.listenerHandler.loadAll();
	  this.commandHandler.loadAll();
	}
  
	public embed(data: string | MessageEmbedOptions) {
	  if (typeof data === "string") {
		return new MessageEmbed().setDescription(data);
	  }
	  return new MessageEmbed(data);
	}
  
	public errorEmbed(description: string) {
	  return this.embed({ description, color: "#e53935" });
	}
  
	public successEmbed(description: string) {
	  return this.embed({ description, color: "#43a047" });
	}
  }
