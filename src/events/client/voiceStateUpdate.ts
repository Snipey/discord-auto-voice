import Listener from "../../struct/Listener";
import { VoiceState } from "discord.js";

class voiceStateUpdateListener extends Listener {
  constructor() {
    super("voiceStateUpdate", {
      event: "voiceStateUpdate",
      emitter: "client",
      category: "client"
    });
  }

  async exec(oldState: VoiceState, newState: VoiceState) {
  	// TODO Check if room is waiting room for private
  	// Connecting to a channel
  	let newChannelState = newState.channel;
  	let oldChannelState = oldState.channel;

  	let joinRoom = await this.roomRepository.findOne({
  		where: { serverId: newChannelState?.guild.id, roomId: newChannelState?.id },
  	});

  	if(newChannelState) {
  		// TODO Check if channel is auto voice
  		// TODO Create a new channel with name
  		if(joinRoom){
  			// this.client.logger.log(`Connected to Join Room ${newChannelState.id}`)
  			newChannelState.guild.channels.cache.map(channel => {
  				if(channel.id == joinRoom?.roomId) {
  					let parent = channel.parent;
  					channel.guild.channels.create("New Room", {type: "voice"})
  					.then(channel => {
  						// console.log(parent?.id)
  						channel.setParent(String(parent?.id))
  						newState.setChannel(channel.id)
  					})
  				}
  			})
  			joinRoom.id
  		}else{
  			// this.client.logger.log(`Connected to ${newChannelState.id}`)
  		}
  	} else {
  		let memberCount = oldChannelState?.members.size;
  		// Check if members are not in channel
  		if(Number(memberCount) < 1) {

  			// TODO Remove channel if last in voice
  			try {
  				await oldChannelState?.guild.channels.cache.map(channel => {
  					if(channel.id != String(joinRoom?.id)){
  						channel.delete();
  						this.roomRepository.createQueryBuilder()
  							.delete()
  							.where({serverId: oldChannelState?.guild.id, roomId: oldChannelState?.id})
  							.execute();
  					}
  					this.client.logger.log(`Removed Channel ${channel?.id}`)
  				})
  				this.client.logger.log(`Removed Channel Record for ${oldChannelState?.id}`)
  			} catch (e) {
  				this.client.logger.error(e);
  			}
  		}
  	}
  }
}

export default voiceStateUpdateListener;
