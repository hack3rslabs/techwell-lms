import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Resume {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column()
  phone: string;

  @Column({ type: 'text' })
  summary: string;

  @Column({ type: 'text' })
  skills: string;

  @Column({ type: 'text' })
  education: string;

  @Column({ type: 'text' })
  experience: string;

  @Column()
  template: string;
}
