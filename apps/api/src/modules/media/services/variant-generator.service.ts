import { Injectable, Logger } from '@nestjs/common'
import sharp from 'sharp'
import { MediaRole } from '@prisma/client'

@Injectable()
export class VariantGeneratorService {
  private readonly logger = new Logger(VariantGeneratorService.name)

  // Strict aspect ratios and sizing rules to maintain cinematic alignment
  private readonly variantConfigs: Record<MediaRole, { width: number; height: number }> = {
    [MediaRole.COVER_SM]: { width: 120, height: 180 }, // Aspect 2:3
    [MediaRole.COVER_MD]: { width: 240, height: 360 }, // Aspect 2:3
    [MediaRole.COVER_LG]: { width: 480, height: 720 }, // Aspect 2:3
    [MediaRole.BACKDROP_HERO]: { width: 1920, height: 1080 }, // Aspect 16:9
    [MediaRole.GALLERY_HD]: { width: 1280, height: 720 }, // Aspect 16:9
    [MediaRole.THUMBNAIL_BLUR]: { width: 64, height: 64 }, // Aspect 1:1

    // Fallbacks for other possible roles
    [MediaRole.AVATAR_SM]: { width: 48, height: 48 },
    [MediaRole.AVATAR_MD]: { width: 96, height: 96 },
    [MediaRole.LOGO_TRANSPARENT]: { width: 512, height: 512 },
  }

  /**
   * Transforms a pristine master image buffer into a specific optimized cinematic variant.
   */
  async generateVariant(
    buffer: Buffer,
    role: MediaRole,
    format: 'webp' | 'avif',
  ): Promise<{ data: Buffer; width: number; height: number }> {
    const config = this.variantConfigs[role]
    if (!config) {
      throw new Error(`Unsupported MediaRole for variant generation: ${role}`)
    }

    try {
      let pipeline = sharp(buffer)
        .resize(config.width, config.height, {
          fit: 'cover',
          position: 'centre', // Enforce center-cropped visual alignment
        })
        .keepMetadata() // HDR-aware hook: preserve ICC profiles and color space to prevent color shift

      // Apply format and compression settings dynamically
      if (format === 'avif') {
        pipeline = pipeline.avif({ quality: 80, effort: 4 })
      } else {
        pipeline = pipeline.webp({ quality: 80, effort: 4 })
      }

      const { data, info } = await pipeline.toBuffer({ resolveWithObject: true })

      return {
        data,
        width: info.width,
        height: info.height,
      }
    } catch (err: any) {
      this.logger.error(`❌ Failed to transform variant [${role} | ${format}]: ${err.message}`)
      throw new Error(`Sharp variant conversion failed: ${err.message}`)
    }
  }
}
