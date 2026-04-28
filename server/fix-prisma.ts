import { Project } from "ts-morph";

const project = new Project({
    tsConfigFilePath: "tsconfig.json",
});

// 1. costs.repository.ts -> Change Prisma.CostCreateInput to Prisma.CostUncheckedCreateInput
const costsRepo = project.getSourceFileOrThrow("src/modules/costs/repositories/costs.repository.ts");
const createMethodCosts = costsRepo.getClassOrThrow("CostsRepository").getMethodOrThrow("create");
createMethodCosts.getParameters()[0].setType("Prisma.CostUncheckedCreateInput");

const updateMethodCosts = costsRepo.getClassOrThrow("CostsRepository").getMethodOrThrow("update");
updateMethodCosts.getParameters()[1].setType("Prisma.CostUncheckedUpdateInput");

costsRepo.saveSync();

// 2. costs.service.ts -> deal with partial types
const costsService = project.getSourceFileOrThrow("src/modules/costs/services/costs.service.ts");
const calcDist = costsService.getClassOrThrow("CostsService").getMethodOrThrow("calculateDistribution");
calcDist.setBodyText(`
    const processed = { ...data } as any;
    if (processed.type === "SHARED") {
      const members = await this.costsRepository.getMessMembers(processed.messId);
      const splitAmount = processed.amount / members.length;
      processed.distribution = members.map((m: any) => ({
        memberId: m.userId,
        amount: splitAmount,
      }));
    } else if (processed.type === "INDIVIDUAL" && processed.memberId) {
      processed.distribution = [
        {
          memberId: processed.memberId,
          amount: processed.amount,
        },
      ];
    }
    return processed;
`);
costsService.saveSync();

// 3. deposits.repository.ts -> Change DepositCreateInput to DepositUncheckedCreateInput
const depRepo = project.getSourceFileOrThrow("src/modules/deposits/repositories/deposits.repository.ts");
const createMethodDep = depRepo.getClassOrThrow("DepositsRepository").getMethodOrThrow("create");
createMethodDep.getParameters()[0].setType("Prisma.DepositUncheckedCreateInput");
const updateMethodDep = depRepo.getClassOrThrow("DepositsRepository").getMethodOrThrow("update");
updateMethodDep.getParameters()[1].setType("Prisma.DepositUncheckedUpdateInput");
depRepo.saveSync();

// 4. meals.repository.ts -> UpsertMany meal.monthId
let mealsRepo = project.getSourceFileOrThrow("src/modules/meals/repositories/meals.repository.ts");
const upsertMany = mealsRepo.getClassOrThrow("MealsRepository").getMethodOrThrow("upsertMany");
upsertMany.getParameters()[0].setType("Prisma.MealUncheckedCreateInput[]");
mealsRepo.saveSync();

// 5. members.service.ts -> typecast Role
let membersService = project.getSourceFileOrThrow("src/modules/members/services/members.service.ts");
const updateRoleMethod = membersService.getClassOrThrow("MembersService").getMethodOrThrow("updateRole");
// Add import if missing
importDecl = membersService.getImportDeclaration("@prisma/client");
if (!importDecl) {
    membersService.addImportDeclaration({
        moduleSpecifier: "@prisma/client",
        namedImports: ["Role"]
    });
} else {
    // we assume it is there
}
// just cast
const textBody = updateRoleMethod.getBodyText() || "";
updateRoleMethod.setBodyText(textBody.replace("update(id, { role })", "update(id, { role: role as any })"));
membersService.saveSync();


// 6. settlement.repository.ts -> UncheckedCreateInput and monthId bug
const setRepo = project.getSourceFileOrThrow("src/modules/settlement/repositories/settlement.repository.ts");
const smCreate = setRepo.getClassOrThrow("SettlementRepository").getMethodOrThrow("create");
smCreate.getParameters()[0].setType("Prisma.SettlementUncheckedCreateInput");
const smUpdate = setRepo.getClassOrThrow("SettlementRepository").getMethodOrThrow("update");
smUpdate.getParameters()[1].setType("Prisma.SettlementUncheckedUpdateInput");

smCreate.setBodyText(`
    const exists = await this.prisma.settlement.findUnique({
      where: { monthId: data.monthId as string },
    });

    if (exists) {
      return this.update(exists.id, data as any);
    }

    return this.prisma.settlement.create({
      data: data as any,
    });
`);
setRepo.saveSync();

// 7. settlement.service.ts -> Remove monthId or map correctly
const setService = project.getSourceFileOrThrow("src/modules/settlement/services/settlement.service.ts");
const calcSet = setService.getClassOrThrow("SettlementService").getMethodOrThrow("calculateSettlement");
const setBody = calcSet.getBodyText() || '';
calcSet.setBodyText(setBody.replace("return {", "return { monthId,")
    .replace("totalMealCost: costResult.totalMealCost", "totalMealCost: costResult.totalMealCost")
    .replace("monthId,", "monthId,")
    );
setService.saveSync();

