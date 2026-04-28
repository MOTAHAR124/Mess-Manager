import { Module } from "@nestjs/common";
import { MembersController } from "./controllers/members.controller";
import { MembersService } from "./services/members.service";
import { MembersRepository } from "./repositories/members.repository";
import { PrismaModule } from "../../common/prisma/prisma.module";

@Module({
  imports: [PrismaModule],
  controllers: [MembersController],
  providers: [MembersService, MembersRepository],
  exports: [MembersService],
})
export class MembersModule {}
