import { Link } from 'react-router-dom';
import StarRating from './StarRating';

export default function WorkerCard({ worker }) {
  return (
    <Link
      to={`/workers/${worker.id}`}
      className="card card-hover group flex items-start gap-4 p-5 hover:border-brass-500/40"
    >
      <div className="flex h-14 w-14 flex-none items-center justify-center rounded-full bg-ink-800 font-display text-lg font-semibold text-brass-300">
        {worker.full_name?.charAt(0)?.toUpperCase() || '?'}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <h3 className="truncate font-display text-base font-semibold text-ink-800 group-hover:text-brass-700">
            {worker.full_name}
          </h3>
          {worker.verified && (
            <span className="label-tag flex-none rounded-full bg-brass-100 px-2.5 py-1">verificat</span>
          )}
        </div>
        {worker.headline && <p className="mt-0.5 truncate text-sm text-ink-600">{worker.headline}</p>}
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-500">
          <StarRating value={worker.avg_rating} count={worker.review_count} />
          {worker.city && <span>· {worker.city}</span>}
        </div>
        {worker.categories?.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {worker.categories.slice(0, 3).map((c) => (
              <span key={c} className="rounded-full bg-ink-50 px-2.5 py-1 font-mono text-[11px] text-ink-600">
                {c}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
