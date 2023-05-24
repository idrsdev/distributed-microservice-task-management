import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface User {
  username: string;
  _id: string;
}

export const GetUserId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    const user: User = request.user;
    return user._id;
  },
);
