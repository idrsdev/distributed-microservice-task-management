import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SchemaTypes, Types } from 'mongoose';

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

@Schema()
export class UserModel {
  _id: Types.ObjectId;

  @Prop({ type: SchemaTypes.String, required: true })
  name: string;

  @Prop({ type: SchemaTypes.String, required: true, unique: true })
  email: string;

  @Prop({ type: SchemaTypes.String, required: true, select: false })
  password: string;

  @Prop({ default: false })
  isVerified: boolean;

  @Prop({ type: [SchemaTypes.String], default: [UserRole.USER] })
  roles: UserRole[];
}

export const UserModelSchema = SchemaFactory.createForClass(UserModel);
