import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { FileText, Save, User, FlaskConical, Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ReportCard } from "@/hooks/useReportCards";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface LabReportCardFormProps {
  reportCard: ReportCard;
  onSubmit: (formData: any) => void;
  onCancel: () => void;
}

// Simple form component like all other forms in the app
export function LabReportCardForm({ reportCard, onSubmit, onCancel }: LabReportCardFormProps) {
  const { toast } = useToast();
  const { userProfile } = useAuth();
  const [existingLabReport, setExistingLabReport] = useState<any>(null);

  // Direct functions without real-time subscription to prevent form re-renders
  const getLabReportCardByLabScriptId = async (labScriptId: string) => {
    try {
      const { data, error } = await supabase
        .from('lab_report_cards')
        .select('*')
        .eq('lab_script_id', labScriptId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found" error
        console.error('Error fetching lab report card:', error);
        throw error;
      }

      return data || null;
    } catch (error) {
      console.error('Error:', error);
      return null;
    }
  };

  const addLabReportCard = async (formData: any, labScriptId: string) => {
    try {
      // Prepare the data object
      const labReportData: any = {
        lab_script_id: labScriptId,
        patient_name: formData.patient_name,
        arch_type: formData.arch_type,
        upper_appliance_type: formData.upper_appliance_type || null,
        lower_appliance_type: formData.lower_appliance_type || null,
        screw: formData.screw,
        material: formData.material || null,
        shade: formData.shade,
        manufacturing_method: formData.manufacturing_method || null,
        implant_on_upper: formData.implant_on_upper || null,
        implant_on_lower: formData.implant_on_lower || null,
        custom_implant_upper: formData.custom_implant_upper || null,
        custom_implant_lower: formData.custom_implant_lower || null,
        tooth_library_upper: formData.tooth_library_upper || null,
        tooth_library_lower: formData.tooth_library_lower || null,
        custom_tooth_library_upper: formData.custom_tooth_library_upper || null,
        custom_tooth_library_lower: formData.custom_tooth_library_lower || null,
        upper_appliance_number: formData.upper_appliance_number || null,
        lower_appliance_number: formData.lower_appliance_number || null,
        upper_nightguard_number: formData.upper_nightguard_number || null,
        lower_nightguard_number: formData.lower_nightguard_number || null,
        notes_and_remarks: formData.notes_and_remarks || null,
        submitted_at: new Date().toISOString(),
        completed_by: userProfile?.id || null,
        completed_by_name: userProfile?.full_name || null,
        status: 'completed' // Change from pending to completed when user submits
      };

      // If we have an existing lab report, include its ID for proper update
      if (existingLabReport?.id) {
        labReportData.id = existingLabReport.id;
      }

      const { data, error } = await supabase
        .from('lab_report_cards')
        .upsert([labReportData])
        .select()
        .single();

      if (error) {
        console.error('Error adding lab report card:', error);
        toast({
          title: "Error",
          description: "Failed to create lab report card",
          variant: "destructive",
        });
        throw error;
      }

      toast({
        title: "Success",
        description: "Lab report card created successfully",
      });

      return data;
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  };


  const [formData, setFormData] = useState({
    // Synced fields (read-only)
    patient_name: reportCard.patient_name,
    arch_type: reportCard.lab_script?.arch_type || '',
    upper_appliance_type: reportCard.lab_script?.upper_appliance_type || '',
    lower_appliance_type: reportCard.lab_script?.lower_appliance_type || '',

    // Editable fields - Auto-populated from lab script but user can modify
    screw: reportCard.lab_script?.screw_type || '',
    customScrewType: reportCard.lab_script?.custom_screw_type || '',
    material: reportCard.lab_script?.material || '',
    shade: reportCard.lab_script?.shade || '',
    manufacturing_method: '', // Will be auto-populated based on appliance types

    // New fields
    implant_on_upper: '',
    implant_on_lower: '',
    custom_implant_upper: '',
    custom_implant_lower: '',
    tooth_library_upper: '',
    tooth_library_lower: '',
    custom_tooth_library_upper: '',
    custom_tooth_library_lower: '',
    upper_appliance_number: '',
    lower_appliance_number: '',
    upper_nightguard_number: '',
    lower_nightguard_number: '',
    notes_and_remarks: ''
  });



  // Function to determine manufacturing method based on appliance types
  const determineManufacturingMethod = (upperType: string, lowerType: string) => {
    const millingTypes = ['direct-load-zirconia', 'direct-load-pmma', 'ti-bar-superstructure'];

    // Check if any appliance type requires milling
    if (millingTypes.includes(upperType) || millingTypes.includes(lowerType)) {
      return 'milling';
    }

    // Default to printing for all other appliances
    return 'printing';
  };

  // Load existing lab report card if it exists
  useEffect(() => {
    const loadExistingReport = async () => {
      if (reportCard.lab_script_id) {
        const existing = await getLabReportCardByLabScriptId(reportCard.lab_script_id);
        if (existing) {
          setExistingLabReport(existing);
          setFormData({
            patient_name: existing.patient_name,
            arch_type: existing.arch_type,
            upper_appliance_type: existing.upper_appliance_type || '',
            lower_appliance_type: existing.lower_appliance_type || '',
            screw: existing.screw,
            // Use existing material, but fallback to lab script material if empty
            material: existing.material || reportCard.lab_script?.material || '',
            shade: existing.shade,
            manufacturing_method: existing.manufacturing_method || determineManufacturingMethod(existing.upper_appliance_type || '', existing.lower_appliance_type || ''),
            // These fields should be empty if not filled by user (cleared auto-generated data)
            implant_on_upper: existing.implant_on_upper || '',
            implant_on_lower: existing.implant_on_lower || '',
            custom_implant_upper: existing.custom_implant_upper || '',
            custom_implant_lower: existing.custom_implant_lower || '',
            tooth_library_upper: existing.tooth_library_upper || '',
            tooth_library_lower: existing.tooth_library_lower || '',
            custom_tooth_library_upper: existing.custom_tooth_library_upper || '',
            custom_tooth_library_lower: existing.custom_tooth_library_lower || '',
            upper_appliance_number: existing.upper_appliance_number || '',
            lower_appliance_number: existing.lower_appliance_number || '',
            upper_nightguard_number: existing.upper_nightguard_number || '',
            lower_nightguard_number: existing.lower_nightguard_number || '',
            notes_and_remarks: existing.notes_and_remarks || ''
          });
        }
      }
    };
    loadExistingReport();
  }, [reportCard.lab_script_id]);

  // Auto-set manufacturing method for new reports
  useEffect(() => {
    if (!existingLabReport && formData.manufacturing_method === '') {
      const autoManufacturingMethod = determineManufacturingMethod(
        reportCard.lab_script?.upper_appliance_type || '',
        reportCard.lab_script?.lower_appliance_type || ''
      );
      setFormData(prev => ({
        ...prev,
        manufacturing_method: autoManufacturingMethod
      }));
    }
  }, [existingLabReport, formData.manufacturing_method, reportCard.lab_script?.upper_appliance_type, reportCard.lab_script?.lower_appliance_type]);

  const [fieldErrors, setFieldErrors] = useState<Record<string, boolean>>({});
  const [openUpperToothLibrary, setOpenUpperToothLibrary] = useState(false);
  const [openLowerToothLibrary, setOpenLowerToothLibrary] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear field error when user starts typing
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({
        ...prev,
        [field]: false
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation for required fields
    const errors: string[] = [];
    const newFieldErrors: Record<string, boolean> = {};

    // Lab Specifications
    if (!formData.screw) {
      errors.push("Screw Type is required");
      newFieldErrors.screw = true;
    }
    if (!formData.material) {
      errors.push("Material is required");
      newFieldErrors.material = true;
    }
    if (!formData.shade) {
      errors.push("Shade is required");
      newFieldErrors.shade = true;
    }
    if (!formData.manufacturing_method) {
      errors.push("Manufacturing Method is required");
      newFieldErrors.manufacturing_method = true;
    }

    // Implant Libraries (conditional based on arch type)
    if (showUpperFields && !formData.implant_on_upper) {
      errors.push("Upper Implant Library is required");
      newFieldErrors.implant_on_upper = true;
    }
    if (showLowerFields && !formData.implant_on_lower) {
      errors.push("Lower Implant Library is required");
      newFieldErrors.implant_on_lower = true;
    }

    // Tooth Libraries (conditional based on arch type)
    if (showUpperFields && !formData.tooth_library_upper) {
      errors.push("Upper Tooth Library is required");
      newFieldErrors.tooth_library_upper = true;
    }
    if (showLowerFields && !formData.tooth_library_lower) {
      errors.push("Lower Tooth Library is required");
      newFieldErrors.tooth_library_lower = true;
    }

    // Appliance Numbers (conditional based on arch type)
    if (showUpperFields && !formData.upper_appliance_number.trim()) {
      errors.push("Upper Appliance Number is required");
      newFieldErrors.upper_appliance_number = true;
    }
    if (showLowerFields && !formData.lower_appliance_number.trim()) {
      errors.push("Lower Appliance Number is required");
      newFieldErrors.lower_appliance_number = true;
    }

    // Notes and Remarks
    if (!formData.notes_and_remarks.trim()) {
      errors.push("Notes and Remarks by Designer is required");
      newFieldErrors.notes_and_remarks = true;
    }

    // Update field errors state
    setFieldErrors(newFieldErrors);

    // Show validation errors if any
    if (errors.length > 0) {
      alert(`Please complete the following required fields:\n\n${errors.join('\n')}`);
      return;
    }

    // Submit the form data
    try {
      // Prepare final form data with custom values if "Others" is selected
      const finalFormData = {
        ...formData,
        screw: formData.screw === "Other" ? formData.customScrewType : formData.screw,
        implant_on_upper: formData.implant_on_upper === "Others" ? formData.custom_implant_upper : formData.implant_on_upper,
        implant_on_lower: formData.implant_on_lower === "Others" ? formData.custom_implant_lower : formData.implant_on_lower,
        tooth_library_upper: formData.tooth_library_upper === "Others" ? formData.custom_tooth_library_upper : formData.tooth_library_upper,
        tooth_library_lower: formData.tooth_library_lower === "Others" ? formData.custom_tooth_library_lower : formData.tooth_library_lower,
        // Include custom fields in the submission
        custom_implant_upper: formData.custom_implant_upper,
        custom_implant_lower: formData.custom_implant_lower,
        custom_tooth_library_upper: formData.custom_tooth_library_upper,
        custom_tooth_library_lower: formData.custom_tooth_library_lower
      };

      // Always update/create the lab report card in the database
      await addLabReportCard(finalFormData, reportCard.lab_script_id);

      // Then notify the parent component
      onSubmit(finalFormData);
    } catch (error) {
      // Error is already handled by the addLabReportCard function with toast
    }
  };

  // Screw type options - matching lab script form
  const screwOptions = [
    { id: 19, value: 'dc_screw', label: 'DC Screw' },
    { id: 20, value: 'rosen', label: 'Rosen' },
    { id: 21, value: 'rosen_wave_t5', label: 'Rosen Wave T5' },
    { id: 22, value: 'powerball', label: 'Powerball' },
    { id: 23, value: 'dess', label: 'Dess' },
    { id: 24, value: 'sin_prh30', label: 'SIN PRH30' },
    { id: 25, value: 'neodent', label: 'Neodent' },
    { id: 26, value: 'other', label: 'Other' }
  ];

  const materialOptions = [
    "Flexera Smile Ultra Plus", "Sprint Ray ONX", "Sprint Ray Nightguard Flex",
    "Flexera Model X", "Zirconia", "PMMA", "ONX Tough", "Titanium & Zirconia", "Titanium"
  ];

  const shadeOptions = [
    "N/A", "A1", "A2", "A3", "A3.5", "A4", "B1", "B2", "B3", "B4",
    "C1", "C2", "C3", "C4", "D2", "D3", "D4", "BL1", "BL2", "BL3", "BL4",
    "BLEACH", "NW", "Clear", "Custom"
  ];

  const manufacturingMethodOptions = [
    "milling",
    "printing"
  ];

  const toothLibraryOptions = [
    "N/A",
    "¦½-(-+--2.0",
    "1 - ANNE - www.naturalshapes.dental by George Zacusai",
    "11 WHITE LADY",
    "2 - MAGALIE - www.naturalshapes.dental by George Zacusai",
    "3 - YANN - www.naturalshapes.dental by George Zacusai",
    "4 - LUKAS - www.naturalshapes.dental by George Zacusai",
    "5 - PRADIP - www.naturalshapes.dental by George Zacusai",
    "AIDA",
    "AIDA-Air",
    "alternative",
    "ANITA",
    "AREUS",
    "ashortia",
    "Ashortia+",
    "B.Deloge",
    "Bravo",
    "Brenes-Elchi Round",
    "Brenes-Elchi Square",
    "Brenes-Elchi Square Round",
    "care1",
    "care2",
    "carlos",
    "Ceramill Mindforms by AG",
    "Ceramill Mindforms by Knut Miller - oval",
    "Ceramill Mindforms by Knut Miller - rectangular",
    "Ceramill Mindforms by Knut Miller - triangular",
    "Ceramill Mindforms by Knut Miller - universal",
    "Ceramill Mindforms by NT",
    "crystal",
    "CSF",
    "CTD1",
    "CTD2",
    "CTD3",
    "CTD4",
    "CTD5",
    "Culp-Mature",
    "Culp-Young",
    "custom",
    "DEMI",
    "Denti",
    "DOF",
    "DOF Hemera",
    "DOF_Hemera",
    "e-xofan",
    "Edwin",
    "el_MatRoberts",
    "eliko2",
    "elmat",
    "ExoRoss Mojito",
    "Expression D1",
    "Expression D2",
    "Expression D3",
    "Expression G1",
    "Expression G2",
    "Expression G3",
    "Expression O1",
    "Expression O1 Exo",
    "Expression O2",
    "Expression O2 Exo",
    "Expression O3",
    "Expression O3 Exo",
    "Expression P1",
    "Expression P1 Exo",
    "Expression P2",
    "Expression P2 Exo",
    "Expression P3",
    "Expression P3 Exo",
    "Expression S1",
    "Expression S1 Exo",
    "Expression S2",
    "Expression S2 Exo",
    "Expression S3",
    "Expression S3 Exo",
    "Expression T1",
    "Expression T1 Exo",
    "Expression T2",
    "Expression T2 Exo",
    "Expression T3",
    "Expression T3 Exo",
    "Expression U1",
    "Expression U2",
    "Expression U3",
    "Expression V1",
    "Expression V2",
    "Expression V3",
    "FEDERICA",
    "Filippidis 1",
    "Filippidis 2",
    "Filippidis 3",
    "FOBOS-Amalthea",
    "FOBOS-Glarus ( PRO )",
    "FOBOS-Pallada",
    "FOBOS-Proteus",
    "G_1",
    "geller",
    "generic",
    "generic-smooth",
    "GLT 1",
    "GLT 2",
    "Grin Design 1",
    "Grin Design 2",
    "Grin Design 3",
    "Grin Design 4",
    "Grin Design 5",
    "Grin Design 6",
    "Grin Design 7",
    "Grin Design 8",
    "Grin Design 9",
    "Grin Design air",
    "Grin Design Drake",
    "Grin Design Earth",
    "Grin Design EAS",
    "Grin Design EUS",
    "Grin Design Fire",
    "Grin Design JS",
    "Grin Design KS",
    "Grin Design MS",
    "Grin Design Sueyder Botelho",
    "Grin Design Water",
    "Grin_Design coringas",
    "haitof1",
    "hd",
    "hd2",
    "HERMES",
    "HTR",
    "HZL 1",
    "HZL 2",
    "IVOCLAR-S72",
    "IVOCLAR-S82",
    "Jan Hajto F26",
    "Jan Hajto F6",
    "Jan Hajto F7",
    "Jan Hajto M2",
    "Jan Hajto M5",
    "Jan Hajto M7",
    "Juan Carlos Palma FHD",
    "Juan Carlos Palma HD",
    "Juan Carlos Palma UFHD",
    "Julian Cardona",
    "katija",
    "Knut Miller - Oval",
    "Knut Miller - Rectangular",
    "Knut Miller - Triangular",
    "Knut Miller - Universal",
    "Lxt_Full_V3",
    "Lxt_Full_V3_1",
    "Lxt_Full_V3_2",
    "Lxt_Full_V3_3",
    "Lxt_Full_V3_4",
    "Lxt_Full_V3_5",
    "Lxt_Full_V3_6",
    "Lxt_Full_V3_7",
    "Lxt_Full_V3_8",
    "Lxt_Full_V4",
    "Lxt_Full_V4_1",
    "Lxt_Full_V4_10",
    "Lxt_Full_V4_11",
    "Lxt_Full_V4_12",
    "Lxt_Full_V4_2",
    "Lxt_Full_V4_3",
    "Lxt_Full_V4_4",
    "Lxt_Full_V4_5",
    "Lxt_Full_V4_6",
    "Lxt_Full_V4_7",
    "Lxt_Full_V4_8",
    "Lxt_Full_V4_9",
    "Lxt_Full_V5",
    "Lxt_Full_V6",
    "Lxt_Full_V6_1",
    "Lxt_Full_V6_2",
    "Lxt_Full_V6_3",
    "Lxt_Full_V6_4",
    "Lxt_Full_V7",
    "MCD - AMSTERDAM",
    "MCD - BRASIL",
    "MCD - CAIRO",
    "MCD - Ciudad del Este",
    "MCD - LISBOA",
    "MCD - LOS ANGELES",
    "MCD - MADRID",
    "MCD - MIAMI",
    "MCD - MITROVICA",
    "MCD - NEW YORK",
    "MCD - PARIS",
    "MCD - ROMA",
    "MCD - SAN ANDRES",
    "MM3.0",
    "Mystery Anatomy",
    "Nondas Vlachopoulos",
    "PAIAN",
    "PDL CatBack1 0.0",
    "PDL CatBack1 0.1",
    "PDL CatBack1 0.2",
    "PDL CatBack1 0.3",
    "PDL CatBack1 0.4",
    "PDL CatBack1 1.0",
    "PDL CatBack1 1.1",
    "PDL CatBack1 1.2",
    "PDL CatBack1 1.3",
    "PDL CatBack1 1.4",
    "PDL CatBack1 2.0",
    "PDL CatBack1 2.1",
    "PDL CatBack1 2.2",
    "PDL CatBack1 3.0",
    "PDL CatBack1 3.1",
    "PDL CatBack1 3.2",
    "PDL CatBack1 3.3",
    "PDL CatBack1 4.0",
    "PDL CatBack1 4.1",
    "PDL CatBack1 4.2",
    "PDL CatBack1 5.0",
    "PDL CatBack1 5.1",
    "PDL CatBack1 5.2",
    "PDL CatBack1 5.3",
    "PDL CatBack1 5.4",
    "PDL CatBack1 6.0",
    "PDL CatBack1 6.1",
    "PDL CatBack1 6.2",
    "PDL CatBack1 6.3",
    "PDL CatBack1 6.4",
    "PDL0.0",
    "PDL0.1",
    "PDL0.2",
    "PDL0.3",
    "PDL0.4",
    "PDL1.0",
    "PDL1.1",
    "PDL1.2",
    "PDL1.3",
    "PDL1.4",
    "PDL2.0",
    "PDL2.1",
    "PDL2.2",
    "PDL3.0",
    "PDL3.1",
    "PDL3.2",
    "PDL3.3",
    "PDL4.0",
    "PDL4.1",
    "PDL4.2",
    "PDL5.0",
    "PDL5.1",
    "PDL5.2",
    "PDL5.3",
    "PDL5.4",
    "PDL6.0",
    "PDL6.1",
    "PDL6.2",
    "PDL6.3",
    "PDL6.4",
    "Peak Point - Oval",
    "Peak Point - Square",
    "Peak Point - Triangular",
    "Peak Point - Unique",
    "PETRA",
    "Pogarskiy Design 0.0",
    "Pogarskiy Design 0.1",
    "Pogarskiy Design 0.2",
    "Pogarskiy Design 0.3",
    "Pogarskiy Design 0.4",
    "Pogarskiy Design 1.0",
    "Pogarskiy Design 1.1",
    "Pogarskiy Design 1.2",
    "Pogarskiy Design 1.3",
    "Pogarskiy Design 1.4",
    "Pogarskiy Design 2.0",
    "Pogarskiy Design 2.1",
    "Pogarskiy Design 2.2",
    "Pogarskiy Design 3.0",
    "Pogarskiy Design 3.1",
    "Pogarskiy Design 3.2",
    "Pogarskiy Design 3.3",
    "Pogarskiy Design 4.0",
    "Pogarskiy Design 4.1",
    "Pogarskiy Design 4.2",
    "Pogarskiy Design 5.0",
    "Pogarskiy Design 5.1",
    "Pogarskiy Design 5.2",
    "Pogarskiy Design 5.3",
    "Pogarskiy Design 5.4",
    "Pogarskiy Design 6.0",
    "Pogarskiy Design 6.1",
    "Pogarskiy Design 6.2",
    "Pogarskiy Design 6.3",
    "Pogarskiy Design 6.4",
    "Priti Q",
    "Priti R",
    "Priti T",
    "priti_Q",
    "priti_R",
    "priti_T",
    "psarris",
    "Psarris - Elderly",
    "psarris-2023",
    "psarris-elderly",
    "RAINBOW",
    "RAINBOW 20 Orange",
    "RAINBOW 40 Green Original",
    "RAINBOW 40 Green Triangular",
    "Reduced Lowerjaw",
    "RHEIA",
    "robtoly-oval",
    "robtoly-square",
    "robtoly-triangular",
    "robtoly-unique",
    "Rooted",
    "SAO",
    "SERAPHIM",
    "studies",
    "THALIA",
    "Thimble Tanlibrary 1",
    "Thimble Tanlibrary 2",
    "TITANIUM CAD 01",
    "TITANIUM CAD 02",
    "TITANIUM CAD 03",
    "TITANIUM CAD 04",
    "TITANIUM CAD 05",
    "TITANIUM CAD 06",
    "TITANIUM CAD 07",
    "TITANIUM CAD 08",
    "TITANIUM CAD 09",
    "Tribos - 1",
    "Tribos - 2",
    "TRITON",
    "uncapped",
    "VITA Physiodents-O5L",
    "VITA Physiodents-T1S",
    "VITA Physiodents-T2S",
    "VITA Physiodents-T5M",
    "VITA Physiodents-T6L",
    "VITA Physiodents-T6S",
    "VITA Physiodents-T7M",
    "VITA Physiodents-T8L",
    "VITA Physiodents-X1M",
    "VITA Physiodents-X2L",
    "VITA Physiodents-X3L",
    "VITA Physiodents-Z1S",
    "VITA Physiodents-Z2S",
    "vita-T8L",
    "vita1",
    "vita2",
    "vita3",
    "White Lady",
    "worn",
    "zfx",
    "zirkonzahn",
    "Zirkonzahn Phonares Bold Universal",
    "zirkonzahnAIDA",
    "zirkonzahnAREUS",
    "zirkonzahnDEMI",
    "zirkonzahnHERMES",
    "zirkonzahnPAIAN",
    "zirkonzahnRHEIA",
    "zirkonzahnSAO",
    "zirkonzahnSERAPHIM",
    "zirkonzahnTHALIA",
    "zirkonzahnTRITON",
    "ZRS 00",
    "ZRS 01",
    "ZRS 02",
    "ZRS 03",
    "ZRS 04",
    "ZRS 05",
    "ZRS 06",
    "ZRS 07",
    "ZRS 08",
    "ZRS 09",
    "ZRS 10",
    "ZRS 11 (Ant F01) + 07 (Mand&Post)",
    "ZRS 12 (Ant F02) + 53 (Mand&Post)",
    "ZRS 13 (Ant F03) + 06 (Mand&Post)",
    "ZRS 14 (Ant F04) + 07 (Mand&Post)",
    "ZRS 15 (Ant F05) + 07 (Mand&Post)",
    "ZRS 16 (Ant F06) + 06 (Mand&Post)",
    "ZRS 17 (Ant F07) + 09 (Mand&Post)",
    "ZRS 18 (Ant F08) + 57 (Mand&Post)",
    "ZRS 19 (Ant F09) + 04 (Mand&Post)",
    "ZRS 20 (Ant F10) + 04 (Mand&Post)",
    "ZRS 21 (Ant F11) + 05 (Mand&Post)",
    "ZRS 22 (Ant F12) + 53 (Mand&Post)",
    "ZRS 23 (Ant F13) + 05 (Mand&Post)",
    "ZRS 24 (Ant F14) + 04 (Mand&Post)",
    "ZRS 25 (Ant F15) + 56 (Mand&Post)",
    "ZRS 26 (Ant F16) + 07 (Mand&Post)",
    "ZRS 27 (Ant F17) + 04 (Mand&Post)",
    "ZRS 28 (Ant F18) + 54 (Mand&Post)",
    "ZRS 29 (Ant F19) + 02 (Mand&Post)",
    "ZRS 30 (Ant F20) + 54 (Mand&Post)",
    "ZRS 31 (Ant F21) + 53 (Mand&Post)",
    "ZRS 32 (Ant F22) + 08 (Mand&Post)",
    "ZRS 33 (Ant F23) + 53 (Mand&Post)",
    "ZRS 34 (Ant F24) + 53 (Mand&Post)",
    "ZRS 35 (Ant F25) + 10 (Mand&Post)",
    "ZRS 36 (Ant F26) + 09 (Mand&Post)",
    "ZRS 37 (Ant F27) + 07 (Mand&Post)",
    "ZRS 38 (Ant F28) + 09 (Mand&Post)",
    "ZRS 39 (Ant F29) + 53 (Mand&Post)",
    "ZRS 40 (Ant F30) + 04 (Mand&Post)",
    "ZRS 41 (Ant F31) + 53 (Mand&Post)",
    "ZRS 42 (Ant F32) + 04 (Mand&Post)",
    "ZRS 43 (Ant M01) + 60 (Mand&Post)",
    "ZRS 44 (Ant M02) + 02 (Mand&Post)",
    "ZRS 45 (Ant M03) + 07 (Mand&Post)",
    "ZRS 46 (Ant M04) + 04 (Mand&Post)",
    "ZRS 47 (Ant M05) + 58 (Mand&Post)",
    "ZRS 48 (Ant M06) + 55 (Mand&Post)",
    "ZRS 49 (Ant M07) + 08 (Mand&Post)",
    "ZRS 50 (Ant M08) + 05 (Mand&Post)",
    "ZRS 51 (Ant M09) + 09 (Mand&Post)",
    "ZRS 52 (Ant M10) + 56 (Mand&Post)",
    "ZRS 53",
    "ZRS 54",
    "ZRS 55",
    "ZRS 56",
    "ZRS 57",
    "ZRS 58",
    "ZRS 59",
    "ZRS 60",
    "zrs00",
    "zrs01",
    "zrs02",
    "zrs03",
    "zrs04",
    "zrs05",
    "zrs06",
    "zrs07",
    "zrs08",
    "zrs09",
    "zrs10",
    "zrs11  ua F01 + 07 up-L",
    "zrs12  ua F02 + 53 up-L",
    "zrs13  ua F03 + 05 up-L",
    "zrs14  ua F04 + 07 up-L",
    "zrs15  ua F05 + 07 up-L",
    "zrs16  ua F06 + 06 up-L",
    "zrs17  ua F07 + 09 up-L",
    "zrs18  ua F08 + 57 up-L",
    "zrs19  ua F09 + 04 up-L",
    "zrs20  ua F10 + 04 up-L",
    "zrs21  ua F11 + 05 up-L",
    "zrs22  ua F12 + 53 up-L",
    "zrs23  ua F13 + 05 up-L",
    "zrs24  ua F14 + 04 up-L",
    "zrs25  ua F15 + 56 up-L",
    "zrs26  ua F16 + 07 up-L",
    "zrs27  ua F17 + 04 up-L",
    "zrs28  ua F18 + 54 up-L",
    "zrs29  ua F19 + 02 up-L",
    "zrs30  ua F20 + 54 up-L",
    "zrs31  ua F21 + 53 up-L",
    "zrs32  ua F22 + 08 up-L",
    "zrs33  ua F23 + 53 up-L",
    "zrs34  ua F24 + 53 up-L",
    "zrs35  ua F25 + 10 up-L",
    "zrs36  ua F26 + 09 up-L",
    "zrs37  ua F27 + 07 up-L",
    "zrs38  ua F28 + 09 up-L",
    "zrs39  ua F29 + 53 up-L",
    "zrs40  ua F30 + 04 up-L",
    "zrs41  ua F31 + 53 up-L",
    "zrs42  ua F32 + 04 up-L",
    "zrs43  ua M01 + 60 up-L",
    "zrs44  ua M02 + 02 up-L",
    "zrs45  ua M03 + 07 up-L",
    "zrs46  ua M04 + 04 up-L",
    "zrs47  ua M05 + 58 up-L",
    "zrs48  ua M06 + 55 up-L",
    "zrs49  ua M07 + 08 up-L",
    "zrs50  ua M08 + 05 up-L",
    "zrs51  ua M09 + 09 up-L",
    "zrs52  ua M10 + 56 up-L",
    "zrs53",
    "zrs54",
    "zrs55",
    "zrs56",
    "zrs57",
    "zrs58",
    "zrs59",
    "zrs60",
    "ZZ - Generic",
    "ZZ - Zirkonzahn",
    "Others"
  ];

  const implantOptions = [
    "DCREF_V5_Cylender - DC Screw_V1",
    "DCREF_V5_Cylender - Rosen (+0.04)",
    "DCREF_V5_Cylender - Powerball (+0.04)",
    "DCREF_V5_Cylender - SIN PRH30",
    "Others",
    "N/A"
  ];

  // Format appliance type for display
  const formatApplianceType = (type: string | undefined) => {
    if (!type) return 'N/A';
    return type.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const showUpperFields = formData.arch_type === 'upper' || formData.arch_type === 'dual';
  const showLowerFields = formData.arch_type === 'lower' || formData.arch_type === 'dual';

  // Simple Searchable Tooth Library Component
  const SearchableToothLibrary = ({
    value,
    onValueChange,
    placeholder,
    open,
    setOpen,
    hasError
  }: {
    value: string;
    onValueChange: (value: string) => void;
    placeholder: string;
    open: boolean;
    setOpen: (open: boolean) => void;
    hasError?: boolean;
  }) => {
    const [searchValue, setSearchValue] = useState("");

    // Filter options based on search
    const filteredOptions = toothLibraryOptions.filter(option =>
      option.toLowerCase().includes(searchValue.toLowerCase())
    );

    return (
      <div className="relative">
        <Button
          variant="outline"
          role="combobox"
          type="button"
          className={`w-full justify-between ${hasError ? "border-red-500 focus:border-red-500" : ""}`}
          onClick={() => setOpen(!open)}
        >
          {value || placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>

        {open && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-[9999]"
              onClick={() => setOpen(false)}
            />

            {/* Dropdown */}
            <div className="fixed z-[10000] w-[400px] bg-white border rounded-md shadow-xl max-h-[80vh] flex flex-col"
              style={{
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)'
              }}
            >
              {/* Search Input */}
              <div className="p-3 border-b flex-shrink-0">
                <Input
                  placeholder="Search tooth library..."
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  className="w-full"
                />
              </div>

              {/* Scrollable Options List */}
              <div className="overflow-y-auto p-1 flex-1">
                {filteredOptions.length === 0 ? (
                  <div className="py-6 text-center text-sm text-gray-500">
                    No tooth library found.
                  </div>
                ) : (
                  filteredOptions.map((option) => (
                    <div
                      key={option}
                      className={`flex items-center px-2 py-2 text-sm cursor-pointer rounded hover:bg-gray-100 ${
                        value === option ? "bg-blue-50 text-blue-700 font-medium" : ""
                      }`}
                      onClick={() => {
                        onValueChange(option);
                        setOpen(false);
                        setSearchValue("");
                      }}
                    >
                      <Check
                        className={`mr-2 h-4 w-4 ${
                          value === option ? "opacity-100" : "opacity-0"
                        }`}
                      />
                      {option}
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full max-h-[80vh]">
      {/* Frozen Header */}
      <div className="flex-shrink-0 border-b bg-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold text-gray-900">
            <FileText className="h-6 w-6 text-indigo-600" />
            Lab Report Card
          </DialogTitle>
        </DialogHeader>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-1 py-6 space-y-6"
             style={{
               WebkitOverflowScrolling: 'touch',
               overscrollBehavior: 'contain'
             }}>
        {/* Patient Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <User className="h-5 w-5 text-indigo-600" />
            Patient Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="patient_name">Patient Name</Label>
              <Input
                id="patient_name"
                value={formData.patient_name}
                disabled
                className="bg-gray-50"
              />
            </div>
            <div>
              <Label htmlFor="arch_type">Arch Type</Label>
              <Input
                id="arch_type"
                value={formData.arch_type?.charAt(0).toUpperCase() + formData.arch_type?.slice(1)}
                disabled
                className="bg-gray-50"
              />
            </div>
          </div>
        </div>

        {/* Appliance Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <FlaskConical className="h-5 w-5 text-indigo-600" />
            Appliance Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {showUpperFields && (
              <div>
                <Label htmlFor="upper_appliance_type">Upper Appliance Type</Label>
                <Input
                  id="upper_appliance_type"
                  value={formatApplianceType(formData.upper_appliance_type)}
                  disabled
                  className="bg-gray-50"
                />
              </div>
            )}
            {showLowerFields && (
              <div>
                <Label htmlFor="lower_appliance_type">Lower Appliance Type</Label>
                <Input
                  id="lower_appliance_type"
                  value={formatApplianceType(formData.lower_appliance_type)}
                  disabled
                  className="bg-gray-50"
                />
              </div>
            )}
          </div>
        </div>

        {/* Lab Specifications */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Lab Specifications</h3>
            <div className="text-xs text-gray-500 bg-blue-50 px-2 py-1 rounded">
              Auto-filled from Lab Script • Editable
            </div>
          </div>

          {/* Screw Type - Full Width */}
          <div>
            <div className="flex items-center justify-between">
              <Label>
                Screw Type <span className="text-red-500">*</span>
              </Label>
              {reportCard.lab_script?.screw_type && (
                <span className="text-xs text-blue-600">
                  From Lab Script: {reportCard.lab_script.screw_type}
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
              {screwOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => handleInputChange("screw", formData.screw === option.label ? "" : option.label)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 border whitespace-nowrap flex items-center gap-2 ${
                    formData.screw === option.label
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                      : fieldErrors.screw
                      ? "bg-white text-gray-700 border-red-500 hover:bg-red-50"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400"
                  }`}
                >
                  <div className={`w-3 h-3 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                    formData.screw === option.label
                      ? "border-white"
                      : "border-gray-400"
                  }`}>
                    {formData.screw === option.label && (
                      <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                    )}
                  </div>
                  {option.label}
                </button>
              ))}
            </div>

            {/* Custom Screw Type Input - Shows when "Other" is selected */}
            {formData.screw === "Other" && (
              <div className="mt-3">
                <div className="flex items-center justify-between mb-1">
                  <Label htmlFor="customScrewType">Specify Other Screw Type</Label>
                  {reportCard.lab_script?.custom_screw_type && (
                    <span className="text-xs text-blue-600">
                      From Lab Script: {reportCard.lab_script.custom_screw_type}
                    </span>
                  )}
                </div>
                <Input
                  id="customScrewType"
                  value={formData.customScrewType}
                  onChange={(e) => handleInputChange("customScrewType", e.target.value)}
                  placeholder="Enter custom screw type..."
                  className="mt-1"
                />
              </div>
            )}
          </div>

          {/* Material and Shade - Side by Side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <Label htmlFor="material">
                  Material <span className="text-red-500">*</span>
                </Label>
                {reportCard.lab_script?.material && (
                  <span className="text-xs text-blue-600">
                    From Lab Script
                  </span>
                )}
              </div>
              <Select value={formData.material} onValueChange={(value) => handleInputChange('material', value)} required>
                <SelectTrigger className={fieldErrors.material ? "border-red-500 focus:border-red-500" : ""}>
                  <SelectValue placeholder="Select material" />
                </SelectTrigger>
                <SelectContent>
                  {materialOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <Label htmlFor="shade">
                  Shade <span className="text-red-500">*</span>
                </Label>
                {reportCard.lab_script?.shade && (
                  <span className="text-xs text-blue-600">
                    From Lab Script
                  </span>
                )}
              </div>
              <Select value={formData.shade} onValueChange={(value) => handleInputChange('shade', value)} required>
                <SelectTrigger className={fieldErrors.shade ? "border-red-500 focus:border-red-500" : ""}>
                  <SelectValue placeholder="Select shade" />
                </SelectTrigger>
                <SelectContent>
                  {shadeOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Manufacturing Method - Full Width */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <Label>
                Manufacturing Method <span className="text-red-500">*</span>
              </Label>
              <div className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                Auto-selected based on appliance type
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {manufacturingMethodOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => handleInputChange("manufacturing_method", formData.manufacturing_method === option ? "" : option)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 border whitespace-nowrap flex items-center gap-2 ${
                    formData.manufacturing_method === option
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                      : fieldErrors.manufacturing_method
                      ? "bg-white text-gray-700 border-red-500 hover:bg-red-50"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400"
                  }`}
                >
                  <div className={`w-3 h-3 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                    formData.manufacturing_method === option
                      ? "border-white"
                      : fieldErrors.manufacturing_method
                      ? "border-red-500"
                      : "border-gray-400"
                  }`}>
                    {formData.manufacturing_method === option && (
                      <div className="w-1.5 h-1.5 bg-white rounded-full" />
                    )}
                  </div>
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Implant & Library Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Implant & Library Information</h3>

          {/* Implants Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {showUpperFields && (
              <div>
                <Label htmlFor="implant_on_upper">
                  Upper Implant Library <span className="text-red-500">*</span>
                </Label>
                <Select value={formData.implant_on_upper} onValueChange={(value) => handleInputChange('implant_on_upper', value)} required>
                  <SelectTrigger className={fieldErrors.implant_on_upper ? "border-red-500 focus:border-red-500" : ""}>
                    <SelectValue placeholder="Select upper implant library" />
                  </SelectTrigger>
                  <SelectContent>
                    {implantOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Custom Upper Implant Input - Shows when "Others" is selected */}
                {formData.implant_on_upper === "Others" && (
                  <div className="mt-3">
                    <Label htmlFor="custom_implant_upper">Specify Upper Implant Type</Label>
                    <Input
                      id="custom_implant_upper"
                      value={formData.custom_implant_upper}
                      onChange={(e) => handleInputChange("custom_implant_upper", e.target.value)}
                      placeholder="Enter custom upper implant type..."
                      className="mt-1"
                    />
                  </div>
                )}
              </div>
            )}
            {showLowerFields && (
              <div>
                <Label htmlFor="implant_on_lower">
                  Lower Implant Library <span className="text-red-500">*</span>
                </Label>
                <Select value={formData.implant_on_lower} onValueChange={(value) => handleInputChange('implant_on_lower', value)} required>
                  <SelectTrigger className={fieldErrors.implant_on_lower ? "border-red-500 focus:border-red-500" : ""}>
                    <SelectValue placeholder="Select lower implant library" />
                  </SelectTrigger>
                  <SelectContent>
                    {implantOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Custom Lower Implant Input - Shows when "Others" is selected */}
                {formData.implant_on_lower === "Others" && (
                  <div className="mt-3">
                    <Label htmlFor="custom_implant_lower">Specify Lower Implant Type</Label>
                    <Input
                      id="custom_implant_lower"
                      value={formData.custom_implant_lower}
                      onChange={(e) => handleInputChange("custom_implant_lower", e.target.value)}
                      placeholder="Enter custom lower implant type..."
                      className="mt-1"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Tooth Library Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {showUpperFields && (
              <div>
                <Label htmlFor="tooth_library_upper">
                  Upper Tooth Library <span className="text-red-500">*</span>
                </Label>
                <SearchableToothLibrary
                  value={formData.tooth_library_upper}
                  onValueChange={(value) => handleInputChange('tooth_library_upper', value)}
                  placeholder="Type to search tooth library..."
                  open={openUpperToothLibrary}
                  setOpen={setOpenUpperToothLibrary}
                  hasError={fieldErrors.tooth_library_upper}
                />

                {/* Custom Upper Tooth Library Input - Shows when "Others" is selected */}
                {formData.tooth_library_upper === "Others" && (
                  <div className="mt-3">
                    <Label htmlFor="custom_tooth_library_upper">Specify Upper Tooth Library</Label>
                    <Input
                      id="custom_tooth_library_upper"
                      value={formData.custom_tooth_library_upper}
                      onChange={(e) => handleInputChange("custom_tooth_library_upper", e.target.value)}
                      placeholder="Enter custom upper tooth library..."
                      className="mt-1"
                    />
                  </div>
                )}
              </div>
            )}
            {showLowerFields && (
              <div>
                <Label htmlFor="tooth_library_lower">
                  Lower Tooth Library <span className="text-red-500">*</span>
                </Label>
                <SearchableToothLibrary
                  value={formData.tooth_library_lower}
                  onValueChange={(value) => handleInputChange('tooth_library_lower', value)}
                  placeholder="Type to search tooth library..."
                  open={openLowerToothLibrary}
                  setOpen={setOpenLowerToothLibrary}
                  hasError={fieldErrors.tooth_library_lower}
                />

                {/* Custom Lower Tooth Library Input - Shows when "Others" is selected */}
                {formData.tooth_library_lower === "Others" && (
                  <div className="mt-3">
                    <Label htmlFor="custom_tooth_library_lower">Specify Lower Tooth Library</Label>
                    <Input
                      id="custom_tooth_library_lower"
                      value={formData.custom_tooth_library_lower}
                      onChange={(e) => handleInputChange("custom_tooth_library_lower", e.target.value)}
                      placeholder="Enter custom lower tooth library..."
                      className="mt-1"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Appliance Numbers Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {showUpperFields && (
              <div>
                <Label htmlFor="upper_appliance_number">
                  Upper Appliance Number <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="upper_appliance_number"
                  value={formData.upper_appliance_number}
                  onChange={(e) => handleInputChange('upper_appliance_number', e.target.value)}
                  placeholder="Enter upper appliance number"
                  className={fieldErrors.upper_appliance_number ? "border-red-500 focus:border-red-500" : ""}
                  required
                />
              </div>
            )}
            {showLowerFields && (
              <div>
                <Label htmlFor="lower_appliance_number">
                  Lower Appliance Number <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="lower_appliance_number"
                  value={formData.lower_appliance_number}
                  onChange={(e) => handleInputChange('lower_appliance_number', e.target.value)}
                  placeholder="Enter lower appliance number"
                  className={fieldErrors.lower_appliance_number ? "border-red-500 focus:border-red-500" : ""}
                  required
                />
              </div>
            )}
          </div>

          {/* Nightguard Numbers Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {showUpperFields && (
              <div>
                <Label htmlFor="upper_nightguard_number">
                  Upper Nightguard Number
                </Label>
                <Input
                  id="upper_nightguard_number"
                  value={formData.upper_nightguard_number}
                  onChange={(e) => handleInputChange('upper_nightguard_number', e.target.value)}
                  placeholder="Enter upper nightguard number (if applicable)"
                />
              </div>
            )}
            {showLowerFields && (
              <div>
                <Label htmlFor="lower_nightguard_number">
                  Lower Nightguard Number
                </Label>
                <Input
                  id="lower_nightguard_number"
                  value={formData.lower_nightguard_number}
                  onChange={(e) => handleInputChange('lower_nightguard_number', e.target.value)}
                  placeholder="Enter lower nightguard number (if applicable)"
                />
              </div>
            )}
          </div>
        </div>

          {/* Notes & Remarks */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="notes_and_remarks">
                Notes and Remarks by Designer <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="notes_and_remarks"
                value={formData.notes_and_remarks}
                onChange={(e) => handleInputChange('notes_and_remarks', e.target.value)}
                placeholder="Enter any additional notes or remarks..."
                className={fieldErrors.notes_and_remarks ? "border-red-500 focus:border-red-500" : ""}
                rows={4}
                required
              />
            </div>
          </div>
        </div>

        {/* Frozen Footer */}
        <div className="flex-shrink-0 border-t bg-white pt-4">
          <div className="flex justify-end space-x-3">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">
              <Save className="h-4 w-4 mr-2" />
              Submit Lab Report
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
