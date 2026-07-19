import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard, type AdminRequest } from '../auth/jwt-auth.guard';
import { AdminCompanyService } from './company.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { QueryCompaniesDto } from './dto/query-companies.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { UpdateCompanyStatusDto } from './dto/update-company-status.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@ApiTags('admin-companies')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('admin/companies')
export class AdminCompanyController {
  constructor(private readonly companyService: AdminCompanyService) {}

  @Get()
  @ApiOperation({ summary: '分页查询上市公司' })
  findAll(@Query() query: QueryCompaniesDto) {
    return this.companyService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: '查询公司详情' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.companyService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: '新增上市公司' })
  create(@Body() dto: CreateCompanyDto, @Req() req: AdminRequest) {
    return this.companyService.create(dto, req.admin.sub);
  }

  @Patch(':id')
  @ApiOperation({ summary: '编辑上市公司' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCompanyDto, @Req() req: AdminRequest) {
    return this.companyService.update(id, dto, req.admin.sub);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: '修改公司发布状态' })
  updateStatus(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCompanyStatusDto, @Req() req: AdminRequest) {
    return this.companyService.updateStatus(id, dto, req.admin.sub);
  }

  @Post(':id/products')
  @ApiOperation({ summary: '新增公司主营产品' })
  createProduct(@Param('id', ParseIntPipe) id: number, @Body() dto: CreateProductDto, @Req() req: AdminRequest) {
    return this.companyService.createProduct(id, dto, req.admin.sub);
  }

  @Patch(':id/products/:productId')
  @ApiOperation({ summary: '编辑公司主营产品' })
  updateProduct(
    @Param('id', ParseIntPipe) id: number,
    @Param('productId', ParseIntPipe) productId: number,
    @Body() dto: UpdateProductDto, @Req() req: AdminRequest,
  ) {
    return this.companyService.updateProduct(id, productId, dto, req.admin.sub);
  }

  @Delete(':id/products/:productId')
  @ApiOperation({ summary: '删除公司主营产品' })
  deleteProduct(@Param('id', ParseIntPipe) id: number, @Param('productId', ParseIntPipe) productId: number, @Req() req: AdminRequest) {
    return this.companyService.deleteProduct(id, productId, req.admin.sub);
  }
}
