import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Put, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard, type AdminRequest } from '../auth/jwt-auth.guard';
import { AdminChainService } from './chain.service';
import { SaveChainDto, SaveChainGraphDto } from './dto/chain.dto';

@ApiTags('admin-industry-chains')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('admin/chains')
export class AdminChainController {
  constructor(private readonly service: AdminChainService) {}
  @Get() findAll() { return this.service.findAll(); }
  @Get(':id') findOne(@Param('id', ParseIntPipe) id: number) { return this.service.findOne(id); }
  @Post() create(@Body() dto: SaveChainDto, @Req() req: AdminRequest) { return this.service.create(dto, req.admin.sub); }
  @Patch(':id') update(@Param('id', ParseIntPipe) id: number, @Body() dto: SaveChainDto, @Req() req: AdminRequest) { return this.service.update(id, dto, req.admin.sub); }
  @Delete(':id') remove(@Param('id', ParseIntPipe) id: number, @Req() req: AdminRequest) { return this.service.remove(id, req.admin.sub); }
  @Put(':id/graph') saveGraph(@Param('id', ParseIntPipe) id: number, @Body() dto: SaveChainGraphDto, @Req() req: AdminRequest) { return this.service.saveGraph(id, dto, req.admin.sub); }
}
