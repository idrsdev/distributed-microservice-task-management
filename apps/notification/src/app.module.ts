import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule } from '@nestjs/config/dist';
import { NotificationsModule } from './notifications/notifications.module';
import { AppService } from './app.service';

@Module({
  imports: [ConfigModule.forRoot(), NotificationsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
