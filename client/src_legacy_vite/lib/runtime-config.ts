export const runtimeConfig = {
  messId: process.env.NEXT_PUBLIC_MESS_ID || "",
  monthId: process.env.NEXT_PUBLIC_MONTH_ID || "",
};

export function configHint() {
  if (!runtimeConfig.messId || !runtimeConfig.monthId) {
    return "Set NEXT_PUBLIC_MESS_ID and NEXT_PUBLIC_MONTH_ID in client/.env.local to load live data.";
  }

  return null;
}
