import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { AssignmentController, FileController } from './assignment.controller';
import { AssignmentService } from './assignment.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';

// Ensure uploads directory exists
const uploadsDir = './uploads/assignments';
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    MulterModule.register({
      storage: diskStorage({
        destination: uploadsDir,
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          const sanitizedOriginalName = file.originalname
            .replace(/[^a-zA-Z0-9.-]/g, '_')
            .substring(0, 50);
          cb(null, `${sanitizedOriginalName}-${uniqueSuffix}${ext}`);
        },
      }),
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
      fileFilter: (req, file, cb) => {
        const allowedMimes = [
          'image/jpeg',
          'image/jpg',
          'image/png',
          'image/gif',
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'text/plain',
          'application/zip',
          'application/x-rar-compressed',
        ];
        
        if (allowedMimes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new Error('Invalid file type'), false);
        }
      },
    }),
  ],
  controllers: [AssignmentController, FileController],
  providers: [AssignmentService],
  exports: [AssignmentService],
})
export class AssignmentModule {}