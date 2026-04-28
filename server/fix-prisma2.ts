import { Project } from "ts-morph";

const project = new Project({
    tsConfigFilePath: "tsconfig.json",
});

// 1. costs.repository.ts -> fix distribution
const costsRepo = project.getSourceFileOrThrow("src/modules/costs/repositories/costs.repository.ts");
const createMethodCosts = costsRepo.getClassOrThrow("CostsRepository").getMethodOrThrow("create");
createMethodCosts.setBodyText(`
    const { distribution, ...rest } = data as any;
    return this.prisma.cost.create({
      data: {
        ...rest,
        distribution: distribution ? {
          create: distribution
        } : undefined
      },
      include: {
        distribution: true,
      },
    });
`);
const updateMethodCosts = costsRepo.getClassOrThrow("CostsRepository").getMethodOrThrow("update");
updateMethodCosts.setBodyText(`
    const { distribution, ...rest } = data as any;
    return this.prisma.cost.update({
      where: { id },
      data: {
        ...rest,
        distribution: distribution ? {
          deleteMany: {},
          create: distribution
        } : undefined
      },
      include: {
        distribution: true,
      },
    });
`);
costsRepo.saveSync();


// 2. settlement.service.ts -> totalMealCost
const setService = project.getSourceFileOrThrow("src/modules/settlement/services/settlement.service.ts");
const calcSet = setService.getClassOrThrow("SettlementService").getMethodOrThrow("calculateSettlement");
const setBody = calcSet.getBodyText() || '';
calcSet.setBodyText(setBody.replace("return this.settlementRepository.create({", "return this.settlementRepository.create({\ntotalMealCost: costResult.totalMealCost || 0,"));
setService.saveSync();

// 3. removes
const depDto = project.getSourceFileOrThrow("src/modules/deposits/dto/deposit.dto.ts");
depDto.getImportDeclaration("class-validator")?.getNamedImports().forEach(n => {
    if (n.getName() === "ValidateNested") n.remove();
});
depDto.getImportDeclaration("class-transformer")?.remove();
depDto.saveSync();

const membersService = project.getSourceFileOrThrow("src/modules/members/services/members.service.ts");
membersService.getImportDeclaration("@prisma/client")?.getNamedImports().forEach(n => {
    if (n.getName() === "Role") n.remove();
});
membersService.saveSync();
