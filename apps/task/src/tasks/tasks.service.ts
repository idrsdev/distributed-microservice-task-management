import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TaskModel } from './task.model';
import { CreateTaskDto, UpdateTaskDto } from './task.dto';

@Injectable()
export class TasksService {
  constructor(
    @InjectModel(TaskModel.name) private taskModel: Model<TaskModel>,
  ) {}

  async createTask(createTaskDto: CreateTaskDto): Promise<TaskModel> {
    const task = new this.taskModel(createTaskDto);
    return task.save();
  }

  async getAllTasks(): Promise<TaskModel[]> {
    return this.taskModel.find().exec();
  }

  async getTaskById(taskId: string): Promise<TaskModel> {
    const task = await this.taskModel.findById(taskId).exec();
    if (!task) {
      throw new NotFoundException(`Task with ID ${taskId} not found`);
    }
    return task;
  }

  async updateTask(
    taskId: string,
    updateTaskDto: UpdateTaskDto,
  ): Promise<TaskModel> {
    const task = this.taskModel
      .findByIdAndUpdate(taskId, updateTaskDto, { new: true })
      .exec();

    if (!task) {
      throw new NotFoundException(`Task with ID ${taskId} not found`);
    }
    return task;
  }

  async deleteTask(taskId: string): Promise<void> {
    this.taskModel.deleteOne({ _id: taskId }).exec();
    return;
  }

  async assignTaskToUser(taskId: string, userId: string): Promise<TaskModel> {
    const task = await this.taskModel
      .findByIdAndUpdate(taskId, { assignedTo: userId })
      .exec();
    if (!task) {
      throw new NotFoundException(`Task with ID ${taskId} not found`);
    }
    return task;
  }

  async getTasksByUser(userId: string): Promise<TaskModel[]> {
    return this.taskModel.find({ assignedTo: userId }).exec();
  }

  async getTasksByStatus(status: string): Promise<TaskModel[]> {
    return this.taskModel.find({ status }).exec();
  }

  async getTaskAssignedUserIds(taskId: string): Promise<string[]> {
    const task = await this.taskModel.findById(taskId).exec();
    if (!task) {
      throw new NotFoundException(`Task with ID ${taskId} not found`);
    }
    return task.assignedTo || [];
  }
}
