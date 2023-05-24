export enum NotificationType {
  TaskUpdated = 'taskUpdated',
  TaskAssigned = 'taskAssigned',
}

export interface TaskAssignmentPayload {
  taskId: string;
  userId: string;
}

export interface TaskUpdatePayload {
  taskId: string;
}

export interface TaskReminderPayload {
  taskId: string;
}
