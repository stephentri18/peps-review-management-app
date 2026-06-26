import { Icon } from './Icon.js';

export function StarDisplay({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' }) {
  const px = size === 'md' ? 18 : 14;
  return (
    <span className="inline-flex gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => {
        const filled = i < rating;
        return (
          <Icon
            key={i}
            name="star"
            size={px}
            strokeWidth={1.5}
            fill={filled ? 'currentColor' : 'none'}
            className={filled ? 'text-amber-400' : 'text-neutral-200 dark:text-neutral-700'}
          />
        );
      })}
    </span>
  );
}
