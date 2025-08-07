import { cn } from "@/lib/utils";
import { Users, Calendar } from "lucide-react";

interface ConsultationTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  {
    id: "consultations",
    label: "Consultations",
    icon: Calendar,
    color: "text-blue-600",
    activeColor: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-500"
  },
  {
    id: "patients",
    label: "Patients",
    icon: Users,
    color: "text-slate-600",
    activeColor: "text-indigo-600",
    bgColor: "bg-indigo-50",
    borderColor: "border-indigo-500"
  }
];

export function ConsultationTabs({ activeTab, onTabChange }: ConsultationTabsProps) {
  return (
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
  );
}
