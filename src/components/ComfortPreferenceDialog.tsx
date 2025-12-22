import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Smile, Heart, MessageCircle, Eye, User, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ComfortPreferenceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientId: string;
  patientName: string;
}

export function ComfortPreferenceDialog({ open, onOpenChange, patientId, patientName }: ComfortPreferenceDialogProps) {
  const [loading, setLoading] = useState(false);
  const [comfortData, setComfortData] = useState<any>(null);

  useEffect(() => {
    if (open && patientId) {
      fetchComfortPreferences();
    }
  }, [open, patientId]);

  const fetchComfortPreferences = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('new_patient_packets')
        .select('anxiety_control, pain_injection, communication, sensory_sensitivities, physical_comfort, service_preferences, other_concerns')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) throw error;
      setComfortData(data);
    } catch (error) {
      console.error('Error fetching comfort preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderPreferenceList = (items: string[] | undefined, emptyMessage: string = "None selected") => {
    if (!items || items.length === 0) {
      return <p className="text-sm text-gray-500">{emptyMessage}</p>;
    }
    
    return (
      <div className="space-y-1">
        {items.map((item, index) => (
          <p key={index} className="text-sm text-gray-700">• {item}</p>
        ))}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Smile className="h-5 w-5 text-pink-600" />
            Comfort Preferences - {patientName}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-gray-500">Loading comfort preferences...</p>
          </div>
        ) : !comfortData ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-gray-500">No comfort preferences found for this patient.</p>
          </div>
        ) : (
          <div className="space-y-4 mt-4">
            {/* Anxiety Control */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Heart className="h-5 w-5 text-pink-600" />
                  Anxiety Control Preferences
                </CardTitle>
              </CardHeader>
              <CardContent>
                {renderPreferenceList(comfortData.anxiety_control)}
              </CardContent>
            </Card>

            {/* Pain and Injection Preferences */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Star className="h-5 w-5 text-orange-600" />
                  Pain Management & Injection Preferences
                </CardTitle>
              </CardHeader>
              <CardContent>
                {renderPreferenceList(comfortData.pain_injection)}
              </CardContent>
            </Card>

            {/* Communication Preferences */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <MessageCircle className="h-5 w-5 text-blue-600" />
                  Communication Preferences
                </CardTitle>
              </CardHeader>
              <CardContent>
                {renderPreferenceList(comfortData.communication)}
              </CardContent>
            </Card>

            {/* Sensory Sensitivities */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Eye className="h-5 w-5 text-purple-600" />
                  Sensory Sensitivities
                </CardTitle>
              </CardHeader>
              <CardContent>
                {renderPreferenceList(comfortData.sensory_sensitivities)}
              </CardContent>
            </Card>

            {/* Physical Comfort */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <User className="h-5 w-5 text-green-600" />
                  Physical Comfort Needs
                </CardTitle>
              </CardHeader>
              <CardContent>
                {renderPreferenceList(comfortData.physical_comfort)}
              </CardContent>
            </Card>

            {/* Service Preferences */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Smile className="h-5 w-5 text-indigo-600" />
                  Service Preferences
                </CardTitle>
              </CardHeader>
              <CardContent>
                {renderPreferenceList(comfortData.service_preferences)}
              </CardContent>
            </Card>

            {/* Other Concerns */}
            {comfortData.other_concerns && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Other Concerns</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-700">{comfortData.other_concerns}</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

