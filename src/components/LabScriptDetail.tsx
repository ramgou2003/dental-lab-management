import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
import { useLabScriptComments } from "@/hooks/useLabScriptComments";
import { FlaskConical, Edit2, Save, X, MessageSquare, Calendar, User, FileText } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { useLabScriptConfig } from "@/hooks/useLabScriptConfig";

// Helper function to format date and time from database, converting UTC to EST/EDT
const formatDateTimeFromDB = (dateString: string): { date: string; time: string } => {
  // Parse the UTC date string and convert to Eastern Time
  const utcDate = new Date(dateString);

  // Use Intl.DateTimeFormat to get the date and time in Eastern timezone
  const dateFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const timeFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });

  const formattedDate = dateFormatter.format(utcDate);
  const formattedTime = timeFormatter.format(utcDate);

  return { date: formattedDate, time: formattedTime };
};

// Helper function to format date-only fields (like requested_date, due_date) without timezone conversion
const formatDateFromDB = (dateString: string): string => {
  // Parse the date string directly without timezone conversion
  // Expected format: "2025-01-15" or "2025-01-15T00:00:00"
  const datePart = dateString.split('T')[0];
  const [year, month, day] = datePart.split('-');

  // Format as "Month Day, Year"
  const months = ['January', 'February', 'March', 'April', 'May', 'June',
                  'July', 'August', 'September', 'October', 'November', 'December'];
  return `${months[parseInt(month) - 1]} ${parseInt(day)}, ${year}`;
};

interface LabScriptDetailProps {
  open: boolean;
  onClose: () => void;
  labScript: LabScript | null;
  onUpdate: (id: string, updates: Partial<LabScript>) => Promise<void>;
  initialEditMode?: boolean;
}

export function LabScriptDetail({ open, onClose, labScript, onUpdate, initialEditMode = false }: LabScriptDetailProps) {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(initialEditMode);
  const [editData, setEditData] = useState<Partial<LabScript>>({});
  const [newComment, setNewComment] = useState("");
  const { comments, addComment, loading: commentsLoading } = useLabScriptComments(labScript?.id);
  const { treatmentTypes, applianceTypes, materials, shades } = useLabScriptConfig();

  // Convert dynamic data to options format
  const options = {
    treatment_type: treatmentTypes.map(t => ({ id: t.id, value: t.value, label: t.name })),
    appliance_type: applianceTypes.map(a => ({ id: a.id, value: a.value, label: a.name })),
    screw_type: [
      { id: '19', value: 'dc_screw', label: 'DC Screw' },
      { id: '20', value: 'rosen', label: 'Rosen' },
      { id: '21', value: 'rosen_wave_t5', label: 'Rosen Wave T5' },
      { id: '22', value: 'powerball', label: 'Powerball' },
      { id: '23', value: 'dess', label: 'Dess' },
      { id: '24', value: 'sin_prh30', label: 'SIN PRH30' },
      { id: '25', value: 'neodent', label: 'Neodent' },
      { id: '26', value: 'other', label: 'Other' }
    ],
    vdo_details: [
      { id: '27', value: 'open_4mm_without', label: 'Open up to 4mm without calling Doctor' },
      { id: '28', value: 'open_4mm_with', label: 'Open up to 4mm with calling Doctor' },
      { id: '29', value: 'open_based_requirement', label: 'Open VDO based on requirement' },
      { id: '30', value: 'no_changes', label: 'No changes required in VDO' }
    ],
    material: materials.map(m => ({ id: m.id, value: m.value, label: m.name })),
    shade: shades.map(s => ({ id: s.id, value: s.value, label: s.name }))
  };

  useEffect(() => {
    if (labScript) {
      setEditData(labScript);
      setIsEditing(initialEditMode);
    }
  }, [labScript, initialEditMode]);

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

  const handleAddComment = async () => {
    if (!newComment.trim() || !labScript?.id) return;

    // Validate comment length
    if (newComment.length > 500) {
      toast.error("Comment is too long. Please keep it under 500 characters.");
      return;
    }

    try {
      await addComment({
        comment_text: newComment.trim(),
        author_name: "Guest",
        author_role: "Guest"
      });
      setNewComment("");
      toast.success("Comment added successfully!");
    } catch (error) {
      console.error("Error adding comment:", error);
      toast.error("Failed to add comment. Please try again.");
    }
  };

  const handlePatientNameClick = () => {
    if (labScript?.patient_id) {
      onClose(); // Close the dialog first
      navigate(`/patients/${labScript.patient_id}`);
    }
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
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 flex flex-col">
        <DialogHeader className="px-6 pt-6 pb-4 flex-shrink-0">
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FlaskConical className="h-6 w-6 text-indigo-600" />
              {isEditing ? "Edit Lab Script" : "Lab Script Details"}
            </div>
            {isEditing && (
              <div className="flex items-center gap-2 mr-8">
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
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 overflow-y-auto flex-1 px-6 pb-6">
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
                {labScript.patient_id ? (
                  <div
                    className="text-lg font-semibold text-blue-600 cursor-pointer hover:text-blue-700 hover:underline transition-colors"
                    onClick={handlePatientNameClick}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handlePatientNameClick();
                      }
                    }}
                  >
                    {labScript.patient_name}
                  </div>
                ) : (
                  <div className="text-lg font-semibold">{labScript.patient_name}</div>
                )}
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

              {/* Treatment Type - Side by side for dual arch */}
              {labScript.arch_type === 'dual' ? (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Upper Treatment Type</Label>
                    <div className="text-base font-medium">
                      {labScript.upper_treatment_type
                        ? labScript.upper_treatment_type.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
                        : 'N/A'
                      }
                    </div>
                  </div>
                  <div>
                    <Label>Lower Treatment Type</Label>
                    <div className="text-base font-medium">
                      {labScript.lower_treatment_type
                        ? labScript.lower_treatment_type.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
                        : 'N/A'
                      }
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {/* Upper Treatment Type - Show when arch is upper */}
                  {labScript.arch_type === 'upper' && (
                    <div>
                      <Label>Upper Treatment Type</Label>
                      <div className="text-base font-medium">
                        {labScript.upper_treatment_type
                          ? labScript.upper_treatment_type.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
                          : 'N/A'
                        }
                      </div>
                    </div>
                  )}

                  {/* Lower Treatment Type - Show when arch is lower */}
                  {labScript.arch_type === 'lower' && (
                    <div>
                      <Label>Lower Treatment Type</Label>
                      <div className="text-base font-medium">
                        {labScript.lower_treatment_type
                          ? labScript.lower_treatment_type.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
                          : 'N/A'
                        }
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Appliance Type - Side by side for dual arch */}
              {labScript.arch_type === 'dual' ? (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Upper Appliance Type</Label>
                    <div className="text-base font-medium">
                      {labScript.upper_appliance_type
                        ? labScript.upper_appliance_type.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
                        : 'N/A'
                      }
                    </div>
                  </div>
                  <div>
                    <Label>Lower Appliance Type</Label>
                    <div className="text-base font-medium">
                      {labScript.lower_appliance_type
                        ? labScript.lower_appliance_type.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
                        : 'N/A'
                      }
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {/* Upper Appliance Type - Show when arch is upper */}
                  {labScript.arch_type === 'upper' && (
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

                  {/* Lower Appliance Type - Show when arch is lower */}
                  {labScript.arch_type === 'lower' && (
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
                </>
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

              {/* Material and Shade */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Material</Label>
                  {isEditing ? (
                    <Select value={editData.material || ""} onValueChange={(value) => handleInputChange("material", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select material" />
                      </SelectTrigger>
                      <SelectContent>
                        {options.material.map((option) => (
                          <SelectItem key={option.id} value={option.label}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="text-base font-medium">
                      {labScript.material ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                          {labScript.material}
                        </span>
                      ) : (
                        'N/A'
                      )}
                    </div>
                  )}
                </div>
                <div>
                  <Label>Shade</Label>
                  {isEditing ? (
                    <Select value={editData.shade || ""} onValueChange={(value) => handleInputChange("shade", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select shade" />
                      </SelectTrigger>
                      <SelectContent>
                        {options.shade.map((option) => (
                          <SelectItem key={option.id} value={option.label}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="text-base font-medium">
                      {labScript.shade ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-amber-100 text-amber-800">
                          {labScript.shade}
                        </span>
                      ) : (
                        'N/A'
                      )}
                    </div>
                  )}
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
                      {formatDateFromDB(labScript.requested_date)}
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
                      {labScript.due_date ? formatDateFromDB(labScript.due_date) : 'Not set'}
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

          {/* Tracking Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calendar className="h-5 w-5 text-indigo-600" />
                Tracking Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`grid grid-cols-1 ${labScript.status === 'completed' ? 'md:grid-cols-2' : ''} gap-6`}>
                {/* Created Information */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <User className="h-4 w-4 text-green-600" />
                    Created
                  </div>
                  <div className="pl-6 space-y-2">
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Created By</div>
                      <div className="text-sm font-medium text-gray-900">
                        {labScript.created_by_name || 'Not available'}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Created Date & Time (Eastern)</div>
                      <div className="text-sm text-gray-900">
                        {labScript.created_at ? (
                          (() => {
                            const { date, time } = formatDateTimeFromDB(labScript.created_at);
                            return (
                              <>
                                <div className="font-medium">{date}</div>
                                <div className="text-gray-600">{time}</div>
                              </>
                            );
                          })()
                        ) : (
                          'Not available'
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Completed Information - Only show if status is completed */}
                {labScript.status === 'completed' && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                      <User className="h-4 w-4 text-blue-600" />
                      Completed
                    </div>
                    <div className="pl-6 space-y-2">
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Completed By</div>
                        <div className="text-sm font-medium text-gray-900">
                          {labScript.completed_by_name || 'Not available'}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Completed Date & Time (Eastern)</div>
                        <div className="text-sm text-gray-900">
                          {labScript.completion_date ? (
                            (() => {
                              const { date, time } = formatDateTimeFromDB(labScript.completion_date);
                              return (
                                <>
                                  <div className="font-medium">{date}</div>
                                  <div className="text-gray-600">{time}</div>
                                </>
                              );
                            })()
                          ) : (
                            'Not available'
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Comments & Remarks - HIDDEN FOR NOW (Keep functionality for future use) */}
          {/*
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-lg">
                  <MessageSquare className="h-5 w-5 text-indigo-600" />
                  Comments & Remarks
                  {comments.length > 0 && (
                    <span className="bg-indigo-100 text-indigo-700 text-xs font-medium px-2 py-1 rounded-full">
                      {comments.length}
                    </span>
                  )}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Existing Comments *\/}
              <div className="space-y-4">
                {commentsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="flex items-center gap-3 text-gray-500">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600"></div>
                      <span>Loading comments...</span>
                    </div>
                  </div>
                ) : comments.length > 0 ? (
                  <div className="max-h-80 overflow-y-auto space-y-4 pr-2">
                    {comments.map((comment, index) => (
                      <div key={comment.id} className="group relative">
                        <div className="flex gap-3">
                          {/* Avatar *\/}
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs font-semibold">
                                {comment.author_name && comment.author_name !== "Guest"
                                  ? comment.author_name.charAt(0).toUpperCase()
                                  : "G"
                                }
                              </span>
                            </div>
                          </div>

                          {/* Comment Content *\/}
                          <div className="flex-1 min-w-0">
                            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow duration-200">
                              {/* Header *\/}
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-gray-900 text-sm">
                                    {comment.author_name && comment.author_name !== "Guest"
                                      ? comment.author_name
                                      : "Guest User"
                                    }
                                  </span>
                                  {comment.author_role && comment.author_role !== "Guest" && (
                                    <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                                      {comment.author_role}
                                    </span>
                                  )}
                                </div>
                                <time className="text-xs text-gray-500" title={new Date(comment.created_at).toLocaleString()}>
                                  {(() => {
                                    const now = new Date();
                                    const commentDate = new Date(comment.created_at);
                                    const diffInHours = Math.floor((now.getTime() - commentDate.getTime()) / (1000 * 60 * 60));

                                    if (diffInHours < 1) {
                                      const diffInMinutes = Math.floor((now.getTime() - commentDate.getTime()) / (1000 * 60));
                                      return diffInMinutes < 1 ? "Just now" : `${diffInMinutes}m ago`;
                                    } else if (diffInHours < 24) {
                                      return `${diffInHours}h ago`;
                                    } else {
                                      const diffInDays = Math.floor(diffInHours / 24);
                                      return diffInDays === 1 ? "Yesterday" : `${diffInDays}d ago`;
                                    }
                                  })()}
                                </time>
                              </div>

                              {/* Comment Text *\/}
                              <div className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                                {comment.comment_text}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Connection line to next comment *\/}
                        {index < comments.length - 1 && (
                          <div className="absolute left-4 top-12 w-px h-4 bg-gray-200"></div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No comments yet</h3>
                    <p className="text-gray-500 text-sm">Be the first to add a comment or remark about this lab script.</p>
                  </div>
                )}
              </div>

              <Separator className="my-6" />

              {/* Add New Comment *\/}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-semibold">G</span>
                  </div>
                  <Label className="text-sm font-medium text-gray-900">Add a new comment</Label>
                </div>
                <div className="ml-10">
                  <Textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Share your thoughts, updates, or important notes about this lab script..."
                    rows={3}
                    className="resize-none border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                    autoFocus={false}
                  />
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xs text-gray-500">
                      {newComment.length}/500 characters
                    </span>
                    <Button
                      onClick={handleAddComment}
                      disabled={!newComment.trim() || commentsLoading || newComment.length > 500}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white"
                      size="sm"
                    >
                      {commentsLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Adding...
                        </>
                      ) : (
                        <>
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Add Comment
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          */}
        </div>
      </DialogContent>
    </Dialog>
  );
}
