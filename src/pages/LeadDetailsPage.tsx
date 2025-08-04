import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { PatientPacketViewer } from "@/components/PatientPacketViewer";
import { PatientPacketDialog } from "@/components/PatientPacketDialog";
import { LeadAppointmentScheduler } from "@/components/LeadAppointmentScheduler";
import { AppointmentDetailsDialog } from "@/components/AppointmentDetailsDialog";
import { getPatientPacketsByLeadId } from "@/services/patientPacketService";
import { NewPatientFormData } from "@/types/newPatientPacket";
import {
  User,
  Phone,
  Mail,
  Calendar,
  Clock,
  MessageSquare,
  ArrowLeft,
  MoreVertical,
  MapPin,
  FileText,
  Activity,
  Send,
  Heart,
  DollarSign,
  AlertCircle,
  CheckCircle,
  XCircle,
  Plus,
  Edit3,
  Trash2,
  AlertTriangle,
  Shield,
  Zap,
  Search,
  Pill,
  CalendarPlus
} from "lucide-react";

interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string;
  source: string;
  createdAt: string;
  lastContact?: string;
  attempts: number;
  notes: string;
  status: 'new' | 'attempt1' | 'attempt2' | 'attempt3' | 'scheduled' | 'optout' | 'noresponse';
  public_link?: string; // Generated public link for patient packet

  // Personal Information
  personal_first_name?: string;
  personal_last_name?: string;
  personal_phone?: string;
  personal_email?: string;
  first_name?: string;
  last_name?: string;
  date_of_birth?: string;
  gender?: string;

  // Contact Information
  best_contact_time?: string;
  phone_call_preference?: string;
  preferred_contact?: string;
  best_time_to_call?: string;

  // Address Information
  home_address?: string;
  street_address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  address?: string;

  // Dental Information
  reason_for_visit?: string;
  dental_problems?: string[];
  immediate_needs?: string[];
  implant_type?: string;
  urgency?: string;

  // Financial Information
  need_loved_one_help?: string;
  use_financing?: string;
  credit_score?: string;
  barriers?: string[];

  // Medical Information
  medical_conditions?: string[];
  has_medical_insurance?: string;

  // Additional Information
  hear_about_us?: string;
  additional_notes?: string;
  agree_to_terms?: boolean;
}

interface Comment {
  id: string;
  lead_id: string;
  user_id: string;
  user_name: string;
  comment: string;
  comment_type: 'general' | 'follow_up' | 'status_change' | 'important';
  created_at: string;
  updated_at: string;
}

const LeadDetailsPage: React.FC = () => {
  // Lead Details Page Component
  const { leadId } = useParams<{ leadId: string }>();
  const navigate = useNavigate();
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [commentType, setCommentType] = useState<'general' | 'follow_up' | 'status_change' | 'important'>('general');
  const [isAddingComment, setIsAddingComment] = useState(false);
  const [loadingComments, setLoadingComments] = useState(true);
  const [patientPackets, setPatientPackets] = useState<any[]>([]);
  const [loadingPackets, setLoadingPackets] = useState(true);
  const [showAppointmentScheduler, setShowAppointmentScheduler] = useState(false);
  const [showAppointmentDetails, setShowAppointmentDetails] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [leadAppointments, setLeadAppointments] = useState<any[]>([]);
  const [loadingAppointments, setLoadingAppointments] = useState(true);

  useEffect(() => {
    console.log('LeadDetailsPage mounted, leadId:', leadId);
    if (leadId) {
      try {
        fetchLeadDetails();
        fetchComments();
        fetchPatientPackets();
        fetchLeadAppointments();
      } catch (error) {
        console.error('Error in useEffect:', error);
        setLoading(false);
      }
    } else {
      console.error('No leadId provided');
      setLoading(false);
    }
  }, [leadId]);

  const fetchLeadDetails = async () => {
    try {
      console.log('Fetching lead details for ID:', leadId);
      const { data, error } = await supabase
        .from('new_patient_leads')
        .select('*')
        .eq('id', leadId)
        .single();

      console.log('Supabase response:', { data, error });

      if (error) {
        console.error('Error fetching lead details:', error);
        toast.error('Failed to load lead details');
        setLoading(false);
        return;
      }

      if (data) {
        const leadData: Lead = {
          id: data.id,
          name: `${data.personal_first_name || data.first_name || ''} ${data.personal_last_name || data.last_name || ''}`.trim() || 'Unknown',
          phone: data.personal_phone || data.phone || 'No phone',
          email: data.personal_email || data.email || 'No email',
          source: 'Website Form',
          createdAt: data.created_at,
          attempts: 0,
          notes: data.additional_notes || '',
          status: data.status || 'new',
          public_link: data.public_link,

          // Personal Information
          personal_first_name: data.personal_first_name,
          personal_last_name: data.personal_last_name,
          personal_phone: data.personal_phone,
          personal_email: data.personal_email,
          first_name: data.first_name,
          last_name: data.last_name,
          date_of_birth: data.date_of_birth,
          gender: data.gender,

          // Contact Information
          best_contact_time: data.best_contact_time,
          phone_call_preference: data.phone_call_preference,
          preferred_contact: data.preferred_contact,
          best_time_to_call: data.best_time_to_call,

          // Address Information
          home_address: data.home_address,
          street_address: data.street_address,
          city: data.city,
          state: data.state,
          zip_code: data.zip_code,
          address: data.address,

          // Dental Information
          reason_for_visit: data.reason_for_visit,
          dental_problems: data.dental_problems,
          immediate_needs: data.immediate_needs,
          implant_type: data.implant_type,
          urgency: data.urgency,

          // Financial Information
          need_loved_one_help: data.need_loved_one_help,
          use_financing: data.use_financing,
          credit_score: data.credit_score,
          barriers: data.barriers,

          // Medical Information
          medical_conditions: data.medical_conditions,
          has_medical_insurance: data.has_medical_insurance,

          // Additional Information
          hear_about_us: data.hear_about_us,
          additional_notes: data.additional_notes,
          agree_to_terms: data.agree_to_terms
        };

        console.log('Setting lead data:', leadData);
        setLead(leadData);
      } else {
        console.log('No data returned from Supabase');
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error('An unexpected error occurred');
    } finally {
      console.log('Setting loading to false');
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from('lead_comments')
        .select('*')
        .eq('lead_id', leadId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching comments:', error);
        return;
      }

      setComments(data || []);
    } catch (error) {
      console.error('Unexpected error:', error);
    } finally {
      setLoadingComments(false);
    }
  };

  const fetchPatientPackets = async () => {
    if (!leadId) return;

    try {
      setLoadingPackets(true);
      const { data, error } = await getPatientPacketsByLeadId(leadId);

      if (error) {
        console.error('Error fetching patient packets:', error);
        return;
      }

      setPatientPackets(data || []);
    } catch (error) {
      console.error('Unexpected error fetching patient packets:', error);
    } finally {
      setLoadingPackets(false);
    }
  };

  const fetchLeadAppointments = async () => {
    if (!leadId) return;

    try {
      setLoadingAppointments(true);
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .or(`patient_id.eq.${leadId},notes.ilike.%Lead ID: ${leadId}%`)
        .order('date', { ascending: true })
        .order('start_time', { ascending: true });

      if (error) {
        console.error('Error fetching lead appointments:', error);
        return;
      }

      setLeadAppointments(data || []);
    } catch (error) {
      console.error('Unexpected error fetching lead appointments:', error);
    } finally {
      setLoadingAppointments(false);
    }
  };

  const addComment = async () => {
    if (!newComment.trim() || !lead) return;

    setIsAddingComment(true);
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from('lead_comments')
        .insert([{
          lead_id: lead.id,
          user_id: user?.id || 'anonymous',
          user_name: user?.email?.split('@')[0] || 'Anonymous User',
          comment: newComment.trim(),
          comment_type: commentType
        }])
        .select()
        .single();

      if (error) {
        console.error('Error adding comment:', error);
        toast.error('Failed to add comment');
        return;
      }

      setComments(prev => [data, ...prev]);
      setNewComment('');
      toast.success('Comment added successfully');
    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsAddingComment(false);
    }
  };

  const updateLeadStatus = async (newStatus: string) => {
    if (!lead) return;

    try {
      const { error } = await supabase
        .from('new_patient_leads')
        .update({ status: newStatus })
        .eq('id', lead.id);

      if (error) {
        console.error('Error updating lead status:', error);
        toast.error('Failed to update lead status');
        return;
      }

      setLead(prev => prev ? { ...prev, status: newStatus as any } : null);

      // Add a status change comment
      const { data: { user } } = await supabase.auth.getUser();
      await supabase
        .from('lead_comments')
        .insert([{
          lead_id: lead.id,
          user_id: user?.id || 'system',
          user_name: user?.email?.split('@')[0] || 'System',
          comment: `Status changed to ${getStatusLabel(newStatus)}`,
          comment_type: 'status_change'
        }]);

      fetchComments(); // Refresh comments
      toast.success('Lead status updated successfully');
    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error('An unexpected error occurred');
    }
  };

  // Handle link generation callback
  const handleLinkGenerated = (link: string) => {
    setLead(prev => prev ? { ...prev, public_link: link } : null);
    fetchComments(); // Refresh comments
    fetchPatientPackets(); // Refresh patient packets
  };

  const handleAppointmentScheduled = () => {
    // Refresh appointments when a new one is scheduled
    fetchLeadAppointments();
    setShowAppointmentScheduler(false);
  };

  const getCommentTypeColor = (type: string) => {
    switch (type) {
      case 'follow_up': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'status_change': return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'important': return 'bg-red-100 text-red-800 border-red-300';
      case 'packet_sent': return 'bg-green-100 text-green-800 border-green-300';
      case 'packet_completed': return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getCommentTypeIcon = (type: string) => {
    switch (type) {
      case 'follow_up':
        return <Clock className="h-3 w-3" />;
      case 'status_change':
        return <Activity className="h-3 w-3" />;
      case 'important':
        return <AlertCircle className="h-3 w-3" />;
      case 'packet_sent':
        return <FileText className="h-3 w-3" />;
      case 'packet_completed':
        return <CheckCircle className="h-3 w-3" />;
      default:
        return <MessageSquare className="h-3 w-3" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'attempt1': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'attempt2': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'attempt3': return 'bg-red-100 text-red-800 border-red-300';
      case 'scheduled': return 'bg-green-100 text-green-800 border-green-300';
      case 'optout': return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'noresponse': return 'bg-purple-100 text-purple-800 border-purple-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'new': return 'New Lead';
      case 'attempt1': return '1st Attempt';
      case 'attempt2': return '2nd Attempt';
      case 'attempt3': return '3rd Attempt';
      case 'scheduled': return 'Scheduled';
      case 'optout': return 'Opt Out';
      case 'noresponse': return 'No Response';
      default: return 'Unknown';
    }
  };

  console.log('Render state:', { loading, lead: !!lead, leadId });

  if (loading) {
    return (
      <div className="flex flex-col h-screen bg-gray-50">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto mb-6"></div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Loading Lead Details</h3>
            <p className="text-gray-600">Please wait while we fetch the information...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!lead && !loading) {
    return (
      <div className="flex flex-col h-screen bg-gray-50">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center max-w-md mx-auto p-8">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="h-10 w-10 text-red-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Lead Not Found</h3>
            <p className="text-gray-600 mb-6">The lead you're looking for doesn't exist or has been removed from the system.</p>
            <p className="text-sm text-gray-500 mb-4">Lead ID: {leadId}</p>
            <Button
              onClick={() => navigate('/lead-in')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 mx-auto"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Leads
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 flex-shrink-0">
        <div className="w-full px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => navigate('/lead-in')}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Leads
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900">{lead.name}</h1>
                <Badge className={`${getStatusColor(lead.status)} border px-3 py-1 text-sm font-medium`}>
                  {getStatusLabel(lead.status)}
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {leadAppointments.length > 0 ? (
                <Button
                  onClick={() => {
                    // Open appointment details dialog
                    const latestAppointment = leadAppointments[0];
                    setSelectedAppointment(latestAppointment);
                    setShowAppointmentDetails(true);
                  }}
                  className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
                  size="sm"
                >
                  <Calendar className="h-4 w-4" />
                  View Appointment Details
                </Button>
              ) : (
                <Button
                  onClick={() => setShowAppointmentScheduler(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
                  size="sm"
                >
                  <CalendarPlus className="h-4 w-4" />
                  Schedule Appointment
                </Button>
              )}
              {lead.status === 'scheduled' && (
                <PatientPacketDialog
                  leadId={lead.id}
                  leadName={lead.name}
                  existingLink={lead.public_link}
                  onLinkGenerated={handleLinkGenerated}
                />
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <MoreVertical className="h-4 w-4" />
                    Actions
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => updateLeadStatus('attempt1')}>
                    Move to 1st Attempt
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => updateLeadStatus('attempt2')}>
                    Move to 2nd Attempt
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => updateLeadStatus('attempt3')}>
                    Move to 3rd Attempt
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => updateLeadStatus('scheduled')}>
                    Mark as Scheduled
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => updateLeadStatus('optout')}>
                    Mark as Opt Out
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => updateLeadStatus('noresponse')}>
                    Mark as No Response
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 pb-6 overflow-hidden min-h-0">
        <div className="h-full">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 h-full">
            {/* Container 1: Patient Profile */}
            <Card className="bg-white border border-gray-200 h-full flex flex-col overflow-hidden">
              <CardContent className="flex-1 overflow-y-auto p-3 scrollbar-modern">
                <div className="space-y-4">
                  {/* Large Patient Avatar Section */}
                  <div className="flex flex-col items-center text-center py-4">
                    <Avatar className="h-20 w-20 mb-3 ring-4 ring-indigo-100">
                      <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                        {lead.name.split(' ').map(n => n.charAt(0)).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">{lead.name}</h3>
                    <Badge className={`${getStatusColor(lead.status)} text-xs px-2 py-1`}>
                      {getStatusLabel(lead.status)}
                    </Badge>
                  </div>

                  {/* Contact Information */}
                  <div className="space-y-3 border-t border-gray-200 pt-4">
                    <div className="flex items-center justify-center gap-2 mb-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Phone className="h-4 w-4 text-blue-600" />
                      </div>
                      <h4 className="text-sm font-semibold text-gray-900">Contact Information</h4>
                    </div>

                    <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Phone className="h-4 w-4 text-green-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{lead.phone}</p>
                        <p className="text-xs text-gray-500">Phone Number</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Mail className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{lead.email}</p>
                        <p className="text-xs text-gray-500">Email Address</p>
                      </div>
                    </div>

                    {lead.best_contact_time && (
                      <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <Clock className="h-4 w-4 text-purple-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">{lead.best_contact_time}</p>
                          <p className="text-xs text-gray-500">Best Contact Time</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Personal Details */}
                  <div className="space-y-3 border-t border-gray-200 pt-4">
                    <div className="flex items-center justify-center gap-2 mb-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-purple-600" />
                      </div>
                      <h4 className="text-sm font-semibold text-gray-900">Personal Details</h4>
                    </div>

                    {lead.date_of_birth && (
                      <div className="flex items-center gap-3">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {new Date(lead.date_of_birth).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-gray-500">Date of Birth</p>
                        </div>
                      </div>
                    )}

                    {lead.gender && (
                      <div className="flex items-center gap-3">
                        <User className="h-4 w-4 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-900 capitalize">{lead.gender}</p>
                          <p className="text-xs text-gray-500">Gender</p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {new Date(lead.createdAt).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-gray-500">Lead Created</p>
                      </div>
                    </div>
                  </div>

                  {/* Address Information */}
                  {(lead.address || lead.home_address || lead.street_address) && (
                    <div className="space-y-3 border-t border-gray-200 pt-4">
                      <div className="flex items-center justify-center gap-2 mb-3">
                        <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                          <MapPin className="h-4 w-4 text-orange-600" />
                        </div>
                        <h4 className="text-sm font-semibold text-gray-900">Address</h4>
                      </div>
                      <div className="flex items-start gap-3 p-2 bg-gray-50 rounded-lg">
                        <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <MapPin className="h-4 w-4 text-orange-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">
                            {lead.address || lead.home_address || lead.street_address}
                          </p>
                          {(lead.city || lead.state || lead.zip_code) && (
                            <p className="text-sm text-gray-700">
                              {[lead.city, lead.state, lead.zip_code].filter(Boolean).join(', ')}
                            </p>
                          )}
                          <p className="text-xs text-gray-500">Home Address</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Container 2: Dental & Medical Information */}
            <Card className="bg-white border border-gray-200 h-full flex flex-col overflow-hidden">
              <CardContent className="flex-1 overflow-y-auto p-3 scrollbar-modern">
                <div className="space-y-4">
                  {/* Reason for Visit - Prominent Display */}
                  {lead.reason_for_visit && (
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <Heart className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-semibold text-blue-900 mb-1">Reason for Visit</h4>
                          <p className="text-sm text-blue-800 leading-relaxed">{lead.reason_for_visit}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Urgency Level - High Priority Display */}
                  {lead.urgency && (
                    <div className={`p-3 rounded-lg border ${
                      lead.urgency === 'high' ? 'bg-red-50 border-red-200' :
                      lead.urgency === 'medium' ? 'bg-yellow-50 border-yellow-200' :
                      'bg-green-50 border-green-200'
                    }`}>
                      <div className="flex items-center gap-2">
                        <AlertCircle className={`h-4 w-4 ${
                          lead.urgency === 'high' ? 'text-red-600' :
                          lead.urgency === 'medium' ? 'text-yellow-600' :
                          'text-green-600'
                        }`} />
                        <Badge className={`${
                          lead.urgency === 'high' ? 'bg-red-100 text-red-800' :
                          lead.urgency === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        } text-sm font-medium`}>
                          {lead.urgency.toUpperCase()} URGENCY
                        </Badge>
                      </div>
                    </div>
                  )}

                  {/* Dental Problems & Needs */}
                  {(lead.dental_problems?.length > 0 || lead.immediate_needs?.length > 0 || lead.implant_type) && (
                    <div className="space-y-3 border-t border-gray-200 pt-4">
                      <div className="flex items-center justify-center gap-2 mb-3">
                        <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                          <AlertTriangle className="h-4 w-4 text-red-600" />
                        </div>
                        <h4 className="text-sm font-semibold text-gray-900">Dental Information</h4>
                      </div>

                      {lead.dental_problems && lead.dental_problems.length > 0 && (
                        <div className="p-3 bg-red-50 rounded-lg border border-red-100">
                          <div className="flex items-center gap-2 mb-2">
                            <AlertTriangle className="h-4 w-4 text-red-600" />
                            <h5 className="text-sm font-medium text-red-900">Dental Problems</h5>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {lead.dental_problems.map((problem, index) => (
                              <Badge key={index} className="bg-red-100 text-red-800 border-red-200 text-xs">
                                {problem}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {lead.immediate_needs && lead.immediate_needs.length > 0 && (
                        <div className="p-3 bg-orange-50 rounded-lg border border-orange-100">
                          <div className="flex items-center gap-2 mb-2">
                            <Clock className="h-4 w-4 text-orange-600" />
                            <h5 className="text-sm font-medium text-orange-900">Immediate Needs</h5>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {lead.immediate_needs.map((need, index) => (
                              <Badge key={index} className="bg-orange-100 text-orange-800 border-orange-200 text-xs">
                                {need}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {lead.implant_type && (
                        <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <Zap className="h-3 w-3 text-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900">{lead.implant_type}</p>
                            <p className="text-xs text-gray-500">Implant Type</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Medical Information */}
                  {(lead.medical_conditions?.length > 0 || lead.has_medical_insurance) && (
                    <div className="space-y-3 border-t border-gray-200 pt-4">
                      <div className="flex items-center justify-center gap-2 mb-3">
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                          <Heart className="h-4 w-4 text-purple-600" />
                        </div>
                        <h4 className="text-sm font-semibold text-gray-900">Medical Information</h4>
                      </div>

                      {lead.medical_conditions && lead.medical_conditions.length > 0 && (
                        <div className="p-3 bg-purple-50 rounded-lg border border-purple-100">
                          <div className="flex items-center gap-2 mb-2">
                            <Heart className="h-4 w-4 text-purple-600" />
                            <h5 className="text-sm font-medium text-purple-900">Medical Conditions</h5>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {lead.medical_conditions.map((condition, index) => (
                              <Badge key={index} className="bg-purple-100 text-purple-800 border-purple-200 text-xs">
                                {condition}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {lead.has_medical_insurance && (
                        <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                            lead.has_medical_insurance === 'yes' ? 'bg-green-100' : 'bg-red-100'
                          }`}>
                            <Shield className={`h-3 w-3 ${
                              lead.has_medical_insurance === 'yes' ? 'text-green-600' : 'text-red-600'
                            }`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900">
                              {lead.has_medical_insurance === 'yes' ? 'Has Insurance' : 'No Insurance'}
                            </p>
                            <p className="text-xs text-gray-500">Medical Insurance</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Empty State */}
                  {!lead.reason_for_visit && !lead.urgency && (!lead.dental_problems || lead.dental_problems.length === 0) &&
                   (!lead.immediate_needs || lead.immediate_needs.length === 0) && !lead.implant_type &&
                   (!lead.medical_conditions || lead.medical_conditions.length === 0) && !lead.has_medical_insurance && (
                    <div className="flex items-center justify-center h-full min-h-[200px]">
                      <div className="text-center">
                        <Heart className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-sm text-gray-500 font-medium">No medical information</p>
                        <p className="text-xs text-gray-400">Medical details will appear here</p>
                      </div>
                    </div>
                  )}

                  {/* Patient Packet Section */}
                  <Separator className="my-4" />
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <FileText className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900">Patient Packet</h4>
                        <p className="text-xs text-gray-500">Submitted forms and documents</p>
                      </div>
                    </div>

                    {loadingPackets ? (
                      <div className="text-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                        <p className="text-xs text-gray-500">Loading patient packets...</p>
                      </div>
                    ) : patientPackets.length > 0 ? (
                      <div className="space-y-3">
                        {patientPackets.map((packet, index) => (
                          <div key={packet.id || index} className="bg-green-50 border border-green-200 rounded-lg p-3">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <span className="text-sm font-medium text-green-800">Form Submitted</span>
                              </div>
                              <span className="text-xs text-green-600">
                                {new Date(packet.created_at || packet.submitted_at).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-xs text-green-700 mb-2">
                              Patient: {packet.first_name} {packet.last_name}
                            </p>
                            <p className="text-xs text-green-600">
                              Complete patient information and medical history submitted via public link.
                            </p>
                          </div>
                        ))}

                        {/* Show public link if available */}
                        {lead.public_link && (
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-2">
                              <Send className="h-4 w-4 text-blue-600" />
                              <span className="text-sm font-medium text-blue-800">Public Link Generated</span>
                            </div>
                            <p className="text-xs text-blue-700 mb-2 break-all">
                              {lead.public_link}
                            </p>
                            <button
                              onClick={() => navigator.clipboard.writeText(lead.public_link || '')}
                              className="text-xs text-blue-600 hover:text-blue-800 underline"
                            >
                              Copy Link
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                          <FileText className="h-6 w-6 text-gray-400" />
                        </div>
                        <p className="text-sm text-gray-500 font-medium">No patient packet submitted</p>
                        <p className="text-xs text-gray-400">Patient forms will appear here when submitted</p>

                        {/* Show public link if available but no packets submitted */}
                        {lead.public_link && (
                          <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-2">
                              <Send className="h-4 w-4 text-blue-600" />
                              <span className="text-sm font-medium text-blue-800">Public Link Available</span>
                            </div>
                            <p className="text-xs text-blue-700 mb-2 break-all">
                              {lead.public_link}
                            </p>
                            <button
                              onClick={() => navigator.clipboard.writeText(lead.public_link || '')}
                              className="text-xs text-blue-600 hover:text-blue-800 underline"
                            >
                              Copy Link
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Container 3: Financial Information & Actions - Split into 2 rows */}
            <div className="space-y-4 h-full flex flex-col">
              {/* Financial Information Row */}
              <Card className="bg-white border border-gray-200 flex-1 flex flex-col overflow-hidden">
                <CardContent className="flex-1 overflow-y-auto p-3 scrollbar-sleek">
                  <div className="space-y-4">
                    {(lead.use_financing || lead.credit_score || lead.barriers || lead.need_loved_one_help || lead.hear_about_us || lead.additional_notes) ? (
                      <>
                        {/* Financial Overview Section */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-center gap-2 mb-3">
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                              <DollarSign className="h-4 w-4 text-green-600" />
                            </div>
                            <h4 className="text-sm font-semibold text-gray-900">Financial Overview</h4>
                          </div>

                          {lead.use_financing && (
                            <div className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                              <div className="flex items-center gap-3">
                                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                                  <CheckCircle className="h-3 w-3 text-green-600" />
                                </div>
                                <div className="flex-1">
                                  <Badge className={`${lead.use_financing === 'yes' ? 'bg-green-100 text-green-800 border-green-300' : 'bg-red-100 text-red-800 border-red-300'} text-xs font-medium`}>
                                    {lead.use_financing === 'yes' ? '✓ Interested in Financing' : '✗ No Financing Interest'}
                                  </Badge>
                                  <p className="text-xs text-green-700 mt-1">Financing Preference</p>
                                </div>
                              </div>
                            </div>
                          )}

                          {lead.credit_score && (
                            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                              <div className="flex items-center gap-3">
                                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                  <Activity className="h-3 w-3 text-blue-600" />
                                </div>
                                <div className="flex-1">
                                  <p className="text-sm font-semibold text-blue-900">{lead.credit_score}</p>
                                  <p className="text-xs text-blue-700">Credit Score Range</p>
                                </div>
                              </div>
                            </div>
                          )}

                          {lead.need_loved_one_help && (
                            <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                              <div className="flex items-center gap-3">
                                <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                                  <User className="h-3 w-3 text-purple-600" />
                                </div>
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-purple-900">
                                    {lead.need_loved_one_help === 'yes' ? 'Needs Family Support' : 'Independent Decision Maker'}
                                  </p>
                                  <p className="text-xs text-purple-700">Decision Making Process</p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Financial Barriers Section */}
                        {lead.barriers && lead.barriers.length > 0 && (
                          <div className="space-y-3 border-t border-gray-200 pt-4">
                            <div className="flex items-center justify-center gap-2 mb-3">
                              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                                <AlertTriangle className="h-4 w-4 text-orange-600" />
                              </div>
                              <h4 className="text-sm font-semibold text-gray-900">Financial Barriers</h4>
                            </div>
                            <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                              <div className="flex flex-wrap gap-2">
                                {lead.barriers.map((barrier, index) => (
                                  <Badge key={index} className="bg-orange-100 text-orange-800 border-orange-300 text-xs px-2 py-1">
                                    <AlertCircle className="h-3 w-3 mr-1" />
                                    {barrier}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Additional Information Section */}
                        {(lead.hear_about_us || lead.additional_notes) && (
                          <div className="space-y-3 border-t border-gray-200 pt-4">
                            <div className="flex items-center justify-center gap-2 mb-3">
                              <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                                <FileText className="h-4 w-4 text-indigo-600" />
                              </div>
                              <h4 className="text-sm font-semibold text-gray-900">Additional Information</h4>
                            </div>

                            {lead.hear_about_us && (
                              <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                                <div className="flex items-center gap-3">
                                  <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                                    <Search className="h-3 w-3 text-indigo-600" />
                                  </div>
                                  <div className="flex-1">
                                    <p className="text-sm font-medium text-indigo-900">{lead.hear_about_us}</p>
                                    <p className="text-xs text-indigo-700">How They Found Us</p>
                                  </div>
                                </div>
                              </div>
                            )}

                            {lead.additional_notes && (
                              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                                <div className="flex items-start gap-3">
                                  <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <FileText className="h-3 w-3 text-gray-600" />
                                  </div>
                                  <div className="flex-1">
                                    <h5 className="text-sm font-medium text-gray-900 mb-1">Additional Notes</h5>
                                    <p className="text-sm text-gray-700 leading-relaxed">{lead.additional_notes}</p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="flex items-center justify-center h-full min-h-[200px]">
                        <div className="text-center">
                          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <DollarSign className="h-8 w-8 text-gray-400" />
                          </div>
                          <p className="text-sm text-gray-500 font-medium">No financial information</p>
                          <p className="text-xs text-gray-400">Financial details will appear here</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>


            </div>

            {/* Container 4: Comments & Communication */}
            <Card className="bg-white border border-gray-200 h-full flex flex-col overflow-hidden">
              <CardHeader className="pb-3 flex-shrink-0">
                <CardTitle className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-indigo-600" />
                    Comments
                  </div>
                  <span className="text-xs text-gray-500 font-normal">
                    {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
                  </span>
                </CardTitle>
              </CardHeader>

              {/* Comments List - Scrollable Middle Section */}
              <div className="flex-1 overflow-y-auto px-3 min-h-0 scrollbar-modern">
                {loadingComments ? (
                  <div className="flex items-center justify-center h-full min-h-[150px]">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-3"></div>
                      <p className="text-xs text-gray-600">Loading comments...</p>
                    </div>
                  </div>
                ) : comments.length === 0 ? (
                  <div className="flex items-center justify-center h-full min-h-[150px]">
                    <div className="text-center">
                      <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-sm text-gray-500 font-medium">No comments yet</p>
                      <p className="text-xs text-gray-400">Start the conversation below</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 py-2">
                    {comments.map((comment) => (
                      <div key={comment.id} className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="text-xs bg-indigo-100 text-indigo-600 font-medium">
                                {comment.user_name.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                              <span className="text-xs font-medium text-gray-900">{comment.user_name}</span>
                              <span className="text-xs text-gray-500">
                                {new Date(comment.created_at).toLocaleString()}
                              </span>
                            </div>
                          </div>
                          <Badge className={`${getCommentTypeColor(comment.comment_type)} text-xs`}>
                            <span className="flex items-center gap-1">
                              {getCommentTypeIcon(comment.comment_type)}
                              {comment.comment_type.replace('_', ' ')}
                            </span>
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-700 leading-relaxed">{comment.comment}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Add Comment Form - Fixed Bottom Section */}
              <div className="border-t border-gray-200 p-3 flex-shrink-0 bg-gray-50">
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <select
                      value={commentType}
                      onChange={(e) => setCommentType(e.target.value as any)}
                      className="px-3 py-1.5 border border-gray-300 rounded-md text-xs focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                    >
                      <option value="general">💬 General</option>
                      <option value="follow_up">📞 Follow Up</option>
                      <option value="important">⚠️ Important</option>
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <Textarea
                      placeholder="Write a comment..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      rows={2}
                      className="flex-1 resize-none text-sm border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <Button
                      onClick={addComment}
                      disabled={!newComment.trim() || isAddingComment}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 h-auto"
                    >
                      {isAddingComment ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Appointment Scheduler Dialog */}
      <LeadAppointmentScheduler
        isOpen={showAppointmentScheduler}
        onClose={() => setShowAppointmentScheduler(false)}
        onAppointmentScheduled={handleAppointmentScheduled}
        leadId={lead?.id || ''}
        leadName={lead?.name || ''}
        leadEmail={lead?.email}
        leadPhone={lead?.phone}
      />

      {/* Appointment Details Dialog */}
      <AppointmentDetailsDialog
        isOpen={showAppointmentDetails}
        onClose={() => setShowAppointmentDetails(false)}
        appointment={selectedAppointment}
        leadId={lead?.id || ''}
        leadName={lead?.name || ''}
        leadEmail={lead?.email}
        leadPhone={lead?.phone}
        onAppointmentUpdated={handleAppointmentScheduled}
      />
    </div>
  );
};

export default LeadDetailsPage;
