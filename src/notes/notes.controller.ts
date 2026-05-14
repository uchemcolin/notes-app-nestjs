import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { NotesService } from './notes.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('notes')
@UseGuards(JwtAuthGuard)
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Post()
  create(@Request() req, @Body() createNoteDto: CreateNoteDto) {
    return this.notesService.create(req.user.id, createNoteDto);
  }

  @Get()
  findAll(@Request() req) {
    return this.notesService.findAll(req.user.id);
  }

  @Get(':id')
  findOne(@Request() req, @Param('id') id: string) {
    return this.notesService.findOne(req.user.id, +id);
  }

  @Patch(':id')
  update(@Request() req, @Param('id') id: string, @Body() updateNoteDto: UpdateNoteDto) {
    return this.notesService.update(req.user.id, +id, updateNoteDto);
  }

  @Delete(':id')
  remove(@Request() req, @Param('id') id: string) {
    return this.notesService.remove(req.user.id, +id);
  }
}