import { Module } from "@nestjs/common";
import { SettlementController } from "./controllers/settlement.controller";
import { SettlementService } from "./services/settlement.service";
import { SettlementRepository } from "./repositories/settlement.repository";
import { PrismaModule } from "../../common/prisma/prisma.module";

@Module({
  imports: [PrismaModule],
  controllers: [SettlementController],
  providers: [SettlementService, SettlementRepository],
  exports: [SettlementService],
})
export class SettlementModule {}
