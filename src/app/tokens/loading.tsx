export default function TokensLoading() {
  return (
    <div className="animate-pulse p-4 sm:p-6 space-y-6 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between">
        <div className="h-7 w-48 rounded-xl bg-white/5" />
        <div className="h-10 w-36 rounded-2xl bg-white/5" />
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 rounded-2xl bg-white/5" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-1 space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 rounded-2xl bg-white/5" />
          ))}
        </div>
        <div className="lg:col-span-2 h-64 rounded-2xl bg-white/5" />
      </div>
    </div>
  );
}
