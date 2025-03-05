import { ConfigService } from "@nestjs/config";
import { config } from "dotenv";
import { DataSource } from "typeorm";

config();

const configService = new ConfigService();

export default new DataSource({
  type: "mongodb",
  url: configService.get("MONGODB_URI"),
  database: configService.get("MONGODB_DATABASE"),
  entities: ["src/**/*.entity.ts"],
  migrations: ["src/migrations/*.ts"],
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
