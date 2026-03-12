import { Controller } from '@nestjs/common';
import { GrpcMethod, EventPattern, Payload } from '@nestjs/microservices';
import { BatchService } from './batch.service';

@Controller()
export class BatchController {
    constructor(private readonly batchService: BatchService) { }

    @GrpcMethod('BatchService', 'ProcessBulkData')
    async processBulkData(data: { tenantId: string; recordCount: number; jobType: string }) {
        return this.batchService.createJob(data.tenantId, data.recordCount, data.jobType);
    }

    @GrpcMethod('BatchService', 'GetJobStatus')
    async getJobStatus(data: { jobId: string }) {
        return this.batchService.getJobStatus(data.jobId);
    }

    @EventPattern('process_chunk')
    async handleProcessChunk(@Payload() data: any) {
        await this.batchService.processChunk(data);
    }
}
