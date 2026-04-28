import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { PassportModule } from "@nestjs/passport";
import { JwtModule } from "@nestjs/jwt";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { PrismaModule } from "./common/prisma/prisma.module";
import { AuthModule } from "./modules/auth/auth.module";
import { UsersModule } from "./modules/users/users.module";
import { MessModule } from "./modules/mess/mess.module";
import { MonthsModule } from "./modules/months/months.module";
import { MembersModule } from "./modules/members/members.module";
import { MealsModule } from "./modules/meals/meals.module";
import { CostsModule } from "./modules/costs/costs.module";
import { ExpensesModule } from "./modules/expenses/expenses.module";
import { DepositsModule } from "./modules/deposits/deposits.module";
import { SettlementModule } from "./modules/settlement/settlement.module";
import { ReportsModule } from "./modules/reports/reports.module";
import { DashboardModule } from "./modules/dashboard/dashboard.module";
import { BazarModule } from "./modules/bazar/bazar.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [".env.local", ".env"],
    }),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET || "your-secret-key",
      signOptions: { expiresIn: (process.env.JWT_EXPIRATION || "7d") as any },
    }),
    PassportModule.register({ defaultStrategy: "jwt" }),
    PrismaModule,
    AuthModule,
    UsersModule,
    MessModule,
    MonthsModule,
    MembersModule,
    MealsModule,
    CostsModule,
    ExpensesModule,
    DepositsModule,
    SettlementModule,
    ReportsModule,
    DashboardModule,
    BazarModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
