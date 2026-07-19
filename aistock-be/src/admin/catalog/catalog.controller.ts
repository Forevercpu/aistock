import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Put, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard, type AdminRequest } from '../auth/jwt-auth.guard';
import { AdminCatalogService } from './catalog.service';
import { SaveSectorDto, SaveTagDto, SetCompaniesDto } from './dto/catalog.dto';

@ApiTags('admin-catalog')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('admin/catalog')
export class AdminCatalogController {
  constructor(private readonly service: AdminCatalogService) {}
  @Get('company-options') getCompanyOptions() { return this.service.getCompanyOptions(); }
  @Get('sectors') getSectors() { return this.service.getSectors(); }
  @Post('sectors') createSector(@Body() dto: SaveSectorDto, @Req() req: AdminRequest) { return this.service.createSector(dto, req.admin.sub); }
  @Patch('sectors/:id') updateSector(@Param('id', ParseIntPipe) id: number, @Body() dto: SaveSectorDto, @Req() req: AdminRequest) { return this.service.updateSector(id, dto, req.admin.sub); }
  @Delete('sectors/:id') deleteSector(@Param('id', ParseIntPipe) id: number, @Req() req: AdminRequest) { return this.service.deleteSector(id, req.admin.sub); }
  @Put('sectors/:id/companies') setSectorCompanies(@Param('id', ParseIntPipe) id: number, @Body() dto: SetCompaniesDto, @Req() req: AdminRequest) { return this.service.setSectorCompanies(id, dto.companyIds, req.admin.sub); }
  @Get('tags') getTags() { return this.service.getTags(); }
  @Post('tags') createTag(@Body() dto: SaveTagDto, @Req() req: AdminRequest) { return this.service.createTag(dto, req.admin.sub); }
  @Patch('tags/:id') updateTag(@Param('id', ParseIntPipe) id: number, @Body() dto: SaveTagDto, @Req() req: AdminRequest) { return this.service.updateTag(id, dto, req.admin.sub); }
  @Delete('tags/:id') deleteTag(@Param('id', ParseIntPipe) id: number, @Req() req: AdminRequest) { return this.service.deleteTag(id, req.admin.sub); }
  @Put('tags/:id/companies') setTagCompanies(@Param('id', ParseIntPipe) id: number, @Body() dto: SetCompaniesDto, @Req() req: AdminRequest) { return this.service.setTagCompanies(id, dto.companyIds, req.admin.sub); }
}
