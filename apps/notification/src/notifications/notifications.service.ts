// notification.service.ts
import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  NotificationSender,
  SendEmailNotificationI,
} from './notification.sender';
import { ClientProxy } from '@nestjs/microservices';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);
  private readonly tasksServiceUrl: string;
  private readonly userServiceUrl: string;

  constructor(
    private readonly notificationSender: NotificationSender,
    @Inject('RabbitMQNotificationQueue')
    private notificationQueue: ClientProxy,
    private readonly configService: ConfigService,
  ) {
    this.tasksServiceUrl = this.configService.get('TASKS_MICROSERVICE_URL');
    this.userServiceUrl = this.configService.get('USER_MICROSERVICE_URL');
  }

  async sendTaskAssignmentNotification(
    taskId: string,
    userId: string,
  ): Promise<void> {
    this.logger.log(
      `Sending task assignment notification for task ${taskId} to user ${userId}`,
    );

    // Retrieve user's email address from the user service
    const email = await this.getUserEmail(userId);

    // Implement logic to construct the assignment notification message
    const content = `Sent Twice! Once From Email! Once From Queue! \n  Oops Task ${taskId} assigned to user ${userId}`;

    // Just One message for POC
    const notification: SendEmailNotificationI = {
      recipient: email,
      subject: 'Task Assignment',
      content,
    };

    this.notificationQueue.send('TaskAssignmentNotification', notification);

    this.notificationSender.sendEmailNotification(notification);
  }

  async sendTaskUpdateNotification(taskId: string): Promise<void> {
    // Retrieve the list of user IDs from the Tasks microservice
    const userIds = await this.getTaskAssignedUserIds(taskId);

    // Retrieve the emails for the user IDs from the User microservice
    const emails = await this.getUserEmails(userIds);

    // Implement logic to construct the update notification message
    const content = `Task ${taskId} has been updated`;

    emails.forEach((email) =>
      this.notificationSender.sendEmailNotification({
        recipient: email,
        subject: 'Task Update',
        content,
      }),
    );
  }

  async sendTaskReminderNotification(taskId: string): Promise<void> {
    // Retrieve the list of user IDs from the Tasks microservice
    const userIds = await this.getTaskAssignedUserIds(taskId);

    // Retrieve the emails for the user IDs from the User microservice
    const emails = await this.getUserEmails(userIds);

    // Implement logic to construct the reminder notification message
    const content = `Reminder: Task ${taskId} is due soon`;

    emails.forEach((email) =>
      this.notificationSender.sendEmailNotification({
        recipient: email,
        subject: 'Task Reminder',
        content,
      }),
    );
  }

  private async getUserEmail(userId: string): Promise<string> {
    const response = await axios.get(
      `${this.userServiceUrl}/users/${userId}/email`,
    );
    return response.data.email;
  }

  private async getTaskAssignedUserIds(taskId: string): Promise<string[]> {
    const response = await axios.get(
      `${this.tasksServiceUrl}/tasks/${taskId}/assigned-users`,
    );
    return response.data.userIds;
  }

  private async getUserEmails(userIds: string[]): Promise<string[]> {
    const response = await axios.post(`${this.userServiceUrl}/users/emails`, {
      userIds,
    });
    return response.data.emails;
  }
}
