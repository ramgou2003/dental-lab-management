import jsPDF from 'jspdf';

export interface FinalDesignApprovalPdfData {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  dateOfService: string;
  treatment: string;
  material: string;
  shade: string;
  designReviewAcknowledged: boolean;
  finalFabricationApproved: boolean;
  postApprovalChangesUnderstood: boolean;
  warrantyReminderUnderstood: boolean;
  patientFullName: string;
  patientSignature: string;
  patientSignatureDate: string;
  witnessName: string;
  witnessSignature: string;
  witnessSignatureDate: string;
  formDate: string;
  [key: string]: any;
}

function addHeaderAndFooter(
  pdf: any,
  pageWidth: number,
  pageHeight: number,
  margin: number,
  formDate: string,
  logoImg: HTMLImageElement | null,
  letterheadImg: HTMLImageElement | null,
  logoHeight: number
) {
  const topMargin = 5;
  let yPosition = topMargin;

  // Add logo to top left corner
  if (logoImg) {
    const logoWidth = 50;
    pdf.addImage(logoImg, 'PNG', margin, topMargin, logoWidth, logoHeight);
  }

  yPosition = topMargin + logoHeight + 1;

  // Add horizontal line below logo
  pdf.setDrawColor(55, 91, 220);
  pdf.setLineWidth(1);
  pdf.line(margin, yPosition, pageWidth - margin, yPosition);

  // Add website text
  pdf.setFontSize(12);
  pdf.setFont('Fira Sans', 'normal');
  pdf.setTextColor(55, 91, 220);
  pdf.text('www.nydentalimplants.com', pageWidth - margin, yPosition - 5, { align: 'right' });

  yPosition += 8;

  // Add form date on right side
  pdf.setFontSize(10);
  pdf.setFont('Fira Sans', 'normal');
  pdf.setTextColor(0, 0, 0);
  pdf.text(`Date: ${formDate}`, pageWidth - margin, yPosition, { align: 'right' });

  yPosition += 6;

  // Add letterhead image
  if (letterheadImg) {
    const letterheadWidth = pageWidth - 2 * margin;
    const letterheadHeight = 60;
    pdf.addImage(letterheadImg, 'PNG', margin, yPosition, letterheadWidth, letterheadHeight);
  }

  // Add footer at the very bottom of the page
  const footerY = pageHeight - margin - 5;

  // Add top border line for footer
  pdf.setDrawColor(55, 91, 220);
  pdf.setLineWidth(0.5);
  pdf.line(margin, footerY, pageWidth - margin, footerY);

  const footerContentY = footerY + 5;

  // Footer content
  pdf.setFontSize(9);
  pdf.setFont('Fira Sans', 'bold');
  pdf.setTextColor(55, 91, 220);

  // Left section - Company tagline
  pdf.text('Restoring Smiles,', margin, footerContentY);
  pdf.text('Returning Health and confidence', margin, footerContentY + 5);

  // Vertical separator 1
  pdf.setDrawColor(55, 91, 220);
  pdf.setLineWidth(0.5);
  pdf.line(margin + 55, footerContentY - 2, margin + 55, footerContentY + 12);

  // Center-left section - Phone
  pdf.setFontSize(8);
  pdf.setFont('Fira Sans', 'bold');
  pdf.text('Phone:', margin + 60, footerContentY);
  pdf.setFont('Fira Sans', 'normal');
  pdf.text('(585)-684-1149', margin + 60, footerContentY + 5);
  pdf.text('(585)-394-5910', margin + 60, footerContentY + 10);

  // Vertical separator 2
  pdf.setDrawColor(55, 91, 220);
  pdf.setLineWidth(0.5);
  pdf.line(margin + 85, footerContentY - 2, margin + 85, footerContentY + 12);

  // Center section - Email
  pdf.setFont('Fira Sans', 'bold');
  pdf.text('Email:', margin + 90, footerContentY);
  pdf.setFont('Fira Sans', 'normal');
  pdf.text('contact@nysdentalimplants.com', margin + 90, footerContentY + 5);

  // Vertical separator 3
  pdf.setDrawColor(55, 91, 220);
  pdf.setLineWidth(0.5);
  pdf.line(margin + 135, footerContentY - 2, margin + 135, footerContentY + 12);

  // Right section - Address
  pdf.setFont('Fira Sans', 'bold');
  pdf.text('Address:', margin + 140, footerContentY);
  pdf.setFont('Fira Sans', 'normal');
  pdf.text('344 N. Main St, Canandaigua,', margin + 140, footerContentY + 5);
  pdf.text('New York, 14424', margin + 140, footerContentY + 10);
}

function addWatermark(pdf: any, pageWidth: number, pageHeight: number, watermarkImg: HTMLImageElement | null) {
  if (!watermarkImg) return;

  try {
    // Calculate dimensions to maintain aspect ratio
    const watermarkWidth = 100;
    const watermarkHeight = (watermarkImg.height / watermarkImg.width) * watermarkWidth;

    // Center the watermark on the page
    const xPosition = (pageWidth - watermarkWidth) / 2;
    const yPosition = (pageHeight - watermarkHeight) / 2;

    // Add the watermark image with opacity
    if (pdf.setOpacity) {
      pdf.setOpacity(0.50);
    }
    pdf.addImage(watermarkImg, 'PNG', xPosition, yPosition, watermarkWidth, watermarkHeight);
    if (pdf.setOpacity) {
      pdf.setOpacity(1);
    }
  } catch (error) {
    console.warn('Could not add watermark:', error);
  }
}





export const generateFinalDesignApprovalPdf = async (data: FinalDesignApprovalPdfData) => {
  try {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 15;
    let logoHeight = 0;
    let logoImg: HTMLImageElement | null = null;
    let letterheadImg: HTMLImageElement | null = null;
    let watermarkImg: HTMLImageElement | null = null;

    // Load logo image
    try {
      logoImg = new Image();
      logoImg.crossOrigin = 'anonymous';

      await new Promise((resolve, reject) => {
        logoImg!.onload = resolve;
        logoImg!.onerror = reject;
        logoImg!.src = '/logo.png';
      });

      const logoWidth = 50;
      logoHeight = (logoImg.height / logoImg.width) * logoWidth;
    } catch (error) {
      console.warn('Could not load logo image:', error);
      logoImg = null;
    }

    // Load letterhead image
    try {
      letterheadImg = new Image();
      letterheadImg.crossOrigin = 'anonymous';

      await new Promise((resolve, reject) => {
        letterheadImg!.onload = resolve;
        letterheadImg!.onerror = reject;
        letterheadImg!.src = '/template/Letterhead.png';
      });
    } catch (error) {
      console.warn('Could not load letterhead image:', error);
      letterheadImg = null;
    }

    // Load watermark image
    try {
      watermarkImg = new Image();
      watermarkImg.crossOrigin = 'anonymous';

      await new Promise((resolve, reject) => {
        watermarkImg!.onload = resolve;
        watermarkImg!.onerror = reject;
        watermarkImg!.src = '/template/Logo icon white.png';
      });
    } catch (error) {
      console.warn('Could not load watermark image:', error);
      watermarkImg = null;
    }

    // Add watermark and header to first page
    addWatermark(pdf, pageWidth, pageHeight, watermarkImg);
    addHeaderAndFooter(pdf, pageWidth, pageHeight, margin, data.formDate, logoImg, letterheadImg, logoHeight);

    // Move yPosition below header
    const topMargin = 5;
    let yPosition = topMargin + logoHeight + 1 + 8 + 6 + 6 + (letterheadImg ? 60 : 0) + 10;

    // Add title (blue color) - same as thank you form
    yPosition -= 8; // Move title up to reduce empty space
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(55, 91, 220); // Blue color (#375BDC)
    pdf.text('Final Design Approval Form', pageWidth / 2, yPosition, { align: 'center' });

    pdf.setTextColor(0, 0, 0); // Reset to black for content
    yPosition += 10;

    // Patient Information Section - 2 Column Layout
    const col1X = margin; // Left column
    const col2X = pageWidth / 2 + 5; // Right column (middle of page + spacing)

    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(0, 0, 0);

    // Row 1: First Name (left) | Last Name (right)
    pdf.text('First Name:', col1X, yPosition);
    pdf.setFont('helvetica', 'normal');
    pdf.text(data.firstName || 'N/A', col1X + 40, yPosition);

    pdf.setFont('helvetica', 'bold');
    pdf.text('Last Name:', col2X, yPosition);
    pdf.setFont('helvetica', 'normal');
    pdf.text(data.lastName || 'N/A', col2X + 40, yPosition);

    yPosition += 8;

    // Row 2: Date of Birth (left) | Date of Service (right)
    pdf.setFont('helvetica', 'bold');
    pdf.text('Date of Birth:', col1X, yPosition);
    pdf.setFont('helvetica', 'normal');
    pdf.text(data.dateOfBirth || 'N/A', col1X + 40, yPosition);

    pdf.setFont('helvetica', 'bold');
    pdf.text('Date of Service:', col2X, yPosition);
    pdf.setFont('helvetica', 'normal');
    pdf.text(data.dateOfService || 'N/A', col2X + 40, yPosition);

    yPosition += 8;

    // Row 3: Treatment (left) | Material (right)
    pdf.setFont('helvetica', 'bold');
    pdf.text('Treatment:', col1X, yPosition);
    pdf.setFont('helvetica', 'normal');
    pdf.text(data.treatment || 'N/A', col1X + 40, yPosition);

    pdf.setFont('helvetica', 'bold');
    pdf.text('Material:', col2X, yPosition);
    pdf.setFont('helvetica', 'normal');
    pdf.text(data.material || 'N/A', col2X + 40, yPosition);

    yPosition += 8;

    // Row 4: Shade (left only)
    pdf.setFont('helvetica', 'bold');
    pdf.text('Shade:', col1X, yPosition);
    pdf.setFont('helvetica', 'normal');
    pdf.text(data.shade || 'N/A', col1X + 40, yPosition);

    yPosition += 12;

    // Design Approval & Fee Agreement section
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(55, 91, 220);
    pdf.text('Design Approval & Fee Agreement', margin, yPosition);
    pdf.setTextColor(0, 0, 0);
    yPosition += 8;

    pdf.setFontSize(9);
    const acknowledgments = [
      { key: 'designReviewAcknowledged', label: 'Design Review', text: 'I confirm I have had adequate time to feel, inspect, and try in the proposed final appliance design. I understand the shape, contours, occlusion, shade, and materials as presented.' },
      { key: 'finalFabricationApproved', label: 'Final Fabrication', text: 'By signing below, I hereby approve the design as-is and authorize fabrication of my final prosthesis. No further design changes will be made prior to fabrication.' },
      { key: 'postApprovalChangesUnderstood', label: 'Post-Approval Changes', text: 'I acknowledge that any modification, adjustment, remake, or replacement requested after this approval will incur a fixed surcharge of $6,354.' },
      { key: 'warrantyReminderUnderstood', label: 'Warranty Reminder', text: 'I understand the three-year warranty covers defects in materials and workmanship but does not cover patient-driven design changes.' }
    ];

    for (const ack of acknowledgments) {
      const isChecked = data[ack.key as keyof typeof data];

      const checkboxSize = 3.5;
      const checkboxX = margin;
      const checkboxY = yPosition;

      // Draw checkbox with black border
      pdf.setDrawColor(0, 0, 0);
      pdf.setLineWidth(0.3);
      pdf.rect(checkboxX, checkboxY - 2.5, checkboxSize, checkboxSize, 'S');

      // Draw checkmark if checked
      if (isChecked) {
        pdf.setDrawColor(0, 0, 0);
        pdf.setLineWidth(0.3);
        // Draw checkmark
        pdf.line(checkboxX + 0.9, checkboxY - 0.8, checkboxX + 1.3, checkboxY - 0.3);
        pdf.line(checkboxX + 1.3, checkboxY - 0.3, checkboxX + 2.8, checkboxY - 1.8);
      }

      // Draw bold label
      pdf.setFont('helvetica', 'bold');
      pdf.text(ack.label + '. ', margin + 6, yPosition);

      // Get width of label to continue text on same line
      const labelWidth = pdf.getTextWidth(ack.label + '. ');

      // Wrap description text starting after label
      const descriptionLines = pdf.splitTextToSize(ack.text, pageWidth - margin - 10 - labelWidth);

      // Draw first line of description on same line as label
      pdf.setFont('helvetica', 'normal');
      pdf.text(descriptionLines[0], margin + 6 + labelWidth, yPosition);

      // Draw remaining lines
      if (descriptionLines.length > 1) {
        const remainingLines = descriptionLines.slice(1);
        pdf.text(remainingLines, margin + 6, yPosition + 4);
        yPosition += remainingLines.length * 4 + 2;
      }

      yPosition += 6;
    }

    yPosition += 6;

    // Signatures section
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(55, 91, 220);
    pdf.text('Signatures', margin, yPosition);
    pdf.setTextColor(0, 0, 0);
    yPosition += 8;

    const sigColWidth = (pageWidth - 2 * margin - 10) / 2;
    const sigCol1X = margin;
    const sigCol2X = margin + sigColWidth + 10;

    // Witness column
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Witness', sigCol1X, yPosition);
    let witnessY = yPosition + 5;

    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Name: ' + (data.witnessName || ''), sigCol1X, witnessY);
    witnessY += 5;

    pdf.text('Date: ' + (data.witnessSignatureDate || ''), sigCol1X, witnessY);
    witnessY += 10;

    // Witness signature
    if (data.witnessSignature) {
      try {
        pdf.addImage(data.witnessSignature, 'PNG', sigCol1X, witnessY, sigColWidth - 5, 18);
      } catch (error) {
        console.warn('Could not add witness signature:', error);
      }
    }
    witnessY += 20;

    // Witness signature line
    pdf.setDrawColor(100, 100, 100);
    pdf.setLineWidth(0.5);
    pdf.line(sigCol1X, witnessY, sigCol1X + sigColWidth - 5, witnessY);
    witnessY += 3;
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(0, 0, 0);
    pdf.text('Witness Signature', sigCol1X + (sigColWidth - 5) / 2, witnessY, { align: 'center' });

    // Patient column (same Y position as witness)
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Patient', sigCol2X, yPosition);
    let patientY = yPosition + 5;

    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Name: ' + (data.patientFullName || ''), sigCol2X, patientY);
    patientY += 5;

    pdf.text('Date: ' + (data.patientSignatureDate || ''), sigCol2X, patientY);
    patientY += 10;

    // Patient signature
    if (data.patientSignature) {
      try {
        pdf.addImage(data.patientSignature, 'PNG', sigCol2X, patientY, sigColWidth - 5, 18);
      } catch (error) {
        console.warn('Could not add patient signature:', error);
      }
    }
    patientY += 20;

    // Patient signature line
    pdf.setDrawColor(100, 100, 100);
    pdf.setLineWidth(0.5);
    pdf.line(sigCol2X, patientY, sigCol2X + sigColWidth - 5, patientY);
    patientY += 3;
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(0, 0, 0);
    pdf.text('Patient Signature', sigCol2X + (sigColWidth - 5) / 2, patientY, { align: 'center' });

    // Add page numbers to all pages
    const totalPages = pdf.internal.pages.length - 1; // -1 because pages array has an extra element at index 0
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      const pageWidth = pdf.internal.pageSize.getWidth();
      const margin = 15;
      const footerY = pdf.internal.pageSize.getHeight() - margin - 5;

      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(0, 0, 0);
      const pageNumberText = `${i} of ${totalPages}`;
      pdf.text(pageNumberText, pageWidth - margin - 5, footerY - 3, { align: 'right' });
    }

    const fileName = `FinalDesignApproval_${data.patientFullName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(fileName);
  } catch (error) {
    console.error('Error generating Final Design Approval PDF:', error);
    throw error;
  }
};

