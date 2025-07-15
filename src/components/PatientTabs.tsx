
import { cn } from "@/lib/utils";
import { Users, Clock, Activity, CheckCircle, Heart, UserPlus } from "lucide-react";

interface PatientTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  {
    id: "all",
    label: "All Patients",
    icon: Users,
    color: "text-slate-600",
    activeColor: "text-indigo-600",
    bgColor: "bg-indigo-50",
    borderColor: "border-indigo-500"
  },
  {
    id: "new",
    label: "New Patients",
    icon: UserPlus,
    color: "text-purple-600",
    activeColor: "text-purple-600",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-500"
  },
  {
    id: "not-started",
    label: "Not Started",
    icon: Clock,
    color: "text-amber-600",
    activeColor: "text-amber-600",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-500"
  },
  {
    id: "in-progress",
    label: "In Progress",
    icon: Activity,
    color: "text-blue-600",
    activeColor: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-500"
  },
  {
    id: "completed",
    label: "Completed",
    icon: CheckCircle,
    color: "text-green-600",
    activeColor: "text-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-500"
  },
  {
    id: "deceased",
    label: "Deceased",
    icon: Heart,
    color: "text-gray-600",
    activeColor: "text-gray-600",
    bgColor: "bg-gray-50",
    borderColor: "border-gray-500"
  },
];

export function PatientTabs({ activeTab, onTabChange }: PatientTabsProps) {
  return (
    <div className="px-4 py-3">
      <div className="flex gap-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-[1.02]",
                isActive
                  ? `${tab.bgColor} ${tab.activeColor} shadow-sm border ${tab.borderColor}`
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <Icon className="h-4 w-4" />
              <span className="whitespace-nowrap">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
