import { Controller, Get, Post, Delete, Query, Body, Param } from '@nestjs/common';
import { CreateListDto } from './dto/create-list.dto';
import { PaginationQueryDto } from './dto/pagination-query.dto';
import { ApiTags } from '@nestjs/swagger';
import { ListService } from './list.servce';

@ApiTags('List')
@Controller('list')
export class ListController {
    constructor(private readonly listService: ListService) { }

    @Get()
    async listMyItems(
        @Query() paginationQuery: PaginationQueryDto,
        @Query('userId') userId: string,
        @Query('itemType') itemType?: string
    ) {
        return this.listService.listMyItems(paginationQuery, userId, itemType);
    }


    @Post()
    async addToList(@Body() createListDto: CreateListDto) {
        return this.listService.addToList(createListDto);
    }

    @Delete(':userId/:itemId')
    async removeFromList(
        @Param('userId') userId: string,
        @Param('itemId') itemId: string
    ) {
        return this.listService.removeFromList(userId, itemId);
    }
}
