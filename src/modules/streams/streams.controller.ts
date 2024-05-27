import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  Query,
  Patch,
  DefaultValuePipe,
  ParseIntPipe,
  NotFoundException,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { StreamsService } from './streams.service';
import { CreateSingleStreamTokenDto, CreateStreamDto, CreateStreamTokenDto } from './dto/create-stream.dto';
import { RolesGuard } from '../roles/roles.guard';
import {
  UpdateStreamAccessDto,
  UpdateStreamDto,
} from './dto/update-stream.dto';
import { Stream } from './entities/stream.entity';
import { PaginationResultType } from 'src/utils/types/pagination-result.type';
import { GetStreamDto } from './dto/get-stream.dto';
import { UpdateViewerAccessDto } from './dto/update-viewer-access.dto';
import { UsersService } from '../users/users.service';
import { RoleEnum } from '../roles/roles.enum';
import { StreamStatus } from 'src/utils/enums';
import { In } from 'typeorm';
import { User } from '../users/entities/user.entity';

@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@ApiTags('Streams')
@Controller({ path: 'streams', version: '1' })
export class StreamsController {
  constructor(
    private readonly streamsService: StreamsService, 
    private readonly userService: UsersService, 
  ) {}

  @Post()
  create(@Request() request, @Body() payload: CreateStreamDto) {
    return this.streamsService.create(request.user, payload);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  update(
    @Param('id') id: string,
    @Body() payload: UpdateStreamDto,
  ): Promise<Stream> {
    return this.streamsService.update(id, payload);
  }

  @Get()
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  findAll(
    @Request() request,
    @Query('page', new DefaultValuePipe(0), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('search', new DefaultValuePipe('')) search?: string,
  ): Promise<PaginationResultType<Stream>> {
    return this.streamsService.findManyWithPagination(request.user, {
      page,
      limit,
      search,
    });
  }

  @Get('getStreamList')
  async getStreamList(
    @Request() request,
  ): Promise<User[]> {
    const user = request.user;
    const accessViewer = await this.streamsService.findManyViewerAccess({
      userID: user.id
    })
    if (!accessViewer) {
      return []
    }

    const streamerID = accessViewer.map(a => a.streamerID);
    // const streams = await this.streamsService.findManyStream({
    //   owner: In(streamerID)
    // })
    const streamers = await this.userService.findMany({
      id: In(streamerID),
      role: RoleEnum.Streamer
    })

    return streamers
  }

  @Get('viewable')
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  findViewable(
    @Request() request,
    @Query('page', new DefaultValuePipe(0), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('search', new DefaultValuePipe('')) search?: string,
  ): Promise<PaginationResultType<Stream>> {
    return this.streamsService.findViewable(request.user, {
      page,
      limit,
      search,
    });
  }

  @Post('getStreamChannel')
  @ApiBody({
    description: 'Example get stream token',
    type: CreateSingleStreamTokenDto,
    examples: {
      example1: {
        value: {
          appId: "39dac30d9a374101ac8dd6c4afba886a",
          appCertificate: "112820e7fed440609a05caa812b43daf"
        },
      },
    },
  })
  @ApiQuery({ name: 'account', required: true, type: String })
  async getStreamChannel(
    @Request() request,
    @Body() payload: CreateSingleStreamTokenDto,
    @Query('account') account: string,
  ): Promise<GetStreamDto> {
    const viewerAccess = await this.streamsService.findOneViewerAccess({
      userID: request.user.id,
      streamerID: account,
    })
    if (!viewerAccess) {
      throw new NotFoundException();
    }
    console.log('viewerAccess.streamer', viewerAccess.streamer)
    let stream = await this.streamsService.getStreamChannel(viewerAccess.streamer, StreamStatus.Live);
    if (!stream) {
      stream = await this.streamsService.getStreamChannel(viewerAccess.streamer, StreamStatus.Idle);
      if (!stream) {
        return {
          channelID: null,
          name: null,
          token: null,
          appId: payload.appId,
        }
      }
    }
    const token = this.streamsService.generateToken(request.user, stream.id, 3600, payload.appId, payload.appCertificate);
    return {
      channelID: token.channelName,
      name: stream.name,
      token: token.token,
      appId: payload.appId,
    }
  }

  @Get(':id')
  findOne(@Request() request, @Param('id') id: string) {
    return this.streamsService.findOne(request.user, { where: { id } });
  }

  @ApiBearerAuth()
  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.NO_CONTENT)
  public async remove(
    @Request() request,
    @Param('id') id: string,
  ): Promise<void> {
    return this.streamsService.softDelete(request.user, id);
  }

  @Post(':id/start')
  start(@Request() request, @Param('id') id: string) {
    return this.streamsService.start(request.user, { where: { id } });
  }

  @Post(':id/view')
  view(@Request() request, @Param('id') id: string) {
    return this.streamsService.view(request.user, id);
  }

  @Post(':id/access')
  @HttpCode(HttpStatus.OK)
  updateAccess(
    @Request() request,
    @Param('id') id: string,
    @Body() payload: UpdateStreamAccessDto,
  ) {
    return this.streamsService.updateAccess(
      request.user,
      { where: { id } },
      payload,
    );
  }


  @Post('streamer/:id/access')
  @HttpCode(HttpStatus.OK)
  updateViewerAccess(
    @Request() request,
    @Param('id') id: string,
    @Body() payload: UpdateViewerAccessDto,
  ) {
    return this.streamsService.updateViewerAccess(
      request.user,
      { where: { id } },
      payload,
    );
  }

  @Post('createStream')
  @ApiBody({
    description: 'Example create stream body',
    type: CreateStreamTokenDto,
    examples: {
      example1: {
        value: {
          name: "test1",
          address: "string",
          appId: "39dac30d9a374101ac8dd6c4afba886a",
          appCertificate: "112820e7fed440609a05caa812b43daf"
        },
      },
    },
  })
  async createStream(@Request() request, @Body() payload: CreateStreamTokenDto) {
    const stream = await this.streamsService.create(request.user, {
      name: payload.name,
      address: payload.address,
    })
    
    const content = this.streamsService.generateToken(request.user, stream.id, 3600000, payload.appId, payload.appCertificate)
    
    return {
      channelID: content.channelName,
      name: stream.name,
      token: content.token,
      appID: content.appId
    };
  }
}
