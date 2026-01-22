// src/modules/messenger-factory/entities/conversation.entity.ts
import { MetaData } from "src/common/entity/meta-data";
import { Company } from "src/modules/company/entities/company.entity";
import { Message } from "./message.entity";
import { ConversationTag } from "./conversation-tag.entity";
import { ConversationSummary } from "./conversation-summary.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique, OneToMany, CreateDateColumn } from "typeorm";

@Entity('conversations')
@Unique(['company_id', 'conversation_id'])
export class Conversation extends MetaData {
  @PrimaryGeneratedColumn('uuid')
  conversation_id: string;

  @Column()
  company_id: string;

  @Column()
  customer_id: string;

  @Column()
  customer_name: string;

  @Column()
  conversation_source: string;

  @Column()
  conversation_status: string;

  @Column()
  assigned_status: boolean;

  @Column({ nullable: true })
  assigned_to: string;

  @Column({ nullable: true })
  group_id: string;

  @CreateDateColumn()
  starting_time: string;

  @Column({ nullable: true })
  ending_time: string;

  @ManyToOne(() => Company, company => company.id)
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @OneToMany(() => Message, message => message.conversation)
  messages: Message[];

  @OneToMany(() => ConversationTag, tag => tag.conversation)
  tags: ConversationTag[];

  @OneToMany(() => ConversationSummary, summary => summary.conversation)
  summaries: ConversationSummary[];
}