import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Metadata } from '@grpc/grpc-js';

@Injectable()
export class GrpcCorrelationInterceptor implements NestInterceptor {
  private readonly logger = new Logger(GrpcCorrelationInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    if (context.getType() === 'rpc') {
      const gRPCContext = context.switchToRpc();
      const metadata = gRPCContext.getContext() as Metadata;
      const correlationId = metadata.get('x-correlation-id')?.[0];

      if (correlationId) {
        this.logger.log(`Incoming gRPC request with correlation-id: ${correlationId}`);
      } else {
        this.logger.warn('Incoming gRPC request missing correlation-id');
      }
    }
    return next.handle();
  }
}
