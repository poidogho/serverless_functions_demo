import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';
import { config } from 'dotenv';

config();

export class CreatePost1710543222982 implements MigrationInterface {
  isProduction = process.env.NODE_ENV === 'production';
  /**
   * Creates the Post table and inserts dummy data into it.
   *
   * @param queryRunner - The QueryRunner that allows running queries on the database.
   */
  public async up(queryRunner: QueryRunner): Promise<void> {
    const table = new Table({
      name: 'post',
      columns: [
        {
          name: 'id',
          type: 'uuid',
          isPrimary: true,
        },
        {
          name: 'userId',
          type: 'uuid',
        },
        {
          name: 'title',
          type: 'varchar',
        },
        {
          name: 'body',
          type: 'text',
        },
        {
          name: 'created_at',
          type: this.isProduction ? 'timestamptz' : 'timestamp',
          default: 'CURRENT_TIMESTAMP',
        },
        {
          name: 'updated_at',
          type: this.isProduction ? 'timestamptz' : 'timestamp',
          default: 'CURRENT_TIMESTAMP',
        },
      ],
      foreignKeys: [
        {
          columnNames: ['userId'],
          referencedTableName: 'user',
          referencedColumnNames: ['id'],
          onDelete: 'CASCADE',
        },
      ],
    });

    await queryRunner.createTable(table, true);

    await queryRunner.createIndex(
      'post',
      new TableIndex({
        name: 'IDX_POST_TITLE',
        columnNames: ['title'],
      })
    );
  }

  /**
   * Drops the Post table from the database.
   *
   * @param queryRunner - The QueryRunner that allows running queries on the database.
   */
  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('post', 'IDX_POST_TITLE');
    await queryRunner.dropTable('post');
  }
}
