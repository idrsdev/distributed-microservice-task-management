import { Body, Controller, Get, Post, Put } from '@nestjs/common';
import { UserService } from './users.service';
import { CreateUserDto, UpdateUserDto } from './user.dto';
import { GetUserId } from '../decorators';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async createUser(@Body() createUserDto: CreateUserDto) {
    return this.userService.createUser(createUserDto);
  }

  @Get(':userId')
  async getUserProfile(@GetUserId() userId: string) {
    return this.userService.getUser(userId);
  }

  @Get(':userId/email')
  async getUserEmail(@GetUserId() userId: string) {
    return this.userService.getUserEmail(userId);
  }

  @Post('emails')
  async getUserEmails(@Body() userIds: string[]) {
    return this.userService.getUserEmails(userIds);
  }

  @Put(':userId')
  async updateUserProfile(
    @GetUserId() userId: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.userService.updateUser(userId, updateUserDto);
  }
}
