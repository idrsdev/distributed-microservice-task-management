import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TaskModel, TaskModelSchema } from './task.model';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: 'apps/task/.env',
    }),
    MongooseModule.forFeature([
      { name: TaskModel.name, schema: TaskModelSchema },
    ]),
  ],
  controllers: [TasksController],
  providers: [
    TasksService,
    {
      provide: 'NOTIFICATION_QUEUE',
      useFactory: (configService: ConfigService) => {
        const user = configService.get('RABBITMQ_USER');
        const password = configService.get('RABBITMQ_PASSWORD');
        const host = configService.get('RABBITMQ_HOST');
        const notificationQueue = configService.get('NOTIFICATION_QUEUE');

        return ClientProxyFactory.create({
          transport: Transport.RMQ,
          options: {
            urls: [`amqp://${user}:${password}@${host}`],
            queue: notificationQueue,
            noAck: false,
            queueOptions: {
              durable: true,
            },
          },
        });
      },
      inject: [ConfigService],
    },
  ],
})
export class TasksModule {}
