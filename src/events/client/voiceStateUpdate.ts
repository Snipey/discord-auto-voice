import Listener from "../../struct/Listener";
import { VoiceState } from "discord.js";
import { Room, ChannelType } from '../../entity/Room.entity';

class voiceStateUpdateListener extends Listener {
	constructor() {
		super("voiceStateUpdate", {
		event: "voiceStateUpdate",
		emitter: "client",
		category: "client"
		});
	}
	
	async exec(oldState: VoiceState, newState: VoiceState) {
		// Channel States
		let newChannelState = newState.channel;
		let oldChannelState = oldState.channel;
		// Get join channel
		let joinRoom = await this.roomRepository.findOne({
			where: { roomId: newChannelState?.id, lobby: true },
		});
		// Get Managed Room
		let oldManagedRoom = await this.roomRepository.findOne({
			where: { roomId: oldState.channel?.id , lobby: false },
		});
		if(newChannelState != null && newChannelState.id == joinRoom?.roomId){
			// TODO Clean up old managed channels if join create
			if(oldChannelState?.members.size == 0 && oldManagedRoom != undefined) {
				oldChannelState.delete();
			}
			// ! CREATE CHANNEL
			if(joinRoom != undefined){
				try {
					newChannelState?.guild.channels.create(`${newState.member?.displayName}'s Room`, { type: "voice" })
					.then(channel => {
						// Add channel to db
						this.roomRepository.createQueryBuilder()
						  .insert()
						  .into(Room)
						  .values({serverId: channel.guild?.id, roomId: channel.id, lobby: false, channelType: ChannelType.VOICE})
						  .execute();
						// Set parent category
						channel.setParent(String(newChannelState?.parent?.id))
						newState.setChannel(channel.id)
					})
				} catch (e) {
					this.client.logger.error(e);
				}
			}
		} else if (newState?.id != joinRoom?.roomId && oldState != null) {
			// Get voice room
			let voiceRoom = await this.roomRepository.findOne({
				where: { roomId: oldState.channel?.id, lobby: false },
			});
			// ! DELETE CHANNEL
			if(voiceRoom != undefined) {
				try {
					if(oldState.channel?.members.size == 0) {
						this.roomRepository.createQueryBuilder()
							.delete()
							.where({serverId: oldChannelState?.guild.id, roomId: oldChannelState?.id})
							.execute();
						oldState.channel.delete();
					}
				} catch (e) {
					this.client.logger.error(e);
				}
			}
		}
    }
}

export default voiceStateUpdateListener;