import { NestFactory } from '@nestjs/core'
import {
  FastifyAdapter,
  type NestFastifyApplication,
} from '@nestjs/platform-fastify'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { ValidationPipe, VersioningType } from '@nestjs/common'
import fastifyHelmet from '@fastify/helmet'
import fastifyCors from '@fastify/cors'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ logger: true }),
  )

  // CORS — must be registered as a Fastify plugin (enableCors is Express-only)
  await app.register(fastifyCors, {
    origin: true,
    credentials: true,
  })

  // Security — after CORS so helmet doesn't block preflight
  await app.register(fastifyHelmet, {
    crossOriginResourcePolicy: false,
    contentSecurityPolicy: false,
  })

  // Global prefix + versioning
  app.setGlobalPrefix('api')
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' })

  // Global validation pipe — strict
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: false },
    }),
  )

  // Swagger — dev only
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Continue API')
      .setDescription('Continue platform REST API')
      .setVersion('1.0')
      .addBearerAuth()
      .build()
    const document = SwaggerModule.createDocument(app, config)
    SwaggerModule.setup('api/docs', app, document)
  }

  const port = process.env.API_PORT ?? 3001
  await app.listen(port, '0.0.0.0')
  console.log(`\n✅ API running on: http://localhost:${port}`)
  console.log(`📖 Swagger:        http://localhost:${port}/api/docs\n`)
}

void bootstrap()
