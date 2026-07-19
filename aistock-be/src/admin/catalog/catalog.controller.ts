import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Put, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard, type AdminRequest } from '../auth/jwt-auth.guard';
import { AdminCatalogService } from './catalog.service';
import { SaveSectorDto, SaveTagDto, SetCompaniesDto } from './dto/catalog.dto';

@ApiTags('admin-catalog')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('admin/catalog')
export class AdminCatalogController {
  constructor(private readonly service: AdminCatalogService) {}

  @Get('company-options')
  @ApiOperation({ summary: '获取可关联的公司选项' })
  getCompanyOptions() { return this.service.getCompanyOptions(); }

  @Get('sectors')
  @ApiOperation({ summary: '查询板块与概念列表' })
  getSectors() { return this.service.getSectors(); }

  @Post('sectors')
  @ApiOperation({ summary: '新增板块或概念' })
  createSector(@Body() dto: SaveSectorDto, @Req() req: AdminRequest) { return this.service.createSector(dto, req.admin.sub); }

  @Patch('sectors/:id')
  @ApiOperation({ summary: '编辑板块或概念' })
  updateSector(@Param('id', ParseIntPipe) id: number, @Body() dto: SaveSectorDto, @Req() req: AdminRequest) { return this.service.updateSector(id, dto, req.admin.sub); }

  @Delete('sectors/:id')
  @ApiOperation({ summary: '删除板块或概念' })
  deleteSector(@Param('id', ParseIntPipe) id: number, @Req() req: AdminRequest) { return this.service.deleteSector(id, req.admin.sub); }

  @Put('sectors/:id/companies')
  @ApiOperation({ summary: '覆盖板块关联的公司' })
  setSectorCompanies(@Param('id', ParseIntPipe) id: number, @Body() dto: SetCompaniesDto, @Req() req: AdminRequest) { return this.service.setSectorCompanies(id, dto.companyIds, req.admin.sub); }

  @Get('tags')
  @ApiOperation({ summary: '查询标签列表' })
  getTags() { return this.service.getTags(); }

  @Post('tags')
  @ApiOperation({ summary: '新增标签' })
  createTag(@Body() dto: SaveTagDto, @Req() req: AdminRequest) { return this.service.createTag(dto, req.admin.sub); }

  @Patch('tags/:id')
  @ApiOperation({ summary: '编辑标签' })
  updateTag(@Param('id', ParseIntPipe) id: number, @Body() dto: SaveTagDto, @Req() req: AdminRequest) { return this.service.updateTag(id, dto, req.admin.sub); }

  @Delete('tags/:id')
  @ApiOperation({ summary: '删除标签' })
  deleteTag(@Param('id', ParseIntPipe) id: number, @Req() req: AdminRequest) { return this.service.deleteTag(id, req.admin.sub); }

  @Put('tags/:id/companies')
  @ApiOperation({ summary: '覆盖标签关联的公司' })
  setTagCompanies(@Param('id', ParseIntPipe) id: number, @Body() dto: SetCompaniesDto, @Req() req: AdminRequest) { return this.service.setTagCompanies(id, dto.companyIds, req.admin.sub); }
}
