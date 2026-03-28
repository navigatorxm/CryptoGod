export default function Loading() {
  return (
    <div className="animate-pulse p-6 space-y-6 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-7 w-52 rounded-xl bg-white/5" />
          <div className="h-4 w-80 rounded-lg bg-white/5" />
        </div>
        <div className="h-10 w-32 rounded-2xl bg-white/5" />
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 rounded-2xl bg-white/5" />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 h-72 rounded-2xl bg-white/5" />
        <div className="h-72 rounded-2xl bg-white/5" />
      </div>

      <div className="h-48 rounded-2xl bg-white/5" />
    </div>
  );
}
