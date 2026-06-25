import { useOverviewStats } from '../hooks/useAnalytics.js';
import { StatsCard } from '../components/ui/StatsCard.js';
import { Spinner }   from '../components/ui/Spinner.js';

export function Dashboard() {
  const { data: stats, isLoading } = useOverviewStats();

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Overview of your reviews across all stores</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : stats ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            label="Total Reviews"
            value={stats.total_reviews.toLocaleString()}
            icon="💬"
            color="bg-blue-50"
          />
          <StatsCard
            label="Pending Review"
            value={stats.pending_reviews.toLocaleString()}
            sub="Needs your attention"
            icon="⏳"
            color="bg-yellow-50"
          />
          <StatsCard
            label="Published"
            value={stats.published_reviews.toLocaleString()}
            icon="✅"
            color="bg-green-50"
          />
          <StatsCard
            label="Average Rating"
            value={`${stats.average_rating.toFixed(1)} ★`}
            sub={`Across ${stats.total_stores} stores`}
            icon="⭐"
            color="bg-amber-50"
          />
          <StatsCard
            label="Total Stores"
            value={stats.total_stores}
            icon="🏪"
            color="bg-purple-50"
          />
          <StatsCard
            label="Rejected"
            value={stats.rejected_reviews.toLocaleString()}
            icon="❌"
            color="bg-red-50"
          />
          <StatsCard
            label="With Media"
            value={stats.reviews_with_media.toLocaleString()}
            sub="Include photos or videos"
            icon="📎"
            color="bg-slate-100"
          />
        </div>
      ) : null}
    </div>
  );
}