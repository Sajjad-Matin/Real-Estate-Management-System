import { Injectable } from '@nestjs/common';
import { PaginatedResult } from '../dto/pagination.dto';

@Injectable()
export class PaginationService {
  paginate<T>(
    data: T[],
    total: number,
    page: number,
    limit: number,
  ): PaginatedResult<T> {
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage,
        hasPreviousPage,
      },
    };
  }

  getSkip(page: number, limit: number): number {
    return (page - 1) * limit;
  }
}