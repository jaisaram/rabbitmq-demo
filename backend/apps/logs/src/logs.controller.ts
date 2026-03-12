import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload, Ctx, RmqContext } from '@nestjs/microservices';

@Controller()
export class LogsController {
  private readonly logger = new Logger(LogsController.name);

  @MessagePattern('log_event')
  getLog(@Payload() data: any, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();
    const correlationId = originalMsg.properties.headers['x-correlation-id'];

    this.logger.log({
      message: 'Log event received via RabbitMQ',
      data,
      correlationId,
    });
  }
}
