const fs = require('fs');
const glob = require('glob'); // Not installed maybe? I'll use simple fs read/write

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

  // Costs.tsx
  content = content.replace('(cost: any)', '(cost: import("@/types/common").Cost)');
  
  // Deposits.tsx
  content = content.replace('(deposit: any)', '(deposit: import("@/types/common").Deposit)');
  
  // Meals.tsx
  content = content.replace('Record<string, Record<string, any>>', 'Record<string, Record<string, import("@/types/common").Meal>>');
  content = content.replace('currentMeals?: any', 'currentMeals?: import("@/types/common").Meal');
  content = content.replace('(sum: number, meal: any)', '(sum: number, meal: import("@/types/common").Meal)');
  
  // Members.tsx
  content = content.replace('} as any);', '});');
  content = content.replace('const startEdit = (member: any)', 'const startEdit = (member: import("@/types/common").MessMember)');
  content = content.replace('memberList.map((member: any)', 'memberList.map((member: import("@/types/common").MessMember)');
  
  // BazarModal.tsx
  content = content.replace('members.map((member: any)', 'members.map((member: import("@/types/common").MessMember)');
  
  // Catch blocks
  content = content.replace(/catch\s*\(\s*err\s*:\s*any\s*\)/g, 'catch (err: unknown)');
  content = content.replace(/catch\s*\(\s*error\s*:\s*any\s*\)/g, 'catch (error: unknown)');

  // api.ts
  content = content.replace('const originalRequest: any = error.config', 'const originalRequest = error.config as import("axios").InternalAxiosRequestConfig & { _retry?: boolean }');
  content = content.replace('(url: string, params?: any)', '(url: string, params?: Record<string, unknown>)');
  content = content.replace('(url: string, data?: any)', '(url: string, data?: unknown)');
  content = content.replace('(url: string, data?: any)', '(url: string, data?: unknown)');

  // authService.ts
  content = content.replace('resetPassword(data: any)', 'resetPassword(data: { token: string; newPassword: string })');

  fs.writeFileSync(file, content, 'utf8');
  console.log(`Fixed any in ${file}`);
}
