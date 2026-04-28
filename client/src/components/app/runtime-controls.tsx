"use client";

import { useMemo, useState } from "react";
import { clearSession, getAuthToken, getRuntimeConfig, saveAuthToken, saveRuntimeConfig } from "@/lib/runtime-config";

export function RuntimeControls() {
  const initial = useMemo(() => getRuntimeConfig(), []);
  const initialToken = useMemo(() => getAuthToken(), []);
  const [messId, setMessId] = useState(initial.messId);
  const [monthId, setMonthId] = useState(initial.monthId);
  const [token, setToken] = useState(initialToken);
  const [saved, setSaved] = useState(false);
  const hasAnyValue = Boolean(messId.trim() || monthId.trim() || token.trim());

  const onSave = () => {
    if (!hasAnyValue) return;
    saveRuntimeConfig({ messId: messId.trim(), monthId: monthId.trim() });
    saveAuthToken(token.trim());
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  const onClearToken = () => {
    setToken("");
    clearSession();
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white/70 p-3 sm:p-4">
      <p className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Runtime Settings</p>
      <div className="grid gap-2.5 lg:grid-cols-5">
        <input
          value={messId}
          onChange={(e) => setMessId(e.target.value)}
          placeholder="Mess ID"
          className="bg-white px-3 py-2 text-sm"
        />
        <input
          value={monthId}
          onChange={(e) => setMonthId(e.target.value)}
          placeholder="Month ID"
          className="bg-white px-3 py-2 text-sm"
        />
        <input
          type="password"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="JWT Token (optional)"
          className="bg-white px-3 py-2 text-sm"
        />
        <button
          onClick={onSave}
          disabled={!hasAnyValue}
          className="primary-btn px-2 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saved ? "Saved" : "Save"}
        </button>
        <button
          type="button"
          onClick={onClearToken}
          className="secondary-btn px-2 py-2 text-sm"
        >
          Clear Session
        </button>
      </div>
    </div>
  );
}
