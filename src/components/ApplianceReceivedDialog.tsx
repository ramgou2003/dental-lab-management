import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Package } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface ApplianceReceivedDialogProps {
  open: boolean;
  onClose: () => void;
  onComplete: (receivedData: {
    received_date: string;
    received_time: string;
    received_by: string;
    received_by_name: string;
  }) => void;
  manufacturingItem: any;
}

interface UserProfile {
  id: string;
  full_name: string;
}

export function ApplianceReceivedDialog({
  open,
  onClose,
  onComplete,
  manufacturingItem
}: ApplianceReceivedDialogProps) {
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

  const [receivedDate, setReceivedDate] = useState(currentDate);
  const [receivedTime, setReceivedTime] = useState(currentTime);
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
    setReceivedDate(date);
    setReceivedTime(time);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!receivedDate || !receivedTime || !selectedUserId) {
      alert('Please fill in all required fields');
      return;
    }

    const selectedUser = users.find(u => u.id === selectedUserId);
    if (!selectedUser) {
      alert('Please select a valid user');
      return;
    }

    onComplete({
      received_date: receivedDate,
      received_time: receivedTime,
      received_by: selectedUserId,
      received_by_name: selectedUser.full_name,
    });

    // Reset form
    setReceivedDate(currentDate);
    setReceivedTime(currentTime);
    setSelectedUserId("");
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl text-blue-600">
            <Package className="h-6 w-6" />
            Appliance Received
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Patient Name */}
          <div>
            <Label className="text-sm font-medium text-gray-700">Patient</Label>
            <div className="text-sm text-gray-900 font-medium mt-1 p-2 bg-gray-50 rounded border border-gray-200">
              {manufacturingItem?.patient_name || 'N/A'}
            </div>
          </div>

          {/* Received Date */}
          <div>
            <Label htmlFor="received-date" className="text-sm font-medium text-gray-700">
              Received Date <span className="text-red-500">*</span>
            </Label>
            <Input
              id="received-date"
              type="date"
              value={receivedDate}
              onChange={(e) => setReceivedDate(e.target.value)}
              className="mt-1"
              required
            />
          </div>

          {/* Received Time */}
          <div>
            <Label htmlFor="received-time" className="text-sm font-medium text-gray-700">
              Received Time <span className="text-red-500">*</span>
            </Label>
            <div className="flex gap-2 mt-1">
              <Input
                id="received-time"
                type="time"
                value={receivedTime}
                onChange={(e) => setReceivedTime(e.target.value)}
                className="flex-1"
                required
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleUseCurrentDateTime}
                className="border-blue-300 text-blue-700 hover:bg-blue-50"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Now
              </Button>
            </div>
          </div>

          {/* Received By */}
          <div>
            <Label htmlFor="received-by" className="text-sm font-medium text-gray-700">
              Received By <span className="text-red-500">*</span>
            </Label>
            <Select value={selectedUserId} onValueChange={setSelectedUserId}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select user" />
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

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700"
              disabled={loading}
            >
              <Package className="h-4 w-4 mr-2" />
              Confirm Received
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

