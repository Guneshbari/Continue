import { Injectable, Logger } from '@nestjs/common'
import sharp from 'sharp'
import * as blurhash from 'blurhash'

@Injectable()
export class BlurPlaceholderService {
  private readonly logger = new Logger(BlurPlaceholderService.name)

  /**
   * Generates a deterministic BlurHash string and a tiny base64 WebP loading placeholder
   * from a raw original master buffer.
   */
  async generatePlaceholders(buffer: Buffer): Promise<{
    blurhashString: string
    tinyBase64Url: string
  }> {
    try {
      // 1. Generate standard BlurHash (requires raw RGBA pixels)
      const { data: pixelBuffer, info } = await sharp(buffer)
        .resize(32, 32, { fit: 'inside' })
        .ensureAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true })

      const blurhashString = blurhash.encode(
        new Uint8ClampedArray(pixelBuffer),
        info.width,
        info.height,
        4,
        4,
      )

      // 2. Generate tiny blurred low-res base64 image (WebP)
      const tinyBuffer = await sharp(buffer)
        .resize(16, 16, { fit: 'cover' })
        .blur(1) // soft blur
        .webp({ quality: 20 })
        .toBuffer()

      const tinyBase64Url = `data:image/webp;base64,${tinyBuffer.toString('base64')}`

      this.logger.debug(`✨ Generated BlurHash: "${blurhashString}" and tiny base64 placeholder.`)

      return {
        blurhashString,
        tinyBase64Url,
      }
    } catch (err: any) {
      this.logger.error(`⚠️ Failed to generate blur placeholders: ${err.message}`)
      // Graceful fallback
      return {
        blurhashString: 'L6PZ9jns.AY.-pAY00%y_Nj[t7t7', // default neutral gray blurhash fallback
        tinyBase64Url:
          'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', // 1x1 transparent gif fallback
      }
    }
  }
}
