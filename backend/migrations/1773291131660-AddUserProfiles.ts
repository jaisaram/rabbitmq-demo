import { MigrationInterface, QueryRunner } from "typeorm";

export class  $npmConfigName1773291131660 implements MigrationInterface {
    name = ' $npmConfigName1773291131660'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "user_profiles" ("id" uuid NOT NULL, "email" character varying NOT NULL, "tenantId" character varying NOT NULL, "firstName" character varying, "lastName" character varying, "avatarUrl" character varying, "metadata" jsonb NOT NULL DEFAULT '{}', CONSTRAINT "PK_1ec6662219f4605723f1e41b6cb" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "user_profiles"`);
    }

}
