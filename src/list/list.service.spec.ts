import { Test, TestingModule } from '@nestjs/testing';
import { Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { CreateListDto } from './dto/create-list.dto';
import { NotFoundException } from '@nestjs/common';
import { ListService } from './list.servce';
import { List, ListDocument } from 'src/models/list.schema';

describe('ListService', () => {
    let service: ListService;
    let listModel: Model<ListDocument>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ListService,
                {
                    provide: getModelToken(List.name),
                    useValue: {
                        create: jest.fn(),
                        findOne: jest.fn(),
                        deleteOne: jest.fn(),
                        find: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get<ListService>(ListService);
        listModel = module.get<Model<ListDocument>>(getModelToken(List.name));
    });

    describe('addToList', () => {
        it('should add an item to the list successfully', async () => {
            const createListDto: CreateListDto = {
                userId: 'user-id',
                itemId: 'item-id',
                itemType: 'movie',
            };

            const mockCreateResponse = { ...createListDto, _id: 'new-id' };
            (listModel.create as jest.Mock).mockResolvedValue(mockCreateResponse); // Type casting `create` to jest mock

            const response = await service.addToList(createListDto);
            expect(response).toEqual(mockCreateResponse);
            expect(listModel.create).toHaveBeenCalledWith(createListDto); // Assert the create method was called with correct arguments
        });

        it('should throw an error if the user does not exist', async () => {
            const createListDto: CreateListDto = {
                userId: 'invalid-user-id',
                itemId: 'item-id',
                itemType: 'movie',
            };

            const errorResponse = new NotFoundException('User not found');
            (listModel.create as jest.Mock).mockRejectedValue(errorResponse); // Type casting `create` to jest mock

            try {
                await service.addToList(createListDto);
            } catch (e) {
                expect(e.response.message).toBe('User not found'); // Assert error message
            }
        });
    });

    describe('removeFromList', () => {
        it('should remove an item from the list successfully', async () => {
            const userId = 'user-id';
            const itemId = 'item-id';
            const response = { message: 'Item removed successfully' };

            (listModel.deleteOne as jest.Mock).mockResolvedValue(response);

            const result = await service.removeFromList(userId, itemId);
            expect(result).toEqual(response);
            expect(listModel.deleteOne).toHaveBeenCalledWith({ userId, itemId });
        });

        it('should throw an error if the item does not exist in the list', async () => {
            const userId = 'user-id';
            const itemId = 'item-id';
            const errorResponse = new NotFoundException('Item not found in list');
            (listModel.deleteOne as jest.Mock).mockRejectedValue(errorResponse);

            try {
                await service.removeFromList(userId, itemId);
            } catch (e) {
                expect(e.response.message).toBe('Item not found in list');
            }
        });
    });

    describe('listMyItems', () => {
        it('should return a list of items for the user', async () => {
            const userId = 'user-id';
            const paginationQuery = { limit: 10, offset: 0 };
            const mockItems = [{ itemId: 'item-id', itemType: 'movie' }];

            (listModel.find as jest.Mock).mockResolvedValue(mockItems);

            const result = await service.listMyItems(paginationQuery, userId);
            expect(result).toEqual(mockItems);
            expect(listModel.find).toHaveBeenCalledWith({ userId });
        });

        it('should return an empty array if the user has no items in the list', async () => {
            const userId = 'user-id';
            const paginationQuery = { limit: 10, offset: 0 };
            const mockItems = [];

            (listModel.find as jest.Mock).mockResolvedValue(mockItems);

            const result = await service.listMyItems(paginationQuery, userId);
            expect(result).toEqual(mockItems);
            expect(listModel.find).toHaveBeenCalledWith({ userId });
        });
    });
});
