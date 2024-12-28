import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateListDto } from './dto/create-list.dto';
import { PaginationQueryDto } from './dto/pagination-query.dto';
import { User } from 'src/models/user.schema';
import { Movie } from 'src/models/movie.schema';
import { TVShow } from 'src/models/tvshow.schema';
import { List, ListDocument } from 'src/models/list.schema';

@Injectable()
export class ListService {
  constructor(
    @InjectModel(List.name) private readonly listModel: Model<ListDocument>,
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(Movie.name) private readonly movieModel: Model<Movie>,
    @InjectModel(TVShow.name) private readonly tvShowModel: Model<TVShow>
  ) { }

  /**
   * Adds an item to the user's list.
   * Validates user and item existence, ensures no duplicates.
   * @param createListDto - Data for adding an item to the list.
   * @returns The added item.
   */
  async addToList(createListDto: CreateListDto) {
    const { userId, itemId, itemType } = createListDto;
    const session = await this.listModel.startSession();

    try {
      session.startTransaction();
      const user = await this.userModel.findById(userId).session(session);
      if (!user) {
        throw new NotFoundException('User does not exist');
      }
      const item = await this.validateItemExists(itemId, itemType, session);
      const existingItem = await this.listModel.findOne({ userId, itemId }).session(session);
      if (existingItem) {
        throw new ConflictException('Item already exists in the list');
      }
      const newItem = new this.listModel(createListDto);
      const result = await newItem.save({ session });
      await session.commitTransaction();
      return result;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Removes an item from the user's list.
   * @param userId - The ID of the user.
   * @param itemId - The ID of the item to remove.
   * @returns A success message.
   */
  async removeFromList(userId: string, itemId: string) {
    const result = await this.listModel.findOneAndDelete({ userId, itemId });

    if (!result) {
      throw new NotFoundException('Item not found in the list');
    }

    return { message: 'Item removed successfully' };
  }

  /**
   * Lists items in the user's list with pagination and optional filtering by item type.
   * @param paginationQuery - Pagination parameters (limit and offset).
   * @param userId - The ID of the user.
   * @param itemType - Optional filter for item type (movie/tvshow).
   * @returns Paginated list of items.
   */

  async listMyItems(paginationQuery: PaginationQueryDto, userId: string, itemType?: string) {
    const { limit = 10, offset = 0 } = paginationQuery;

    const filter: any = { userId };
    if (itemType) {
      filter.itemType = itemType;
    }

    const [items, totalCount] = await Promise.all([
      this.listModel.find(filter).skip(offset).limit(limit).exec(),
      this.listModel.countDocuments(filter),
    ]);

    return {
      data: items,
      totalCount,
      limit,
      offset,
      totalPages: Math.ceil(totalCount / limit),
    };
  }

  /**
   * Validates if the item exists based on its type.
   * @param itemId - The ID of the item.
   * @param itemType - The type of the item (movie or tvshow).
   * @param session - The MongoDB session for transaction.
   * @returns The item document if it exists.
   * @throws NotFoundException if the item does not exist.
   */

  private async validateItemExists(itemId: string, itemType: string, session: any) {
    let item;

    if (itemType === 'movie') {
      item = await this.movieModel.findById(itemId).session(session);
    } else if (itemType === 'tvshow') {
      item = await this.tvShowModel.findById(itemId).session(session);
    } else {
      throw new BadRequestException('Invalid item type');
    }

    if (!item) {
      throw new NotFoundException('Item does not exist');
    }

    return item;
  }
  async listUser() {
    throw new Error('Method not implemented.');
  }

}
