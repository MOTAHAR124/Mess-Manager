export function StatCard({ title, value, hint }: { title: string; value: string; hint: string }) {
  return (
    <article className="card p-5">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{title}</p>
      <p className="mt-2 text-3xl font-extrabold text-slate-900">{value}</p>
      <p className="mt-2 text-sm font-medium text-slate-600">{hint}</p>
    </article>
  );
}
