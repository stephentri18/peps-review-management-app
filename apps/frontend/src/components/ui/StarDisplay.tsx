export function StarDisplay({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' }) {
  const cls = size === 'md' ? 'text-lg' : 'text-sm';
  return (
    <span className="inline-flex gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={`${cls} ${i < rating ? 'text-amber-400' : 'text-gray-200'}`}>
          ★
        </span>
      ))}
    </span>
  );
}