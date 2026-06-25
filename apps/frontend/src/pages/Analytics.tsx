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
import { Spinner } from '../components/ui/Spinner.js';

const RATING_COLORS = ['#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e'];

export function Analytics() {
  const [interval, setInterval] = useState<'day' | 'week' | 'month'>('day');
  const [days, setDays]         = useState(30);

  const { data: stats }    = useOverviewStats();
  const { data: volume }   = useVolumeData({ interval, days });
  const { data: stores }   = useStoreStats();
  const { data: ratings }  = useRatingDistribution();

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-500 text-sm mt-0.5">Review trends and performance metrics</p>
      </div>

      {/* Volume chart */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-semibold text-gray-900">Review Volume</h2>
          <div className="flex gap-2">
            {(['day', 'week', 'month'] as const).map((i) => (
              <button
                key={i}
                onClick={() => setInterval(i)}
                className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  interval === i
                    ? 'bg-slate-900 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {i.charAt(0).toUpperCase() + i.slice(1)}
              </button>
            ))}
            <select
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className="text-xs border border-gray-300 rounded-lg px-2 py-1.5 ml-2 focus:outline-none"
            >
              <option value={7}>7 days</option>
              <option value={30}>30 days</option>
              <option value={90}>90 days</option>
            </select>
          </div>
        </div>

        {!volume ? (
          <div className="flex justify-center py-10"><Spinner /></div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={volume.data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12 }}
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#1e293b"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Rating distribution */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="font-semibold text-gray-900 mb-6">Rating Distribution</h2>
          {!ratings ? (
            <div className="flex justify-center py-10"><Spinner /></div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={ratings} layout="vertical">
                <XAxis type="number" tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} />
                <YAxis
                  dataKey="rating"
                  type="category"
                  tick={{ fontSize: 11, fill: '#9ca3af' }}
                  tickLine={false}
                  tickFormatter={(v) => `${v}★`}
                />
                <Tooltip
                  contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12 }}
                  formatter={(val) => [`${val} reviews`, 'Count']}
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {ratings.map((_entry, index) => (
                    <Cell key={index} fill={RATING_COLORS[index] ?? '#94a3b8'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Store breakdown */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Stores by Volume</h2>
          {!stores ? (
            <div className="flex justify-center py-10"><Spinner /></div>
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {stores.map((s) => (
                <div key={s.store_id} className="flex items-center gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {s.store_name}
                    </div>
                    <div className="text-xs text-gray-400">{s.shop_domain}</div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-sm font-semibold text-gray-800">
                      {s.total}
                    </div>
                    <div className="text-xs text-gray-400">
                      {s.average_rating.toFixed(1)} ★
                    </div>
                  </div>
                  <div className="w-16">
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-slate-700 rounded-full"
                        style={{
                          width: `${stores[0]?.total
                            ? Math.round((s.total / stores[0].total) * 100)
                            : 0}%`,
                        }}
                      />
                    </div>
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