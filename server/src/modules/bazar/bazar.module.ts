import { Module } from "@nestjs/common";
import { BazarService } from "./services/bazar.service";
import { BazarController } from "./controllers/bazar.controller";
import { PrismaModule } from "../../common/prisma/prisma.module";

@Module({
  imports: [PrismaModule],
  controllers: [BazarController],
  providers: [BazarService],
  exports: [BazarService],
})
export class BazarModule {}
