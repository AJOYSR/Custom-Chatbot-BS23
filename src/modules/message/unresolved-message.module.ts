import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import {
  UnresolvedQueryModel,
  UnresolvedQuerySchema,
} from './entities/unresolved-message.model';
import { UnresolvedQueryService } from './unresolved-message.service';
import { UnresolvedQueryRepository } from './unresolved-message.repository';
import { UnresolvedQueryController } from './unresolved-message.controller';
import { APIResponse } from 'src/internal/api-response/api-response.service';
import { PaginationService } from '../pagination/pagination.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UnresolvedQueryModel.name, schema: UnresolvedQuerySchema },
    ]),
  ],
  controllers: [UnresolvedQueryController],
  providers: [
    UnresolvedQueryService,
    UnresolvedQueryRepository,
    APIResponse,
    PaginationService,
  ],
  exports: [UnresolvedQueryService],
})
export class UnresolvedQueryModule {}
