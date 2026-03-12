import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { v4 as uuidv4 } from 'uuid';
import Redis from 'ioredis';

@Injectable()
export class BatchService {
    private redis: Redis;

    constructor(
        @Inject('QUEUE_SERVICE') private readonly client: ClientProxy,
    ) {
        this.redis = new Redis({
            host: process.env.REDIS_HOST || 'localhost',
            port: parseInt(process.env.REDIS_PORT || '6379', 10),
        });
    }

    async createJob(tenantId: string, recordCount: number, jobType: string) {
        const jobId = uuidv4();
        const jobKey = `job:${jobId}`;

        // Store job metadata in Redis Hash
        await this.redis.hset(jobKey, {
            jobId,
            tenantId,
            totalCount: recordCount.toString(),
            processedCount: '0',
            status: 'pending',
            jobType,
            createdAt: new Date().toISOString(),
        });

        // Expire after 24 hours
        await this.redis.expire(jobKey, 86400);

        // Chunk the work - higher chunk size for large datasets
        const chunkSize = 5000;
        const totalChunks = Math.ceil(recordCount / chunkSize);

        console.log(`[Batch] Initialized Job ${jobId} | ${recordCount} records | ${totalChunks} chunks`);

        for (let i = 0; i < totalChunks; i++) {
            const start = i * chunkSize;
            const count = Math.min(chunkSize, recordCount - start);

            this.client.emit('process_chunk', {
                jobId,
                tenantId,
                start,
                count,
                isLast: i === totalChunks - 1
            });
        }

        return { jobId, status: 'started' };
    }

    async processChunk(data: { jobId: string; tenantId: string; start: number; count: number; isLast: boolean }) {
        const jobKey = `job:${data.jobId}`;

        // Atomic increment of processed count
        const newCount = await this.redis.hincrby(jobKey, 'processedCount', data.count);

        // Get total count once for verification
        const totalStr = await this.redis.hget(jobKey, 'totalCount');
        if (!totalStr) return;

        const total = parseInt(totalStr, 10);

        if (newCount >= total) {
            await this.redis.hset(jobKey, 'status', 'completed');
            console.log(`[Batch] Job ${data.jobId} fully completed. Total: ${newCount}/${total}`);
        } else if (newCount > 0) {
            await this.redis.hset(jobKey, 'status', 'processing');
        }
    }

    async getJobStatus(jobId: string) {
        const jobKey = `job:${jobId}`;
        const job = await this.redis.hgetall(jobKey);

        if (!job || Object.keys(job).length === 0) {
            return { jobId, status: 'not_found' };
        }

        const processed = parseInt(job.processedCount || '0', 10);
        const total = parseInt(job.totalCount || '0', 10);

        return {
            jobId,
            status: job.status,
            processedCount: processed,
            totalCount: total,
            percentage: total > 0 ? (processed / total) * 100 : 0,
        };
    }
}
