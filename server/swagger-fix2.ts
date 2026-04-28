import { Project } from "ts-morph";
import type { SourceFile } from "ts-morph";

const project = new Project({
    tsConfigFilePath: "tsconfig.json",
});

const controllerFiles = project.getSourceFiles("src/modules/**/*.controller.ts");

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

for (const file of controllerFiles) {
    let modified = false;
    
    let useAlias = false;
    for (const d of file.getImportDeclarations()) {
        if (d.getModuleSpecifierValue() !== '@nestjs/swagger') {
            if (d.getNamedImports().some(ni => ni.getName() === 'ApiResponse')) {
                useAlias = true;
                break;
            }
        }
    }

    const swaggerImport = file.getImportDeclaration('@nestjs/swagger');
    if (swaggerImport && useAlias) {
        const apiResponseImport = swaggerImport.getNamedImports().find(ni => ni.getName() === 'ApiResponse' && !ni.getAliasNode());
        if (apiResponseImport) {
            apiResponseImport.remove();
            modified = true;
        }
    }

    const classes = file.getClasses();
    for (const cls of classes) {
        const methods = cls.getMethods();
        for (const method of methods) {
             const hasRoute = ['Get', 'Post', 'Put', 'Patch', 'Delete'].some(d => method.getDecorator(d));
             if (hasRoute) {
                 const oldApiResponse = method.getDecorator('ApiResponse');
                 if (oldApiResponse && useAlias) {
                     const isSuccess = oldApiResponse.getText().includes('Success');
                     oldApiResponse.remove();
                     if (!method.getDecorator('SwaggerApiResponse')) {
                         getOrAddImport(file, '@nestjs/swagger', 'ApiResponse', 'SwaggerApiResponse');
                         method.addDecorator({
                             name: 'SwaggerApiResponse',
                             arguments: [`{ status: 200, description: 'Success' }`]
                         });
                         modified = true;
                     }
                 }
             }
        }
    }
    if (modified) {
        file.saveSync();
        console.log(`Fixed collision in ${file.getFilePath()}`);
    }
}
