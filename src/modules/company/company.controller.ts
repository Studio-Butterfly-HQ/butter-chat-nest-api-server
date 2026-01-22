// src/modules/company/company.controller.ts
import { 
  Controller, 
  Get, 
  Patch, 
  Delete, 
  Body, 
  Req, 
  UseGuards,
  HttpCode,
  HttpStatus,
  Param,
  UnauthorizedException
} from '@nestjs/common';
import { CompanyService } from './company.service';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { ResponseUtil } from 'src/common/utils/response.util';

@ApiTags('company')
@Controller('company')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Get('profile')
  @ApiOperation({ summary: 'Get company profile' })
  @ApiResponse({ status: 200, description: 'Company profile retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Company not found' })
  async getCompanyProfile(@Req() req) {
    let profile = await this.companyService.getCompanyById(req.companyId);
    return ResponseUtil.success(
      'company profile data',
       profile
    )
  }

  @Patch('update')
  @ApiOperation({ summary: 'Update company profile' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  @ApiResponse({ status: 404, description: 'Company not found' })
  async updateCompanyProfile(@Req() req, @Body() updateCompanyDto: UpdateCompanyDto) {
    let result = await this.companyService.updateCompany(req.companyId, updateCompanyDto);
    return ResponseUtil.created(
      'updated successfully',
      result
    )
  }

  @Delete('delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete company profile' })
  @ApiResponse({ status: 204, description: 'Profile deleted successfully' })
  @ApiResponse({ status: 404, description: 'Company not found' })
  async deleteCompanyProfile(@Req() req) {
    let result = await this.companyService.deleteCompany(req.companyId);
    return ResponseUtil.noContent('profile deleted')
  }
}