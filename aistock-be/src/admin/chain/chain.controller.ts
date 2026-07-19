import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Put, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard, type AdminRequest } from '../auth/jwt-auth.guard';
import { AdminChainService } from './chain.service';
import { SaveChainDto, SaveChainGraphDto } from './dto/chain.dto';

@ApiTags('admin-industry-chains')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('admin/chains')
export class AdminChainController {
  constructor(private readonly service: AdminChainService) {}

  @Get()
  @ApiOperation({ summary: '查询产业链列表' })
  findAll() { return this.service.findAll(); }

  @Get(':id')
  @ApiOperation({ summary: '查询产业链及图谱详情' })
  findOne(@Param('id', ParseIntPipe) id: number) { return this.service.findOne(id); }

  @Post()
  @ApiOperation({ summary: '新增产业链' })
  create(@Body() dto: SaveChainDto, @Req() req: AdminRequest) { return this.service.create(dto, req.admin.sub); }

  @Patch(':id')
  @ApiOperation({ summary: '编辑产业链基础信息' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: SaveChainDto, @Req() req: AdminRequest) { return this.service.update(id, dto, req.admin.sub); }

  @Delete(':id')
  @ApiOperation({ summary: '删除产业链' })
  remove(@Param('id', ParseIntPipe) id: number, @Req() req: AdminRequest) { return this.service.remove(id, req.admin.sub); }

  @Put(':id/graph')
  @ApiOperation({ summary: '保存产业链节点与连线图谱' })
  saveGraph(@Param('id', ParseIntPipe) id: number, @Body() dto: SaveChainGraphDto, @Req() req: AdminRequest) { return this.service.saveGraph(id, dto, req.admin.sub); }
}
