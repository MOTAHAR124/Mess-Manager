import { Controller, Get, Put, Body, UseGuards } from "@nestjs/common";
import { UsersService } from "../services/users.service";
import { ApiResponse } from "@/common/dto/response.dto";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { User } from "../../auth/decorators/user.decorator";
import { UpdateUserDto } from "../dto/update-user.dto";
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse as SwaggerApiResponse } from "@nestjs/swagger";

@Controller("users")
@UseGuards(JwtAuthGuard)
@ApiTags('Users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get("me")
    @ApiOperation({ summary: 'Get Me' })
    @ApiBearerAuth('access-token')
    @SwaggerApiResponse({ status: 200, description: 'Success' })
  async getMe(@User("id") userId: string) {
    const user = await this.usersService.getUserById(userId);
    return ApiResponse.success(user);
  }

  @Put("me")
    @ApiOperation({ summary: 'Update Profile' })
    @ApiBearerAuth('access-token')
    @SwaggerApiResponse({ status: 200, description: 'Success' })
  async updateProfile(
    @User("id") userId: string,
    @Body() data: UpdateUserDto,
  ) {
    const user = await this.usersService.updateUser(userId, data);
    return ApiResponse.success(user, "Profile updated successfully");
  }
}
