// src/modules/messenger-factory/entities/conversation-tag.entity.ts
import { MetaData } from "src/common/entity/meta-data";
import { Company } from "src/modules/company/entities/company.entity";
import { Conversation } from "./coversation.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from "typeorm";

@Entity('conversation_tags')
@Unique(['company_id', 'tag_id'])
export class ConversationTag extends MetaData {
  @PrimaryGeneratedColumn('uuid')
  tag_id: string;

  @Column()
  conversation_id: string;

  @Column()
  company_id: string;

  @Column()
  tag_name: string;

  @Column({ nullable: true })
  tag_color: string;

  @Column({ nullable: true })
  tag_description: string;

  @Column()
  created_by: string;

  @ManyToOne(() => Company, company => company.id)
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @ManyToOne(() => Conversation, conversation => conversation.tags)
  @JoinColumn({ name: 'conversation_id' })
  conversation: Conversation;
}