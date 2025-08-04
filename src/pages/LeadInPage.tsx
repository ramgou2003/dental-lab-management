import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Phone, Mail, Calendar, User, MoreVertical, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { PatientPacketDialog } from "@/components/PatientPacketDialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

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
  public_link?: string;
  has_submitted_packets?: boolean;
  personal_first_name?: string;
  personal_last_name?: string;
  personal_phone?: string;
  personal_email?: string;
  reason_for_visit?: string;
  best_contact_time?: string;
  phone_call_preference?: string;
}

const kanbanColumns = [
  { id: "new", title: "New Leads", color: "bg-white border-gray-200", count: 0 },
  { id: "attempt1", title: "1st Attempt", color: "bg-white border-gray-200", count: 0 },
  { id: "attempt2", title: "2nd Attempt", color: "bg-white border-gray-200", count: 0 },
  { id: "attempt3", title: "3rd Attempt", color: "bg-white border-gray-200", count: 0 },
  { id: "scheduled", title: "Scheduled", color: "bg-white border-gray-200", count: 0 },
  { id: "optout", title: "Opt Out", color: "bg-white border-gray-200", count: 0 },
  { id: "noresponse", title: "No Response", color: "bg-white border-gray-200", count: 0 }
];

const LeadInPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch leads from Supabase
  const fetchLeads = async () => {
    try {
      const { data, error } = await supabase
        .from('new_patient_leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching leads:', error);
        toast.error('Failed to load leads');
        return;
      }

      // Check for submitted packets for all leads
      const leadIds = data.map((lead: any) => lead.id);
      const { data: packetCounts } = await supabase
        .from('new_patient_packets')
        .select('lead_id')
        .in('lead_id', leadIds);

      const leadsWithPackets = new Set(packetCounts?.map(p => p.lead_id) || []);

      // Transform Supabase data to Lead format
      const transformedLeads: Lead[] = data.map((lead: any) => ({
        id: lead.id,
        name: `${lead.personal_first_name || lead.first_name || ''} ${lead.personal_last_name || lead.last_name || ''}`.trim() || 'Unknown',
        phone: lead.personal_phone || lead.phone || 'No phone',
        email: lead.personal_email || lead.email || 'No email',
        source: 'Website Form',
        createdAt: new Date(lead.created_at).toISOString().split('T')[0],
        attempts: 0, // Default to 0, you can add a status field to track this
        notes: lead.reason_for_visit || 'No notes',
        status: lead.status || 'new', // Use status from database
        public_link: lead.public_link,
        has_submitted_packets: leadsWithPackets.has(lead.id),
        personal_first_name: lead.personal_first_name,
        personal_last_name: lead.personal_last_name,
        personal_phone: lead.personal_phone,
        personal_email: lead.personal_email,
        reason_for_visit: lead.reason_for_visit,
        best_contact_time: lead.best_contact_time,
        phone_call_preference: lead.phone_call_preference
      }));

      setLeads(transformedLeads);
    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  // Update lead status
  const updateLeadStatus = async (leadId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('new_patient_leads')
        .update({ status: newStatus })
        .eq('id', leadId);

      if (error) {
        console.error('Error updating lead status:', error);
        toast.error('Failed to update lead status');
        return;
      }

      // Update local state
      setLeads(prev => prev.map(lead =>
        lead.id === leadId ? { ...lead, status: newStatus as any } : lead
      ));

      toast.success('Lead status updated successfully');
    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error('An unexpected error occurred');
    }
  };

  const handleNewLeadIn = () => {
    // Open new patient form in a new tab
    window.open('/new-patient', '_blank');
  };

  // Helper function to get patient packet button text based on status
  const getPatientPacketButtonText = (lead: Lead) => {
    // Check if there are submitted packets (we'll add this data to the lead interface)
    if (lead.has_submitted_packets) {
      return "View Patient Packet";
    } else if (lead.public_link) {
      return "View Status";
    } else {
      return "Patient Packet";
    }
  };



  const getLeadsForColumn = (columnId: string) => {
    const filteredLeads = leads.filter(lead => {
      const matchesSearch = searchTerm === "" ||
        lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.phone.includes(searchTerm) ||
        lead.email.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesSearch;
    });

    switch (columnId) {
      case "new":
        return filteredLeads.filter(lead => lead.status === 'new');
      case "attempt1":
        return filteredLeads.filter(lead => lead.status === 'attempt1');
      case "attempt2":
        return filteredLeads.filter(lead => lead.status === 'attempt2');
      case "attempt3":
        return filteredLeads.filter(lead => lead.status === 'attempt3');
      case "scheduled":
        return filteredLeads.filter(lead => lead.status === 'scheduled');
      case "optout":
        return filteredLeads.filter(lead => lead.status === 'optout');
      case "noresponse":
        return filteredLeads.filter(lead => lead.status === 'noresponse');
      default:
        return [];
    }
  };

  const LeadCard = ({ lead }: { lead: Lead }) => (
    <Card
      className="hover:shadow-md transition-all duration-200 cursor-pointer bg-indigo-50 border-indigo-200 hover:bg-indigo-100 hover:border-indigo-300 hover:shadow-indigo-200/50"
      onClick={() => navigate(`/lead-in/${lead.id}`)}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-indigo-900">{lead.name}</CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 hover:bg-indigo-200"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="h-3 w-3 text-indigo-600" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {lead.status === 'scheduled' && (
                <>
                  <PatientPacketDialog
                    leadId={lead.id}
                    leadName={lead.name}
                    existingLink={lead.public_link}
                    trigger={
                      <DropdownMenuItem
                        onSelect={(e) => e.preventDefault()}
                        className="text-green-600 hover:text-green-700 hover:bg-green-50"
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        {getPatientPacketButtonText(lead)}
                      </DropdownMenuItem>
                    }
                  />
                  <div className="border-t my-1"></div>
                </>
              )}
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); updateLeadStatus(lead.id, 'attempt1'); }}>
                Move to 1st Attempt
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); updateLeadStatus(lead.id, 'attempt2'); }}>
                Move to 2nd Attempt
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); updateLeadStatus(lead.id, 'attempt3'); }}>
                Move to 3rd Attempt
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); updateLeadStatus(lead.id, 'scheduled'); }}>
                Mark as Scheduled
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); updateLeadStatus(lead.id, 'optout'); }}>
                Mark as Opt Out
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); updateLeadStatus(lead.id, 'noresponse'); }}>
                Mark as No Response
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          <div className="flex items-center text-xs text-indigo-700">
            <Phone className="h-3 w-3 mr-1 text-indigo-500" />
            {lead.phone}
          </div>
          <div className="flex items-center text-xs text-indigo-700">
            <Mail className="h-3 w-3 mr-1 text-indigo-500" />
            {lead.email}
          </div>
          <div className="flex items-center justify-end">
            <span className="text-xs text-indigo-600 font-medium">
              {new Date(lead.createdAt).toLocaleDateString()}
            </span>
          </div>
          {lead.best_contact_time && (
            <div className="text-xs text-indigo-600">
              <Calendar className="h-3 w-3 mr-1 inline text-indigo-500" />
              Best time: {lead.best_contact_time}
            </div>
          )}
          {lead.notes && (
            <p className="text-xs text-indigo-600 mt-2 line-clamp-2">
              {lead.notes}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex flex-col h-full bg-gray-50">
        <div className="bg-white border-b border-gray-200">
          <PageHeader
            title="Lead-in"
            search={{
              placeholder: "Search lead-ins by name, ID, or phone",
              value: searchTerm,
              onChange: setSearchTerm
            }}
            action={{
              label: "Add Lead-in",
              onClick: handleNewLeadIn
            }}
          />
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading leads...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 flex-shrink-0">
        <PageHeader
          title="Lead-in"
          search={{
            placeholder: "Search lead-ins by name, ID, or phone",
            value: searchTerm,
            onChange: setSearchTerm
          }}
          action={{
            label: "Add Lead-in",
            onClick: handleNewLeadIn
          }}
        />
      </div>

      {/* Kanban Board */}
      <div className="flex-1 p-4 pb-4 overflow-hidden min-h-0">
        <div className="h-full overflow-x-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-300 hover:scrollbar-thumb-gray-400">
          <div className="flex gap-4 h-full min-w-max">
            {kanbanColumns.map((column) => {
              const leads = getLeadsForColumn(column.id);
              return (
                <div key={column.id} className="flex-shrink-0 w-80 h-full">
                  <div className={`h-full flex flex-col rounded-xl border-2 ${column.color} shadow-sm bg-white`}>
                    {/* Column Header */}
                    <div className="flex-shrink-0 p-4 border-b border-gray-200 bg-white rounded-t-xl">
                      <div className="flex items-center justify-between">
                        <div className="flex-1"></div>
                        <h3 className="font-semibold text-indigo-700 text-center">{column.title}</h3>
                        <div className="flex-1 flex justify-end">
                          <Badge variant="outline" className="bg-indigo-50 border-indigo-300 text-indigo-700">
                            {leads.length}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Column Content - Scrollable Area */}
                    <div className="flex-1 overflow-y-auto min-h-0 scrollbar-enhanced">
                      <div className="p-4 space-y-3 pb-3">
                        {leads.length > 0 ? (
                          leads.map((lead) => (
                            <LeadCard key={lead.id} lead={lead} />
                          ))
                        ) : (
                          <div className="text-center text-gray-400 mt-8">
                            <User className="h-8 w-8 mx-auto mb-2 opacity-60" />
                            <p className="text-sm font-medium">No leads</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadInPage;
