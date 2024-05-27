import { DeepPartial, In, Not, Repository } from 'typeorm';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateStreamDto } from './dto/create-stream.dto';
import { Stream } from './entities/stream.entity';
import { User } from '../users/entities/user.entity';
import { FindOptions } from 'src/utils/types/find-options.type';
import { NullableType } from 'src/utils/types/nullable.type';
import { Status, StreamStatus, ViewStatus } from '../../utils/enums';
import { StreamResponse } from './types/response.type';
import { UpdateStreamAccessDto } from './dto/update-stream.dto';
import { Viewer } from './entities/viewer.entity';
import { RoleEnum } from '../roles/roles.enum';
import { PaginationResultType } from 'src/utils/types/pagination-result.type';
import { IPaginationOptions } from 'src/utils/types/pagination-options';
import { RtcRole, RtcTokenBuilder } from 'agora-token';
import { ConfigService } from '@nestjs/config';
import { AllConfigType } from 'src/configs/config.type';
import { UpdateViewerAccessDto } from './dto/update-viewer-access.dto';
import { AccessViewer } from './entities/viewer-list.entity';
import { EntityCondition } from 'src/utils/types/entity-condition.type';

@Injectable()
export class StreamsService {
  constructor(
    @InjectRepository(Stream) private repository: Repository<Stream>,
    @InjectRepository(User) private uesRepository: Repository<User>,
    @InjectRepository(Viewer)
    private viewRepository: Repository<Viewer>,
    @InjectRepository(AccessViewer)
    private accessViewRepository: Repository<AccessViewer>,
    private configService: ConfigService<AllConfigType>,
  ) {}

  async create(owner: User, payload: CreateStreamDto): Promise<Stream> {
    const { name, address, status } = payload;

    if (!owner || owner.role === RoleEnum.Viewer) {
      throw new HttpException(
        { status: HttpStatus.FORBIDDEN, errors: { user: 'NotAllowed' } },
        HttpStatus.FORBIDDEN,
      );
    }

    const newStream = await this.repository.create({
      name,
      status,
      address,
      owner,
    });

    return this.repository.save(newStream);
  }

  update(id: Stream['id'], payload: DeepPartial<Stream>): Promise<Stream> {
    return this.repository.save(this.repository.create({ id, ...payload }));
  }

  async findManyWithPagination(
    reqUser: User,
    { page, limit, search }: IPaginationOptions,
  ): Promise<PaginationResultType<Stream>> {
    const queryBuilder = this.repository
      .createQueryBuilder('stream')
      .where('stream.name LIKE :search', { search: `%${search}%` });

    if (reqUser.role !== RoleEnum.Admin) {
      queryBuilder.andWhere('stream.owner = :id', {
        id: reqUser.id,
      });
    } else {
      queryBuilder.leftJoinAndSelect('stream.owner', 'owner');
    }

    const [data, total] = await queryBuilder
      .skip(page * limit)
      .take(limit)
      .getManyAndCount();

    return { total, data };
  }

  async findViewable(
    reqUser: User,
    { page, limit, search }: IPaginationOptions,
  ): Promise<PaginationResultType<Stream>> {
    const queryBuilder = this.repository
      .createQueryBuilder('stream')
      .leftJoinAndSelect('stream.owner', 'owner')
      .leftJoinAndSelect('stream.viewers', 'viewers')
      .leftJoin('viewers.user', 'user')
      .where('stream.name LIKE :search', { search: `%${search}%` });

    if (reqUser.role !== RoleEnum.Admin) {
      queryBuilder.where('viewers.user = :id', { id: reqUser.id });
    }

    const [data, total] = await queryBuilder
      .skip(page * limit)
      .take(limit)
      .getManyAndCount();

    return { total, data };
  }

  async findOne(
    reqUser: User,
    options: FindOptions<Stream>,
  ): Promise<NullableType<Stream>> {
    return this.repository.findOneOrFail({
      where: options.where,
      relations: {
        viewers: {
          user: reqUser.role !== RoleEnum.Viewer,
        },
      },
    });
  }

  async softDelete(reqUser: User, id: Stream['id']): Promise<void> {
    if (!reqUser || reqUser.role === RoleEnum.Viewer) {
      throw new HttpException(
        { status: HttpStatus.FORBIDDEN, errors: { user: 'NotAllowed' } },
        HttpStatus.FORBIDDEN,
      );
    }

    await this.repository.softDelete(id);
  }

  async start(
    reqUser: User,
    options: FindOptions<Stream>,
  ): Promise<StreamResponse> {
    const stream = await this.repository.findOne({
      where: options.where,
      relations: { owner: true },
    });

    if (reqUser.id !== stream.owner.id) {
      throw new HttpException(
        { status: HttpStatus.FORBIDDEN, errors: { user: reqUser.id } },
        HttpStatus.FORBIDDEN,
      );
    }

    stream.status = StreamStatus.Live;

    await this.repository.save(stream);

    return this.generateToken(reqUser, stream.name);
  }

  async view(reqUser: User, id: Stream['id']): Promise<StreamResponse> {
    const stream = await this.repository.findOne({
      where: { id, status: StreamStatus.Live },
      relations: { viewers: true },
    });

    const isAdmin = reqUser.role === RoleEnum.Admin;
    const isViewerAuthorized =
      isAdmin || stream?.viewers.some((sv) => sv.userID === reqUser.id);

    if (!stream || !isViewerAuthorized) {
      throw new HttpException(
        { status: HttpStatus.FORBIDDEN, errors: { user: reqUser.id } },
        HttpStatus.FORBIDDEN,
      );
    }

    return this.generateToken(reqUser, stream.name);
  }

  async updateAccess(
    reqUser: User,
    options: FindOptions<Stream>,
    payload: UpdateStreamAccessDto,
  ): Promise<Stream> {
    const stream = await this.repository.findOne({
      where: options.where,
      relations: { owner: true },
    });

    if (reqUser.role === RoleEnum.Viewer) {
      throw new HttpException(
        { status: HttpStatus.FORBIDDEN, errors: { user: reqUser.id } },
        HttpStatus.FORBIDDEN,
      );
    }

    if (!payload.records?.length) {
      return;
    }

    const accessUsers = await this.uesRepository.findBy({
      id: In(payload.records.map((item) => item.user.id)),
      status: Status.Active,
    });

    await this.viewRepository.delete({
      streamID: stream.id,
      userID: Not(In(accessUsers.map((item) => item.id))),
    });

    for await (const viewer of accessUsers) {
      const record = payload.records.find((item) => item.user.id === viewer.id);

      const streamViewer = await this.viewRepository.create({
        status: record.status ?? ViewStatus.Idle,
        streamID: stream.id,
        userID: viewer.id,
      });

      await this.viewRepository.save(streamViewer);
    }

    return await this.repository.findOne({
      where: { id: stream.id },
      relations: {
        viewers: {
          user: true,
        },
      },
    });
  }

  async updateViewerAccess(
    reqUser: User,
    options: FindOptions<User>,
    payload: UpdateViewerAccessDto,
  ): Promise<User> {

    const streamer = await this.uesRepository.findOne({
      where: options.where,
    });
    if (reqUser.role === RoleEnum.Viewer) {
      throw new HttpException(
        { status: HttpStatus.FORBIDDEN, errors: { user: reqUser.id } },
        HttpStatus.FORBIDDEN,
      );
    }

    if (!payload.records?.length) {
      return;
    }

    const accessUsers = await this.uesRepository.findBy({
      id: In(payload.records.map((item) => item.user.id)),
      status: Status.Active,
    });

    await this.accessViewRepository.delete({
      streamerID: streamer.id,
      userID: Not(In(accessUsers.map((item) => item.id))),
    });

    for await (const viewer of accessUsers) {
      const accessViewer = await this.accessViewRepository.create({
        streamerID: streamer.id,
        userID: viewer.id,
      });
      await this.accessViewRepository.save(accessViewer);
    }

    return await this.uesRepository.findOne({
      where: { id: streamer.id },
      relations: {
        accessViewers: true,
      },
    });
  }

  generateToken(
    reqUser: User,
    channelName,
    tokenExpireInSeconds = 3600,
    appId = null,
    appCertificate = null,
  ): StreamResponse {
    if (!appCertificate && !appCertificate) {
      const agoraCon = this.configService.getOrThrow('agora', {
        infer: true,
      });
      appId = agoraCon.appID;
      appCertificate = agoraCon.appCertificate;
    }
    
    const uid = 0;
    let role = RtcRole.PUBLISHER;
    if (reqUser.role == RoleEnum.Viewer) {
      role = RtcRole.SUBSCRIBER;
    } 

    const currentTimestamp = Math.floor(Date.now() / 1000)
    const privilegeExpiredTs = currentTimestamp + tokenExpireInSeconds
    const token = RtcTokenBuilder.buildTokenWithUid(
      appId,
      appCertificate,
      channelName,
      uid,
      role,
      tokenExpireInSeconds,
      privilegeExpiredTs,
    );

    return { token, appId, channelName  };
  }

  async getStreamChannel(
    streamer: User,
    status: StreamStatus,
  ): Promise<Stream | null> {
    const stream = await this.repository
      .createQueryBuilder('stream')
      .andWhere('stream.status=:status', {status: status})
      .orWhere('stream.owner=:ownerID',{ownerID: streamer.id})
      .orderBy('stream.createdAt', 'DESC')
      .getOne();
    return stream;
  }

  async findOneViewerAccess(
    fields: EntityCondition<AccessViewer>,
  ): Promise<AccessViewer | null> {
    return this.accessViewRepository.findOne({
      where: fields,
      relations: {
        streamer: true,
        user: true
      }
    });
  }

  async findManyViewerAccess(
    fields: EntityCondition<AccessViewer>,
  ): Promise<AccessViewer[] | null> {
    return this.accessViewRepository.find({
      where: fields,
    });
  }

  async findManyStream(
    fields: EntityCondition<Stream>,
  ): Promise<Stream[] | null> {
    return this.repository.find({
      where: fields,
      relations: {
        owner: true
      }
    });
  }
}
