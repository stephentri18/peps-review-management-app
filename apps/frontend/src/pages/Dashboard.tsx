import { useState } from 'react';
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from 'recharts';
import {
  useOverviewStats, useVolumeData,
  useStoreStats, useRatingDistribution,
} from '../hooks/useAnalytics.js';
import { StatsCard } from '../components/ui/StatsCard.js';
import { Spinner }   from '../components/ui/Spinner.js';
import { useThemeStore } from '../store/themeStore.js';

const RATING_COLORS = ['#f43f5e', '#fb923c', '#facc15', '#a3e635', '#34d399'];

export function Dashboard() {
  const [interval, setInterval] = useState<'day' | 'week' | 'month'>('day');
  const [days, setDays]         = useState(30);

  const isDark = useThemeStore((s) => s.theme === 'dark');
  const gridStroke   = isDark ? '#27272a' : '#f1f1f4';
  const cursorStroke = isDark ? '#3f3f46' : '#e5e7eb';
  const tooltipStyle = {
    borderRadius: 12,
    fontSize: 12,
    border: `1px solid ${isDark ? '#3f3f46' : '#e5e7eb'}`,
    background: isDark ? '#18181b' : '#ffffff',
    color: isDark ? '#e5e5e5' : '#171717',
    boxShadow: '0 4px 12px -2px rgb(15 23 42 / 0.12)',
  };

  const { data: stats, isLoading } = useOverviewStats();
  const { data: volume }   = useVolumeData({ interval, days });
  const { data: stores }   = useStoreStats();
  const { data: ratings }  = useRatingDistribution();

  return (
    <div className="mx-auto max-w-7xl space-y-8 p-6 lg:p-10">
      <div>
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Overview of your reviews across all stores</p>
      </div>

      {/* Overview stats */}
      {isLoading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : stats ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <StatsCard label="Total Reviews"   value={stats.total_reviews.toLocaleString()}     icon="message" tone="brand" />
          <StatsCard label="Pending Review"  value={stats.pending_reviews.toLocaleString()}   sub="Needs your attention" icon="inbox" tone="amber" />
          <StatsCard label="Published"       value={stats.published_reviews.toLocaleString()} icon="check" tone="emerald" />
          <StatsCard label="Average Rating"  value={`${stats.average_rating.toFixed(1)} ★`}   sub={`Across ${stats.total_stores} stores`} icon="star" tone="amber" />
          <StatsCard label="Total Stores"    value={stats.total_stores}                       icon="store" tone="violet" />
          <StatsCard label="Rejected"        value={stats.rejected_reviews.toLocaleString()}  icon="x" tone="rose" />
          <StatsCard label="With Media"      value={stats.reviews_with_media.toLocaleString()} sub="Include photos or videos" icon="image" tone="sky" />
        </div>
      ) : null}

      {/* Review volume */}
      <div className="card p-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-semibold text-neutral-900 dark:text-neutral-50">Review Volume</h2>
          <div className="flex items-center gap-2">
            <div className="inline-flex rounded-xl bg-neutral-100 p-1 dark:bg-neutral-800">
              {(['day', 'week', 'month'] as const).map((i) => (
                <button
                  key={i}
                  onClick={() => setInterval(i)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                    interval === i
                      ? 'bg-white text-neutral-900 shadow-sm dark:bg-neutral-700 dark:text-neutral-50'
                      : 'text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-100'
                  }`}
                >
                  {i.charAt(0).toUpperCase() + i.slice(1)}
                </button>
              ))}
            </div>
            <select
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className="input w-auto py-1.5 text-xs"
            >
              <option value={7}>7 days</option>
              <option value={30}>30 days</option>
              <option value={90}>90 days</option>
            </select>
          </div>
        </div>

        {!volume ? (
          <div className="flex justify-center py-16"><Spinner /></div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={volume.data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
              <defs>
                <linearGradient id="volumeStroke" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4f46e5" />
                  <stop offset="100%" stopColor="#818cf8" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ stroke: cursorStroke, strokeWidth: 1 }} />
              <Line
                type="monotone"
                dataKey="count"
                stroke="url(#volumeStroke)"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5, fill: '#4f46e5', strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Rating distribution */}
        <div className="card p-6">
          <h2 className="mb-6 font-semibold text-neutral-900 dark:text-neutral-50">Rating Distribution</h2>
          {!ratings ? (
            <div className="flex justify-center py-16"><Spinner /></div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={ratings} layout="vertical" margin={{ left: -8 }}>
                <XAxis type="number" tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
                <YAxis
                  dataKey="rating"
                  type="category"
                  tick={{ fontSize: 11, fill: '#9ca3af' }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `${v}★`}
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  cursor={{ fill: isDark ? '#27272a' : '#f8fafc' }}
                  formatter={(val) => [`${val} reviews`, 'Count']}
                />
                <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={18}>
                  {ratings.map((_entry, index) => (
                    <Cell key={index} fill={RATING_COLORS[index] ?? '#94a3b8'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Store breakdown */}
        <div className="card p-6">
          <h2 className="mb-4 font-semibold text-neutral-900 dark:text-neutral-50">Stores by Volume</h2>
          {!stores ? (
            <div className="flex justify-center py-16"><Spinner /></div>
          ) : (
            <div className="scrollbar-thin max-h-64 space-y-3 overflow-y-auto pr-1">
              {stores.map((s) => (
                <div key={s.store_id} className="flex items-center gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-neutral-900 dark:text-neutral-100">
                      {s.store_name}
                    </div>
                    <div className="text-xs text-neutral-400 dark:text-neutral-500">{s.shop_domain}</div>
                  </div>
                  <div className="w-20">
                    <div className="h-2 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
                      <div
                        className="h-full rounded-full bg-brand-500"
                        style={{
                          width: `${stores[0]?.total
                            ? Math.round((s.total / stores[0].total) * 100)
                            : 0}%`,
                        }}
                      />
                    </div>
                  </div>
                  <div className="w-12 flex-shrink-0 text-right">
                    <div className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">{s.total}</div>
                    <div className="text-xs text-neutral-400 dark:text-neutral-500">{s.average_rating.toFixed(1)} ★</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
