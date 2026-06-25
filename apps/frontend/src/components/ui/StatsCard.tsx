interface StatsCardProps {
  label:      string;
  value:      string | number;
  sub?:       string;
  icon:       string;
  color?:     string;
}

export function StatsCard({ label, value, sub, icon, color = 'bg-slate-100' }: StatsCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-start gap-4">
      <div className={`${color} rounded-lg p-3 text-2xl flex-shrink-0`}>{icon}</div>
      <div>
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        <div className="text-sm font-medium text-gray-600">{label}</div>
        {sub && <div className="text-xs text-gray-400 mt-0.5">{sub}</div>}
      </div>
    </div>
  );
}