import React from 'react';
import { cn } from '@/lib/utils';
import { useDeviceType } from '@/hooks/use-mobile';

interface TabletOptimizedProps {
  children: React.ReactNode;
  className?: string;
  tabletClassName?: string;
  desktopClassName?: string;
}

export function TabletOptimized({ 
  children, 
  className, 
  tabletClassName, 
  desktopClassName 
}: TabletOptimizedProps) {
  const deviceType = useDeviceType();
  
  const finalClassName = cn(
    className,
    deviceType === 'tablet' && tabletClassName,
    deviceType === 'desktop' && desktopClassName
  );
  
  return (
    <div className={finalClassName}>
      {children}
    </div>
  );
}

interface TabletIconProps {
  icon: React.ComponentType<{ className?: string }>;
  className?: string;
  tabletSize?: 'xs' | 'sm' | 'md';
}

export function TabletIcon({ 
  icon: Icon, 
  className, 
  tabletSize = 'sm' 
}: TabletIconProps) {
  const sizeClasses = {
    xs: 'tablet:h-3 tablet:w-3',
    sm: 'tablet:h-4 tablet:w-4', 
    md: 'tablet:h-5 tablet:w-5'
  };
  
  return (
    <Icon className={cn(className, sizeClasses[tabletSize])} />
  );
}

interface TabletButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  disabled?: boolean;
}

export function TabletButton({ 
  children, 
  onClick, 
  variant = 'primary', 
  size = 'md',
  className,
  disabled = false
}: TabletButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantClasses = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-500',
    outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-indigo-500'
  };
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm tablet:px-2 tablet:py-1 tablet:text-xs',
    md: 'px-4 py-2 text-sm tablet:px-3 tablet:py-1.5 tablet:text-sm',
    lg: 'px-6 py-3 text-base tablet:px-4 tablet:py-2 tablet:text-sm'
  };
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
    >
      {children}
    </button>
  );
}

interface TabletCardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
}

export function TabletCard({ 
  children, 
  className, 
  padding = 'md' 
}: TabletCardProps) {
  const paddingClasses = {
    sm: 'p-3 tablet:p-2',
    md: 'p-4 tablet:p-3',
    lg: 'p-6 tablet:p-4'
  };
  
  return (
    <div className={cn(
      'bg-white rounded-xl tablet:rounded-lg border border-gray-200 shadow-sm',
      paddingClasses[padding],
      className
    )}>
      {children}
    </div>
  );
}

interface TabletGridProps {
  children: React.ReactNode;
  cols?: number;
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function TabletGrid({ 
  children, 
  cols = 2, 
  gap = 'md',
  className 
}: TabletGridProps) {
  const colClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    5: 'grid-cols-5 tablet:grid-cols-5'
  };
  
  const gapClasses = {
    sm: 'gap-2 tablet:gap-1.5',
    md: 'gap-4 tablet:gap-3',
    lg: 'gap-6 tablet:gap-4'
  };
  
  return (
    <div className={cn(
      'grid',
      colClasses[cols as keyof typeof colClasses] || colClasses[2],
      gapClasses[gap],
      className
    )}>
      {children}
    </div>
  );
}

interface TabletTextProps {
  children: React.ReactNode;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  className?: string;
}

export function TabletText({ 
  children, 
  size = 'md', 
  weight = 'normal',
  className 
}: TabletTextProps) {
  const sizeClasses = {
    xs: 'text-xs tablet:text-[10px]',
    sm: 'text-sm tablet:text-xs',
    md: 'text-base tablet:text-sm',
    lg: 'text-lg tablet:text-base',
    xl: 'text-xl tablet:text-lg'
  };
  
  const weightClasses = {
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold'
  };
  
  return (
    <span className={cn(
      sizeClasses[size],
      weightClasses[weight],
      className
    )}>
      {children}
    </span>
  );
}

interface TabletSpacingProps {
  children: React.ReactNode;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  direction?: 'x' | 'y' | 'all';
  className?: string;
}

export function TabletSpacing({ 
  children, 
  size = 'md', 
  direction = 'y',
  className 
}: TabletSpacingProps) {
  const spacingClasses = {
    xs: {
      x: 'space-x-1 tablet:space-x-0.5',
      y: 'space-y-1 tablet:space-y-0.5',
      all: 'gap-1 tablet:gap-0.5'
    },
    sm: {
      x: 'space-x-2 tablet:space-x-1.5',
      y: 'space-y-2 tablet:space-y-1.5',
      all: 'gap-2 tablet:gap-1.5'
    },
    md: {
      x: 'space-x-4 tablet:space-x-3',
      y: 'space-y-4 tablet:space-y-3',
      all: 'gap-4 tablet:gap-3'
    },
    lg: {
      x: 'space-x-6 tablet:space-x-4',
      y: 'space-y-6 tablet:space-y-4',
      all: 'gap-6 tablet:gap-4'
    },
    xl: {
      x: 'space-x-8 tablet:space-x-6',
      y: 'space-y-8 tablet:space-y-6',
      all: 'gap-8 tablet:gap-6'
    }
  };
  
  return (
    <div className={cn(
      spacingClasses[size][direction],
      className
    )}>
      {children}
    </div>
  );
}
