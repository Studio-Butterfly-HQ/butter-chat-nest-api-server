import { Module } from '@nestjs/common';
import { UserModule } from './modules/user/user.module';
import { DepartmentModule } from './modules/department/department.module';
import { CompanyModule } from './modules/company/company.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './modules/user/entities/user.entity';
import { Company } from './modules/company/entities/company.entity';
import { Department } from './modules/department/entities/department.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { UserDepartmentModule } from './modules/user-department/user-department.module';
import { UserDepartment } from './modules/user-department/entities/user-department.entity';
import { MailModule } from './modules/mail/mail.module';
import { PasswordResetToken } from './modules/user/entities/password-reset-token.entity';
import { FileHandleModule } from './modules/file-handle/file-handle.module';
import { MessengerFactoryModule } from './modules/messenger-factory/messenger-factory.module';
import { BullModule } from '@nestjs/bullmq';
import { MessengerBullMQProducerModule } from './modules/bullmq-consumer/bullmq-consumer.module';
import { Conversation } from './modules/messenger-factory/entities/coversation.entity';
import { Message } from './modules/messenger-factory/entities/message.entity';
import { ConversationTag } from './modules/messenger-factory/entities/conversation-tag.entity';
import { ConversationSummary } from './modules/messenger-factory/entities/conversation-summary.entity';
import { MetaBusinessModule } from './modules/meta_business_connection/meta-business.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { SocialConnection } from './modules/meta_business_connection/entity/social-connection.entity';
import { PendingUser } from './modules/user/entities/pending-user.entity';
import { ShiftModule } from './modules/shift/shift.module';
import { Shift } from './modules/shift/entities/shift.entity';

@Module({
  imports: [
     ConfigModule.forRoot({
      isGlobal:true,
     }),
      ServeStaticModule.forRoot({
        rootPath: join(__dirname, '..', 'public'),
        serveRoot: '/public',
      }),
     TypeOrmModule.forRootAsync({
      imports:[ConfigModule],
      useFactory:(configService: ConfigService)=>({
         type:'mysql',
         host:configService.get('DB_HOST'),
         port:+configService.get('DB_PORT'),
         username:configService.get('DB_USERNAME'),
         password:configService.get('DB_PASSWORD'),
         database:configService.get('DB_DATABASE'),
         entities:[
          Company,User,Department,UserDepartment,PasswordResetToken,
          Conversation,Message,ConversationTag,ConversationSummary,
          SocialConnection,PendingUser,Shift
        ],
        synchronize:true,
         //logging:true
      }),
      inject:[ConfigService]
     }),
    //  BullModule.forRoot({
    //   connection: {
    //     host: 'localhost',
    //     port: 6379,
    //   },
    // }),
     AuthModule,
     UserModule,
     DepartmentModule,
     CompanyModule,
     UserDepartmentModule,
     MailModule, 
     FileHandleModule,
     MessengerFactoryModule,
    //MessengerBullMQProducerModule,
    MetaBusinessModule,
    ShiftModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}