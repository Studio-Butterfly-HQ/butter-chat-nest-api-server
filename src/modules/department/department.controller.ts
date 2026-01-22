import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { DepartmentService } from './department.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { ResponseUtil } from 'src/common/utils/response.util';

//for each request:
//logics to check...:
//req.body.company_id == req.company_id or not (request comes from original company)
//user who send the requests belongs to this company or not...
//user who send the request have the autority to manipulate or not...

//api to create :
//1. creating a new department
//2. updating existing department
//3. deleting a department
//4. getting the list of all department
//5. get specific department details

@Controller('department')
@UseGuards(JwtAuthGuard)

export class DepartmentController {
  constructor(private readonly departmentService: DepartmentService) {
    // getting user id from request
    // getting company id from request
    // getting role from request
  }

  //getting the list of all departments...
  @Get()
  async findAll(@Req() req) {
    let res = await this.departmentService.findAll(req.companyId);
    return ResponseUtil.success("department list",res)
  }

  //getting a department details by its id...
  @Get(':id')
  findOne(@Param('id') id: string, @Req() req) {
    return this.departmentService.findOne(id,req.companyId);
  }

  //creates a new department...
  @Post()
  create(
    // @CurrentUser('userId') currentUserId:string,
    @CurrentUser('companyId') companyId:string,
    @Body() createDepartmentDto: CreateDepartmentDto
  ) {
    return this.departmentService.create(companyId,createDepartmentDto);
  }

  //updates a department...
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateDepartmentDto: UpdateDepartmentDto,@Req() req) {
    return this.departmentService.update(id, updateDepartmentDto,req.companyId);
  }

  //deletes a department...
  @Delete(':id')
  remove(@Param('id') id: string,@Req() req) {
    return this.departmentService.remove(id,req.companyId);
  }
}
