import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';
import { User } from '../util';

export class UpdateAgeToBirthdate1710538071538 implements MigrationInterface {
  /**
   * Migrates the user table from storing age to storing birthdate.
   * This migration adds a birthdate column, calculates each user's birthdate based
   * on their age assuming their birthday is on January 1st, updates the user records
   * with the calculated birthdates, and finally removes the age column.
   *
   * @param {QueryRunner} queryRunner - The QueryRunner instance used to execute queries directly on the database.
   * @returns {Promise<void>} A promise that resolves when the migration is complete.
   */
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'user',
      new TableColumn({
        name: 'birthdate',
        type: 'date',
        isNullable: true,
      })
    );

    await queryRunner.dropColumn('user', 'age');
  }

  /**
   * Reverts the changes made by the `up` method. This migration removes the birthdate column,
   * adds back the age column, and calculates the age for each user assuming their birthdate was
   * on January 1st. It then populates the newly added age column with these calculated ages.
   *
   * @param {QueryRunner} queryRunner - The QueryRunner instance used to execute queries directly on the database.
   * @returns {Promise<void>} A promise that resolves when the migration is reversed.
   */
  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'user',
      new TableColumn({
        name: 'age',
        type: 'int',
        isNullable: true,
      })
    );

    await queryRunner.dropColumn('user', 'birthdate');
  }
}
