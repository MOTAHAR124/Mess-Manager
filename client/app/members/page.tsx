"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/app/page-header";
import { StatusStack } from "@/components/app/status-stack";
import { getMembers } from "@/lib/next-api";
import { getRuntimeConfig, listenRuntimeChange, RuntimeConfig } from "@/lib/runtime-config";
import { MemberStatus, MessMember, Role } from "@/types/common";

export default function MembersPage() {
  const [config, setConfig] = useState<RuntimeConfig>({ messId: "", monthId: "" });
  const [members, setMembers] = useState<MessMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hint = config.messId ? null : "Set Mess ID in Runtime Settings (top bar) to load members.";

  async function load(activeConfig?: RuntimeConfig) {
    const cfg = activeConfig ?? config;
    if (!cfg.messId) return;

    try {
      setLoading(true);
      setError(null);
      const memberData = await getMembers(cfg.messId);
      setMembers(memberData || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load members");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const cfg = getRuntimeConfig();
    setConfig(cfg);
    void load(cfg);

    return listenRuntimeChange((detail) => {
      setConfig(detail.config);
      void load(detail.config);
    });
  }, []);

  return (
    <section className="space-y-5">
      <PageHeader title="Members" description="View active mess members and their account status." />
      <StatusStack hint={hint} error={error} />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {members.map((member) => {
          const displayName = `${member.user.firstName} ${member.user.lastName}`.trim() || member.user.email;
          const isManager = member.role === Role.MANAGER;
          const isActive = member.status === MemberStatus.ACTIVE;

          return (
            <article key={member.id} className="card p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-100 font-bold text-orange-600">
                  {displayName[0]}
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="truncate text-sm font-bold text-slate-900">{displayName}</h2>
                  <p className="truncate text-xs text-slate-500">{member.user.email}</p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${isManager ? "bg-red-50 text-red-700" : "bg-slate-100 text-slate-700"}`}>
                  {member.role}
                </span>
                <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${isActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                  {member.status}
                </span>
              </div>

              <p className="mt-4 text-xs text-slate-500">Joined {new Date(member.joinedAt).toLocaleDateString()}</p>
            </article>
          );
        })}
      </div>

      {members.length === 0 && !loading && !hint && (
        <div className="card px-4 py-10 text-center text-sm text-slate-500">No members found for this mess.</div>
      )}
    </section>
  );
}
