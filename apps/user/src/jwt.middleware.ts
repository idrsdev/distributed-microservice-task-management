import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NextFunction, Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';

import { User } from './decorators';

interface AuthenticatedRequest extends Request {
  user: User;
}

@Injectable()
export class JwtMiddleware implements NestMiddleware {
  constructor(private readonly configService: ConfigService) {}

  use(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (token) {
      try {
        const secretKey = this.configService.get<string>('JWT_SECRET');
        const decoded = jwt.verify(token, secretKey) as User;
        req.user = decoded;
      } catch (error) {
        throw new UnauthorizedException('Invalid token');
      }
    }

    next();
  }
}
