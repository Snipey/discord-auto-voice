import { Listener, ListenerOptions, AkairoClient } from 'discord-akairo';
import SporkVoiceClient from "./SporkVoiceClient";
import { Guild } from "../entity/Guild.entity";
import { Room } from "../entity/Room.entity";
import { Repository, getRepository } from "typeorm";

export default class SporkVoiceListener extends Listener {
  client: SporkVoiceClient = new SporkVoiceClient();
  guildRepository: Repository<Guild>;
  roomRepository: Repository<Room>;

  constructor(id: string, options?: ListenerOptions) {
    super(id, options);

    this.guildRepository = getRepository(Guild);
    this.roomRepository = getRepository(Room);
  }
}
