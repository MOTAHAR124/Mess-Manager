type PageHeaderProps = {
  title: string;
  description: string;
  action?: React.ReactNode;
};

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="chip mb-3">Workspace</p>
        <h1 className="text-3xl font-black text-slate-900 sm:text-4xl">{title}</h1>
        <p className="mt-1.5 text-sm text-slate-600 sm:text-base">{description}</p>
      </div>
      {action}
    </div>
  );
}
