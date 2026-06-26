import { Icon, type IconName } from './Icon.js';

type Tone = 'brand' | 'emerald' | 'amber' | 'rose' | 'violet' | 'sky' | 'neutral';

interface StatsCardProps {
  label: string;
  value: string | number;
  sub?:  string;
  icon:  IconName;
  tone?: Tone;
}

const tones: Record<Tone, string> = {
  brand:   'bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400',
  emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
  amber:   'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
  rose:    'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400',
  violet:  'bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400',
  sky:     'bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-400',
  neutral: 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300',
};

export function StatsCard({ label, value, sub, icon, tone = 'neutral' }: StatsCardProps) {
  return (
    <div className="card p-5 transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${tones[tone]}`}>
        <Icon name={icon} size={20} />
      </span>
      <div className="mt-4 text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">{value}</div>
      <div className="mt-1 text-sm font-medium text-neutral-500 dark:text-neutral-400">{label}</div>
      {sub && <div className="mt-0.5 text-xs text-neutral-400 dark:text-neutral-500">{sub}</div>}
    </div>
  );
}
