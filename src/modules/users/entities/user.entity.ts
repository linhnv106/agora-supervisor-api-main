import bcrypt from 'bcryptjs';
import {
  AfterLoad,
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { RoleEnum } from 'src/modules/roles/roles.enum';
import { Status } from 'src/utils/enums';
import { Stream } from 'src/modules/streams/entities/stream.entity';
import { EntityHelper } from 'src/utils/entity-helper';
import { Viewer } from 'src/modules/streams/entities/viewer.entity';
import { AccessViewer } from 'src/modules/streams/entities/viewer-list.entity';

@Entity()
export class User extends EntityHelper {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: String, unique: true, nullable: true })
  email: string | null;

  @Column({ nullable: true })
  @Exclude({ toPlainOnly: true })
  password: string;

  @Exclude({ toPlainOnly: true })
  public previousPassword: string;

  @AfterLoad()
  public loadPreviousPassword(): void {
    this.previousPassword = this.password;
  }

  @BeforeInsert()
  @BeforeUpdate()
  async setPassword() {
    if (this.previousPassword !== this.password && this.password) {
      const salt = await bcrypt.genSalt();
      this.password = await bcrypt.hash(this.password, salt);
    }
  }

  @Index()
  @Column({ type: String, nullable: true })
  fullName: string | null;

  @Index()
  @Column({ enum: RoleEnum, default: RoleEnum.Viewer })
  role: RoleEnum;

  @Index()
  @Column({ enum: Status, default: Status.Active })
  status: Status;

  @Column({ type: String, nullable: true })
  @Index()
  @Exclude({ toPlainOnly: true })
  hash: string | null;

  @OneToMany(() => Stream, (stream) => stream.owner)
  streams: Stream[];

  @OneToMany(() => Viewer, (sv) => sv.user)
  viewers: Viewer[];

  @OneToMany(() => AccessViewer, (av) => av.user)
  accessStreamers: AccessViewer[];

  @OneToMany(() => AccessViewer, (as) => as.streamer)
  accessViewers: AccessViewer[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
