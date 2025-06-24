export function DashboardSkeleton() {
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gray-50">
      {/* Header Skeleton */}
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-96"></div>
        </div>
      </div>

      {/* Main Content Skeleton */}
      <div className="flex-1 overflow-hidden p-6">
        <div className="h-full grid grid-cols-12 gap-6">
          
          {/* Left Column Skeleton */}
          <div className="col-span-8 flex flex-col gap-6">
            
            {/* Key Metrics Skeleton */}
            <div className="grid grid-cols-4 gap-4 h-32">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 animate-pulse">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                      <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-20"></div>
                    </div>
                    <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                  </div>
                </div>
              ))}
            </div>

            {/* Charts Skeleton */}
            <div className="flex-1 grid grid-cols-2 gap-6">
              {Array.from({ length: 2 }).map((_, index) => (
                <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-6 bg-gray-200 rounded w-40"></div>
                    <div className="w-5 h-5 bg-gray-200 rounded"></div>
                  </div>
                  <div className="h-64 bg-gray-100 rounded-lg"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column Skeleton */}
          <div className="col-span-4 flex flex-col gap-6">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-6 bg-gray-200 rounded w-32"></div>
                  <div className="w-5 h-5 bg-gray-200 rounded"></div>
                </div>
                <div className="h-48 bg-gray-100 rounded-lg mb-4"></div>
                <div className="space-y-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="h-4 bg-gray-200 rounded w-24"></div>
                      <div className="h-4 bg-gray-200 rounded w-8"></div>
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
