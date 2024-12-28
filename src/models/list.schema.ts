import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { IsNotEmpty, IsString, IsIn, Length } from 'class-validator';

@Schema({ timestamps: true })
export class List {
    @Prop({ required: true, index: true })
    @IsNotEmpty()
    @IsString()
    @Length(24, 24)
    userId: string;

    @Prop({ required: true, index: true })
    @IsNotEmpty()
    @IsString()
    @Length(24, 24)
    itemId: string;

    @Prop({ required: true, enum: ['movie', 'tvshow'] })
    @IsNotEmpty()
    @IsString()
    @IsIn(['movie', 'tvshow'])
    itemType: string;
}

export type ListDocument = List & Document;
export const ListSchema = SchemaFactory.createForClass(List);

// Add a unique compound index for (userId, itemId)
ListSchema.index({ userId: 1, itemId: 1 }, { unique: true });
