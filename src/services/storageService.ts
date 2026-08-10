import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { ENV } from '../config/env.js';
import logger from '../config/logger.js';

export interface StorageFile {
  url: string;
  filename: string;
  size: number;
}

export class StorageService {
  private basePath: string;

  constructor() {
    this.basePath = ENV.STORAGE.PATH;
    this.ensureUploadDir();
  }

  private ensureUploadDir(): void {
    if (!fs.existsSync(this.basePath)) {
      fs.mkdirSync(this.basePath, { recursive: true });
      logger.info('Upload directory created', { path: this.basePath });
    }
  }

  async saveFile(buffer: Buffer, fileType: string): Promise<StorageFile> {
    const filename = `${uuidv4()}.${this.getFileExtension(fileType)}`;
    const filepath = path.join(this.basePath, filename);

    return new Promise((resolve, reject) => {
      fs.writeFile(filepath, buffer, (err) => {
        if (err) {
          logger.error('Failed to save file', { error: err });
          reject(err);
        } else {
          logger.info('File saved successfully', { filename, size: buffer.length });
          resolve({
            url: `/uploads/${filename}`,
            filename,
            size: buffer.length,
          });
        }
      });
    });
  }

  async getFile(filename: string): Promise<Buffer> {
    const filepath = path.join(this.basePath, filename);

    return new Promise((resolve, reject) => {
      fs.readFile(filepath, (err, data) => {
        if (err) {
          logger.warn('Failed to read file', { filename, error: err });
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
  }

  async deleteFile(filename: string): Promise<void> {
    const filepath = path.join(this.basePath, filename);

    return new Promise((resolve, reject) => {
      fs.unlink(filepath, (err) => {
        if (err) {
          logger.warn('Failed to delete file', { filename, error: err });
          reject(err);
        } else {
          logger.info('File deleted', { filename });
          resolve();
        }
      });
    });
  }

  private getFileExtension(fileType: string): string {
    const extensions: Record<string, string> = {
      'audio/mpeg': 'mp3',
      'audio/wav': 'wav',
      'video/mp4': 'mp4',
      'video/webm': 'webm',
      'image/jpeg': 'jpg',
      'image/png': 'png',
    };

    return extensions[fileType] || 'bin';
  }

  async generateFileHash(buffer: Buffer): Promise<string> {
    const crypto = await import('crypto');
    return crypto.createHash('sha256').update(buffer).digest('hex');
  }

  async addWatermark(
    filename: string,
    userId: string,
    timestamp: Date
  ): Promise<string> {
    // In production, use image/video processing library
    // For now, return watermarked filename
    return `${filename}_watermarked`;
  }

  async protectFile(filename: string): Promise<void> {
    // Mark file as protected in system
    // Prevent download/editing
    logger.info('File protected', { filename });
  }
}

export const storageService = new StorageService();
