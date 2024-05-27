import { ApiProperty, PartialType } from "@nestjs/swagger";

export class GetStreamDto{
    @ApiProperty()
    channelID: string;

    @ApiProperty()
    name: string;

    @ApiProperty()
    token: string;

    @ApiProperty()
    appId: string;
}
