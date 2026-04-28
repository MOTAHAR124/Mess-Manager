export type RuntimeConfig = {
  messId: string;
  monthId: string;
};

export type RuntimeChangeDetail = {
  config: RuntimeConfig;
  token: string;
};

const STORAGE_KEYS = {
  token: "meso_jwt_token",
  refreshToken: "meso_jwt_refresh_token",
  messId: "meso_mess_id",
  monthId: "meso_month_id",
} as const;

const RUNTIME_EVENT = "meso:runtime-change";

const envDefaults: RuntimeConfig = {
  messId: process.env.NEXT_PUBLIC_MESS_ID || "",
  monthId: process.env.NEXT_PUBLIC_MONTH_ID || "",
};

export function getRuntimeConfig(): RuntimeConfig {
  if (typeof window === "undefined") {
    return envDefaults;
  }

  return {
    messId: localStorage.getItem(STORAGE_KEYS.messId) || envDefaults.messId,
    monthId: localStorage.getItem(STORAGE_KEYS.monthId) || envDefaults.monthId,
  };
}

export function saveRuntimeConfig(config: RuntimeConfig) {
  if (typeof window === "undefined") return;
  const messId = config.messId.trim();
  const monthId = config.monthId.trim();

  if (messId) {
    localStorage.setItem(STORAGE_KEYS.messId, messId);
  } else {
    localStorage.removeItem(STORAGE_KEYS.messId);
  }

  if (monthId) {
    localStorage.setItem(STORAGE_KEYS.monthId, monthId);
  } else {
    localStorage.removeItem(STORAGE_KEYS.monthId);
  }

  emitRuntimeChange();
}

export function getAuthToken() {
  if (typeof window === "undefined") {
    return process.env.NEXT_PUBLIC_API_TOKEN || "";
  }

  return localStorage.getItem(STORAGE_KEYS.token) || process.env.NEXT_PUBLIC_API_TOKEN || "";
}

export function saveAuthToken(token: string) {
  if (typeof window === "undefined") return;
  const trimmedToken = token.trim();
  if (!trimmedToken) {
    localStorage.removeItem(STORAGE_KEYS.token);
    emitRuntimeChange();
    return;
  }
  localStorage.setItem(STORAGE_KEYS.token, trimmedToken);
  emitRuntimeChange();
}

export function getRefreshToken() {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(STORAGE_KEYS.refreshToken) || "";
}

export function saveRefreshToken(token: string) {
  if (typeof window === "undefined") return;
  const trimmedToken = token.trim();
  if (!trimmedToken) {
    localStorage.removeItem(STORAGE_KEYS.refreshToken);
    emitRuntimeChange();
    return;
  }
  localStorage.setItem(STORAGE_KEYS.refreshToken, trimmedToken);
  emitRuntimeChange();
}

export function clearSession() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEYS.token);
  localStorage.removeItem(STORAGE_KEYS.refreshToken);
  localStorage.removeItem("meso_auth_user");
  emitRuntimeChange();
}

export function listenRuntimeChange(handler: (detail: RuntimeChangeDetail) => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  const runHandler = () => {
    handler({
      config: getRuntimeConfig(),
      token: getAuthToken(),
    });
  };

  const onCustomEvent = () => runHandler();
  const onStorage = (event: StorageEvent) => {
    if (!event.key || event.key.startsWith("meso_")) {
      runHandler();
    }
  };

  window.addEventListener(RUNTIME_EVENT, onCustomEvent);
  window.addEventListener("storage", onStorage);

  return () => {
    window.removeEventListener(RUNTIME_EVENT, onCustomEvent);
    window.removeEventListener("storage", onStorage);
  };
}

export function configHint(config: RuntimeConfig) {
  if (!config.messId || !config.monthId) {
    return "Set Mess ID and Month ID in Runtime Settings (top bar) to load live data.";
  }

  return null;
}

function emitRuntimeChange() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(RUNTIME_EVENT));
}
