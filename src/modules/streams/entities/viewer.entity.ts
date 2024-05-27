import { ViewStatus } from 'src/utils/enums';
import { User } from 'src/modules/users/entities/user.entity';
import { EntityHelper } from 'src/utils/entity-helper';
import {
  Column,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Stream } from './stream.entity';

@Entity()
export class Viewer extends EntityHelper {
  @PrimaryColumn()
  userID: string;

  @PrimaryColumn()
  streamID: string;

  @ManyToOne(() => User, (user) => user.viewers)
  @JoinColumn({ name: 'userID' })
  user: User;

  @ManyToOne(() => Stream, (stream) => stream.viewers)
  @JoinColumn({ name: 'streamID' })
  stream: Stream;

  @Column({ enum: ViewStatus, default: ViewStatus.Idle })
  status: ViewStatus;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
