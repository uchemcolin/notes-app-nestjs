import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PaginationService {
  constructor(private prisma: PrismaService) {}

  async paginate(model: string, page: number, limit: number, where: any = {}, orderBy: any = { createdAt: 'desc' }) {
    const skip = (page - 1) * limit;
    
    const [data, total] = await Promise.all([
      (this.prisma as any)[model].findMany({
        where,
        skip,
        take: limit,
        orderBy,
      }),
      (this.prisma as any)[model].count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);
    
    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNext: page < totalPages,
        hasPrevious: page > 1,
      },
    };
  }
}