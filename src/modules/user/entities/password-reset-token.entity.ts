// src/modules/user/entities/password-reset-token.entity.ts
import { 
  Entity, 
  Column, 
  PrimaryGeneratedColumn, 
  ManyToOne, 
  JoinColumn, 
  CreateDateColumn, 
  Index 
} from 'typeorm';
import { User } from './user.entity';

@Entity('password_reset_tokens')
@Index(['user_id'])
@Index(['expires_at'])
export class PasswordResetToken {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  user_id: string;

  @Column({ length: 255 })
  token: string;

  @Column({ type: 'timestamp' })
  expires_at: Date;

  @Column({ default: false })
  used: boolean;

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}