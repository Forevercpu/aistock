import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard, type AdminRequest } from '../auth/jwt-auth.guard';
import { AdminContentService } from './content.service';
import { QueryAnnouncementsDto, QueryQuizzesDto, ReviewAiDto, SaveAnnouncementDto, SaveQuizDto } from './dto/content.dto';

@ApiTags('admin-content')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('admin')
export class AdminContentController {
  constructor(private readonly service: AdminContentService) {}
  @Get('announcements') getAnnouncements(@Query() query: QueryAnnouncementsDto) { return this.service.getAnnouncements(query); }
  @Get('announcements/:id') getAnnouncement(@Param('id', ParseIntPipe) id: number) { return this.service.getAnnouncement(id); }
  @Post('announcements') createAnnouncement(@Body() dto: SaveAnnouncementDto, @Req() req: AdminRequest) { return this.service.createAnnouncement(dto, req.admin.sub); }
  @Patch('announcements/:id') updateAnnouncement(@Param('id', ParseIntPipe) id: number, @Body() dto: SaveAnnouncementDto, @Req() req: AdminRequest) { return this.service.updateAnnouncement(id, dto, req.admin.sub); }
  @Delete('announcements/:id') deleteAnnouncement(@Param('id', ParseIntPipe) id: number, @Req() req: AdminRequest) { return this.service.deleteAnnouncement(id, req.admin.sub); }
  @Post('announcements/:id/parse') parseAnnouncement(@Param('id', ParseIntPipe) id: number, @Req() req: AdminRequest) { return this.service.parseAnnouncement(id, req.admin.sub); }
  @Get('ai-results') getAiResults(@Query('status') status?: 'PENDING' | 'APPROVED' | 'REJECTED') { return this.service.getAiResults(status); }
  @Get('ai-results/:id') getAiResult(@Param('id', ParseIntPipe) id: number) { return this.service.getAiResult(id); }
  @Patch('ai-results/:id/review') reviewAiResult(@Param('id', ParseIntPipe) id: number, @Body() dto: ReviewAiDto, @Req() req: AdminRequest) { return this.service.reviewAiResult(id, dto, req.admin.sub); }
  @Get('quizzes') getQuizzes(@Query() query: QueryQuizzesDto) { return this.service.getQuizzes(query); }
  @Post('quizzes') createQuiz(@Body() dto: SaveQuizDto, @Req() req: AdminRequest) { return this.service.createQuiz(dto, req.admin.sub); }
  @Patch('quizzes/:id') updateQuiz(@Param('id', ParseIntPipe) id: number, @Body() dto: SaveQuizDto, @Req() req: AdminRequest) { return this.service.updateQuiz(id, dto, req.admin.sub); }
  @Delete('quizzes/:id') deleteQuiz(@Param('id', ParseIntPipe) id: number, @Req() req: AdminRequest) { return this.service.deleteQuiz(id, req.admin.sub); }
}
