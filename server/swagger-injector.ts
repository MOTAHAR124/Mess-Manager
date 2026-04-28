import { Project } from "ts-morph";
import type { SourceFile } from "ts-morph";

const project = new Project({
    tsConfigFilePath: "tsconfig.json",
});

const dtoFiles = project.getSourceFiles("src/modules/**/*.dto.ts");
const controllerFiles = project.getSourceFiles("src/modules/**/*.controller.ts");
const serviceFiles = project.getSourceFiles("src/modules/**/*.service.ts");

console.log(`Found ${dtoFiles.length} DTO files, ${controllerFiles.length} controller files, ${serviceFiles.length} service files.`);

function getOrAddImport(sourceFile: SourceFile, moduleSpecifier: string, namedImport?: string) {
    if (!namedImport) return;
    let importDecl = sourceFile.getImportDeclaration(moduleSpecifier);
    if (!importDecl) {
        importDecl = sourceFile.addImportDeclaration({
            moduleSpecifier,
            namedImports: [namedImport]
        });
    } else {
        const hasNamed = importDecl.getNamedImports().some(ni => ni.getName() === namedImport);
        if (!hasNamed) {
            importDecl.addNamedImport(namedImport);
        }
    }
}

// Process DTOs
for (const file of dtoFiles) {
    let modified = false;
    const classes = file.getClasses();
    for (const cls of classes) {
        // Skip DTOs that are actually just abstract or standard entity classes that already have it implicitly
        const props = cls.getProperties();
        for (const prop of props) {
            if (prop.getDecorator('ApiProperty') || prop.getDecorator('ApiPropertyOptional') || prop.getDecorator('HideField') || prop.getDecorator('OmitType') || prop.getDecorator('PickType')) {
                continue;
            }
            
            const isOptional = prop.hasQuestionToken() || prop.getDecorator('IsOptional');
            const decoratorName = isOptional ? 'ApiPropertyOptional' : 'ApiProperty';
            
            getOrAddImport(file, '@nestjs/swagger', decoratorName);
            prop.addDecorator({
                name: decoratorName,
                arguments: []
            });
            modified = true;
        }
    }
    if (modified) {
        file.saveSync();
        console.log(`Updated DTO: ${file.getFilePath()}`);
    }
}

// Process Controllers
for (const file of controllerFiles) {
    let modified = false;
    const classes = file.getClasses();
    const baseName = file.getBaseNameWithoutExtension().replace('.controller', '');
    const tag = baseName.charAt(0).toUpperCase() + baseName.slice(1);
    
    for (const cls of classes) {
        // Tag Controller
        if (!cls.getDecorator('ApiTags') && cls.getDecorator('Controller')) {
            getOrAddImport(file, '@nestjs/swagger', 'ApiTags');
            cls.addDecorator({
                name: 'ApiTags',
                arguments: [`'${tag}'`]
            });
            modified = true;
        }
        
        // Operations
        const methods = cls.getMethods();
        for (const method of methods) {
            const hasRoute = ['Get', 'Post', 'Put', 'Patch', 'Delete'].some(d => method.getDecorator(d));
            if (hasRoute) {
                if (!method.getDecorator('ApiOperation')) {
                    getOrAddImport(file, '@nestjs/swagger', 'ApiOperation');
                    const summary = `'${method.getName().replace(/([A-Z])/g, ' $1').trim().replace(/^./, str => str.toUpperCase())}'`;
                    method.addDecorator({
                        name: 'ApiOperation',
                        arguments: [`{ summary: ${summary} }`]
                    });
                    modified = true;
                }
                if (!method.getDecorator('ApiResponse')) {
                    getOrAddImport(file, '@nestjs/swagger', 'ApiResponse');
                    method.addDecorator({
                        name: 'ApiResponse',
                        arguments: [`{ status: 200, description: 'Success' }`]
                    });
                    modified = true;
                }
                 if (!method.getDecorator('ApiBearerAuth')) {
                    getOrAddImport(file, '@nestjs/swagger', 'ApiBearerAuth');
                    method.addDecorator({
                        name: 'ApiBearerAuth',
                        arguments: [`'access-token'`]
                    });
                    modified = true;
                }
            }
        }
    }
    if (modified) {
        file.saveSync();
        console.log(`Updated Controller: ${file.getFilePath()}`);
    }
}
