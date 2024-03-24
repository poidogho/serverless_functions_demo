import { EntityManager, FindOptionsWhere, Like } from 'typeorm';
import { Post } from '../entities/Post';
import { BaseRepository } from './base';
import { SearchPostsInput } from '../util';

/**
 * PostRepository extends the generic BaseRepository to implement
 * repository pattern specific for the Post entity. It provides
 * an asynchronous initialization method to create an instance
 * with a connected DataSource.
 */
export class PostRepository extends BaseRepository<Post> {
  constructor(manager: EntityManager) {
    super(Post, manager);
  }

  async getUserPost(options: FindOptionsWhere<Post>): Promise<Post | null> {
    return this.findOneBy(options);
  }

  async searchPosts(searchClause: SearchPostsInput): Promise<Post[] | null> {
    const { title, currentPage, pageSize } = searchClause;
    const offset = (currentPage - 1) * pageSize;
    const posts = await this.find({
      where: {
        title: Like(`%${title}%`),
      },
      take: pageSize,
      skip: offset,
    });

    return posts;
  }
}
