import { Module } from "@nestjs/common";
import { DepositsController } from "./controllers/deposits.controller";
import { DepositsService } from "./services/deposits.service";
import { DepositsRepository } from "./repositories/deposits.repository";
import { PrismaModule } from "../../common/prisma/prisma.module";

@Module({
  imports: [PrismaModule],
  controllers: [DepositsController],
  providers: [DepositsService, DepositsRepository],
  exports: [DepositsService],
})
export class DepositsModule {}
