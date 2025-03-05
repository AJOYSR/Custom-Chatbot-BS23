import { Module } from "@nestjs/common";
import { VectorsController } from "./vectors.controller";
import { VectorsService } from "./vectors.service";
import { AIResponseService } from "src/modules/ai-response/ai-response.service";
import { PaginationService } from "../pagination/pagination.service";
import { APIResponse } from "src/internal/api-response/api-response.service";

@Module({
  controllers: [VectorsController],
  providers: [
    VectorsService,
    AIResponseService,
    PaginationService,
    APIResponse,
  ],
})
export class VectorsModule {}
