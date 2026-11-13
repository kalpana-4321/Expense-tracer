export function SkeletonBar({
  className = "",
  dark = false,
}: {
  className?: string;
  dark?: boolean;
}) {
  return (
    <div
      aria-hidden="true"
      className={`rounded-md ${
        dark ? "bg-white/10" : "bg-[#e5ecf4]"
      } ${className}`}
    />
  );
}

export function DashboardSkeleton() {
  return (
    <main
      aria-busy="true"
      aria-label="Loading wallet dashboard"
      className="min-h-screen bg-[#f4f7fb] pb-28 text-[#0f172a]"
    >
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-8 sm:py-8">
        <header className="flex items-center justify-between gap-4">
          <div className="space-y-2">
            <SkeletonBar className="h-4 w-28" />
            <SkeletonBar className="h-8 w-44" />
          </div>
          <div className="flex items-center gap-3">
            <SkeletonBar className="h-7 w-28 rounded-full" />
            <SkeletonBar className="h-11 w-11 rounded-full" />
          </div>
        </header>

        <section className="mt-6 rounded-2xl border border-[#1e293b] bg-[#0b0f17] p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-3">
              <SkeletonBar dark className="h-4 w-32" />
              <SkeletonBar dark className="h-10 w-56" />
              <SkeletonBar dark className="h-4 w-64" />
            </div>
            <SkeletonBar dark className="h-11 w-11 rounded-xl" />
          </div>
          <div className="mt-6 flex gap-3">
            <SkeletonBar dark className="h-11 w-36 rounded-xl" />
            <SkeletonBar dark className="h-11 w-36 rounded-xl" />
          </div>
        </section>

        <section className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {[0, 1].map((idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-[#dfe7f0] bg-white p-5"
            >
              <div className="flex items-center justify-between">
                <SkeletonBar className="h-4 w-24" />
                <SkeletonBar className="h-9 w-9 rounded-xl" />
              </div>
              <SkeletonBar className="mt-3 h-7 w-36" />
              <SkeletonBar className="mt-4 h-2 w-full rounded-full" />
              <SkeletonBar className="mt-2 h-3.5 w-44" />
            </div>
          ))}
        </section>

        <section className="mt-6 rounded-2xl border border-[#dfe7f0] bg-white p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-2">
              <SkeletonBar className="h-6 w-36" />
              <SkeletonBar className="h-4 w-48" />
            </div>
            <SkeletonBar className="h-10 w-full rounded-xl sm:w-72" />
          </div>

          <div className="mt-4 flex gap-2">
            <SkeletonBar className="h-8 w-14 rounded-full" />
            <SkeletonBar className="h-8 w-16 rounded-full" />
            <SkeletonBar className="h-8 w-20 rounded-full" />
            <SkeletonBar className="h-8 w-22 rounded-full" />
          </div>

          <div className="mt-5 divide-y divide-[#edf2f7]">
            {[0, 1, 2, 3, 4].map((row) => (
              <div
                key={row}
                className="flex items-center justify-between gap-3 py-3.5"
              >
                <div className="flex items-center gap-3">
                  <SkeletonBar className="h-11 w-11 rounded-xl" />
                  <div className="space-y-2">
                    <SkeletonBar className="h-4 w-36" />
                    <SkeletonBar className="h-3.5 w-28" />
                  </div>
                </div>
                <div className="space-y-2 text-right">
                  <SkeletonBar className="ml-auto h-4 w-24" />
                  <SkeletonBar className="ml-auto h-3.5 w-16" />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

export function OverviewSkeleton() {
  return (
    <main
      aria-busy="true"
      aria-label="Loading spending overview"
      className="min-h-screen bg-[#f4f7fb] pb-28 text-[#0f172a]"
    >
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-8 sm:py-8">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-2">
            <SkeletonBar className="h-4 w-28" />
            <SkeletonBar className="h-8 w-40" />
          </div>
          <SkeletonBar className="h-10 w-36 rounded-xl" />
        </div>

        <div className="mt-6 grid grid-cols-1 divide-y divide-[#dfe7f0] rounded-2xl border border-[#dfe7f0] bg-white sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {[0, 1, 2].map((i) => (
            <div key={i} className="space-y-2 p-5">
              <SkeletonBar className="h-4 w-24" />
              <SkeletonBar className="h-7 w-32" />
              <SkeletonBar className="h-3.5 w-28" />
            </div>
          ))}
        </div>

        <div className="mt-4 rounded-2xl border border-[#dfe7f0] bg-white p-6">
          <SkeletonBar className="h-5 w-44" />
          <SkeletonBar className="mt-2 h-4 w-60" />
          <div className="mt-6 flex h-44 items-end gap-3">
            {[45, 70, 35, 90, 55, 75, 40].map((h, i) => (
              <div
                key={i}
                className="flex flex-1 flex-col items-center justify-end gap-2"
                style={{ height: "100%" }}
              >
                <div
                  className="w-full max-w-10 rounded-t-md bg-[#e5ecf4]"
                  style={{ height: `${h}%` }}
                />
                <SkeletonBar className="h-3 w-6" />
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          {[0, 1].map((card) => (
            <div
              key={card}
              className="space-y-4 rounded-2xl border border-[#dfe7f0] bg-white p-6"
            >
              <SkeletonBar className="h-5 w-40" />
              <SkeletonBar className="h-12 w-full rounded-xl" />
              <SkeletonBar className="h-12 w-full rounded-xl" />
              <SkeletonBar className="h-12 w-full rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

export function GoalsSkeleton() {
  return (
    <main
      aria-busy="true"
      aria-label="Loading savings goals"
      className="min-h-screen bg-[#f4f7fb] pb-28 text-[#0f172a]"
    >
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-8 sm:py-8">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-2">
            <SkeletonBar className="h-4 w-28" />
            <SkeletonBar className="h-8 w-44" />
          </div>
          <SkeletonBar className="h-10 w-32 rounded-xl" />
        </div>

        <div className="mt-6 rounded-2xl border border-[#1e293b] bg-[#0b0f17] p-6 sm:p-7">
          <SkeletonBar dark className="h-4 w-28" />
          <SkeletonBar dark className="mt-2 h-9 w-48" />
          <SkeletonBar dark className="mt-6 h-2.5 w-full rounded-full" />
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="space-y-4 rounded-2xl border border-[#dfe7f0] bg-white p-5"
            >
              <div className="flex items-center justify-between">
                <SkeletonBar className="h-5 w-36" />
                <SkeletonBar className="h-6 w-12 rounded-full" />
              </div>
              <SkeletonBar className="h-7 w-44" />
              <SkeletonBar className="h-2.5 w-full rounded-full" />
              <SkeletonBar className="h-10 w-full rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

export function AgentSkeleton() {
  return (
    <main
      aria-busy="true"
      aria-label="Loading NOVA assistant"
      className="min-h-screen bg-[#f4f7fb] pb-28 text-[#0f172a]"
    >
      <div className="mx-auto flex min-h-screen max-w-3xl flex-col px-4 py-6 sm:px-6">
        <div className="space-y-2">
          <SkeletonBar className="h-4 w-28" />
          <SkeletonBar className="h-7 w-40" />
        </div>
        <div className="mt-8 space-y-4">
          <SkeletonBar className="h-16 w-4/5 rounded-2xl" />
          <SkeletonBar className="ml-auto h-12 w-3/5 rounded-2xl" />
          <SkeletonBar className="h-20 w-4/5 rounded-2xl" />
        </div>
      </div>
    </main>
  );
}
