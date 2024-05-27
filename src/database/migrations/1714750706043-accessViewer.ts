import { MigrationInterface, QueryRunner } from "typeorm";

export class AccessViewer1714750706043 implements MigrationInterface {
    name = 'AccessViewer1714750706043'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "access_viewer" ("userID" uuid NOT NULL, "streamerID" uuid NOT NULL, "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, CONSTRAINT "PK_765e692f747fe1a35589d8295f8" PRIMARY KEY ("userID", "streamerID"))`);
        await queryRunner.query(`ALTER TABLE "access_viewer" ADD CONSTRAINT "FK_b4abcb5a86a3f990be37ff7a25e" FOREIGN KEY ("streamerID") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "access_viewer" ADD CONSTRAINT "FK_4c4d52a507c570e22dc1561ec54" FOREIGN KEY ("userID") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "access_viewer" DROP CONSTRAINT "FK_4c4d52a507c570e22dc1561ec54"`);
        await queryRunner.query(`ALTER TABLE "access_viewer" DROP CONSTRAINT "FK_b4abcb5a86a3f990be37ff7a25e"`);
        await queryRunner.query(`DROP TABLE "access_viewer"`);
    }

}
