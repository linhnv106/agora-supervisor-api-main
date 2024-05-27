import {
  Column,
  Entity,
  OneToOne,
  CreateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from 'src/modules/users/entities/user.entity';
import { EntityHelper } from 'src/utils/entity-helper';

@Entity()
export class Logger extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: String })
  message: string;

  @Column({ type: 'json', nullable: true })
  payload: Record<string, any>;

  @OneToOne(() => User)
  reqUser: User;

  @CreateDateColumn()
  createdAt: Date;
}
