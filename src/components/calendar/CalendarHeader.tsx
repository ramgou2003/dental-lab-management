import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar, Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { useState } from "react";

interface CalendarHeaderProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  onNewAppointment: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  canCreateAppointments?: boolean;
}

export function CalendarHeader({
  currentDate,
  onDateChange,
  onNewAppointment,
  searchQuery,
  onSearchChange,
  canCreateAppointments = true
}: CalendarHeaderProps) {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    onDateChange(newDate);
  };

  const goToToday = () => {
    onDateChange(new Date());
  };

  const handleCalendarDateSelect = (date: Date | undefined) => {
    if (date) {
      onDateChange(date);
      setIsCalendarOpen(false);
    }
  };

  const formatDateTitle = () => {
    return currentDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'America/New_York'
    });
  };

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left side - Navigation and Title */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateDate('prev')}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={goToToday}
              className="px-3 h-8"
            >
              Today
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateDate('next')}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <h1 className="text-xl font-semibold text-gray-900">
            {formatDateTitle()}
          </h1>
        </div>

        {/* Right side - Calendar Picker, Search and Actions */}
        <div className="flex items-center space-x-3">
          {/* Calendar Date Picker */}
          <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-9 px-3"
              >
                <Calendar className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <CalendarComponent
                mode="single"
                selected={currentDate}
                onSelect={handleCalendarDateSelect}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          {/* Search Field */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search appointments..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 h-9 w-80"
            />
          </div>

          {/* New Appointment Button */}
          {canCreateAppointments && (
            <Button
              onClick={onNewAppointment}
              className="bg-indigo-600 hover:bg-indigo-700 text-white h-9 px-4"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Appointment
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
