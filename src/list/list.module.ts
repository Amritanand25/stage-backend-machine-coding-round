import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ListController } from './list.controller';
import { ListService } from './list.servce';
import { List, ListSchema } from 'src/models/list.schema';

@Module({
    imports: [MongooseModule.forFeature([{ name: List.name, schema: ListSchema }])],
    controllers: [ListController],
    providers: [ListService],
    exports: [ListService],
})
export class ListModule { }