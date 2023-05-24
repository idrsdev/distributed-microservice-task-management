import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  Inject,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './task.dto';
import { UpdateTaskDto } from './task.dto';
import { TaskModel } from './task.model';
import { ClientProxy } from '@nestjs/microservices';
import { NotificationType } from './tasks.enum';
import { GetUserId } from '../decorators';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('tasks')
@Controller('tasks')
export class TasksController {
  constructor(
    private tasksService: TasksService,
    @Inject('NOTIFICATION_QUEUE') private notificationQueue: ClientProxy,
  ) {}

  @Get()
  getAllTasks(
    @GetUserId() userId: string,
    @Query('status') status: string,
  ): Promise<TaskModel[]> {
    if (userId) {
      return this.tasksService.getTasksByUser(userId);
    }
    if (status) {
      return this.tasksService.getTasksByStatus(status);
    }
    return this.tasksService.getAllTasks();
  }

  @Get(':id')
  async getTaskById(@Param('id') id: string): Promise<TaskModel> {
    return await this.tasksService.getTaskById(id);
  }

  @Post()
  async createTask(@Body() createTaskDto: CreateTaskDto): Promise<TaskModel> {
    return await this.tasksService.createTask(createTaskDto);
  }

  @Put(':id')
  async updateTask(
    @Param('id') id: string,
    @GetUserId() userId: string,
    @Body() updateTaskDto: UpdateTaskDto,
  ): Promise<TaskModel> {
    const task = await this.tasksService.updateTask(id, {
      ...updateTaskDto,
      updatedBy: userId,
    });

    // Publish message to RabbitMQ queue for further processing
    this.notificationQueue.send(NotificationType.TaskUpdated, {
      taskId: task._id,
      payload: updateTaskDto,
    });

    return task;
  }

  @Delete(':id')
  deleteTask(@Param('id') id: string): Promise<void> {
    this.tasksService.deleteTask(id);
    return;
  }

  @Post(':id/assign')
  async assignTaskToUser(
    @Param('id') id: string,
    @GetUserId() userId: string,
  ): Promise<void> {
    const task = await this.tasksService.assignTaskToUser(id, userId);

    // Publish message to RabbitMQ queue for further processing
    this.notificationQueue.send(NotificationType.TaskAssigned, {
      taskId: task._id,
      payload: CreateTaskDto,
    });
  }

  @Get(':id/assigned-users')
  async getTaskAssignedUserIds(@Param('id') id: string): Promise<string[]> {
    return this.tasksService.getTaskAssignedUserIds(id);
  }
}
