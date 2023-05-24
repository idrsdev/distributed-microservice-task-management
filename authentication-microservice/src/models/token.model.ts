import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SchemaTypes, Types } from 'mongoose';

@Schema()
export class TokenModel {
  _id: Types.ObjectId;

  @Prop({ type: SchemaTypes.ObjectId, required: true, ref: 'User' })
  userId: string;

  @Prop({ type: SchemaTypes.String, required: true })
  token: string;

  @Prop({ type: SchemaTypes.Date, default: Date.now })
  expireAt: Date;
}

export const TokenModelSchema = SchemaFactory.createForClass(TokenModel);
