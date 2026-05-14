/*import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';

@Injectable()
export class NotesService {
  constructor(private prisma: PrismaService) {}

  create(userId: number, createNoteDto: CreateNoteDto) {
    return this.prisma.note.create({

      data: {
        title: createNoteDto.title,
        content: createNoteDto.content,
        userId: userId,
      },
    });
  }

  findAll(userId: number) {
    return this.prisma.note.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(userId: number, id: number) {
    const note = await this.prisma.note.findUnique({
      where: { id },
    });

    if (!note) {
      throw new NotFoundException('Note not found');
    }

    if (note.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return note;
  }

  async update(userId: number, id: number, updateNoteDto: UpdateNoteDto) {
    await this.findOne(userId, id);

    return this.prisma.note.update({
      where: { id },
      data: updateNoteDto,
    });
  }

  async remove(userId: number, id: number) {
    await this.findOne(userId, id);

    return this.prisma.note.delete({
      where: { id },
    });
  }
}*/

import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class NotesService {
  constructor(private prisma: PrismaService) {}

  /*async create(userId: number, createNoteDto: CreateNoteDto) {
    try {
      const note = await this.prisma.note.create({
        data: {
          title: createNoteDto.title,
          content: createNoteDto.content,
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
      throw new BadRequestException({
        message: 'Failed to create note',
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      });
    }
  }*/

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

  async findAll(userId: number) {
    const notes = await this.prisma.note.findMany({
      where: { userId: userId },
      orderBy: { createdAt: 'desc' },
    });

    return {
      success: true,
      message: 'Notes retrieved successfully',
      data: notes,
      count: notes.length,
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

