export default function LiveBadge() {
  return (
    <div className="flex items-center gap-2 text-sm font-semibold">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
      </span>
      <span className="text-red-400 tracking-wide text-xs uppercase">Live</span>
    </div>
  )
}
