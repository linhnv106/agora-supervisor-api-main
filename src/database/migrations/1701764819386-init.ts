import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1701764819386 implements MigrationInterface {
    name = 'Init1701764819386'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "viewer" ("userID" uuid NOT NULL, "streamID" uuid NOT NULL, "status" character varying NOT NULL DEFAULT 'Idle', "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, CONSTRAINT "PK_1edb3fc36e8c7702a5cbda86b92" PRIMARY KEY ("userID", "streamID"))`);
        await queryRunner.query(`CREATE TABLE "stream" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "address" character varying NOT NULL, "status" character varying NOT NULL DEFAULT 'Idle', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "ownerId" uuid, CONSTRAINT "PK_0dc9d7e04ff213c08a096f835f2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying, "password" character varying, "fullName" character varying, "role" character varying NOT NULL DEFAULT 'Viewer', "status" character varying NOT NULL DEFAULT 'Active', "hash" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_035190f70c9aff0ef331258d28" ON "user" ("fullName") `);
        await queryRunner.query(`CREATE INDEX "IDX_6620cd026ee2b231beac7cfe57" ON "user" ("role") `);
        await queryRunner.query(`CREATE INDEX "IDX_3d44ccf43b8a0d6b9978affb88" ON "user" ("status") `);
        await queryRunner.query(`CREATE INDEX "IDX_e282acb94d2e3aec10f480e4f6" ON "user" ("hash") `);
        await queryRunner.query(`CREATE TABLE "logger" ("id" SERIAL NOT NULL, "message" character varying NOT NULL, "payload" json, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_46cad7e44f77ea2fa7da01e7828" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "session" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "userId" uuid, CONSTRAINT "PK_f55da76ac1c3ac420f444d2ff11" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_3d2f174ef04fb312fdebd0ddc5" ON "session" ("userId") `);
        await queryRunner.query(`ALTER TABLE "viewer" ADD CONSTRAINT "FK_77f84e2f2db8b87fb45eb22717d" FOREIGN KEY ("userID") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "viewer" ADD CONSTRAINT "FK_e0b520eb227a52cb3a7f370a5b3" FOREIGN KEY ("streamID") REFERENCES "stream"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "stream" ADD CONSTRAINT "FK_fb5eb93eb2f606e072b96fc96cb" FOREIGN KEY ("ownerId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "session" ADD CONSTRAINT "FK_3d2f174ef04fb312fdebd0ddc53" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "session" DROP CONSTRAINT "FK_3d2f174ef04fb312fdebd0ddc53"`);
        await queryRunner.query(`ALTER TABLE "stream" DROP CONSTRAINT "FK_fb5eb93eb2f606e072b96fc96cb"`);
        await queryRunner.query(`ALTER TABLE "viewer" DROP CONSTRAINT "FK_e0b520eb227a52cb3a7f370a5b3"`);
        await queryRunner.query(`ALTER TABLE "viewer" DROP CONSTRAINT "FK_77f84e2f2db8b87fb45eb22717d"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_3d2f174ef04fb312fdebd0ddc5"`);
        await queryRunner.query(`DROP TABLE "session"`);
        await queryRunner.query(`DROP TABLE "logger"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_e282acb94d2e3aec10f480e4f6"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_3d44ccf43b8a0d6b9978affb88"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_6620cd026ee2b231beac7cfe57"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_035190f70c9aff0ef331258d28"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TABLE "stream"`);
        await queryRunner.query(`DROP TABLE "viewer"`);
    }

}
