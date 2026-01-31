import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiAgentsService } from './ai-agents.service';
import { AiAgentsController } from './ai-agents.controller';
import { AiAgentsRepository } from './ai-agents.repository';
import { AiAgent } from './entities/ai-agent.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([AiAgent])
  ],
  controllers: [AiAgentsController],
  providers: [AiAgentsService, AiAgentsRepository],
  exports: [AiAgentsService, AiAgentsRepository]
})
export class AiAgentsModule {}