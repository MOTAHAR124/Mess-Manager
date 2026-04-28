import { Module } from "@nestjs/common";
import { MonthsController } from "./controllers/months.controller";
import { MonthsService } from "./services/months.service";
import { MonthsRepository } from "./repositories/months.repository";
import { PrismaModule } from "../../common/prisma/prisma.module";

@Module({
  imports: [PrismaModule],
  controllers: [MonthsController],
  providers: [MonthsService, MonthsRepository],
  exports: [MonthsService],
})
export class MonthsModule {}
