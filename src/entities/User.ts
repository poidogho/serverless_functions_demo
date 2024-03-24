import { Entity, Column, OneToMany, PrimaryColumn } from 'typeorm';
// eslint-disable-next-line import/no-cycle
import { Post } from './Post';

@Entity()
export class User {
  @PrimaryColumn('uuid')
  id: string;

  // eslint-disable-next-line arrow-body-style
  @OneToMany(() => Post, (post) => post.user)
  posts: Post[];

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  birthdate: Date;

  get age(): number {
    const today = new Date();
    const birthDate = new Date(this.birthdate);
    let age = today.getFullYear() - birthDate.getFullYear();
    const month = today.getMonth() - birthDate.getMonth();
    if (month < 0 || (month === 0 && today.getDate() < birthDate.getDate())) {
      age -= 1;
    }
    return age;
  }

  toJSON() {
    return { ...this, age: this.age };
  }
}
