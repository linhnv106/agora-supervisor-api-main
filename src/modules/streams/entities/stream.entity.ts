import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { EntityHelper } from 'src/utils/entity-helper';
import { IsNotEmpty } from 'class-validator';
import { User } from 'src/modules/users/entities/user.entity';
import { StreamStatus } from 'src/utils/enums';
import { Viewer } from './viewer.entity';

@Entity()
export class Stream extends EntityHelper {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @IsNotEmpty()
  name: string;

  @Column()
  @IsNotEmpty()
  address: string;

  @Column({ enum: StreamStatus, default: StreamStatus.Idle })
  status: StreamStatus;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.streams)
  owner: User;

  @OneToMany(() => Viewer, (sv) => sv.stream)
  viewers: Viewer[];

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
