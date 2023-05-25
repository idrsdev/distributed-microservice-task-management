import { Controller, Get, Post, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Controller()
export class GatewayController {
  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
  ) {}

  @Get('*')
  @Post('*')
  async forwardRequest(@Req() request: Request, @Res() response: Response) {
    const subdomain = this.extractSubdomain(request);
    const microserviceUrl = this.constructMicroserviceUrl(subdomain);

    try {
      const axiosResponse = await firstValueFrom(
        this.httpService.request({
          method: request.method,
          url: `${microserviceUrl}${request.url}`,
          headers: request.headers,
          data: request.body,
        }),
      );

      return response.status(axiosResponse.status).json(axiosResponse.data);
    } catch (error) {
      const status = error.response?.status || 500;
      const message = error.response?.data || 'Internal Server Error';

      return response.status(status).json(message);
    }
  }

  private extractSubdomain(request: Request): string {
    const subdomain = request.headers.host?.split('.')[0];
    return subdomain;
  }

  private constructMicroserviceUrl(subdomain: string): string {
    const microserviceUrl = this.configService.get<string>(
      `${subdomain.toUpperCase()}_MICROSERVICE_URL`,
    );
    return microserviceUrl;
  }
}

/*
  @NOTE
  If you want to forward the request and immediately return the first response from the microservice,
  you can use firstValueFrom. If you want to wait for the microservice to complete processing and
  return the last response, you can use lastValueFrom.

  For example, if you have multiple instances of a microservice processing the request and you want
  to aggregate the responses, you might use lastValueFrom. On the other hand, if you have a scenario
  where the first microservice to respond should be considered, you can use firstValueFrom.
*/
