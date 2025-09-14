import { Module } from '@nestjs/common';
import { CoursesController, EnrollmentsController } from './courses.controller';
import { CoursesService } from './courses.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CoursesController, EnrollmentsController],
  providers: [CoursesService],
  exports: [CoursesService],
})
export class CoursesModule {}