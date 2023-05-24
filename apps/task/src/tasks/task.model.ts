import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { SchemaTypes, Types } from 'mongoose';

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';

@Schema()
export class TaskModel {
  _id: Types.ObjectId;

  @Prop({ type: SchemaTypes.String, required: true })
  title: string;

  @Prop({ type: SchemaTypes.String, required: false })
  description: string;

  @Prop({ default: 'TODO' })
  status: TaskStatus;

  @Prop({ type: SchemaTypes.String, required: true, ref: 'User' })
  createdBy: string;

  @Prop({
    type: [{ type: SchemaTypes.ObjectId, ref: 'User' }],
    required: false,
  })
  assignedTo?: string[];

  @Prop({ type: SchemaTypes.ObjectId, required: false, ref: 'User' })
  updatedBy?: string;

  @Prop({ type: SchemaTypes.Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: SchemaTypes.Date, required: false })
  updatedAt?: Date;
  // You can add more fields and methods as needed
}

export const TaskModelSchema = SchemaFactory.createForClass(TaskModel);
