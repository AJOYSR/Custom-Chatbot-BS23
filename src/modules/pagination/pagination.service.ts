import { Injectable } from "@nestjs/common";
import { GetCountFunction, GetDataFunction } from "./types";
import { PaginationInterface } from "src/interface/common";

@Injectable()
export class PaginationService {
  /**
   * Paginates data based on the provided functions, query, and pagination parameters.
   *
   * @async
   * @template T - Type of data to be paginated.
   * @param getDataFn - Function to retrieve paginated data.
   * @param getCountFn - Function to retrieve the total count of data.
   * @param query - The query conditions for filtering data.
   * @param pagination - The pagination parameters, including page and limit.
   * @returns A Promise resolving to an object containing paginated data, page information, and the total count.
   */
  async paginate<T>(
    getDataFn: GetDataFunction<T>,
    getCountFn: GetCountFunction,
    query: Record<string, any>,
    pagination: PaginationInterface
  ): Promise<{ data: T[]; page: number; limit: number; total: number }> {
    const { page, limit } = this.handlePaginationParams(pagination);

    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      getDataFn(query, { skip, limit }),
      getCountFn(query),
    ]);

    return {
      data,
      page,
      limit,
      total,
    };
  }

  /**
   * Handles pagination parameters, ensuring that page and limit are within valid ranges.
   *
   * @private
   * @param pagination - The pagination parameters, including page and limit.
   * @returns An object containing normalized page and limit values.
   */
  handlePaginationParams(pagination: PaginationInterface): {
    page: number;
    limit: number;
  } {
    const { page, limit } = pagination;

    // Handle the page if it is lower than 1.
    const normalizedPage = Number(page) >= 1 ? Number(page) : 1;

    // Handle the limit if it is lower than 1 or greater than 100.
    let normalizedLimit = 10;

    if (limit && Number(limit) >= 1) {
      const parsedLimit = Number(limit);
      if (parsedLimit > 100) {
        normalizedLimit = 100;
      } else {
        normalizedLimit = parsedLimit;
      }
    }

    return { page: normalizedPage, limit: normalizedLimit };
  }
}
