import { MessagePattern, Payload } from '@nestjs/microservices';
import {
  NotificationSender,
  SendEmailNotificationI,
} from './notification.sender';
import { Injectable } from '@nestjs/common';

@Injectable()
export class NotificationConsumer {
  constructor(private readonly notificationSender: NotificationSender) {}

  // TODO: Confirm if this can be called from services
  @MessagePattern('TaskAssignmentNotification')
  async handleTaskAssignmentNotification(
    @Payload() payload: SendEmailNotificationI,
  ) {
    // Handle the TaskAssignmentNotification message here
    // ...
    // Call the notificationSender to send the email notification
    this.notificationSender.sendEmailNotification(payload);
  }
}
