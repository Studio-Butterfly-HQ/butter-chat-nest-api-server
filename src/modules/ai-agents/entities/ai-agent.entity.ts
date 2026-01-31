import { MetaData } from "src/common/entity/meta-data";
import { Company } from "src/modules/company/entities/company.entity";
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
    Index
} from "typeorm";

@Entity("ai_agents")
export class AiAgent extends MetaData {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ type: "varchar", length: 255 })
    agent_name: string;

    @Column({ type: "text" })
    personality: string;

    @Column({ type: "text" })
    general_instructions: string;

    @Column({ type: "varchar", length: 500, nullable: true })
    avatar?: string;

    @Column({ type: "varchar", length: 255 })
    choice_when_unable?: string;

    @Column({ type: "text" })
    conversation_pass_instructions?: string;

    @Column({ type: "varchar", length: 50 })
    auto_tranfer?: string;

    @Column({ type: "text" })
    transfer_connecting_message?: string;

    @Column({ type: "uuid" })
    @Index()
    company_id: string;

    @ManyToOne(() => Company, (company) => company.ai_agents, {
        onDelete: "CASCADE",
        nullable: false
    })
    @JoinColumn({ name: "company_id" })
    company: Company;
}