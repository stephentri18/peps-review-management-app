interface BadgeProps {
  status: 'pending' | 'published' | 'rejected';
}

const config = {
  pending:   { label: 'Pending',   dot: 'bg-amber-500',   cls: 'bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-400 dark:ring-amber-400/20'         },
  published: { label: 'Published', dot: 'bg-emerald-500', cls: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-400/20' },
  rejected:  { label: 'Rejected',  dot: 'bg-rose-500',    cls: 'bg-rose-50 text-rose-700 ring-rose-600/20 dark:bg-rose-500/10 dark:text-rose-400 dark:ring-rose-400/20'                 },
};

export function StatusBadge({ status }: BadgeProps) {
  const { label, dot, cls } = config[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${cls}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      {label}
    </span>
  );
}
