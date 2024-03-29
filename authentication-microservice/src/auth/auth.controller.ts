import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Req,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/createUser.dto';
import { LoginUserDto } from './dto/loginUser.dto';
import { Request } from 'express';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User successfully registered' })
  @Post('register')
  async register(
    @Body() createUserDto: CreateUserDto,
    @Req() req: Request,
  ): Promise<void> {
    await this.authService.create(createUserDto, req);
  }

  @ApiOperation({ summary: 'Authenticate user' })
  @ApiResponse({
    status: 200,
    description: 'User successfully authenticated',
  })
  @Post('login')
  async login(@Body() loginUserDto: LoginUserDto): Promise<{ token: string }> {
    return this.authService.login(loginUserDto);
  }

  @ApiOperation({ summary: 'Verify user account' })
  @ApiResponse({
    status: 200,
    description: 'User account successfully verified',
  })
  @Get('verify/:email/:token')
  async verifyUser(
    @Param('email') email: string,
    @Param('token') token: string,
  ): Promise<void> {
    await this.authService.verifyUser(email, token);
  }

  @ApiOperation({ summary: 'Resend activation link' })
  @ApiResponse({
    status: 202,
    description: 'Activation link queued for sending',
  })
  @Post('resend-activation-link')
  async resendActivationLink(
    @Body('email') email: string,
    @Req() req: Request,
  ): Promise<void> {
    await this.authService.resendActivationLink(email, req);
  }

  @ApiOperation({ summary: 'Get user information' })
  @ApiResponse({
    status: 200,
    description: 'User information successfully retrieved',
  })
  @Get('users/:userId')
  async getUser(@Param('userId') userId: string) {
    const user = await this.authService.findUserById(userId);
    if (!user) {
      return null;
    }

    return {
      _id: user._id,
      isVerified: user.isVerified,
      roles: user.roles,
    };
  }
}
