import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { Prisma } from '@prisma/client';
import { PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class NotesService {
  constructor(private prisma: PrismaService) {}

  async create(userId: number, createNoteDto: CreateNoteDto) {
    try {
      // Additional validation for empty strings
      if (!createNoteDto.title || createNoteDto.title.trim() === '') {
        throw new BadRequestException({
          message: 'Title cannot be empty',
          error: 'Validation failed',
        });
      }
      
      if (!createNoteDto.content || createNoteDto.content.trim() === '') {
        throw new BadRequestException({
          message: 'Content cannot be empty',
          error: 'Validation failed',
        });
      }
      
      const note = await this.prisma.note.create({
        data: {
          title: createNoteDto.title.trim(),
          content: createNoteDto.content.trim(),
          userId: userId,
        },
      });

      return {
        success: true,
        message: 'Note created successfully',
        data: note,
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2003') {
          throw new BadRequestException({
            message: 'User not found',
            error: 'Invalid user',
          });
        }
      }
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException({
        message: 'Failed to create note',
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      });
    }
  }

  /*async findAll(userId: number, paginationDto: PaginationDto) {
    const { page = 1, limit = 10 } = paginationDto; // Set default values during destructuring
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.note.findMany({
        where: { userId: userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.note.count({
        where: { userId: userId },
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      success: true,
      message: 'Notes retrieved successfully',
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
  }*/

  /*async findAll(userId: number, paginationDto: PaginationDto) {
    const { page = 1, limit = 10, search, searchBy = 'both' } = paginationDto;
    const skip = (page - 1) * limit;

    // Build the where clause for search
    let whereClause: any = { userId: userId };
    
    if (search && search.trim() !== '') {
      const searchTerm = search.trim();
      
      if (searchBy === 'title') {
        whereClause.title = {
          contains: searchTerm,
          mode: 'insensitive', // 🔑 THIS IS THE KEY FIX
        };
      } else if (searchBy === 'content') {
        whereClause.content = {
          contains: searchTerm,
          mode: 'insensitive', // 🔑 THIS IS THE KEY FIX
        };
      } else if (searchBy === 'both') {
        whereClause.OR = [
          {
            title: {
              contains: searchTerm,
              mode: 'insensitive', // 🔑 THIS IS THE KEY FIX
            },
          },
          {
            content: {
              contains: searchTerm,
              mode: 'insensitive', // 🔑 THIS IS THE KEY FIX
            },
          },
        ];
      }
    }

    const [data, total] = await Promise.all([
      this.prisma.note.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.note.count({
        where: whereClause,
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      success: true,
      message: search ? `Notes matching "${search}" retrieved successfully` : 'Notes retrieved successfully',
      data,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNext: page < totalPages,
        hasPrevious: page > 1,
        ...(search && { search, searchBy }),
      },
    };
  }*/

  async findAll(userId: number, paginationDto: PaginationDto) {
    const { page = 1, limit = 10, search, searchBy = 'both' } = paginationDto;
    const skip = (page - 1) * limit;

    let allNotes = await this.prisma.note.findMany({
      where: { userId: userId },
      orderBy: { createdAt: 'desc' },
    });

    console.log('All notes before filter:', allNotes.map(n => ({ id: n.id, title: n.title })));
    console.log('Search term:', search);
    console.log('Search by:', searchBy);

    // Apply search filter in memory (not efficient for large datasets)
    if (search && search.trim() !== '') {
      const searchTerm = search.trim().toLowerCase();
      console.log('Search term lowercase:', searchTerm);
      
      allNotes = allNotes.filter(note => {
        const titleMatch = note.title.toLowerCase().includes(searchTerm);
        const contentMatch = note.content.toLowerCase().includes(searchTerm);
        
        console.log(`Note ${note.id}: title="${note.title}", titleMatch=${titleMatch}, contentMatch=${contentMatch}`);
        
        if (searchBy === 'title') {
          return titleMatch;
        } else if (searchBy === 'content') {
          return contentMatch;
        } else {
          return titleMatch || contentMatch;
        }
      });
    }

    console.log('Filtered notes:', allNotes.map(n => ({ id: n.id, title: n.title })));

    const total = allNotes.length;
    const data = allNotes.slice(skip, skip + limit);
    const totalPages = Math.ceil(total / limit);

    return {
      success: true,
      message: search ? `Notes matching "${search}" retrieved successfully` : 'Notes retrieved successfully',
      data,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNext: page < totalPages,
        hasPrevious: page > 1,
        ...(search && { search, searchBy }),
      },
    };
  }

  async findOne(userId: number, id: number) {
    try {
      const note = await this.prisma.note.findUnique({
        where: { id: id },
      });

      if (!note) {
        throw new NotFoundException({
          message: `Note with ID ${id} not found`,
          error: 'Not Found',
        });
      }

      if (note.userId !== userId) {
        throw new ForbiddenException({
          message: 'You do not have permission to access this note',
          error: 'Forbidden',
        });
      }

      return {
        success: true,
        message: 'Note retrieved successfully',
        data: note,
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }
      throw new BadRequestException({
        message: 'Failed to retrieve note',
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      });
    }
  }

  async update(userId: number, id: number, updateNoteDto: UpdateNoteDto) {
    try {
      // First check if note exists and belongs to user
      await this.findOne(userId, id);

      const updatedNote = await this.prisma.note.update({
        where: { id: id },
        data: {
          title: updateNoteDto.title,
          content: updateNoteDto.content,
        },
      });

      return {
        success: true,
        message: 'Note updated successfully',
        data: updatedNote,
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }
      throw new BadRequestException({
        message: 'Failed to update note',
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      });
    }
  }

  async remove(userId: number, id: number) {
    try {
      // First check if note exists and belongs to user
      await this.findOne(userId, id);

      await this.prisma.note.delete({
        where: { id: id },
      });

      return {
        success: true,
        message: 'Note deleted successfully',
        data: { id },
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }
      throw new BadRequestException({
        message: 'Failed to delete note',
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      });
    }
  }
}

