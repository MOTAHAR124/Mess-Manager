const fs = require('fs');

const filesToFix = [
  'src/pages/Costs.tsx',
  'src/pages/Deposits.tsx',
  'src/pages/ForgotPassword.tsx',
  'src/pages/History.tsx',
  'src/pages/Login.tsx',
  'src/pages/Meals.tsx',
  'src/pages/Members.tsx',
  'src/pages/Profile.tsx',
  'src/pages/Register.tsx',
  'src/pages/ResetPassword.tsx',
  'src/components/modals/BazarModal.tsx',
  'src/services/api.ts',
  'src/services/authService.ts'
];

for (const file of filesToFix) {
  let content = fs.readFileSync(file, 'utf8');

  content = content.replace(/catch\s*\(\s*error\s*:\s*unknown\s*\)\s*\{/g, 
    'catch (e: unknown) { const error = e as Error & { response?: { data?: { message?: string } } };');
  
  content = content.replace(/catch\s*\(\s*err\s*:\s*unknown\s*\)\s*\{/g, 
    'catch (e: unknown) { const err = e as Error & { response?: { data?: { message?: string } } };');

  fs.writeFileSync(file, content, 'utf8');
  console.log(`Fixed unknown type in ${file}`);
}
