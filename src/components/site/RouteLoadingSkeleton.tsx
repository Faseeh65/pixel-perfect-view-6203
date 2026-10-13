export function RouteLoadingSkeleton() {
  return (
    <section aria-label="Loading page" aria-busy="true" className="section-pad">
      <div className="container-site space-y-6">
        <div className="mx-auto h-10 max-w-md animate-pulse rounded-lg bg-muted" />
        <div className="mx-auto h-5 max-w-xl animate-pulse rounded bg-muted" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }, (_, index) => (
            <div key={index} className="aspect-[4/3] animate-pulse rounded-2xl bg-muted" />
          ))}
        </div>
      </div>
    </section>
  );
}
