import { User } from 'src/modules/users/entities/user.entity';
import { EntityHelper } from 'src/utils/entity-helper';
import {
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class AccessViewer extends EntityHelper {
    @PrimaryColumn()
    userID: string;

    @PrimaryColumn()
    streamerID: string;

    @ManyToOne(() => User, (user) => user.accessStreamers)
    @JoinColumn({ name: 'streamerID' })
    streamer: User;

    @ManyToOne(() => User, (user) => user.accessViewers)
    @JoinColumn({ name: 'userID' })
    user: User;

    @UpdateDateColumn()
    updatedAt: Date;

    @DeleteDateColumn()
    deletedAt: Date;
}
