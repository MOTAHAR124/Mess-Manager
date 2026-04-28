export function StatCard({ title, value, hint }: { title: string; value: string; hint: string }) {
  return (
    <article className="card group p-5 transition duration-200 hover:-translate-y-0.5 hover:shadow-lg">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">{title}</p>
      <p className="mt-2 text-3xl font-extrabold text-slate-900">{value}</p>
      <p className="mt-2 text-sm font-medium text-slate-600">{hint}</p>
      <div className="mt-4 h-1.5 w-16 rounded-full bg-slate-200 transition group-hover:w-24 group-hover:bg-blue-400" />
    </article>
  );
}
