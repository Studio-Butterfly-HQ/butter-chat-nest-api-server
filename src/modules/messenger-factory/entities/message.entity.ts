// src/modules/messenger-factory/entities/message.entity.ts
import { MetaData } from "src/common/entity/meta-data";
import { Company } from "src/modules/company/entities/company.entity";
import { Conversation } from "./coversation.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from "typeorm";

export enum SenderType {
  AI_AGENT = 'AI-AGENT',
  HUMAN = 'HUMAN'
}

@Entity('messages')
@Unique(['company_id', 'message_id'])
export class Message extends MetaData {
  @PrimaryGeneratedColumn('uuid')
  message_id: string;

  @Column()
  sender: string;

  @Column()
  conversation_id: string;

  @Column()
  company_id: string;

  @Column({
    type: 'enum',
    enum: SenderType,
    default: SenderType.HUMAN
  })
  sender_type: SenderType;

  @Column('text')
  message: string;

  @Column()
  message_type: string;

  @Column({ default: false })
  edit_status: boolean;

  @Column({ nullable: true })
  reply_to_message_id: string;

  @Column()
  time: string;

  @Column({ nullable: true })
  message_intend: string;

  @ManyToOne(() => Company, company => company.id)
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @ManyToOne(() => Conversation, conversation => conversation.messages)
  @JoinColumn({ name: 'conversation_id' })
  conversation: Conversation;
}