import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, CheckCircle, XCircle, ClipboardCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface InspectionDialogProps {
  open: boolean;
  onClose: () => void;
  onComplete: (inspectionData: {
    print_quality: 'pass' | 'fail';
    physical_defects: 'pass' | 'fail';
    screw_access_channel: 'pass' | 'fail';
    mua_platform: 'pass' | 'fail';
    inspection_status: 'approved' | 'rejected';
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

export function InspectionDialog({
  open,
  onClose,
  onComplete,
  manufacturingItem
}: InspectionDialogProps) {
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

  // Checklist states
  const [printQuality, setPrintQuality] = useState<'pass' | 'fail' | ''>('');
  const [physicalDefects, setPhysicalDefects] = useState<'pass' | 'fail' | ''>('');
  const [screwAccessChannel, setScrewAccessChannel] = useState<'pass' | 'fail' | ''>('');
  const [muaPlatform, setMuaPlatform] = useState<'pass' | 'fail' | ''>('');

  // Completion tracking
  const [completionDate, setCompletionDate] = useState(currentDate);
  const [completionTime, setCompletionTime] = useState(currentTime);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [users, setUsers] = useState<UserProfile[]>([]);

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
      // Reset form when dialog opens
      setPrintQuality('');
      setPhysicalDefects('');
      setScrewAccessChannel('');
      setMuaPlatform('');
      const { date, time } = getCurrentESTDateTime();
      setCompletionDate(date);
      setCompletionTime(time);
      setSelectedUserId('');
    }
  }, [open]);

  const handleUseCurrentDateTime = () => {
    const { date, time } = getCurrentESTDateTime();
    setCompletionDate(date);
    setCompletionTime(time);
  };

  const isAllChecklistComplete = () => {
    return printQuality !== '' && physicalDefects !== '' && screwAccessChannel !== '' && muaPlatform !== '';
  };

  const isAllChecklistPassed = () => {
    return printQuality === 'pass' && physicalDefects === 'pass' && screwAccessChannel === 'pass' && muaPlatform === 'pass';
  };

  const handleApprove = () => {
    if (!isAllChecklistComplete()) {
      alert('Please complete all checklist items');
      return;
    }

    if (!completionDate || !completionTime || !selectedUserId) {
      alert('Please fill in completion date, time, and select inspector');
      return;
    }

    const selectedUser = users.find(u => u.id === selectedUserId);
    if (!selectedUser) {
      alert('Please select a valid user');
      return;
    }

    onComplete({
      print_quality: printQuality as 'pass' | 'fail',
      physical_defects: physicalDefects as 'pass' | 'fail',
      screw_access_channel: screwAccessChannel as 'pass' | 'fail',
      mua_platform: muaPlatform as 'pass' | 'fail',
      inspection_status: 'approved',
      completion_date: completionDate,
      completion_time: completionTime,
      completed_by: selectedUserId,
      completed_by_name: selectedUser.full_name
    });
  };

  const handleReject = () => {
    if (!isAllChecklistComplete()) {
      alert('Please complete all checklist items');
      return;
    }

    if (!completionDate || !completionTime || !selectedUserId) {
      alert('Please fill in completion date, time, and select inspector');
      return;
    }

    const selectedUser = users.find(u => u.id === selectedUserId);
    if (!selectedUser) {
      alert('Please select a valid user');
      return;
    }

    onComplete({
      print_quality: printQuality as 'pass' | 'fail',
      physical_defects: physicalDefects as 'pass' | 'fail',
      screw_access_channel: screwAccessChannel as 'pass' | 'fail',
      mua_platform: muaPlatform as 'pass' | 'fail',
      inspection_status: 'rejected',
      completion_date: completionDate,
      completion_time: completionTime,
      completed_by: selectedUserId,
      completed_by_name: selectedUser.full_name
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5 text-blue-600" />
            Quality Inspection - {manufacturingItem?.patient_name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Inspection Checklist */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2 border-b pb-2">
              <ClipboardCheck className="h-4 w-4 text-blue-600" />
              Inspection Checklist
            </h3>

            {/* Print Quality */}
            <div className="grid grid-cols-3 gap-4 items-center">
              <Label className="font-medium">Print Quality</Label>
              <div className="col-span-2 flex gap-2">
                <Button
                  type="button"
                  variant={printQuality === 'pass' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPrintQuality('pass')}
                  className={printQuality === 'pass' ? 'bg-green-600 hover:bg-green-700' : ''}
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Pass
                </Button>
                <Button
                  type="button"
                  variant={printQuality === 'fail' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPrintQuality('fail')}
                  className={printQuality === 'fail' ? 'bg-red-600 hover:bg-red-700' : ''}
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  Fail
                </Button>
              </div>
            </div>

            {/* Physical Defects */}
            <div className="grid grid-cols-3 gap-4 items-center">
              <Label className="font-medium">Physical Defects</Label>
              <div className="col-span-2 flex gap-2">
                <Button
                  type="button"
                  variant={physicalDefects === 'pass' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPhysicalDefects('pass')}
                  className={physicalDefects === 'pass' ? 'bg-green-600 hover:bg-green-700' : ''}
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Pass
                </Button>
                <Button
                  type="button"
                  variant={physicalDefects === 'fail' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPhysicalDefects('fail')}
                  className={physicalDefects === 'fail' ? 'bg-red-600 hover:bg-red-700' : ''}
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  Fail
                </Button>
              </div>
            </div>

            {/* Screw Access Channel */}
            <div className="grid grid-cols-3 gap-4 items-center">
              <Label className="font-medium">Screw Access Channel</Label>
              <div className="col-span-2 flex gap-2">
                <Button
                  type="button"
                  variant={screwAccessChannel === 'pass' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setScrewAccessChannel('pass')}
                  className={screwAccessChannel === 'pass' ? 'bg-green-600 hover:bg-green-700' : ''}
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Pass
                </Button>
                <Button
                  type="button"
                  variant={screwAccessChannel === 'fail' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setScrewAccessChannel('fail')}
                  className={screwAccessChannel === 'fail' ? 'bg-red-600 hover:bg-red-700' : ''}
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  Fail
                </Button>
              </div>
            </div>

            {/* MUA Platform */}
            <div className="grid grid-cols-3 gap-4 items-center">
              <Label className="font-medium">MUA Platform</Label>
              <div className="col-span-2 flex gap-2">
                <Button
                  type="button"
                  variant={muaPlatform === 'pass' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setMuaPlatform('pass')}
                  className={muaPlatform === 'pass' ? 'bg-green-600 hover:bg-green-700' : ''}
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Pass
                </Button>
                <Button
                  type="button"
                  variant={muaPlatform === 'fail' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setMuaPlatform('fail')}
                  className={muaPlatform === 'fail' ? 'bg-red-600 hover:bg-red-700' : ''}
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  Fail
                </Button>
              </div>
            </div>
          </div>

          {/* Completion Date and Time */}
          <div className="space-y-4 border-t pt-4">
            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-600" />
              Inspection Completed On (EST)
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

          {/* Inspected By */}
          <div>
            <Label htmlFor="inspected_by">
              Inspected By <span className="text-red-500">*</span>
            </Label>
            <Select value={selectedUserId} onValueChange={setSelectedUserId}>
              <SelectTrigger>
                <SelectValue placeholder="Select inspector" />
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
          <div className="flex justify-between gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <div className="flex gap-3">
              <Button
                type="button"
                onClick={handleReject}
                className="bg-red-600 hover:bg-red-700 text-white"
                disabled={!isAllChecklistComplete() || !completionDate || !completionTime || !selectedUserId}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Reject
              </Button>
              <Button
                type="button"
                onClick={handleApprove}
                className="bg-green-600 hover:bg-green-700 text-white"
                disabled={!isAllChecklistComplete() || !completionDate || !completionTime || !selectedUserId}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

