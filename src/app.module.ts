import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";
import { DatabaseModule } from "./modules/database/database.module";
import { UserModule } from "./modules/user/user.module";

import { MessageModule } from "./modules/message/message.module";
import { ConversationModule } from "./modules/conversation/conversation.module";
import { BotModule } from "./modules/bot/bot.module";
import { dbConfig } from "./config/database";
import { VectorsModule } from "./modules/vectors/vectors.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
    }),
    MongooseModule.forRoot(dbConfig.mongodb.URI),
    DatabaseModule,
    UserModule,
    MessageModule,
    ConversationModule,
    BotModule,
    VectorsModule,
  ],
})
export class AppModule {}
