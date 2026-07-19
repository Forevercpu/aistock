import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard, type AdminRequest } from '../auth/jwt-auth.guard';
import { AdminContentService } from './content.service';
import { QueryAnnouncementsDto, QueryQuizzesDto, ReviewAiDto, SaveAnnouncementDto, SaveQuizDto } from './dto/content.dto';

@ApiTags('admin-content')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('admin')
export class AdminContentController {
  constructor(private readonly service: AdminContentService) {}

  @Get('announcements')
  @ApiOperation({ summary: '分页查询公告文档' })
  getAnnouncements(@Query() query: QueryAnnouncementsDto) { return this.service.getAnnouncements(query); }

  @Get('announcements/:id')
  @ApiOperation({ summary: '查询公告及解析详情' })
  getAnnouncement(@Param('id', ParseIntPipe) id: number) { return this.service.getAnnouncement(id); }

  @Post('announcements')
  @ApiOperation({ summary: '新增公告文档' })
  createAnnouncement(@Body() dto: SaveAnnouncementDto, @Req() req: AdminRequest) { return this.service.createAnnouncement(dto, req.admin.sub); }

  @Patch('announcements/:id')
  @ApiOperation({ summary: '编辑公告文档' })
  updateAnnouncement(@Param('id', ParseIntPipe) id: number, @Body() dto: SaveAnnouncementDto, @Req() req: AdminRequest) { return this.service.updateAnnouncement(id, dto, req.admin.sub); }

  @Delete('announcements/:id')
  @ApiOperation({ summary: '删除公告文档' })
  deleteAnnouncement(@Param('id', ParseIntPipe) id: number, @Req() req: AdminRequest) { return this.service.deleteAnnouncement(id, req.admin.sub); }

  @Post('announcements/:id/parse')
  @ApiOperation({ summary: '触发公告 AI 解析' })
  parseAnnouncement(@Param('id', ParseIntPipe) id: number, @Req() req: AdminRequest) { return this.service.parseAnnouncement(id, req.admin.sub); }

  @Get('ai-results')
  @ApiOperation({ summary: '按审核状态查询 AI 解析结果' })
  getAiResults(@Query('status') status?: 'PENDING' | 'APPROVED' | 'REJECTED') { return this.service.getAiResults(status); }

  @Get('ai-results/:id')
  @ApiOperation({ summary: '查询单条 AI 解析结果' })
  getAiResult(@Param('id', ParseIntPipe) id: number) { return this.service.getAiResult(id); }

  @Patch('ai-results/:id/review')
  @ApiOperation({ summary: '审核并修订 AI 解析结果' })
  reviewAiResult(@Param('id', ParseIntPipe) id: number, @Body() dto: ReviewAiDto, @Req() req: AdminRequest) { return this.service.reviewAiResult(id, dto, req.admin.sub); }

  @Get('quizzes')
  @ApiOperation({ summary: '按条件查询题库' })
  getQuizzes(@Query() query: QueryQuizzesDto) { return this.service.getQuizzes(query); }

  @Post('quizzes')
  @ApiOperation({ summary: '新增题目' })
  createQuiz(@Body() dto: SaveQuizDto, @Req() req: AdminRequest) { return this.service.createQuiz(dto, req.admin.sub); }

  @Patch('quizzes/:id')
  @ApiOperation({ summary: '编辑题目' })
  updateQuiz(@Param('id', ParseIntPipe) id: number, @Body() dto: SaveQuizDto, @Req() req: AdminRequest) { return this.service.updateQuiz(id, dto, req.admin.sub); }

  @Delete('quizzes/:id')
  @ApiOperation({ summary: '删除题目' })
  deleteQuiz(@Param('id', ParseIntPipe) id: number, @Req() req: AdminRequest) { return this.service.deleteQuiz(id, req.admin.sub); }
}
