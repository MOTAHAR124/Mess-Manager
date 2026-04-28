import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import type { NextFunction, Request, Response } from "express";
import { AppModule } from "./app.module";
import { AllExceptionsFilter } from "./common/filters/all-exceptions.filter";
import { ResponseInterceptor } from "./common/interceptors/response.interceptor";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use((req: Request, _res: Response, next: NextFunction) => {
    req.url = req.url.replace(/^\/api\/+api\/v1(?=\/|$)/, "/api/v1");
    next();
  });

  // Controllers are already versioned (e.g. /api/v1/auth), so only apply a
  // global prefix when it is explicitly configured.
  const apiPrefix = process.env.API_PREFIX?.trim();
  if (apiPrefix) {
    app.setGlobalPrefix(apiPrefix);
  }

  // CORS
  app.enableCors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
  });

  // Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global Error Filter
  app.useGlobalFilters(new AllExceptionsFilter());

  // Global Response Interceptor
  app.useGlobalInterceptors(new ResponseInterceptor());

  // Swagger Documentation
  if (process.env.NODE_ENV !== "production") {
    const config = new DocumentBuilder()
      .setTitle("MESO API")
      .setDescription("Mess Management System API Documentation")
      .setVersion("1.0")
      .addBearerAuth(
        {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
        "access-token",
      )
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup("api/docs", app, document);
  }

  const server = app.getHttpAdapter().getInstance();
  server.get("/", (_req: Request, res: Response) => {
    res.redirect("/api/docs");
  });
  server.get("/favicon.ico", (_req: Request, res: Response) => {
    res.status(204).send();
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);
  const baseUrl = apiPrefix
    ? `http://localhost:${port}/${apiPrefix}`
    : `http://localhost:${port}`;
  console.log(`MESO Backend running on ${baseUrl}`);
  if (process.env.NODE_ENV !== "production") {
    console.log(`Swagger docs: http://localhost:${port}/api/docs`);
  }
}

bootstrap().catch((error) => {
  console.error("Bootstrap error:", error);
  process.exit(1);
});
