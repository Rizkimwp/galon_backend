import { Injectable } from '@nestjs/common';
import { join } from 'path';

import { writeFile } from 'fs/promises';
@Injectable()
export class FileService {
  async saveFile(file: Express.Multer.File): Promise<string> {
    if (!file || !file.originalname) {
      throw new Error('Invalid file input');
    }

    // Tentukan direktori 'uploads' di root proyek
    const uploadDir = join(process.cwd(), 'uploads');
    const uploadPath = join(uploadDir, file.originalname);

    try {
      await writeFile(uploadPath, file.buffer);

      // Return path relatif, misal: 'uploads/<namaFile>'
      return `uploads/${file.originalname}`;
    } catch (error) {
      console.error('Error saving file:', error);
      throw new Error('Failed to save file');
    }
  }
}
