interface BadgeProps {
  status: 'pending' | 'published' | 'rejected';
}

const config = {
  pending:   { label: 'Pending',   cls: 'bg-yellow-100 text-yellow-800' },
  published: { label: 'Published', cls: 'bg-green-100  text-green-800'  },
  rejected:  { label: 'Rejected',  cls: 'bg-red-100    text-red-800'    },
};

export function StatusBadge({ status }: BadgeProps) {
  const { label, cls } = config[status];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>
      {label}
    </span>
  );
}