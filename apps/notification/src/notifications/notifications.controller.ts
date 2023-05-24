import { Controller } from '@nestjs/common';
import { NotificationService } from './notifications.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import {
  NotificationType,
  TaskAssignmentPayload,
  TaskReminderPayload,
  TaskUpdatePayload,
} from './notification.enum';

@Controller()
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @MessagePattern(NotificationType.TaskAssigned)
  async handleTaskAssignmentNotification(
    @Payload() payload: TaskAssignmentPayload,
  ) {
    const { taskId, userId } = payload;
    await this.notificationService.sendTaskAssignmentNotification(
      taskId,
      userId,
    );
  }

  @MessagePattern(NotificationType.TaskUpdated)
  async handleTaskUpdateNotification(@Payload() payload: TaskUpdatePayload) {
    const { taskId } = payload;
    await this.notificationService.sendTaskUpdateNotification(taskId);
  }

  // It will be a cron Job, Maybe inside Tasks App
  // @Cron('0 0 * * *') // Run every day at midnight
  // async sendTaskReminderNotification() {
  //   const tasks = await this.taskService.getTasksForReminder();
  //   tasks.forEach((task) => {
  //     this.notificationService.sendTaskReminderNotification(task.taskId);
  //   });
  // }
}
