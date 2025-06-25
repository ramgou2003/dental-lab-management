export function DashboardSkeleton() {
  return (
    <div className="h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      {/* Main Content Skeleton - Full height */}
      <div className="h-screen p-4 overflow-hidden">
        {/* Top Row with Greeting and New Container Skeleton */}
        <div className="grid grid-cols-12 gap-4 mb-4">
          {/* Greeting Container Skeleton - 8 columns */}
          <div className="col-span-8 bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 p-4 animate-pulse">
            <div className="flex items-center justify-start min-h-[5.5rem] pl-4">
              {/* Greeting Text Skeleton */}
              <div className="flex flex-col justify-center">
                <div className="h-8 bg-gradient-to-r from-blue-200 to-purple-200 rounded-lg w-48 mb-2"></div>
                <div className="flex items-center space-x-2">
                  <div className="h-4 bg-slate-200 rounded w-24"></div>
                  <div className="px-2 py-1 bg-gradient-to-r from-blue-100/80 to-indigo-100/80 rounded-lg">
                    <div className="h-4 bg-blue-200 rounded w-20"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Time & Date Container Skeleton - 4 columns */}
          <div className="col-span-4 bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 p-4 animate-pulse">
            {/* Live Data Skeleton - Top Right Corner */}
            <div className="absolute top-4 right-4 flex items-center space-x-2">
              <div className="px-3 py-1.5 bg-blue-100/50 rounded-full">
                <div className="h-3 bg-blue-200 rounded w-12"></div>
              </div>
              <div className="w-2 h-2 bg-slate-300 rounded-full"></div>
            </div>

            <div className="flex flex-col justify-center h-full min-h-[5.5rem] pt-2">
              <div className="text-center">
                {/* Time Skeleton */}
                <div className="mb-2">
                  <div className="h-8 bg-gradient-to-r from-blue-200 to-indigo-200 rounded-lg w-24 mx-auto mb-1"></div>
                  <div className="h-3 bg-slate-200 rounded w-8 mx-auto"></div>
                </div>

                {/* Date Skeleton */}
                <div>
                  <div className="h-4 bg-slate-200 rounded w-20 mx-auto mb-1"></div>
                  <div className="h-4 bg-slate-200 rounded w-32 mx-auto"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="h-[calc(100%-6rem)] grid grid-cols-12 gap-6">

          {/* Left Column Skeleton */}
          <div className="col-span-8 flex flex-col gap-6">

            {/* Key Metrics Skeleton */}
            <div className="grid grid-cols-4 gap-4">
              {Array.from({ length: 2 }).map((_, index) => (
                <div key={index} className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 p-6 animate-pulse">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl">
                      <div className="w-6 h-6 bg-blue-200 rounded"></div>
                    </div>
                    <div className="px-2 py-1 bg-slate-100 rounded-full">
                      <div className="h-3 bg-slate-200 rounded w-8"></div>
                    </div>
                  </div>
                  <div>
                    <div className="h-4 bg-slate-200 rounded-lg w-24 mb-2"></div>
                    <div className="h-8 bg-gradient-to-r from-slate-200 to-slate-300 rounded-lg w-16"></div>
                  </div>
                </div>
              ))}

              {/* Search Container Skeleton */}
              <div className="col-span-2 bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 p-6 animate-pulse">
                <div className="h-full flex flex-col justify-center">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl">
                      <div className="w-6 h-6 bg-blue-200 rounded"></div>
                    </div>
                    <div className="px-2 py-1 bg-slate-100 rounded-full">
                      <div className="h-3 bg-slate-200 rounded w-8"></div>
                    </div>
                  </div>
                  <div>
                    <div className="h-4 bg-slate-200 rounded-lg w-24 mb-3"></div>
                    <div className="h-10 bg-slate-200 rounded-xl w-full"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts Skeleton */}
            <div className="flex-1 grid grid-cols-2 gap-6">
              {Array.from({ length: 2 }).map((_, index) => (
                <div key={index} className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 p-8 animate-pulse">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <div className="h-6 bg-gradient-to-r from-slate-200 to-slate-300 rounded-lg w-48 mb-2"></div>
                      <div className="h-4 bg-slate-200 rounded-lg w-32"></div>
                    </div>
                    <div className="p-3 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl">
                      <div className="w-6 h-6 bg-blue-200 rounded"></div>
                    </div>
                  </div>
                  <div className="h-72 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column Skeleton */}
          <div className="col-span-4 flex flex-col gap-6">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 p-8 animate-pulse">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <div className="h-6 bg-gradient-to-r from-slate-200 to-slate-300 rounded-lg w-40 mb-2"></div>
                    <div className="h-4 bg-slate-200 rounded-lg w-28"></div>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl">
                    <div className="w-6 h-6 bg-purple-200 rounded"></div>
                  </div>
                </div>
                <div className="h-56 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl mb-6"></div>
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl">
                      <div className="flex items-center space-x-3">
                        <div className="w-4 h-4 bg-slate-300 rounded-full"></div>
                        <div className="h-4 bg-slate-200 rounded w-24"></div>
                      </div>
                      <div className="h-4 bg-slate-200 rounded w-8"></div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
