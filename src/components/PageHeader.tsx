import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LucideIcon } from "lucide-react";
import { useDeviceType } from "@/hooks/use-mobile";

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    icon?: LucideIcon;
    onClick: () => void;
  };
  search?: {
    placeholder: string;
    value: string;
    onChange: (value: string) => void;
  };
}
export function PageHeader({
  title,
  description,
  action,
  secondaryAction,
  search
}: PageHeaderProps) {
  const deviceType = useDeviceType();

  const getHeaderClasses = () => {
    if (deviceType === 'tablet') return 'tablet-header-compact';
    return 'px-6 py-3.5';
  };

  const getTitleClasses = () => {
    if (deviceType === 'tablet') return 'tablet-header-title font-bold text-gray-900';
    return 'text-2xl font-bold text-gray-900';
  };

  const getGapClasses = () => {
    if (deviceType === 'tablet') return 'tablet-gap-2';
    return 'gap-3';
  };

  return <div className={`flex items-center justify-between ${getHeaderClasses()}`}>
      <div>
        <h1 className={getTitleClasses()}>{title}</h1>
        {description && <p className={`text-gray-600 mt-1 ${deviceType === 'tablet' ? 'tablet-text-sm' : ''}`}>{description}</p>}
      </div>
      <div className={`flex items-center ${getGapClasses()}`}>
        {search && (
          <div className="relative">
            <Input
              type="text"
              placeholder={search.placeholder}
              value={search.value}
              onChange={(e) => search.onChange(e.target.value)}
              className={`pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                deviceType === 'tablet' ? 'tablet-input-sm w-48' : 'w-64 py-2'
              }`}
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        )}
        {secondaryAction && (
          <Button
            variant="outline"
            onClick={secondaryAction.onClick}
            className={`flex items-center ${secondaryAction.label ? (deviceType === 'tablet' ? 'tablet-gap-2' : 'gap-2') : ''} ${deviceType === 'tablet' ? 'tablet-btn-sm' : ''}`}
            size={deviceType === 'tablet' ? 'sm' : (secondaryAction.label ? "default" : "icon")}
          >
            {secondaryAction.icon && <secondaryAction.icon className="h-4 w-4" />}
            {secondaryAction.label && secondaryAction.label}
          </Button>
        )}
        {action && (
          <Button
            onClick={action.onClick}
            className={`bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors duration-200 ${
              deviceType === 'tablet' ? 'tablet-btn-sm px-4' : 'px-6 py-2'
            }`}
          >
            {action.label}
          </Button>
        )}
      </div>
    </div>;
}