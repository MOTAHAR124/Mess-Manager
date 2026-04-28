import { Module } from "@nestjs/common";
import { MealsController } from "./controllers/meals.controller";
import { MealsService } from "./services/meals.service";
import { MealsRepository } from "./repositories/meals.repository";
import { PrismaModule } from "../../common/prisma/prisma.module";

@Module({
  imports: [PrismaModule],
  controllers: [MealsController],
  providers: [MealsService, MealsRepository],
  exports: [MealsService],
})
export class MealsModule {}
