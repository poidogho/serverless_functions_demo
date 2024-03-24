import {
  Entity,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  PrimaryColumn,
} from 'typeorm';
// eslint-disable-next-line import/no-cycle
import { User } from './User';

@Entity()
export class Post {
  @PrimaryColumn('uuid')
  id: string;

  @Column('uuid')
  userId: string;

  // eslint-disable-next-line arrow-body-style
  @ManyToOne(() => User, (user) => user.posts)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  title: string;

  @Column()
  body: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
