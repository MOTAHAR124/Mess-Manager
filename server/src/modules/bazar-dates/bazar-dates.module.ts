import { Module } from "@nestjs/common";
import { BazarDatesController } from "./controllers/bazar-dates.controller";
import { BazarDatesService } from "./services/bazar-dates.service";
import { BazarDatesRepository } from "./repositories/bazar-dates.repository";
import { PrismaModule } from "../../common/prisma/prisma.module";

@Module({
  imports: [PrismaModule],
  controllers: [BazarDatesController],
  providers: [BazarDatesService, BazarDatesRepository],
  exports: [BazarDatesService],
})
export class BazarDatesModule {}
