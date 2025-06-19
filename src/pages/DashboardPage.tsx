
import { PageHeader } from "@/components/PageHeader";

export function DashboardPage() {
  return (
    <div className="flex flex-col max-w-full flex-1">
      <PageHeader
        title="Dashboard"
        description="Overview of your clinic's daily operations"
      />

      {/* Main Content Grid */}
      <div className="px-4 tablet:px-3 py-3 tablet:py-2">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 tablet:gap-4 h-[600px] tablet:h-[500px]">
          {/* Left section - Empty */}
          <div className="lg:col-span-2">
            {/* Content cleared as requested */}
          </div>

          {/* Right section - Blank as requested */}
          <div className="h-full flex flex-col">
            {/* Right section kept blank as requested */}
          </div>
        </div>
      </div>
    </div>
  );
}
