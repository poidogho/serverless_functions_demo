import { EntityManager } from 'typeorm';
import { User } from '../entities/User';
import { BaseRepository } from './base';

/**
 * UserRepository extends the generic BaseRepository to implement
 * repository pattern specific for the User entity.
 */
export class UserRepository extends BaseRepository<User> {
  constructor(manager: EntityManager) {
    super(User, manager);
  }
}
