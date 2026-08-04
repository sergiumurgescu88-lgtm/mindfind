export default function StarRating({ value = 0, count, size = 'text-sm' }) {
  const rounded = Math.round(Number(value) || 0);
  return (
    <span className={`inline-flex items-center gap-1 font-mono ${size}`}>
      <span className="text-brass-500">
        {'★'.repeat(Math.max(0, Math.round(Number(rounded) || 0)))}
        <span className="text-ink-700/20">{'★'.repeat(Math.max(0, Math.round(Number(5 - rounded) || 0)))}</span>
      </span>
      <span className="text-ink-600">{Number(value || 0).toFixed(1)}</span>
      {typeof count === 'number' && <span className="text-ink-400">({count})</span>}
    </span>
  );
}
