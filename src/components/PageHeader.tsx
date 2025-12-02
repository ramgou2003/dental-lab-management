import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { LucideIcon, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface SortOption {
  label: string;
  value: string;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  badge?: number;
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
  sortAction?: {
    options: SortOption[];
    currentField: string | null;
    currentOrder: 'asc' | 'desc';
    onSort: (field: string) => void;
  };
}
export function PageHeader({
  title,
  description,
  badge,
  action,
  secondaryAction,
  search,
  sortAction
}: PageHeaderProps) {
  const getCurrentSortLabel = () => {
    if (!sortAction?.currentField) return 'Sort';
    const option = sortAction.options.find(o => o.value === sortAction.currentField);
    return option?.label || 'Sort';
  };

  return <div className="flex items-center justify-between px-6 py-3.5">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          {badge !== undefined && (
            <Badge variant="secondary" className="bg-indigo-100 text-indigo-700 hover:bg-indigo-200 font-semibold px-3 py-1 text-sm">
              {badge}
            </Badge>
          )}
        </div>
        {description && <p className="text-gray-600 mt-1">{description}</p>}
      </div>
      <div className="flex items-center gap-3">
        {sortAction && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <ArrowUpDown className="h-4 w-4" />
                {getCurrentSortLabel()}
                {sortAction.currentField && (
                  sortAction.currentOrder === 'asc'
                    ? <ArrowUp className="h-3 w-3" />
                    : <ArrowDown className="h-3 w-3" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {sortAction.options.map((option) => (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => sortAction.onSort(option.value)}
                >
                  {option.label}
                  {sortAction.currentField === option.value && (
                    <span className="ml-2">{sortAction.currentOrder === 'asc' ? '↑' : '↓'}</span>
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {secondaryAction && (
          <Button
            variant="outline"
            onClick={secondaryAction.onClick}
            className={`flex items-center ${secondaryAction.label ? 'gap-2' : ''}`}
            size={secondaryAction.label ? "default" : "icon"}
          >
            {secondaryAction.icon && <secondaryAction.icon className="h-4 w-4" />}
            {secondaryAction.label && secondaryAction.label}
          </Button>
        )}

        {search && (
          <div className="relative">
            <Input
              type="text"
              placeholder={search.placeholder}
              value={search.value}
              onChange={(e) => search.onChange(e.target.value)}
              className="w-80 pl-10 pr-4 py-2 text-xs border border-gray-300 bg-white text-gray-900 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        )}

        {action && (
          <Button onClick={action.onClick} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200">
            {action.label}
          </Button>
        )}
      </div>
    </div>;
}