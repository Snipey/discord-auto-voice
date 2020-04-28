import { Command, ArgumentGenerator } from "discord-akairo";
import ArgumentOptions from "./ArgumentOptions";
import CommandOptions from "./CommandOptions";
import { Repository, getRepository } from "typeorm";
import { Guild } from "../entity/Guild.entity";
import { Room } from "../entity/Room.entity";
import SporkVoiceClient from "./SporkVoiceClient";

class CustomCommand extends Command {
	client: SporkVoiceClient = new SporkVoiceClient();
  guildRepository: Repository<Guild>;
  roomRepository: Repository<Room>;
  args?: ArgumentOptions[];
  categoryName?: string;
  guild?: Guild;
  Room?: Room;

  constructor(id: string, options: CommandOptions) {
    super(id, options);
    this.args = options.args;
    this.categoryName = options.category;
    this.guildRepository = getRepository(Guild);
    this.roomRepository = getRepository(Room);
  }
}

export default CustomCommand;