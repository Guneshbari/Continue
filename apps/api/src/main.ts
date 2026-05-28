import { NestFactory } from '@nestjs/core'
import {
  FastifyAdapter,
  type NestFastifyApplication,
} from '@nestjs/platform-fastify'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { ValidationPipe, VersioningType } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import fastifyHelmet from '@fastify/helmet'
import fastifyCors from '@fastify/cors'
import { AppModule } from './app.module'
import { HttpExceptionFilter } from './common/filters/http-exception.filter'

function parseCorsOrigins(value?: string): string[] {
  return (value ?? 'http://localhost:3000')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)
}

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ logger: true }),
  )
  const configService = app.get(ConfigService)
  const corsOrigins = parseCorsOrigins(configService.get<string>('CORS_ORIGINS'))

  await app.register(fastifyCors, {
    origin: corsOrigins,
    credentials: true,
  })

  await app.register(fastifyHelmet, {
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        imgSrc: ["'self'", 'data:', 'https://images.igdb.com', 'https:'],
        connectSrc: ["'self'"],
        frameSrc: ["'none'"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: [],
      },
    },
  })

  app.setGlobalPrefix('api')
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' })

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: false },
    }),
  )
  app.useGlobalFilters(new HttpExceptionFilter())

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

  const port = configService.get<number>('API_PORT') ?? 3001
  await app.listen(port, '0.0.0.0')
  console.log(`API running on: http://localhost:${port}`)
  if (process.env.NODE_ENV !== 'production') {
    console.log(`Swagger docs: http://localhost:${port}/api/docs`)
  }

  if (configService.get<string>('AUTO_SEED_DATABASE') === 'true') {
    try {
      const { PrismaService } = await import('./common/prisma/prisma.service.js')
      const { autoSeedDatabase } = await import('./common/seed.js')
      const prisma = app.get(PrismaService)
      await autoSeedDatabase(prisma)
    } catch (err) {
      console.error('Failed to run auto-seed on startup:', err)
    }
  }

  if (configService.get<string>('ENABLE_FIXTURE_MODE') === 'true') {
    const nodeEnv = configService.get<string>('NODE_ENV')
    if (nodeEnv === 'production') {
      console.error('❌ CRITICAL WARNING: Fixture mode is enabled but NODE_ENV is set to "production". Hard-blocking fixture bootstrapping for safety!')
    } else {
      console.log('🎮 Fixture mode is enabled. Bootstrapping canonical datasets...')
      try {
        const { FixtureLoaderService } = await import('./modules/fixtures/fixture-loader.service.js')
        const loader = app.get(FixtureLoaderService)
        await loader.load()
        console.log('✅ Game fixtures loaded successfully on startup.')
      } catch (err) {
        console.error('Failed to load game fixtures on startup:', err)
      }
    }
  }
}

void bootstrap()
