import Command from "../../struct/Command";
import { Message } from "discord.js";
import { SequelizeProvider } from "discord-akairo";
import { Room } from './../../entity/Room.entity';

class CreateVoiceCommand extends Command {
  constructor() {
    super("cv", {
      aliases: ["cv"],
      category: "general",
      description: "Create Voice Channel"
    });
  }

  async exec(message: Message) {
    // TODO Create multiple Room types
    let lobbyRecord = await this.roomRepository.findOne({
      where: { serverId: message.guild?.id },
    });
    if (!lobbyRecord) {
    // Create a spork voice Room category
    await message.guild?.channels.create('Rooms', { type: "category", reason: 'Created auto voice category' })
      .then(category => {
        category.guild.channels.create("➕ Join To Create", {parent: category.id, type: "voice"})
        .then(channel => {
          try{
            this.roomRepository.createQueryBuilder()
              .insert()
              .into(Room)
              .values({serverId: channel.guild?.id, roomId: channel.id, lobby: true})
              .execute();
          } catch (e) {
            this.client.logger.error(e)
          }
        })
        this.client.logger.info(`Created Room record for ${message.guild?.id}`);
      })
      .catch(console.error);
      return message.channel.send(this.client.successEmbed("Created Auto Voice Rooms"));
    }
  }
}

export default CreateVoiceCommand;