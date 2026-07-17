import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  const origins = (process.env.CORS_ORIGINS ?? 'http://localhost:3718,http://localhost:3719').split(',');
  app.enableCors({ origin: origins, credentials: true });

  const swaggerConfig = new DocumentBuilder().setTitle('AIStock API').setDescription('上市公司知识图鉴前后台共用接口').setVersion('0.1.0').addBearerAuth().build();
  SwaggerModule.setup('docs', app, SwaggerModule.createDocument(app, swaggerConfig));

  const port = Number(process.env.PORT ?? 3717);
  await app.listen(port);
  console.log(`AIStock API is running at http://localhost:${port}/api`);
}

void bootstrap();
