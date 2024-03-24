import {
  Repository,
  EntityTarget,
  EntityManager,
  ObjectLiteral,
  DeepPartial,
  FindOneOptions,
  UpdateResult,
  FindManyOptions,
} from 'typeorm';

/**
 * Abstract base repository class to handle common CRUD operations.
 * @template Entity - The entity type that extends ObjectLiteral for TypeORM operations.
 */
export abstract class BaseRepository<
  Entity extends ObjectLiteral
> extends Repository<Entity> {
  /**
   * Initializes a new instance of the `BaseRepository` class.
   * @param entity - The target entity class.
   * @param manager - The EntityManager instance to be used by the repository.
   */
  constructor(private entity: EntityTarget<Entity>, manager: EntityManager) {
    super(entity, manager);
  }

  /**
   * Creates and saves a new entity based on the provided data.
   * @param data - The data to create the entity with.
   * @returns The newly created entity instance.
   */
  async createEntity(data: DeepPartial<Entity>): Promise<Entity> {
    const entity = this.create(data);
    return this.save(entity);
  }

  /**
   * Finds and returns all entities in the repository.
   * @returns An array of all entity instances.
   */
  async findAll(): Promise<Entity[]> {
    return this.find();
  }

  /**
   * Finds a single entity based on the provided find options.
   * @param options - The options to use when finding the entity.
   * @returns The found entity instance or null if not found.
   */
  async findById(options: FindOneOptions<Entity>): Promise<Entity | null> {
    return this.findOne(options);
  }

  /**
   * Updates an entity identified by the given ID with the provided data.
   * @param id - The ID of the entity to update.
   * @param data - The data to update the entity with.
   * @returns The result of the update operation.
   */
  async updateEntity(id: string, data: Partial<Entity>): Promise<UpdateResult> {
    return this.update(id, data);
  }

  /**
   * Deletes an entity by its ID.
   * @param id - The ID of the entity to delete.
   */
  async deleteEntity(id: string): Promise<void> {
    await this.delete(id);
  }

  /**
   * Find entity that match where condition and count them
   * @param options
   * @returns {Promise<[Entity[], number]>}
   */
  async findCount(
    options?: FindManyOptions<Entity> | undefined
  ): Promise<[Entity[], number]> {
    return this.findAndCount(options);
  }
}
