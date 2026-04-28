import {
  Controller,
  Post,
  Get,
  Delete,
  Put,
  Body,
  Param,
  UseGuards,
} from "@nestjs/common";
import { MembersService } from "../services/members.service";
import { ApiResponse } from "@/common/dto/response.dto";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { IsEmail, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse as SwaggerApiResponse } from "@nestjs/swagger";

class AddMemberDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  messId: string;

  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;
}

class UpdateMemberDto {
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  role?: string;
}

@Controller("members")
@UseGuards(JwtAuthGuard)
@ApiTags('Members')
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  @Post()
    @ApiOperation({ summary: 'Add Member' })
    @ApiBearerAuth('access-token')
    @SwaggerApiResponse({ status: 200, description: 'Success' })
  async addMember(@Body() dto: AddMemberDto) {
    const member = await this.membersService.addMemberByEmail(
      dto.messId,
      dto.email,
      dto.firstName,
      dto.lastName,
    );
    return ApiResponse.success(member, "Member added successfully");
  }

  @Get(":id")
    @ApiOperation({ summary: 'Get Member' })
    @ApiBearerAuth('access-token')
    @SwaggerApiResponse({ status: 200, description: 'Success' })
  async getMember(@Param("id") id: string) {
    const member = await this.membersService.getMemberById(id);
    return ApiResponse.success(member);
  }

  @Delete(":id")
    @ApiOperation({ summary: 'Remove Member' })
    @ApiBearerAuth('access-token')
    @SwaggerApiResponse({ status: 200, description: 'Success' })
  async removeMember(@Param("id") id: string) {
    await this.membersService.removeMember(id);
    return ApiResponse.success(null, "Member removed successfully");
  }

  @Put(":id/role")
    @ApiOperation({ summary: 'Update Role' })
    @ApiBearerAuth('access-token')
    @SwaggerApiResponse({ status: 200, description: 'Success' })
  async updateRole(@Param("id") id: string, @Body("role") role: string) {
    const member = await this.membersService.updateRole(id, role);
    return ApiResponse.success(member, "Role updated successfully");
  }

  @Put(":id")
    @ApiOperation({ summary: 'Update Member' })
    @ApiBearerAuth('access-token')
    @SwaggerApiResponse({ status: 200, description: 'Success' })
  async updateMember(@Param("id") id: string, @Body() dto: UpdateMemberDto) {
    const member = await this.membersService.updateMember(id, dto);
    return ApiResponse.success(member, "Member updated successfully");
  }
}
