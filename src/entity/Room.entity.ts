import { PrimaryGeneratedColumn, Column, Entity } from "typeorm";
export enum ChannelType {
    TEXT = "text",
    CATEGORY = "category",
    VOICE = "voice"
}

@Entity()
export class Room {
    @PrimaryGeneratedColumn()
	id!: number;

	@Column()
	serverId!: string;
	
	@Column()
	roomId!: string;
	
	@Column({
        type: "enum",
        enum: ChannelType,
        default: ChannelType.VOICE
    })
    channelType?: ChannelType
}