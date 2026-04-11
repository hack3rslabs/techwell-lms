import { Controller, Post, Get, Put, Delete, Body, Param } from '@nestjs/common';
import { ResumeService } from './resume.service';
import { Resume } from './resume.entity';

@Controller('resume')
export class ResumeController {
  constructor(private readonly resumeService: ResumeService) {}

  @Post()
  async create(@Body() resumeData: Partial<Resume>) {
    return this.resumeService.create(resumeData);
  }

  @Get(':userId')
  async getByUserId(@Param('userId') userId: number) {
    return this.resumeService.findByUserId(userId);
  }

  @Put(':id')
  async update(@Param('id') id: number, @Body() updateData: Partial<Resume>) {
    return this.resumeService.update(id, updateData);
  }

  @Delete(':id')
  async delete(@Param('id') id: number) {
    await this.resumeService.delete(id);
    return { deleted: true };
  }
}
