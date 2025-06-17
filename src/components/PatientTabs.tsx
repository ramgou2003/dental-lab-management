
import { cn } from "@/lib/utils";
import { useDeviceType } from "@/hooks/use-mobile";

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
  const deviceType = useDeviceType();

  const getTabClasses = () => {
    if (deviceType === 'tablet') {
      return 'tablet-compact tablet-gap-3';
    }
    return 'px-4 gap-8';
  };

  const getButtonClasses = () => {
    const baseClasses = "flex flex-col items-center justify-center border-b-[3px] transition-colors touch-target";
    if (deviceType === 'tablet') {
      return `${baseClasses} pb-2 pt-3`;
    }
    return `${baseClasses} pb-[13px] pt-4`;
  };

  const getTextClasses = () => {
    if (deviceType === 'tablet') {
      return 'tablet-text-xs font-bold leading-normal tracking-[0.015em]';
    }
    return 'text-sm font-bold leading-normal tracking-[0.015em]';
  };

  return (
    <div className={deviceType === 'tablet' ? 'pb-2' : 'pb-3'}>
      <div className={`flex border-b border-slate-200 ${getTabClasses()}`}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              getButtonClasses(),
              activeTab === tab.id
                ? "border-b-blue-500 text-slate-900"
                : "border-b-transparent text-slate-600 hover:text-slate-900"
            )}
          >
            <p className={getTextClasses()}>{tab.label}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
