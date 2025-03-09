import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import {
	UnresolvedQueryModel,
	UnresolvedQuerySchema,
} from "./entities/unresolved-message.model";
import { UnresolvedQueryService } from "./unresolved-message.service";
import { UnresolvedQueryRepository } from "./unresolved-message.repository";
import { UnresolvedQueryController } from "./unresolved-message.controller";

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: UnresolvedQueryModel.name, schema: UnresolvedQuerySchema },
		]),
	],
	controllers: [UnresolvedQueryController],
	providers: [UnresolvedQueryService, UnresolvedQueryRepository],
	exports: [UnresolvedQueryService],
})
export class UnresolvedQueryModule {}
