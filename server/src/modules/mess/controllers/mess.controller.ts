import {
  Controller,
  Post,
  Get,
  Put,
  Body,
  Param,
  UseGuards,
} from "@nestjs/common";
import { MessService } from "../services/mess.service";
import { ApiResponse } from "@/common/dto/response.dto";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { CreateMessDto, UpdateMessDto } from "../dto/create-mess.dto";
import { User } from "../../auth/decorators/user.decorator";
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse as SwaggerApiResponse } from "@nestjs/swagger";

@Controller("mess")
@UseGuards(JwtAuthGuard)
@ApiTags('Mess')
export class MessController {
  constructor(private readonly messService: MessService) {}

  @Post()
    @ApiOperation({ summary: 'Create Mess' })
    @ApiBearerAuth('access-token')
    @SwaggerApiResponse({ status: 200, description: 'Success' })
  async createMess(@Body() data: CreateMessDto, @User("id") userId: string) {
    const mess = await this.messService.createMess(userId, data);
    return ApiResponse.success(mess, "Mess created successfully");
  }

  @Get("current")
    @ApiOperation({ summary: 'Get Current Mess' })
    @ApiBearerAuth('access-token')
    @SwaggerApiResponse({ status: 200, description: 'Success' })
  async getCurrentMess(@User("id") userId: string) {
    const mess = await this.messService.getCurrentMess(userId);
    return ApiResponse.success(mess);
  }

  @Get(":id")
    @ApiOperation({ summary: 'Get Mess' })
    @ApiBearerAuth('access-token')
    @SwaggerApiResponse({ status: 200, description: 'Success' })
  async getMess(@Param("id") id: string) {
    const mess = await this.messService.getMessById(id);
    return ApiResponse.success(mess);
  }

  @Put(":id")
    @ApiOperation({ summary: 'Update Mess' })
    @ApiBearerAuth('access-token')
    @SwaggerApiResponse({ status: 200, description: 'Success' })
  async updateMess(@Param("id") id: string, @Body() data: UpdateMessDto) {
    const mess = await this.messService.updateMess(id, data);
    return ApiResponse.success(mess, "Mess updated successfully");
  }

  @Get(":id/members")
    @ApiOperation({ summary: 'Get Members' })
    @ApiBearerAuth('access-token')
    @SwaggerApiResponse({ status: 200, description: 'Success' })
  async getMembers(@Param("id") id: string) {
    const members = await this.messService.getMembers(id);
    return ApiResponse.success(members);
  }
}
