// src/modules/messenger-factory/entities/conversation-summary.entity.ts
import { MetaData } from "src/common/entity/meta-data";
import { Company } from "src/modules/company/entities/company.entity";
import { Conversation } from "./coversation.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from "typeorm";

@Entity('conversation_summaries')
@Unique(['company_id', 'summary_id'])
export class ConversationSummary extends MetaData {
  @PrimaryGeneratedColumn('uuid')
  summary_id: string;

  @Column()
  conversation_id: string;

  @Column()
  company_id: string;

  @Column('text')
  summary_text: string;

  @Column({ nullable: true })
  summary_type: string; // e.g., 'auto', 'manual', 'ai-generated'

  @Column({ nullable: true })
  generated_by: string;

  @Column()
  generated_at: string;

  @ManyToOne(() => Company, company => company.id)
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @ManyToOne(() => Conversation, conversation => conversation.summaries)
  @JoinColumn({ name: 'conversation_id' })
  conversation: Conversation;
}