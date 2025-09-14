import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { diskStorage } from 'multer';
import * as path from 'path';
import { 
  syllabusFileFilter, 
  generateFileName, 
  MAX_FILE_SIZE,
  ensureUploadDirectory 
} from '../common/filters/file-upload.filter';

// Upload directory path
export const UPLOAD_PATH = path.join(process.cwd(), 'uploads', 'syllabus');

// Ensure upload directory exists on startup
ensureUploadDirectory(UPLOAD_PATH);

export const multerConfig: MulterOptions = {
  storage: diskStorage({
    destination: (req, file, cb) => {
      cb(null, UPLOAD_PATH);
    },
    filename: (req, file, cb) => {
      const filename = generateFileName(file);
      cb(null, filename);
    },
  }),
  fileFilter: syllabusFileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1, // Only one file at a time
  },
};

// Multer configuration for memory storage (if you prefer to handle file storage manually)
export const multerMemoryConfig: MulterOptions = {
  storage: 'memory' as any,
  fileFilter: syllabusFileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1,
  },
};