import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface PrintingCompletionDialogProps {
  open: boolean;
  onClose: () => void;
  onComplete: (completionData: {
    completion_date: string;
    completion_time: string;
    completed_by: string;
    completed_by_name: string;
  }) => void;
  manufacturingItem: any;
}

interface UserProfile {
  id: string;
  full_name: string;
}

export function PrintingCompletionDialog({
  open,
  onClose,
  onComplete,
  manufacturingItem
}: PrintingCompletionDialogProps) {
  // Get current date and time in EST
  const getCurrentESTDateTime = () => {
    const now = new Date();
    const estDate = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
    const date = estDate.toISOString().split('T')[0];
    const hours = estDate.getHours().toString().padStart(2, '0');
    const minutes = estDate.getMinutes().toString().padStart(2, '0');
    const time = `${hours}:${minutes}`;
    return { date, time };
  };

  const { date: currentDate, time: currentTime } = getCurrentESTDateTime();

  const [completionDate, setCompletionDate] = useState(currentDate);
  const [completionTime, setCompletionTime] = useState(currentTime);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch all users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('id, full_name')
          .order('full_name', { ascending: true });

        if (error) {
          console.error('Error fetching users:', error);
          return;
        }

        setUsers(data || []);
      } catch (error) {
        console.error('Error:', error);
      }
    };

    if (open) {
      fetchUsers();
    }
  }, [open]);

  const handleUseCurrentDateTime = () => {
    const { date, time } = getCurrentESTDateTime();
    setCompletionDate(date);
    setCompletionTime(time);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!completionDate || !completionTime || !selectedUserId) {
      alert('Please fill in all required fields');
      return;
    }

    const selectedUser = users.find(u => u.id === selectedUserId);
    if (!selectedUser) {
      alert('Please select a valid user');
      return;
    }

    onComplete({
      completion_date: completionDate,
      completion_time: completionTime,
      completed_by: selectedUserId,
      completed_by_name: selectedUser.full_name
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Complete Printing - {manufacturingItem?.patient_name}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Completion Date and Time */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-green-600" />
              Printing Completed On (EST)
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="completion_date">
                  Date <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="completion_date"
                  type="date"
                  value={completionDate}
                  onChange={(e) => setCompletionDate(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="completion_time">
                  Time <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="completion_time"
                  type="time"
                  value={completionTime}
                  onChange={(e) => setCompletionTime(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          {/* Use Current Date & Time Button */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleUseCurrentDateTime}
            className="w-full"
          >
            Use Current Date & Time (EST)
          </Button>

          {/* Printed By */}
          <div>
            <Label htmlFor="printed_by">
              Printed By <span className="text-red-500">*</span>
            </Label>
            <Select value={selectedUserId} onValueChange={setSelectedUserId}>
              <SelectTrigger>
                <SelectValue placeholder="Select user who completed printing" />
              </SelectTrigger>
              <SelectContent>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white"
              disabled={loading}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Complete Printing
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

