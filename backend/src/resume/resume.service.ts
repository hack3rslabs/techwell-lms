import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Resume } from './resume.entity';

@Injectable()
export class ResumeService {
  constructor(
    @InjectRepository(Resume)
    private resumeRepository: Repository<Resume>,
  ) {}

  async create(resumeData: Partial<Resume>): Promise<Resume> {
    const resume = this.resumeRepository.create(resumeData);
    return this.resumeRepository.save(resume);
  }

  async findByUserId(userId: number): Promise<Resume[]> {
    return this.resumeRepository.find({ where: { userId } });
  }

  async update(id: number, updateData: Partial<Resume>): Promise<Resume> {
    await this.resumeRepository.update(id, updateData);
    return this.resumeRepository.findOneBy({ id });
  }

  async delete(id: number): Promise<void> {
    await this.resumeRepository.delete(id);
  }
}
