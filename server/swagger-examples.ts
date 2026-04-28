import { Project, SyntaxKind } from "ts-morph";

const project = new Project({
    tsConfigFilePath: "tsconfig.json",
});

const dtoFiles = project.getSourceFiles("src/modules/**/*.dto.ts");

const exampleGenerators = [
    { match: /email/i, value: "'user@example.com'" },
    { match: /password/i, value: "'StrongP@ssw0rd1!'" },
    { match: /firstName/i, value: "'John'" },
    { match: /lastName/i, value: "'Doe'" },
    { match: /phone/i, value: "'+1234567890'" },
    { match: /amount|cost|balance/i, value: "150.50" },
    { match: /date|createdAt|updatedAt|lastLogin/i, value: "'2026-04-10T10:00:00Z'" },
    { match: /id$/i, value: "'123e4567-e89b-12d3-a456-426614174000'" },
    { match: /messId|monthId|memberId|userId/i, value: "'123e4567-e89b-12d3-a456-426614174000'" },
    { match: /status/i, value: "'ACTIVE'" },
    { match: /type/i, value: "'SHARED'" },
    { match: /details|description/i, value: "'Sample description text'" },
    { match: /name/i, value: "'Sample Name'" },
    { match: /token/i, value: "'jwt.token.string'" },
    { match: /cursor/i, value: "'eyJpZCI6MTIzfQ=='" },
    { match: /(breakfast|lunch|dinner|count|total|pageSize)/i, value: "1" },
    { match: /success|hasMore|isVerified/i, value: "true" }
];

function generateExample(propName: string, propType: string): string {
    for (const gen of exampleGenerators) {
        if (gen.match.test(propName)) {
            return gen.value;
        }
    }
    if (propType.includes('number')) return '0';
    if (propType.includes('boolean')) return 'false';
    return "'string'";
}

for (const file of dtoFiles) {
    let modified = false;
    const classes = file.getClasses();
    
    for (const cls of classes) {
        for (const prop of cls.getProperties()) {
            const apiProp = prop.getDecorator('ApiProperty') || prop.getDecorator('ApiPropertyOptional');
            if (apiProp) {
                const args = apiProp.getArguments();
                let objArg = args.find(a => a.getKind() === SyntaxKind.ObjectLiteralExpression);
                
                const propType = prop.getTypeNode()?.getText() || 'string';
                const exampleValue = generateExample(prop.getName(), propType);

                if (!objArg) {
                    apiProp.addArgument(`{ example: ${exampleValue} }`);
                    modified = true;
                } else {
                    const objNode = objArg.asKind(SyntaxKind.ObjectLiteralExpression);
                    if (objNode && !objNode.getProperty('example')) {
                        objNode.addPropertyAssignment({
                            name: 'example',
                            initializer: exampleValue
                        });
                        modified = true;
                    }
                }
            }
        }
    }
    
    if (modified) {
        file.saveSync();
        console.log(`Added examples to DTO: ${file.getFilePath()}`);
    }
}
