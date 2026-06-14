import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import * as fs from 'fs/promises'
import * as path from 'path'

@Injectable()
export class MediaStorageService {
  private readonly logger = new Logger(MediaStorageService.name)
  private readonly baseStorageDir: string

  constructor(private readonly config: ConfigService) {
    // Determine static directory path (supports configuration via environment variables)
    // Default to resolving 'apps/api/public'
    const publicPath = this.config.get<string>('MEDIA_PUBLIC_DIR') || 'public'
    this.baseStorageDir = path.isAbsolute(publicPath)
      ? publicPath
      : path.join(process.cwd(), publicPath)
  }

  /**
   * Initializes target storage directories on bootstrap.
   */
  async onModuleInit() {
    try {
      await fs.mkdir(path.join(this.baseStorageDir, 'media', 'originals'), { recursive: true })
      await fs.mkdir(path.join(this.baseStorageDir, 'media', 'assets'), { recursive: true })
      this.logger.log(`📁 Media storage directories initialized successfully at: ${this.baseStorageDir}`)
    } catch (err: any) {
      this.logger.error(`❌ Failed to initialize media storage directory: ${err.message}`)
    }
  }

  /**
   * Returns the physical path to save/read the pristine raw original file.
   */
  getOriginalPhysicalPath(assetId: string): string {
    return path.join(this.baseStorageDir, 'media', 'originals', `${assetId}.bin`)
  }

  /**
   * Returns the physical path to save/read a specific variant.
   */
  getVariantPhysicalPath(assetId: string, role: string, format: string): string {
    return path.join(
      this.baseStorageDir,
      'media',
      'assets',
      assetId,
      `${role.toLowerCase()}.${format.toLowerCase()}`
    )
  }

  /**
   * Returns the public, browser-servable URL for a variant.
   * Ex: '/public/media/assets/cmppcbxyj000esb4ptcdkgc2t/cover_sm.webp'
   */
  getVariantPublicUrl(assetId: string, role: string, format: string): string {
    return `/public/media/assets/${assetId}/${role.toLowerCase()}.${format.toLowerCase()}`
  }

  /**
   * Idempotently checks if the pristine raw original file exists locally on disk.
   */
  async originalExists(assetId: string): Promise<boolean> {
    const originalPath = this.getOriginalPhysicalPath(assetId)
    try {
      await fs.access(originalPath)
      return true
    } catch {
      return false
    }
  }

  /**
   * Saves a raw buffer as the pristine master original binary for a media asset.
   */
  async saveOriginal(assetId: string, buffer: Buffer): Promise<string> {
    const originalPath = this.getOriginalPhysicalPath(assetId)
    await fs.writeFile(originalPath, buffer)
    this.logger.debug(`💾 Saved master original asset: originals/${assetId}.bin`)
    return originalPath
  }

  /**
   * Saves an optimized variant image buffer to its canonical folder location.
   */
  async saveVariant(
    assetId: string,
    role: string,
    format: string,
    buffer: Buffer
  ): Promise<string> {
    const physicalPath = this.getVariantPhysicalPath(assetId, role, format)
    const parentDir = path.dirname(physicalPath)

    // Ensure asset sub-folder exists
    await fs.mkdir(parentDir, { recursive: true })
    await fs.writeFile(physicalPath, buffer)

    this.logger.debug(`💾 Saved optimized variant: assets/${assetId}/${role.toLowerCase()}.${format}`)
    return this.getVariantPublicUrl(assetId, role, format)
  }

  /**
   * Reads the raw preserved original binary from disk.
   */
  async readOriginal(assetId: string): Promise<Buffer> {
    const originalPath = this.getOriginalPhysicalPath(assetId)
    return await fs.readFile(originalPath)
  }
}
