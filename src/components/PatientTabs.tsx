
import { cn } from "@/lib/utils";

interface PatientTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: "all", label: "All" },
  { id: "not-started", label: "Treatment Not Started" },
  { id: "in-progress", label: "Treatment In Progress" },
  { id: "completed", label: "Treatment Completed" },
  { id: "deceased", label: "Patient Deceased" },
];

export function PatientTabs({ activeTab, onTabChange }: PatientTabsProps) {
  return (
    <div className="pb-3">
      <div className="flex border-b border-slate-200 px-4 gap-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "flex flex-col items-center justify-center border-b-[3px] pb-[13px] pt-4 transition-colors",
              activeTab === tab.id
                ? "border-b-blue-500 text-slate-900"
                : "border-b-transparent text-slate-600 hover:text-slate-900"
            )}
          >
            <p className="text-sm font-bold leading-normal tracking-[0.015em]">{tab.label}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
