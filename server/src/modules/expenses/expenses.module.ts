import { Module } from "@nestjs/common";
import { ExpensesController } from "./controllers/expenses.controller";
import { ExpensesService } from "./services/expenses.service";
import { ExpensesRepository } from "./repositories/expenses.repository";
import { PrismaModule } from "../../common/prisma/prisma.module";

@Module({
  imports: [PrismaModule],
  controllers: [ExpensesController],
  providers: [ExpensesService, ExpensesRepository],
  exports: [ExpensesService],
})
export class ExpensesModule {}
