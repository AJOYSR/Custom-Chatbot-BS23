import * as dotenv from "dotenv";
dotenv.config();
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import { ExcludeEmbeddingInterceptor } from "./common/pipes/exclude-embedding.pipe";
import { SwaggerConfig } from "./internal/swagger.init";
import { connect as connectToDatabase } from "./internal/connect-to-db";

async function bootstrap() {
  // Connect to the database
  await connectToDatabase();
  // Connect to MongoDB
  // const mongoUri = process.env.MONGODB_URI;
  // await mongoose.connect(mongoUri);

  // mongoose.connection.on("error", (err) => {
  //   console.error("MongoDB connection error:", err);
  // });

  // mongoose.connection.on("disconnected", () => {
  //   console.log("MongoDB disconnected");
  // });

  // Create a new Nest application instance
  const app = await NestFactory.create(AppModule);

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    })
  );

  // Global interceptor to exclude embedding field
  app.useGlobalInterceptors(new ExcludeEmbeddingInterceptor());

  // Swagger setup
  SwaggerConfig(app);

  const port = process.env.PORT || 4040;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
}
bootstrap();
