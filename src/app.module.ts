import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";
import { DatabaseModule } from "./modules/database/database.module";
import { UserModule } from "./modules/user/user.module";

import { MessageModule } from "./modules/message/message.module";
import { ConversationModule } from "./modules/conversation/conversation.module";
import { BotModule } from "./modules/bot/bot.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
    }),
    MongooseModule.forRoot(process.env.MONGODB_URI),
    DatabaseModule,
    UserModule,
    MessageModule,
    ConversationModule,
    MessageModule,
    ConversationModule,
    BotModule,
    UserModule,
  ],
})
export class AppModule {}
