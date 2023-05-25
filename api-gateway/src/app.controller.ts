import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get('Ping')
  ping(): string {
    return 'Pong!';
  }
}
