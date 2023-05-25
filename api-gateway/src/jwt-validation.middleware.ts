import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { JwtService } from '@nestjs/jwt';
import axios from 'axios';

@Injectable()
export class JwtValidationMiddleware implements NestMiddleware {
  constructor(private readonly jwtService: JwtService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers['authorization'];
    const subdomain = req.headers.host?.split('.')[0];

    // Skip authentication check for 'auth' subdomain
    if (subdomain === 'auth') {
      next();
      return;
    }

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7); // Remove 'Bearer ' prefix
      try {
        const decoded = this.jwtService.verify(token);
        const user = await this.getUser(decoded._id);

        if (!user || !user.isVerified) {
          res.status(403).json({ message: 'User not found or not verified' });
          return;
        }

        req.headers['X-User-Id'] = user._id;
        req.headers['X-User-IsVerified'] = user.isVerified;
        req.headers['X-User-Roles'] = user.roles;
        next();
      } catch (error) {
        // Handle JWT validation error
        res.status(401).json({ message: 'Invalid token' });
      }
    } else {
      // No token or incorrect format
      res.status(401).json({ message: 'Missing or invalid token' });
    }
  }

  private async getUser(userId: string): Promise<User | null> {
    // Call authentication service to get the user information
    const getUserUrl = process.env.AUTH_MICROSERVICE_URL + `/users/${userId}`;
    const response = await axios.get(getUserUrl);
    return response.data;
  }
}

interface User {
  _id: string;
  isVerified: string;
  roles: string[];
}
