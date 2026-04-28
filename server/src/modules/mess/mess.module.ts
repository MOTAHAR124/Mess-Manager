import { Module } from "@nestjs/common";
import { MessController } from "./controllers/mess.controller";
import { MessService } from "./services/mess.service";
import { MessRepository } from "./repositories/mess.repository";
import { PrismaModule } from "../../common/prisma/prisma.module";

@Module({
  imports: [PrismaModule],
  controllers: [MessController],
  providers: [MessService, MessRepository],
  exports: [MessService],
})
export class MessModule {}
