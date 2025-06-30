import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface ManufacturingScriptData {
  patient_name: string;
  shade: string;
  screw?: string;
  material?: string;
  arch_type: string;
  upper_appliance_type?: string;
  lower_appliance_type?: string;
  upper_appliance_number?: string;
  lower_appliance_number?: string;
  milling_location?: string;
  gingiva_color?: string;
  stained_and_glazed?: string;
  cementation?: string;
  additional_notes?: string;
  status: string;
  manufacturing_method?: string;
  created_at: string;
  updated_at: string;
}

export const generateManufacturingScriptPDF = async (data: ManufacturingScriptData) => {
  try {
    console.log('PDF Generator received data:', data);

    // Create new PDF document
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    
    // Add logo to top left corner
    try {
      const logoImg = new Image();
      logoImg.crossOrigin = 'anonymous';
      
      await new Promise((resolve, reject) => {
        logoImg.onload = resolve;
        logoImg.onerror = reject;
        logoImg.src = '/logo-wide.png';
      });
      
      // Add logo (adjust size as needed)
      const logoWidth = 40;
      const logoHeight = 15;
      pdf.addImage(logoImg, 'PNG', 15, 15, logoWidth, logoHeight);
    } catch (error) {
      console.warn('Could not load logo:', error);
    }

    // Title
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Manufacturing Script', pageWidth / 2, 45, { align: 'center' });

    // Patient info line
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Patient: ${data.patient_name}`, pageWidth / 2, 55, { align: 'center' });

    let yPosition = 75;

    // Case Information Section
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Case Information', 15, yPosition);
    yPosition += 10;

    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');

    const caseInfo = [
      ['Patient:', data.patient_name],
      ['Shade:', data.shade],
      ['Material:', data.material || 'Not specified'],
      ['Screw Type:', data.screw || 'Not specified'],
      ['Arch Type:', data.arch_type],
    ];

    if (data.upper_appliance_type) {
      caseInfo.push([
        'Upper Appliance:', 
        `${data.upper_appliance_type.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}${
          data.upper_appliance_number ? ` (${data.upper_appliance_number})` : ''
        }`
      ]);
    }

    if (data.lower_appliance_type) {
      caseInfo.push([
        'Lower Appliance:', 
        `${data.lower_appliance_type.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}${
          data.lower_appliance_number ? ` (${data.lower_appliance_number})` : ''
        }`
      ]);
    }

    // Draw case information in two columns
    for (let i = 0; i < caseInfo.length; i++) {
      const [label, value] = caseInfo[i];
      const column = i % 2;
      const row = Math.floor(i / 2);
      const xPos = column === 0 ? 15 : pageWidth / 2 + 5;
      const yPos = yPosition + (row * 8);

      pdf.setFont('helvetica', 'bold');
      pdf.text(label, xPos, yPos);
      pdf.setFont('helvetica', 'normal');
      pdf.text(value, xPos + 35, yPos);
    }

    yPosition += Math.ceil(caseInfo.length / 2) * 8 + 15;

    // Milling Instructions Section
    if (data.milling_location || data.gingiva_color || data.stained_and_glazed) {
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Milling Instructions', 15, yPosition);
      yPosition += 10;

      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');

      const millingInfo = [];
      
      if (data.milling_location) {
        millingInfo.push([
          'Milling Location:', 
          data.milling_location.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
        ]);
      }
      
      if (data.gingiva_color) {
        millingInfo.push([
          'Gingiva Color:', 
          data.gingiva_color.replace(/\b\w/g, l => l.toUpperCase())
        ]);
      }
      
      if (data.stained_and_glazed) {
        millingInfo.push([
          'Stained and Glazed:', 
          data.stained_and_glazed.replace(/\b\w/g, l => l.toUpperCase())
        ]);
      }
      
      if (data.cementation) {
        millingInfo.push([
          'Cementation:', 
          data.cementation.replace(/\b\w/g, l => l.toUpperCase())
        ]);
      }

      // Draw milling information in two columns
      for (let i = 0; i < millingInfo.length; i++) {
        const [label, value] = millingInfo[i];
        const column = i % 2;
        const row = Math.floor(i / 2);
        const xPos = column === 0 ? 15 : pageWidth / 2 + 5;
        const yPos = yPosition + (row * 8);

        pdf.setFont('helvetica', 'bold');
        pdf.text(label, xPos, yPos);
        pdf.setFont('helvetica', 'normal');
        pdf.text(value, xPos + 35, yPos);
      }

      yPosition += Math.ceil(millingInfo.length / 2) * 8 + 15;
    }

    // Additional Notes Section
    if (data.additional_notes) {
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Additional Notes', 15, yPosition);
      yPosition += 10;

      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      
      // Split long text into multiple lines
      const splitNotes = pdf.splitTextToSize(data.additional_notes, pageWidth - 30);
      pdf.text(splitNotes, 15, yPosition);
      yPosition += splitNotes.length * 6 + 15;
    }

    // Status Information Section
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Status Information', 15, yPosition);
    yPosition += 10;

    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');

    const statusInfo = [
      ['Current Status:', data.status === 'milling' ? 'In Milling' :
                        data.status === 'in-transit' ? 'In Transit' :
                        data.status === 'quality-check' ? 'Quality Check' :
                        data.status === 'completed' ? 'Completed' :
                        data.status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())],
      ['Manufacturing Method:', data.manufacturing_method?.replace(/\b\w/g, l => l.toUpperCase()) || 'Not specified'],
      ['Created:', new Date(data.created_at).toLocaleDateString()],
      ['Last Updated:', new Date(data.updated_at).toLocaleDateString()]
    ];

    // Draw status information in two columns
    for (let i = 0; i < statusInfo.length; i++) {
      const [label, value] = statusInfo[i];
      const column = i % 2;
      const row = Math.floor(i / 2);
      const xPos = column === 0 ? 15 : pageWidth / 2 + 5;
      const yPos = yPosition + (row * 8);

      pdf.setFont('helvetica', 'bold');
      pdf.text(label, xPos, yPos);
      pdf.setFont('helvetica', 'normal');
      pdf.text(value, xPos + 35, yPos);
    }

    // Footer
    const footerY = pageHeight - 20;
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'italic');
    pdf.setTextColor(100, 100, 100);
    pdf.text(`Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`,
              pageWidth / 2, footerY, { align: 'center' });

    // Save the PDF
    const fileName = `Manufacturing_Script_${data.patient_name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(fileName);

    return true;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};

// IV Sedation Form PDF Generation
export interface IVSedationFormData {
  // Basic Information
  patient_name: string;
  sedation_date: string;
  status?: string;

  // Step 1: Patient Information & Treatment Selection
  upper_treatment?: string;
  lower_treatment?: string;
  upper_surgery_type?: string;
  lower_surgery_type?: string;
  height_feet?: number;
  height_inches?: number;
  weight?: number;

  // Step 2: Pre-Assessment
  npo_status?: string;
  morning_medications?: string;
  allergies?: string[];
  allergies_other?: string;
  pregnancy_risk?: string;
  last_menstrual_cycle?: string;
  anesthesia_history?: string;
  anesthesia_history_other?: string;
  respiratory_problems?: string[];
  respiratory_problems_other?: string;
  cardiovascular_problems?: string[];
  cardiovascular_problems_other?: string;
  gastrointestinal_problems?: string[];
  gastrointestinal_problems_other?: string;
  neurologic_problems?: string[];
  neurologic_problems_other?: string;
  endocrine_renal_problems?: string[];
  endocrine_renal_problems_other?: string;
  last_a1c_level?: string;
  miscellaneous?: string[];
  miscellaneous_other?: string;
  social_history?: string[];
  social_history_other?: string;
  well_developed_nourished?: string;
  patient_anxious?: string;
  asa_classification?: string;
  airway_evaluation?: string[];
  airway_evaluation_other?: string;
  mallampati_score?: string;
  heart_lung_evaluation?: string[];
  heart_lung_evaluation_other?: string;

  // Step 3: Sedation Plan
  instruments_checklist?: any; // JSONB object
  sedation_type?: string;
  medications_planned?: string[];
  medications_other?: string;
  administration_route?: string[];
  emergency_protocols?: any; // JSONB object
  level_of_sedation?: string;

  // Step 4: Monitoring & Time Tracking
  time_in_room?: string;
  sedation_start_time?: string;
  monitoring_log?: any; // JSONB array
  sedation_end_time?: string;
  out_of_room_time?: string;

  // Step 5: Post-Procedure & Discharge
  post_procedure_notes?: string;
  discharge_criteria_met?: any; // JSONB object
  follow_up_instructions?: string;
  follow_up_instructions_given_to?: string;
  discharged_to?: string;
  pain_level_discharge?: string;
  other_remarks?: string;

  // Timestamps
  created_at?: string;
  updated_at?: string;
}

export const generateIVSedationFormPDF = async (data: IVSedationFormData) => {
  try {
    console.log('IV Sedation PDF Generator received data:', data);

    // Create new PDF document
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // Add logo to top left corner
    try {
      const logoImg = new Image();
      logoImg.crossOrigin = 'anonymous';

      await new Promise((resolve, reject) => {
        logoImg.onload = resolve;
        logoImg.onerror = reject;
        logoImg.src = '/logo-wide.png';
      });

      // Add logo (adjust size as needed)
      const logoWidth = 40;
      const logoHeight = 15;
      pdf.addImage(logoImg, 'PNG', 15, 15, logoWidth, logoHeight);
    } catch (error) {
      console.warn('Could not load logo:', error);
    }

    // Title
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text('IV Sedation Form', pageWidth / 2, 45, { align: 'center' });

    // Patient info line
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Patient: ${data.patient_name}`, pageWidth / 2, 55, { align: 'center' });
    pdf.text(`Date: ${new Date(data.sedation_date).toLocaleDateString()}`, pageWidth / 2, 62, { align: 'center' });

    let yPosition = 80;

    // Patient Information Section
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Patient Information', 15, yPosition);
    yPosition += 10;

    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');

    const patientInfo = [
      ['Patient:', data.patient_name],
      ['Date:', new Date(data.sedation_date).toLocaleDateString()],
      ['Status:', data.status || 'Not specified'],
      ['Height:', `${data.height_feet || 0}' ${data.height_inches || 0}"`],
      ['Weight:', `${data.weight || 0} lbs`],
      ['Upper Treatment:', data.upper_treatment || 'Not specified'],
      ['Lower Treatment:', data.lower_treatment || 'Not specified'],
      ['Upper Surgery Type:', data.upper_surgery_type || 'Not specified'],
      ['Lower Surgery Type:', data.lower_surgery_type || 'Not specified'],
    ];

    patientInfo.forEach(([label, value]) => {
      pdf.text(`${label}`, 20, yPosition);
      pdf.text(`${value}`, 70, yPosition);
      yPosition += 6;
    });

    yPosition += 5;

    // Pre-Assessment Section
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Pre-Assessment', 15, yPosition);
    yPosition += 10;

    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');

    const preAssessment = [
      ['NPO Status:', data.npo_status || 'Not specified'],
      ['Morning Medications:', data.morning_medications === 'no' ? 'No' : data.morning_medications || 'Not specified'],
      ['Pregnancy Risk:', data.pregnancy_risk || 'Not specified'],
      ['Last Menstrual Cycle:', data.last_menstrual_cycle ? new Date(data.last_menstrual_cycle).toLocaleDateString() : 'Not specified'],
      ['Anesthesia History:', data.anesthesia_history || 'Not specified'],
      ['Well Developed/Nourished:', data.well_developed_nourished || 'Not specified'],
      ['Patient Anxious:', data.patient_anxious || 'Not specified'],
      ['ASA Classification:', data.asa_classification || 'Not specified'],
      ['Mallampati Score:', data.mallampati_score || 'Not specified'],
    ];

    preAssessment.forEach(([label, value]) => {
      pdf.text(`${label}`, 20, yPosition);
      pdf.text(`${value}`, 70, yPosition);
      yPosition += 6;
    });

    yPosition += 5;

    // Allergies Section
    if (data.allergies && data.allergies.length > 0) {
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Allergies', 15, yPosition);
      yPosition += 8;

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      const allergiesText = data.allergies.join(', ');
      const allergiesLines = pdf.splitTextToSize(allergiesText, pageWidth - 40);
      pdf.text(allergiesLines, 20, yPosition);
      yPosition += allergiesLines.length * 5 + 5;

      if (data.allergies_other) {
        pdf.text(`Other: ${data.allergies_other}`, 20, yPosition);
        yPosition += 8;
      }
    }

    // Medical History Sections
    const medicalSections = [
      { title: 'Respiratory Problems', data: data.respiratory_problems, other: data.respiratory_problems_other },
      { title: 'Cardiovascular Problems', data: data.cardiovascular_problems, other: data.cardiovascular_problems_other },
      { title: 'Gastrointestinal Problems', data: data.gastrointestinal_problems, other: data.gastrointestinal_problems_other },
      { title: 'Neurologic Problems', data: data.neurologic_problems, other: data.neurologic_problems_other },
      { title: 'Endocrine/Renal Problems', data: data.endocrine_renal_problems, other: data.endocrine_renal_problems_other },
      { title: 'Miscellaneous', data: data.miscellaneous, other: data.miscellaneous_other },
      { title: 'Social History', data: data.social_history, other: data.social_history_other },
    ];

    medicalSections.forEach(section => {
      if (section.data && section.data.length > 0) {
        // Check if we need a new page
        if (yPosition > pageHeight - 40) {
          pdf.addPage();
          yPosition = 20;
        }

        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text(section.title, 15, yPosition);
        yPosition += 8;

        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        const sectionText = section.data.join(', ');
        const sectionLines = pdf.splitTextToSize(sectionText, pageWidth - 40);
        pdf.text(sectionLines, 20, yPosition);
        yPosition += sectionLines.length * 5 + 3;

        if (section.other) {
          pdf.text(`Other: ${section.other}`, 20, yPosition);
          yPosition += 8;
        }

        yPosition += 3;
      }
    });

    // A1C Level if diabetes is present
    if (data.endocrine_renal_problems?.includes('Diabetes') && data.last_a1c_level) {
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`Last A1C Level: ${data.last_a1c_level}%`, 20, yPosition);
      yPosition += 10;
    }

    // Airway Evaluation Section
    if (data.airway_evaluation && data.airway_evaluation.length > 0) {
      // Check if we need a new page
      if (yPosition > pageHeight - 40) {
        pdf.addPage();
        yPosition = 20;
      }

      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Airway Evaluation', 15, yPosition);
      yPosition += 8;

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      const airwayText = data.airway_evaluation.join(', ');
      const airwayLines = pdf.splitTextToSize(airwayText, pageWidth - 40);
      pdf.text(airwayLines, 20, yPosition);
      yPosition += airwayLines.length * 5 + 3;

      if (data.airway_evaluation_other) {
        pdf.text(`Other: ${data.airway_evaluation_other}`, 20, yPosition);
        yPosition += 8;
      }

      yPosition += 3;
    }

    // Heart/Lung Evaluation Section
    if (data.heart_lung_evaluation && data.heart_lung_evaluation.length > 0) {
      // Check if we need a new page
      if (yPosition > pageHeight - 40) {
        pdf.addPage();
        yPosition = 20;
      }

      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Heart/Lung Evaluation', 15, yPosition);
      yPosition += 8;

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      const heartLungText = data.heart_lung_evaluation.join(', ');
      const heartLungLines = pdf.splitTextToSize(heartLungText, pageWidth - 40);
      pdf.text(heartLungLines, 20, yPosition);
      yPosition += heartLungLines.length * 5 + 3;

      if (data.heart_lung_evaluation_other) {
        pdf.text(`Other: ${data.heart_lung_evaluation_other}`, 20, yPosition);
        yPosition += 8;
      }

      yPosition += 3;
    }

    // Check if we need a new page for sedation plan
    if (yPosition > pageHeight - 60) {
      pdf.addPage();
      yPosition = 20;
    }

    // Sedation Plan Section
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Sedation Plan', 15, yPosition);
    yPosition += 10;

    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');

    const sedationPlan = [
      ['Sedation Type:', data.sedation_type || 'Not specified'],
      ['Level of Sedation:', data.level_of_sedation || 'Not specified'],
    ];

    sedationPlan.forEach(([label, value]) => {
      pdf.text(`${label}`, 20, yPosition);
      pdf.text(`${value}`, 70, yPosition);
      yPosition += 6;
    });

    // Instruments Checklist
    if (data.instruments_checklist && typeof data.instruments_checklist === 'object') {
      yPosition += 5;
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Instruments Checklist:', 20, yPosition);
      yPosition += 6;

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      Object.entries(data.instruments_checklist).forEach(([instrument, checked]) => {
        if (checked) {
          pdf.text(`✓ ${instrument}`, 25, yPosition);
          yPosition += 5;
        }
      });
      yPosition += 3;
    }

    // Medications Planned
    if (data.medications_planned && data.medications_planned.length > 0) {
      yPosition += 5;
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Planned Medications:', 20, yPosition);
      yPosition += 6;

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      const medicationsText = data.medications_planned.join(', ');
      const medicationsLines = pdf.splitTextToSize(medicationsText, pageWidth - 40);
      pdf.text(medicationsLines, 20, yPosition);
      yPosition += medicationsLines.length * 5 + 3;
    }

    // Additional Medications
    if (data.medications_other) {
      yPosition += 3;
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Other Medications:', 20, yPosition);
      yPosition += 6;

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      const otherMedsLines = pdf.splitTextToSize(data.medications_other, pageWidth - 40);
      pdf.text(otherMedsLines, 20, yPosition);
      yPosition += otherMedsLines.length * 5 + 3;
    }

    // Administration Route
    if (data.administration_route && data.administration_route.length > 0) {
      yPosition += 3;
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Administration Route:', 20, yPosition);
      yPosition += 6;

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      const routeText = data.administration_route.join(', ');
      const routeLines = pdf.splitTextToSize(routeText, pageWidth - 40);
      pdf.text(routeLines, 20, yPosition);
      yPosition += routeLines.length * 5 + 3;
    }

    // Emergency Protocols
    if (data.emergency_protocols && typeof data.emergency_protocols === 'object') {
      yPosition += 5;
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Emergency Protocols:', 20, yPosition);
      yPosition += 6;

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      Object.entries(data.emergency_protocols).forEach(([protocol, checked]) => {
        if (checked) {
          pdf.text(`✓ ${protocol}`, 25, yPosition);
          yPosition += 5;
        }
      });
      yPosition += 3;
    }

    // Monitoring & Time Tracking Section
    if (data.time_in_room || data.sedation_start_time || data.sedation_end_time || data.out_of_room_time || data.monitoring_log) {
      // Check if we need a new page
      if (yPosition > pageHeight - 60) {
        pdf.addPage();
        yPosition = 20;
      }

      yPosition += 5;
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Monitoring & Time Tracking', 15, yPosition);
      yPosition += 10;

      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');

      const timeSummary = [
        ['Time in Room:', data.time_in_room || 'Not recorded'],
        ['Sedation Start:', data.sedation_start_time || 'Not recorded'],
        ['Sedation End:', data.sedation_end_time || 'Not recorded'],
        ['Out of Room:', data.out_of_room_time || 'Not recorded'],
      ];

      timeSummary.forEach(([label, value]) => {
        pdf.text(`${label}`, 20, yPosition);
        pdf.text(`${value}`, 70, yPosition);
        yPosition += 6;
      });

      // Monitoring Log
      if (data.monitoring_log && Array.isArray(data.monitoring_log) && data.monitoring_log.length > 0) {
        yPosition += 8;
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Monitoring Log:', 20, yPosition);
        yPosition += 6;

        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'normal');

        data.monitoring_log.forEach((entry: any, index: number) => {
          if (yPosition > pageHeight - 20) {
            pdf.addPage();
            yPosition = 20;
          }

          const entryText = `${entry.time || 'N/A'} - BP: ${entry.blood_pressure || 'N/A'}, HR: ${entry.heart_rate || 'N/A'}, O2: ${entry.oxygen_saturation || 'N/A'}%, RR: ${entry.respiratory_rate || 'N/A'}`;
          pdf.text(entryText, 25, yPosition);
          yPosition += 5;
        });
        yPosition += 3;
      }
    }

    // Post-Procedure & Recovery Assessment
    yPosition += 10;

    // Check if we need a new page
    if (yPosition > pageHeight - 60) {
      pdf.addPage();
      yPosition = 20;
    }

    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Post-Procedure & Recovery', 15, yPosition);
    yPosition += 10;

    // Post-Procedure Notes
    if (data.post_procedure_notes) {
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Post-Procedure Notes:', 20, yPosition);
      yPosition += 6;

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      const notesLines = pdf.splitTextToSize(data.post_procedure_notes, pageWidth - 40);
      pdf.text(notesLines, 20, yPosition);
      yPosition += notesLines.length * 5 + 8;
    }

    // Discharge Criteria Met
    if (data.discharge_criteria_met && typeof data.discharge_criteria_met === 'object') {
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Discharge Criteria Met:', 20, yPosition);
      yPosition += 6;

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      Object.entries(data.discharge_criteria_met).forEach(([criteria, met]) => {
        const status = met ? '✓' : '✗';
        pdf.text(`${status} ${criteria}`, 25, yPosition);
        yPosition += 5;
      });
      yPosition += 5;
    }

    // Follow-up Instructions
    if (data.follow_up_instructions) {
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Follow-up Instructions:', 20, yPosition);
      yPosition += 6;

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      const instructionsLines = pdf.splitTextToSize(data.follow_up_instructions, pageWidth - 40);
      pdf.text(instructionsLines, 20, yPosition);
      yPosition += instructionsLines.length * 5 + 5;
    }

    // Follow-up Instructions Given To
    if (data.follow_up_instructions_given_to) {
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Instructions Given To: ${data.follow_up_instructions_given_to}`, 20, yPosition);
      yPosition += 8;
    }

    // Discharge Information
    yPosition += 5;
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Discharge Information', 15, yPosition);
    yPosition += 8;

    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');

    const dischargeInfo = [
      ['Discharged To:', data.discharged_to || 'Not specified'],
      ['Pain Level at Discharge:', data.pain_level_discharge ? `${data.pain_level_discharge}/10` : 'Not recorded'],
    ];

    dischargeInfo.forEach(([label, value]) => {
      pdf.text(`${label}`, 20, yPosition);
      pdf.text(`${value}`, 80, yPosition);
      yPosition += 6;
    });

    // Other Remarks
    if (data.other_remarks) {
      yPosition += 10;
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Other Remarks', 15, yPosition);
      yPosition += 8;

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      const remarksLines = pdf.splitTextToSize(data.other_remarks, pageWidth - 40);
      pdf.text(remarksLines, 20, yPosition);
      yPosition += remarksLines.length * 5 + 10;
    }

    // Form Timestamps
    if (data.created_at || data.updated_at) {
      yPosition += 10;
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Form Information', 15, yPosition);
      yPosition += 8;

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');

      if (data.created_at) {
        const createdDate = new Date(data.created_at).toLocaleString();
        pdf.text(`Form Created: ${createdDate}`, 20, yPosition);
        yPosition += 5;
      }

      if (data.updated_at) {
        const updatedDate = new Date(data.updated_at).toLocaleString();
        pdf.text(`Last Updated: ${updatedDate}`, 20, yPosition);
        yPosition += 5;
      }
    }

    // Footer
    const pageCount = pdf.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i);
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Page ${i} of ${pageCount}`, pageWidth - 30, pageHeight - 10);
      pdf.text(`Generated on ${new Date().toLocaleDateString()}`, 15, pageHeight - 10);
    }

    // Save the PDF
    const fileName = `IV_Sedation_Form_${data.patient_name.replace(/\s+/g, '_')}_${new Date(data.sedation_date).toISOString().split('T')[0]}.pdf`;
    pdf.save(fileName);

    return true;
  } catch (error) {
    console.error('Error generating IV Sedation PDF:', error);
    throw error;
  }
};

// Print IV Sedation Form
export const printIVSedationForm = async (elementId: string) => {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error('Element not found for printing');
    }

    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      throw new Error('Could not open print window');
    }

    // Get the element's HTML and styles
    const elementHTML = element.innerHTML;
    const styles = Array.from(document.styleSheets)
      .map(styleSheet => {
        try {
          return Array.from(styleSheet.cssRules)
            .map(rule => rule.cssText)
            .join('\n');
        } catch (e) {
          return '';
        }
      })
      .join('\n');

    // Create the print document
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>IV Sedation Form</title>
          <style>
            ${styles}
            @media print {
              body { margin: 0; padding: 20px; }
              .no-print { display: none !important; }
            }
          </style>
        </head>
        <body>
          ${elementHTML}
        </body>
      </html>
    `);

    printWindow.document.close();

    // Wait for content to load then print
    printWindow.onload = () => {
      printWindow.print();
      printWindow.close();
    };

    return true;
  } catch (error) {
    console.error('Error printing IV Sedation form:', error);
    throw error;
  }
};
