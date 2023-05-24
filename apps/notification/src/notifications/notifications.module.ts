// notification.module.ts
import { Module } from '@nestjs/common';
import { NotificationController } from './notifications.controller';
import { NotificationService } from './notifications.service';
import { NotificationSender } from './notification.sender';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';
import { NotificationConsumer } from './notification.consumer';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: 'apps/notification/.env',
    }),
  ],
  controllers: [NotificationController],
  providers: [
    NotificationService,
    NotificationSender,
    NotificationConsumer,
    {
      provide: 'RabbitMQNotificationQueue',
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
export class NotificationsModule {}
