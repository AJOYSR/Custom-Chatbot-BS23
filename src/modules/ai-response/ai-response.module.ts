import { Module } from "@nestjs/common";
import { AIResponseService } from "./ai-response.service";

@Module({
	providers: [AIResponseService],
	exports: [AIResponseService],
})
export class AIResponseModule {}
