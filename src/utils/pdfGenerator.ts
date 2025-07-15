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
