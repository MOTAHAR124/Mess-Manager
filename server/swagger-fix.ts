import { Project } from "ts-morph";
import type { SourceFile } from "ts-morph";

const project = new Project({
    tsConfigFilePath: "tsconfig.json",
});

const dtoFiles = project.getSourceFiles("src/modules/**/*.dto.ts");
const controllerFiles = project.getSourceFiles("src/modules/**/*.controller.ts");

console.log(`Found ${dtoFiles.length} DTO files, ${controllerFiles.length} controller files.`);

function getOrAddImport(sourceFile: SourceFile, moduleSpecifier: string, namedImport: string, alias?: string) {
    if (!namedImport) return;
    let importDecl = sourceFile.getImportDeclaration(moduleSpecifier);
    if (!importDecl) {
        importDecl = sourceFile.addImportDeclaration({
            moduleSpecifier,
            namedImports: [alias ? { name: namedImport, alias } : { name: namedImport }]
        });
    } else {
        const hasNamed = importDecl.getNamedImports().some(ni => (alias ? ni.getAliasNode()?.getText() === alias : ni.getName() === namedImport));
        if (!hasNamed) {
            importDecl.addNamedImport(alias ? { name: namedImport, alias } : { name: namedImport });
        }
    }
}

// Process DTOs
for (const file of dtoFiles) {
    // skip
}

// Process Controllers
for (const file of controllerFiles) {
    let modified = false;
    const classes = file.getClasses();
    
    // Check if we need to remove our previously added `ApiResponse` without alias
    const swaggerImport = file.getImportDeclaration('@nestjs/swagger');
    if (swaggerImport) {
        const apiResponseImport = swaggerImport.getNamedImports().find(ni => ni.getName() === 'ApiResponse' && !ni.getAliasNode());
        if (apiResponseImport) {
            apiResponseImport.remove();
            modified = true;
        }
    }

    // Check if ApiResponse is imported from elsewhere
    let useAlias = false;
    const commonImports = file.getImportDeclarations().find(d => d.getModuleSpecifierValue() === '@/common/dto/response.dto');
    if (commonImports && commonImports.getNamedImports().some(ni => ni.getName() === 'ApiResponse')) {
        useAlias = true;
    }

    for (const cls of classes) {
        const methods = cls.getMethods();
        for (const method of methods) {
             const hasRoute = ['Get', 'Post', 'Put', 'Patch', 'Delete'].some(d => method.getDecorator(d));
             if (hasRoute) {
                 // Replace old ApiResponse if any
                 const oldApiResponse = method.getDecorator('ApiResponse');
                 if (oldApiResponse && oldApiResponse.getText().includes('Success')) {
                     oldApiResponse.remove();
                     modified = true;
                 }
                 
                 const decoratorName = useAlias ? 'SwaggerApiResponse' : 'ApiResponse';
                 
                 if (!method.getDecorator(decoratorName)) {
                     getOrAddImport(file, '@nestjs/swagger', 'ApiResponse', useAlias ? 'SwaggerApiResponse' : undefined);
                     method.addDecorator({
                         name: decoratorName,
                         arguments: [`{ status: 200, description: 'Success' }`]
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
