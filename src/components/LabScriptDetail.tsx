import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { LabScript } from "@/hooks/useLabScripts";
import { FlaskConical, Edit2, Save, X, MessageSquare, Calendar, User, FileText } from "lucide-react";
import { toast } from "@/components/ui/sonner";

interface LabScriptDetailProps {
  open: boolean;
  onClose: () => void;
  labScript: LabScript | null;
  onUpdate: (id: string, updates: Partial<LabScript>) => Promise<void>;
}

export function LabScriptDetail({ open, onClose, labScript, onUpdate }: LabScriptDetailProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<LabScript>>({});
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState<Array<{id: string, text: string, timestamp: string}>>([]);

  // Hardcoded dropdown options
  const options = {
    appliance_type: [
      { id: 1, value: 'surgical-day-appliance', label: 'Surgical Day Appliance' },
      { id: 2, value: 'printed-tryin', label: 'Printed Tryin' },
      { id: 3, value: 'night-guard', label: 'Night Guard' },
      { id: 4, value: 'direct-load-pmma', label: 'Direct Load PMMA' },
      { id: 5, value: 'direct-load-zirconia', label: 'Direct Load Zirconia' },
      { id: 6, value: 'ti-bar-superstructure', label: 'Ti-Bar and Superstructure' },
      { id: 7, value: 'crown', label: 'Crown' },
      { id: 8, value: 'bridge', label: 'Bridge' },
      { id: 9, value: 'denture', label: 'Denture' },
      { id: 10, value: 'retainer', label: 'Retainer' }
    ],
    screw_type: [
      { id: 19, value: 'dc_screw', label: 'DC Screw' },
      { id: 20, value: 'rosen', label: 'Rosen' },
      { id: 21, value: 'rosen_wave_t5', label: 'Rosen Wave T5' },
      { id: 22, value: 'powerball', label: 'Powerball' },
      { id: 23, value: 'dess', label: 'Dess' },
      { id: 24, value: 'sin_prh30', label: 'SIN PRH30' },
      { id: 25, value: 'neodent', label: 'Neodent' },
      { id: 26, value: 'other', label: 'Other' }
    ],
    vdo_details: [
      { id: 27, value: 'open_4mm_without', label: 'Open up to 4mm without calling Doctor' },
      { id: 28, value: 'open_4mm_with', label: 'Open up to 4mm with calling Doctor' },
      { id: 29, value: 'open_based_requirement', label: 'Open VDO based on requirement' },
      { id: 30, value: 'no_changes', label: 'No changes required in VDO' }
    ],
    treatment_type: [
      { id: 11, value: 'orthodontic', label: 'Orthodontic' },
      { id: 12, value: 'restorative', label: 'Restorative' },
      { id: 13, value: 'preventive', label: 'Preventive' },
      { id: 14, value: 'cosmetic', label: 'Cosmetic' },
      { id: 15, value: 'surgical', label: 'Surgical' },
      { id: 16, value: 'prosthetic', label: 'Prosthetic' },
      { id: 17, value: 'implant_placement', label: 'Implant Placement' },
      { id: 18, value: 'endodontic', label: 'Endodontic' }
    ],
    screw_type: [
      { id: 19, value: 'dc_screw', label: 'DC Screw' },
      { id: 20, value: 'rosen', label: 'Rosen' },
      { id: 21, value: 'rosen_wave_t5', label: 'Rosen Wave T5' },
      { id: 22, value: 'powerball', label: 'Powerball' },
      { id: 23, value: 'dess', label: 'Dess' },
      { id: 24, value: 'sin_prh30', label: 'SIN PRH30' },
      { id: 25, value: 'neodent', label: 'Neodent' },
      { id: 26, value: 'other', label: 'Other' }
    ],
    vdo_details: [
      { id: 27, value: 'open_4mm_without', label: 'Open up to 4mm without calling Doctor' },
      { id: 28, value: 'open_4mm_with', label: 'Open up to 4mm with calling Doctor' },
      { id: 29, value: 'open_based_requirement', label: 'Open VDO based on requirement' },
      { id: 30, value: 'no_changes', label: 'No changes required in VDO' }
    ]
  };

  useEffect(() => {
    if (labScript) {
      setEditData(labScript);
      // Load existing comments (in real app, this would come from database)
      setComments([
        {
          id: "1",
          text: "Initial lab script created. Patient consultation completed.",
          timestamp: new Date(labScript.created_at).toLocaleString()
        }
      ]);
    }
  }, [labScript]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!labScript) return;
    
    try {
      await onUpdate(labScript.id, editData);
      setIsEditing(false);
      toast.success("Lab script updated successfully!");
    } catch (error) {
      toast.error("Failed to update lab script");
    }
  };

  const handleCancel = () => {
    setEditData(labScript || {});
    setIsEditing(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setEditData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    
    const comment = {
      id: Date.now().toString(),
      text: newComment,
      timestamp: new Date().toLocaleString()
    };
    
    setComments(prev => [...prev, comment]);
    setNewComment("");
    toast.success("Comment added successfully!");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-emerald-100 text-emerald-700';
      case 'in-progress': return 'bg-blue-100 text-blue-700';
      case 'delayed': return 'bg-red-100 text-red-700';
      case 'hold': return 'bg-purple-100 text-purple-700';
      default: return 'bg-amber-100 text-amber-700';
    }
  };

  if (!labScript) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FlaskConical className="h-6 w-6 text-indigo-600" />
              Lab Script Details
            </div>
            <div className="flex items-center gap-2 mr-8">
              {!isEditing ? (
                <Button variant="outline" size="sm" onClick={handleEdit}>
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleSave}>
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleCancel}>
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Patient Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="h-5 w-5 text-indigo-600" />
                Patient Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Patient Name</Label>
                <div className="text-lg font-semibold">{labScript.patient_name}</div>
              </div>
            </CardContent>
          </Card>

          {/* Appliance Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <FlaskConical className="h-5 w-5 text-indigo-600" />
                Appliance Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Arch Type</Label>
                <div className="text-base font-medium">{labScript.arch_type?.charAt(0).toUpperCase() + labScript.arch_type?.slice(1)}</div>
              </div>

              {/* Upper Appliance Type - Show when arch is upper or dual */}
              {(labScript.arch_type === 'upper' || labScript.arch_type === 'dual') && (
                <div>
                  <Label>Upper Appliance Type</Label>
                  <div className="text-base font-medium">
                    {labScript.upper_appliance_type
                      ? labScript.upper_appliance_type.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
                      : 'N/A'
                    }
                  </div>
                </div>
              )}

              {/* Lower Appliance Type - Show when arch is lower or dual */}
              {(labScript.arch_type === 'lower' || labScript.arch_type === 'dual') && (
                <div>
                  <Label>Lower Appliance Type</Label>
                  <div className="text-base font-medium">
                    {labScript.lower_appliance_type
                      ? labScript.lower_appliance_type.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
                      : 'N/A'
                    }
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Screw Type</Label>
                  <div className="text-base font-medium">
                    {labScript.screw_type || 'N/A'}
                    {labScript.custom_screw_type && ` (${labScript.custom_screw_type})`}
                  </div>
                </div>
                <div>
                  <Label>VDO Details</Label>
                  <div className="text-base font-medium">{labScript.vdo_details || 'N/A'}</div>
                </div>
              </div>

              <div>
                <Label>Nightguard Needed</Label>
                <div className="text-base font-medium">
                  {labScript.is_nightguard_needed === 'yes' ? 'Yes' :
                   labScript.is_nightguard_needed === 'no' ? 'No' : 'N/A'}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dates and Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calendar className="h-5 w-5 text-indigo-600" />
                Timeline & Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Requested Date</Label>
                  {isEditing ? (
                    <Input
                      type="date"
                      value={editData.requested_date}
                      onChange={(e) => handleInputChange("requested_date", e.target.value)}
                    />
                  ) : (
                    <div className="text-base font-medium">
                      {new Date(labScript.requested_date).toLocaleDateString()}
                    </div>
                  )}
                </div>
                <div>
                  <Label>Due Date</Label>
                  {isEditing ? (
                    <Input
                      type="date"
                      value={editData.due_date || ""}
                      onChange={(e) => handleInputChange("due_date", e.target.value)}
                    />
                  ) : (
                    <div className="text-base font-medium">
                      {labScript.due_date ? new Date(labScript.due_date).toLocaleDateString() : 'Not set'}
                    </div>
                  )}
                </div>
                <div>
                  <Label>Status</Label>
                  {isEditing ? (
                    <Select value={editData.status} onValueChange={(value) => handleInputChange("status", value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="delayed">Delayed</SelectItem>
                        <SelectItem value="hold">Hold</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Badge className={getStatusColor(labScript.status)}>
                      {labScript.status}
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="h-5 w-5 text-indigo-600" />
                Instructions & Notes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Special Instructions</Label>
                {isEditing ? (
                  <Textarea
                    value={editData.instructions || ""}
                    onChange={(e) => handleInputChange("instructions", e.target.value)}
                    rows={4}
                    placeholder="Enter special instructions..."
                  />
                ) : (
                  <div className="text-base p-3 bg-gray-50 rounded-md min-h-[100px]">
                    {labScript.instructions || 'No special instructions provided'}
                  </div>
                )}
              </div>
              <div>
                <Label>Notes</Label>
                {isEditing ? (
                  <Textarea
                    value={editData.notes || ""}
                    onChange={(e) => handleInputChange("notes", e.target.value)}
                    rows={3}
                    placeholder="Enter additional notes..."
                  />
                ) : (
                  <div className="text-base p-3 bg-gray-50 rounded-md min-h-[80px]">
                    {labScript.notes || 'No additional notes'}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Comments & Remarks */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <MessageSquare className="h-5 w-5 text-indigo-600" />
                Comments & Remarks
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Existing Comments */}
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {comments.map((comment) => (
                  <div key={comment.id} className="p-3 bg-gray-50 rounded-md border-l-4 border-indigo-500">
                    <div className="text-sm text-gray-500 mb-1">{comment.timestamp}</div>
                    <div className="text-base">{comment.text}</div>
                  </div>
                ))}
              </div>
              
              <Separator />
              
              {/* Add New Comment */}
              <div className="space-y-3">
                <Label>Add Comment/Remark</Label>
                <Textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Enter your comment or remark..."
                  rows={3}
                />
                <Button onClick={handleAddComment} disabled={!newComment.trim()}>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Add Comment
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
