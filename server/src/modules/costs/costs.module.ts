import { Module } from "@nestjs/common";
import { CostsController } from "./controllers/costs.controller";
import { CostsService } from "./services/costs.service";
import { CostsRepository } from "./repositories/costs.repository";
import { PrismaModule } from "../../common/prisma/prisma.module";

@Module({
  imports: [PrismaModule],
  controllers: [CostsController],
  providers: [CostsService, CostsRepository],
  exports: [CostsService],
})
export class CostsModule {}
