import * as dotenv from "dotenv";
dotenv.config();
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import { ExcludeEmbeddingInterceptor } from "./common/pipes/exclude-embedding.pipe";
import { SwaggerConfig } from "./internal/swagger.init";
import { connect as connectToDatabase } from "./internal/connect-to-db";
import { I18nService } from "nestjs-i18n";
import { AllExceptionsFilter } from "./common/exception/all-exception-filter";

async function bootstrap() {
  // Connect to the database
  await connectToDatabase();

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

  // Initialize I18nModule and inject I18nService into AllExceptionsFilter
  const i18nService =
    app.get<I18nService<Record<string, unknown>>>(I18nService);
  app.useGlobalFilters(new AllExceptionsFilter(i18nService));

  const port = process.env.PORT || 4040;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
}
bootstrap();
