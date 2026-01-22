import { Controller, Post, Delete, Get, Body, Param, Req, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { UserDepartmentService } from './user-department.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@ApiTags('user-department')
@Controller('user-department')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class UserDepartmentController {
  constructor(private readonly service: UserDepartmentService) {}

  @Post('assign')
  @ApiOperation({ summary: 'Assign user to department' })
  async assignUser(
    @Req() req,
    @Body('userId', ParseUUIDPipe) userId: string,
    @Body('departmentId', ParseUUIDPipe) departmentId: string
  ) {
    return await this.service.assignUserToDepartment(userId, departmentId, req.companyId);
  }

  @Delete('remove')
  @ApiOperation({ summary: 'Remove user from department' })
  async removeUser(
    @Req() req,
    @Body('userId', ParseUUIDPipe) userId: string,
    @Body('departmentId', ParseUUIDPipe) departmentId: string
  ) {
    return await this.service.removeUserFromDepartment(userId, departmentId, req.companyId);
  }

  @Get('user/:userId/departments')
  @ApiOperation({ summary: 'Get all departments of a user' })
  async getUserDepartments(@Req() req, @Param('userId', ParseUUIDPipe) userId: string) {
    return await this.service.getUserDepartments(userId, req.companyId);
  }

  @Get('department/:departmentId/users')
  @ApiOperation({ summary: 'Get all users in a department' })
  async getDepartmentUsers(@Req() req, @Param('departmentId', ParseUUIDPipe) departmentId: string) {
    return await this.service.getDepartmentUsers(departmentId, req.companyId);
  }
}