import jsPDF from 'jspdf';

export interface ConsentFullArchPdfData {
  // Patient & Interpreter Information
  patientName: string;
  chartNumber: string;
  date: string;
  consentTime: string;
  primaryLanguage: string;
  otherLanguageText?: string;
  interpreterRequired: string;
  interpreterName?: string;
  interpreterCredential?: string;
  patientInfoInitials?: string;

  // Treatment Details
  archType: string;
  upperTeeth?: any[];
  lowerTeeth?: any[];
  upperTeethRegions?: string;
  lowerTeethRegions?: string;
  upperImplants?: string;
  lowerImplants?: string;
  upperTreatmentType?: string;
  lowerTreatmentType?: string;
  upperSameDayLoad?: string;
  lowerSameDayLoad?: string;
  upperGraftMaterial?: any;
  lowerGraftMaterial?: any;
  upperProsthesis?: any;
  lowerProsthesis?: any;
  treatmentInitials?: string;

  // Reasonable Alternatives
  alternativesInitials?: {
    noTreatment?: string;
    conventionalDentures?: string;
    segmentedExtraction?: string;
    removableOverdentures?: string;
    zygomaticImplants?: string;
  };
  treatmentDescriptionInitials?: string;

  // Material Risks
  risksUnderstood?: boolean;
  materialRisksInitials?: string;

  // Risks
  risksInitials?: string;

  // Sedation
  sedationPlan?: any;
  asaPhysicalStatus?: string;
  plannedDrugs?: any;
  escortName?: string;
  escortPhone?: string;
  medicationsDisclosed?: boolean;
  declineIVSedation?: boolean;
  sedationInitials?: string;

  // Financial
  surgicalExtractions?: {
    count?: string;
    fee?: string;
    covered?: string;
  };
  implantFixtures?: {
    count?: string;
    fee?: string;
    covered?: string;
  };
  zirconiabridge?: {
    fee?: string;
    covered?: string;
  };
  ivSedation?: {
    fee?: string;
    covered?: string;
  };
  financialInitials?: string;

  // Media
  internalRecordKeeping?: string;
  professionalEducation?: string;
  marketingSocialMedia?: string;
  hipaaEmailSms?: boolean;
  hipaaEmail?: string;
  hipaaPhone?: string;
  photoVideoInitials?: string;

  // Opioid
  smallestOpioidSupply?: boolean;
  opioidInitials?: string;

  // Patient Acknowledgment
  acknowledgmentRead?: boolean;
  acknowledgmentOutcome?: boolean;
  acknowledgmentAuthorize?: boolean;

  // Final Signatures
  patientSignature?: string;
  patientSignatureDate?: string;
  surgeonName?: string;
  surgeonSignature?: string;
  surgeonDate?: string;
  witnessName?: string;
  witnessSignature?: string;
  witnessSignatureDate?: string;
}

/**
 * Add watermark to the page (drawn on top with blend mode)
 */
function addWatermark(pdf: jsPDF, pageWidth: number, pageHeight: number, watermarkImg: HTMLImageElement | null) {
  if (watermarkImg) {
    try {
      const watermarkWidth = 120;
      const watermarkHeight = 120;
      const watermarkX = (pageWidth - watermarkWidth) / 2;
      const watermarkY = (pageHeight - watermarkHeight) / 2;

      pdf.saveGraphicsState();
      // Use screen blend mode so it shows through filled boxes
      pdf.setGState(new pdf.GState({ opacity: 0.15 }));
      pdf.addImage(watermarkImg, 'PNG', watermarkX, watermarkY, watermarkWidth, watermarkHeight);
      pdf.restoreGraphicsState();
    } catch (error) {
      console.error('Error adding watermark:', error);
    }
  }
}

/**
 * Add watermark on top of content (called after all content is drawn)
 */
function addWatermarkOnTop(pdf: jsPDF, pageWidth: number, pageHeight: number, watermarkImg: HTMLImageElement | null) {
  if (watermarkImg) {
    try {
      const watermarkWidth = 120;
      const watermarkHeight = 120;
      const watermarkX = (pageWidth - watermarkWidth) / 2;
      const watermarkY = (pageHeight - watermarkHeight) / 2;

      pdf.saveGraphicsState();
      pdf.setGState(new pdf.GState({ opacity: 0.08 }));
      pdf.addImage(watermarkImg, 'PNG', watermarkX, watermarkY, watermarkWidth, watermarkHeight);
      pdf.restoreGraphicsState();
    } catch (error) {
      console.error('Error adding watermark on top:', error);
    }
  }
}

/**
 * Add header and footer to the page
 */
function addHeaderAndFooter(
  pdf: jsPDF,
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

  // Add logo
  if (logoImg) {
    const logoWidth = 50;
    pdf.addImage(logoImg, 'PNG', margin, yPosition, logoWidth, logoHeight);
  }

  yPosition += logoHeight + 1;

  // Add blue line
  pdf.setDrawColor(55, 91, 220);
  pdf.setLineWidth(1);
  pdf.line(margin, yPosition, pageWidth - margin, yPosition);

  // Add website text
  pdf.setFontSize(12);
  pdf.setFont('Fira Sans', 'normal');
  pdf.setTextColor(55, 91, 220);
  pdf.text('www.nydentalimplants.com', pageWidth - margin, yPosition - 5, { align: 'right' });

  yPosition += 8;

  // Add date
  pdf.setFontSize(10);
  pdf.setFont('Fira Sans', 'normal');
  pdf.setTextColor(0, 0, 0);
  pdf.text(`Date: ${formDate}`, pageWidth - margin, yPosition, { align: 'right' });

  yPosition += 6;

  // Add letterhead if available
  if (letterheadImg) {
    const letterheadWidth = pageWidth - 2 * margin;
    const letterheadHeight = 60;
    pdf.addImage(letterheadImg, 'PNG', margin, yPosition, letterheadWidth, letterheadHeight);
  }

  // Add footer
  const footerY = pageHeight - margin - 5;

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

/**
 * Generate Consent Full Arch PDF
 */
export async function generateConsentFullArchPdf(data: ConsentFullArchPdfData) {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 15;

  // Load images
  let logoImg: HTMLImageElement | null = null;
  let letterheadImg: HTMLImageElement | null = null;
  let watermarkImg: HTMLImageElement | null = null;

  try {
    [logoImg, letterheadImg, watermarkImg] = await Promise.all([
      loadImage('/logo.png'),
      loadImage('/template/Letterhead.png'),
      loadImage('/template/Logo icon white.png')
    ]);
  } catch (error) {
    console.error('Error loading images:', error);
  }

  // Calculate logo height
  const logoWidth = 50;
  const logoHeight = logoImg ? (logoImg.height / logoImg.width) * logoWidth : 15;

  // Page 1: Overview
  addWatermark(pdf, pageWidth, pageHeight, watermarkImg);
  addHeaderAndFooter(pdf, pageWidth, pageHeight, margin, data.date, logoImg, letterheadImg, logoHeight);

  const topMargin = 5;
  let yPosition = topMargin + logoHeight + 1 + 8 + 6 + 6 + (letterheadImg ? 60 : 0) + 10;

  // Title
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(55, 91, 220);
  pdf.text('Consent for Full-Arch Implant Treatment', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 15;

  // Overview content
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(0, 0, 0);
  pdf.text('Welcome and Overview', margin, yPosition);
  yPosition += 10;

  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  const overviewText = 'Today we discussed in detail your full-arch implant treatment, including:';
  pdf.text(overviewText, margin, yPosition);
  yPosition += 8;

  const overviewItems = [
    'Exactly which teeth and endosteal implants are planned',
    'Reasonable alternatives (from doing nothing to various denture/bridge options)',
    'All material risks and their approximate likelihoods',
    'The sedation/anesthesia plan and associated safety measures',
    'Financial obligations, insurance notice, and your No Surprises Act rights',
    'How we\'ll use any photos/videos or communicate by email/SMS'
  ];

  overviewItems.forEach((item, index) => {
    pdf.text(`${index + 1}. ${item}`, margin + 5, yPosition);
    yPosition += 6;
  });

  yPosition += 5;

  const disclaimerText = 'You\'ve had the opportunity to ask questions, to see the statistical ranges for each complication, and to confirm that you understand each element. If anything remains unclear at any point, please let us know right away—your signature on the following pages certifies that you have been fully informed and that we have addressed your questions thoroughly.';
  const disclaimerLines = pdf.splitTextToSize(disclaimerText, pageWidth - 2 * margin);
  disclaimerLines.forEach((line: string) => {
    pdf.text(line, margin, yPosition);
    yPosition += 5;
  });

  yPosition += 10;

  // Important note box
  pdf.setDrawColor(245, 158, 11);
  pdf.setFillColor(254, 243, 199);
  pdf.setLineWidth(0.4);
  pdf.roundedRect(margin, yPosition, pageWidth - 2 * margin, 15, 2, 2, 'FD');
  yPosition += 6;

  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(146, 64, 14);
  pdf.text('Important Note:', margin + 1, yPosition);
  pdf.setFont('helvetica', 'normal');
  pdf.text(' Patient must initial the lower-right corner of every page throughout this consent packet.', margin + 3 + pdf.getTextWidth('Important Note:'), yPosition);

  // Draw watermark on top of page 1 content
  addWatermarkOnTop(pdf, pageWidth, pageHeight, watermarkImg);

  // PAGE 2: Patient & Interpreter Information
  pdf.addPage();
  addWatermark(pdf, pageWidth, pageHeight, watermarkImg);
  addHeaderAndFooter(pdf, pageWidth, pageHeight, margin, data.date, logoImg, null, logoHeight);

  yPosition = topMargin + logoHeight + 1 + 8 + 6 + 6 + 10;

  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(55, 91, 220);
  pdf.text('Patient & Interpreter Information', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 12;

  // Patient details
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(0, 0, 0);
  pdf.text('Patient Full Legal Name:', margin, yPosition);
  pdf.setFont('helvetica', 'normal');
  pdf.text(data.patientName, margin + 60, yPosition);
  yPosition += 8;

  pdf.setFont('helvetica', 'bold');
  pdf.text('Chart Number:', margin, yPosition);
  pdf.setFont('helvetica', 'normal');
  pdf.text(data.chartNumber || 'N/A', margin + 60, yPosition);
  yPosition += 8;

  pdf.setFont('helvetica', 'bold');
  pdf.text('Date:', margin, yPosition);
  pdf.setFont('helvetica', 'normal');
  pdf.text(data.date, margin + 60, yPosition);

  pdf.setFont('helvetica', 'bold');
  pdf.text('Time:', margin + 100, yPosition);
  pdf.setFont('helvetica', 'normal');
  pdf.text(data.consentTime || 'N/A', margin + 115, yPosition);
  yPosition += 12;

  // Language section
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(55, 91, 220);
  pdf.text('Primary Language', margin, yPosition);
  yPosition += 8;

  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(0, 0, 0);
  const language = data.primaryLanguage === 'other' ? data.otherLanguageText || 'Other' :
                   data.primaryLanguage.charAt(0).toUpperCase() + data.primaryLanguage.slice(1);
  pdf.text(`Primary Language: ${language}`, margin, yPosition);
  yPosition += 12;

  // Interpreter section
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(55, 91, 220);
  pdf.text('Interpreter Information', margin, yPosition);
  yPosition += 8;

  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(0, 0, 0);
  pdf.text(`Interpreter Required: ${data.interpreterRequired === 'yes' ? 'Yes' : 'No'}`, margin, yPosition);
  yPosition += 8;

  if (data.interpreterRequired === 'yes') {
    pdf.text(`Interpreter Name: ${data.interpreterName || 'N/A'}`, margin, yPosition);
    yPosition += 6;
    pdf.text(`Credential/ID: ${data.interpreterCredential || 'N/A'}`, margin, yPosition);
    yPosition += 6;
  }

  yPosition += 10;

  // Acknowledgment box
  pdf.setDrawColor(55, 91, 220);
  pdf.setFillColor(240, 245, 255);
  pdf.setLineWidth(0.4);
  const ackBoxHeight = 25;
  pdf.roundedRect(margin, yPosition, pageWidth - 2 * margin, ackBoxHeight, 2, 2, 'FD');
  yPosition += 6;

  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(55, 91, 220);
  pdf.text('Patient Acknowledgment', margin + 3, yPosition);
  yPosition += 8;

  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(0, 0, 0);
  const ackText = 'I confirm that I understand the language used in this consent form. If an interpreter was provided, I confirm that the interpreter accurately conveyed all information to me in my primary language.';
  const ackLines = pdf.splitTextToSize(ackText, pageWidth - 2 * margin - 10);
  ackLines.forEach((line: string) => {
    pdf.text(line, margin + 3, yPosition);
    yPosition += 5;
  });

  yPosition += 10;

  // Patient Initials Signature Section for Page 2
  const signatureLineStart = pageWidth - margin - 70;
  const signatureLineEnd = pageWidth - margin - 5;
  const signatureLineCenter = (signatureLineStart + signatureLineEnd) / 2;

  // Add signature above the line
  if (data.patientInfoInitials) {
    try {
      pdf.addImage(data.patientInfoInitials, 'PNG', signatureLineCenter - 27.5, yPosition, 55, 15);
    } catch (error) {
      console.error('Error adding patient info initials:', error);
    }
  }
  yPosition += 16;

  // Draw line
  pdf.setDrawColor(100, 100, 100);
  pdf.setLineWidth(0.2);
  pdf.line(signatureLineStart, yPosition, signatureLineEnd, yPosition);
  yPosition += 4;

  // Add "Patient Signature" text centered below the line
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(0, 0, 0);
  pdf.text('Patient Signature', signatureLineCenter, yPosition, { align: 'center' });

  // Draw watermark on top of page 2 content
  addWatermarkOnTop(pdf, pageWidth, pageHeight, watermarkImg);

  // PAGE 3: Treatment Description & Alternatives
  pdf.addPage();
  addWatermark(pdf, pageWidth, pageHeight, watermarkImg);
  addHeaderAndFooter(pdf, pageWidth, pageHeight, margin, data.date, logoImg, null, logoHeight);

  yPosition = topMargin + logoHeight + 1 + 8 + 6 + 6 + 10;

  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(55, 91, 220);
  pdf.text('Treatment Description & Alternatives', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 12;

  // Treatment Arch Selection
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(0, 0, 0);
  pdf.text('Treatment Arch Selection', margin, yPosition);
  yPosition += 8;

  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Which arch(es) require treatment?', margin, yPosition);
  yPosition += 6;

  const archTypeText = data.archType === 'upper' ? 'Upper Arch Only' :
                       data.archType === 'lower' ? 'Lower Arch Only' :
                       (data.archType === 'both' || data.archType === 'dual') ? 'Dual Arch (Both)' : 'Not specified';
  pdf.setFont('helvetica', 'bold');
  pdf.text(archTypeText, margin + 5, yPosition);
  yPosition += 12;

  const isDualArch = data.archType === 'both' || data.archType === 'dual';

  // Dual Arch Layout - Side by Side
  if (isDualArch) {
    const boxHeight = 40  ;
    const columnWidth = (pageWidth - 2 * margin - 5) / 2; // 5mm gap between columns
    const leftColumnX = margin;
    const rightColumnX = margin + columnWidth + 5;
    const startY = yPosition;

    // Upper Arch Treatment Details - Left Column
    pdf.setDrawColor(55, 91, 220);
    pdf.setFillColor(240, 245, 255);
    pdf.setLineWidth(0.4);
    pdf.roundedRect(leftColumnX, startY, columnWidth, boxHeight, 2, 2, 'FD');

    let upperY = startY + 6;
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(55, 91, 220);
    pdf.text('Upper Arch Treatment Details', leftColumnX + 3, upperY);
    upperY += 7;

    pdf.setFontSize(8);
    pdf.setTextColor(0, 0, 0);

    // Treatment Type
    pdf.setFont('helvetica', 'bold');
    pdf.text('Treatment Type:', leftColumnX + 3, upperY);
    pdf.setFont('helvetica', 'normal');
    pdf.text(data.upperTreatmentType || 'N/A', leftColumnX + 30, upperY);
    upperY += 4;

    // Teeth/Regions
    pdf.setFont('helvetica', 'bold');
    pdf.text('Teeth/Regions:', leftColumnX + 3, upperY);
    pdf.setFont('helvetica', 'normal');
    pdf.text(data.upperTeethRegions || 'N/A', leftColumnX + 30, upperY);
    upperY += 4;

    // # Implants
    pdf.setFont('helvetica', 'bold');
    pdf.text('# Implants:', leftColumnX + 3, upperY);
    pdf.setFont('helvetica', 'normal');
    pdf.text(data.upperImplants || 'N/A', leftColumnX + 30, upperY);
    upperY += 4;

    // Graft Material
    pdf.setFont('helvetica', 'bold');
    pdf.text('Graft Material:', leftColumnX + 3, upperY);
    pdf.setFont('helvetica', 'normal');
    const upperGraftMaterials = [];
    if (data.upperGraftMaterial?.allograft) upperGraftMaterials.push('Allograft');
    if (data.upperGraftMaterial?.xenograft) upperGraftMaterials.push('Xenograft');
    if (data.upperGraftMaterial?.autograft) upperGraftMaterials.push('Autograft');
    if (data.upperGraftMaterial?.prf) upperGraftMaterials.push('PRF');
    pdf.text(upperGraftMaterials.length > 0 ? upperGraftMaterials.join(', ') : 'N/A', leftColumnX + 30, upperY);
    upperY += 4;

    // Prosthesis
    pdf.setFont('helvetica', 'bold');
    pdf.text('Prosthesis:', leftColumnX + 3, upperY);
    pdf.setFont('helvetica', 'normal');
    const upperProsthesis = [];
    if (data.upperProsthesis?.zirconia) upperProsthesis.push('Fixed Zirconia Bridge');
    if (data.upperProsthesis?.overdenture) upperProsthesis.push('Removable Overdenture');
    pdf.text(upperProsthesis.length > 0 ? upperProsthesis.join(', ') : 'N/A', leftColumnX + 30, upperY);
    upperY += 4;

    // Same-day Load
    pdf.setFont('helvetica', 'bold');
    pdf.text('Same-day Load:', leftColumnX + 3, upperY);
    pdf.setFont('helvetica', 'normal');
    pdf.text(data.upperSameDayLoad === 'yes' ? 'Yes' : data.upperSameDayLoad === 'no' ? 'No' : 'N/A', leftColumnX + 30, upperY);

    // Lower Arch Treatment Details - Right Column
    pdf.setDrawColor(55, 91, 220);
    pdf.setFillColor(240, 245, 255);
    pdf.setLineWidth(0.4);
    pdf.roundedRect(rightColumnX, startY, columnWidth, boxHeight, 2, 2, 'FD');

    let lowerY = startY + 6;
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(55, 91, 220);
    pdf.text('Lower Arch Treatment Details', rightColumnX + 3, lowerY);
    lowerY += 7;

    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(0, 0, 0);

    // Treatment Type
    pdf.setFont('helvetica', 'bold');
    pdf.text('Treatment Type:', rightColumnX + 3, lowerY);
    pdf.setFont('helvetica', 'normal');
    pdf.text(data.lowerTreatmentType || 'N/A', rightColumnX + 30, lowerY);
    lowerY += 4;

    // Teeth/Regions
    pdf.setFont('helvetica', 'bold');
    pdf.text('Teeth/Regions:', rightColumnX + 3, lowerY);
    pdf.setFont('helvetica', 'normal');
    pdf.text(data.lowerTeethRegions || 'N/A', rightColumnX + 30, lowerY);
    lowerY += 4;

    // # Implants
    pdf.setFont('helvetica', 'bold');
    pdf.text('# Implants:', rightColumnX + 3, lowerY);
    pdf.setFont('helvetica', 'normal');
    pdf.text(data.lowerImplants || 'N/A', rightColumnX + 30, lowerY);
    lowerY += 4;

    // Graft Material
    pdf.setFont('helvetica', 'bold');
    pdf.text('Graft Material:', rightColumnX + 3, lowerY);
    pdf.setFont('helvetica', 'normal');
    const lowerGraftMaterials = [];
    if (data.lowerGraftMaterial?.allograft) lowerGraftMaterials.push('Allograft');
    if (data.lowerGraftMaterial?.xenograft) lowerGraftMaterials.push('Xenograft');
    if (data.lowerGraftMaterial?.autograft) lowerGraftMaterials.push('Autograft');
    if (data.lowerGraftMaterial?.prf) lowerGraftMaterials.push('PRF');
    pdf.text(lowerGraftMaterials.length > 0 ? lowerGraftMaterials.join(', ') : 'N/A', rightColumnX + 30, lowerY);
    lowerY += 4;

    // Prosthesis
    pdf.setFont('helvetica', 'bold');
    pdf.text('Prosthesis:', rightColumnX + 3, lowerY);
    pdf.setFont('helvetica', 'normal');
    const lowerProsthesis = [];
    if (data.lowerProsthesis?.zirconia) lowerProsthesis.push('Fixed Zirconia Bridge');
    if (data.lowerProsthesis?.overdenture) lowerProsthesis.push('Removable Overdenture');
    pdf.text(lowerProsthesis.length > 0 ? lowerProsthesis.join(', ') : 'N/A', rightColumnX + 30, lowerY);
    lowerY += 4;

    // Same-day Load
    pdf.setFont('helvetica', 'bold');
    pdf.text('Same-day Load:', rightColumnX + 3, lowerY);
    pdf.setFont('helvetica', 'normal');
    pdf.text(data.lowerSameDayLoad === 'yes' ? 'Yes' : data.lowerSameDayLoad === 'no' ? 'No' : 'N/A', rightColumnX + 30, lowerY);

    yPosition = startY + boxHeight + 5;
  }
  // Single Arch Layout - Full Width
  else {
    const boxHeight = 40;
    const startY = yPosition;

    // Upper Arch Treatment Details (if applicable)
    if (data.archType === 'upper') {
      pdf.setDrawColor(55, 91, 220);
      pdf.setFillColor(240, 245, 255);
      pdf.setLineWidth(0.4);
      pdf.roundedRect(margin, startY, pageWidth - 2 * margin, boxHeight, 2, 2, 'FD');

      let upperY = startY + 6;
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(55, 91, 220);
      pdf.text('Upper Arch Treatment Details', margin + 3, upperY);
      upperY += 7;

      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(0, 0, 0);

      // Treatment Type
      pdf.setFont('helvetica', 'bold');
      pdf.text('Treatment Type:', margin + 3, upperY);
      pdf.setFont('helvetica', 'normal');
      pdf.text(data.upperTreatmentType || 'N/A', margin + 30, upperY);
      upperY += 4;

      // Teeth/Regions
      pdf.setFont('helvetica', 'bold');
      pdf.text('Teeth/Regions:', margin + 3, upperY);
      pdf.setFont('helvetica', 'normal');
      pdf.text(data.upperTeethRegions || 'N/A', margin + 30, upperY);
      upperY += 4;

      // # Implants
      pdf.setFont('helvetica', 'bold');
      pdf.text('# Implants:', margin + 3, upperY);
      pdf.setFont('helvetica', 'normal');
      pdf.text(data.upperImplants || 'N/A', margin + 30, upperY);
      upperY += 4;

      // Graft Material
      pdf.setFont('helvetica', 'bold');
      pdf.text('Graft Material:', margin + 3, upperY);
      pdf.setFont('helvetica', 'normal');
      const upperGraftMaterials = [];
      if (data.upperGraftMaterial?.allograft) upperGraftMaterials.push('Allograft');
      if (data.upperGraftMaterial?.xenograft) upperGraftMaterials.push('Xenograft');
      if (data.upperGraftMaterial?.autograft) upperGraftMaterials.push('Autograft');
      if (data.upperGraftMaterial?.prf) upperGraftMaterials.push('PRF');
      pdf.text(upperGraftMaterials.length > 0 ? upperGraftMaterials.join(', ') : 'N/A', margin + 30, upperY);
      upperY += 4;

      // Prosthesis
      pdf.setFont('helvetica', 'bold');
      pdf.text('Prosthesis:', margin + 3, upperY);
      pdf.setFont('helvetica', 'normal');
      const upperProsthesis = [];
      if (data.upperProsthesis?.zirconia) upperProsthesis.push('Fixed Zirconia Bridge');
      if (data.upperProsthesis?.overdenture) upperProsthesis.push('Removable Overdenture');
      pdf.text(upperProsthesis.length > 0 ? upperProsthesis.join(', ') : 'N/A', margin + 30, upperY);
      upperY += 4;

      // Same-day Load
      pdf.setFont('helvetica', 'bold');
      pdf.text('Same-day Load:', margin + 3, upperY);
      pdf.setFont('helvetica', 'normal');
      pdf.text(data.upperSameDayLoad === 'yes' ? 'Yes' : data.upperSameDayLoad === 'no' ? 'No' : 'N/A', margin + 30, upperY);

      yPosition = startY + boxHeight + 5;
    }

    // Lower Arch Treatment Details (if applicable)
    if (data.archType === 'lower') {
      pdf.setDrawColor(55, 91, 220);
      pdf.setFillColor(240, 245, 255);
      pdf.setLineWidth(0.4);
      pdf.roundedRect(margin, startY, pageWidth - 2 * margin, boxHeight, 2, 2, 'FD');

      let lowerY = startY + 6;
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(55, 91, 220);
      pdf.text('Lower Arch Treatment Details', margin + 3, lowerY);
      lowerY += 7;

      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(0, 0, 0);

      // Treatment Type
      pdf.setFont('helvetica', 'bold');
      pdf.text('Treatment Type:', margin + 3, lowerY);
      pdf.setFont('helvetica', 'normal');
      pdf.text(data.lowerTreatmentType || 'N/A', margin + 30, lowerY);
      lowerY += 4;

      // Teeth/Regions
      pdf.setFont('helvetica', 'bold');
      pdf.text('Teeth/Regions:', margin + 3, lowerY);
      pdf.setFont('helvetica', 'normal');
      pdf.text(data.lowerTeethRegions || 'N/A', margin + 30, lowerY);
      lowerY += 4;

      // # Implants
      pdf.setFont('helvetica', 'bold');
      pdf.text('# Implants:', margin + 3, lowerY);
      pdf.setFont('helvetica', 'normal');
      pdf.text(data.lowerImplants || 'N/A', margin + 30, lowerY);
      lowerY += 4;

      // Graft Material
      pdf.setFont('helvetica', 'bold');
      pdf.text('Graft Material:', margin + 3, lowerY);
      pdf.setFont('helvetica', 'normal');
      const lowerGraftMaterials = [];
      if (data.lowerGraftMaterial?.allograft) lowerGraftMaterials.push('Allograft');
      if (data.lowerGraftMaterial?.xenograft) lowerGraftMaterials.push('Xenograft');
      if (data.lowerGraftMaterial?.autograft) lowerGraftMaterials.push('Autograft');
      if (data.lowerGraftMaterial?.prf) lowerGraftMaterials.push('PRF');
      pdf.text(lowerGraftMaterials.length > 0 ? lowerGraftMaterials.join(', ') : 'N/A', margin + 30, lowerY);
      lowerY += 4;

      // Prosthesis
      pdf.setFont('helvetica', 'bold');
      pdf.text('Prosthesis:', margin + 3, lowerY);
      pdf.setFont('helvetica', 'normal');
      const lowerProsthesis = [];
      if (data.lowerProsthesis?.zirconia) lowerProsthesis.push('Fixed Zirconia Bridge');
      if (data.lowerProsthesis?.overdenture) lowerProsthesis.push('Removable Overdenture');
      pdf.text(lowerProsthesis.length > 0 ? lowerProsthesis.join(', ') : 'N/A', margin + 30, lowerY);
      lowerY += 4;

      // Same-day Load
      pdf.setFont('helvetica', 'bold');
      pdf.text('Same-day Load:', margin + 3, lowerY);
      pdf.setFont('helvetica', 'normal');
      pdf.text(data.lowerSameDayLoad === 'yes' ? 'Yes' : data.lowerSameDayLoad === 'no' ? 'No' : 'N/A', margin + 30, lowerY);

      yPosition = startY + boxHeight + 5;
    }
  }

  yPosition += 10;

  // Sedation Plan Section
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(0, 0, 0);
  pdf.text('Sedation Plan:', margin, yPosition);

  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  const sedationOptions = [];
  if (data.sedationPlan?.localOnly) sedationOptions.push('Local only');
  if (data.sedationPlan?.nitrous) sedationOptions.push('Nitrous');
  if (data.sedationPlan?.ivConscious) sedationOptions.push('IV conscious');
  if (data.sedationPlan?.generalHospital) sedationOptions.push('General (hospital)');

  const sedationPlanText = sedationOptions.length > 0 ? sedationOptions.join(', ') : 'Not specified';
  pdf.text(sedationPlanText, margin + 35, yPosition);
  yPosition += 8;

  // ASA Physical Status Section
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(0, 0, 0);
  pdf.text('ASA Physical Status:', margin, yPosition);

  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  pdf.text(data.asaPhysicalStatus || 'Not specified', margin + 45, yPosition);
  yPosition += 8;

  // Planned Drugs Section
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(0, 0, 0);
  pdf.text('Planned Drugs:', margin, yPosition);

  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  const plannedDrugs = [];
  if (data.plannedDrugs?.midazolam) plannedDrugs.push('Midazolam');
  if (data.plannedDrugs?.fentanyl) plannedDrugs.push('Fentanyl');
  if (data.plannedDrugs?.ketamine) plannedDrugs.push('Ketamine');
  if (data.plannedDrugs?.dexamethasone) plannedDrugs.push('Dexamethasone');
  if (data.plannedDrugs?.versed) plannedDrugs.push('Versed');
  if (data.plannedDrugs?.ketorolac) plannedDrugs.push('Ketorolac');
  if (data.plannedDrugs?.benadryl) plannedDrugs.push('Benadryl');
  if (data.plannedDrugs?.acetaminophen) plannedDrugs.push('Acetaminophen');
  if (data.plannedDrugs?.valium) plannedDrugs.push('Valium');
  if (data.plannedDrugs?.clindamycin) plannedDrugs.push('Clindamycin');
  if (data.plannedDrugs?.lidocaine) plannedDrugs.push('Lidocaine');

  const drugsText = plannedDrugs.length > 0 ? plannedDrugs.join(', ') : 'None selected';
  pdf.text(drugsText, margin + 35, yPosition);
  yPosition += 12;

  // Reasonable Alternatives Discussed Section
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(0, 0, 0);
  pdf.text('Reasonable Alternatives Discussed (patient to initial each):', margin, yPosition);
  yPosition += 7;

  // Alternative 1: No treatment
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(0, 0, 0);
  pdf.text('No treatment, with progressive bone loss and prosthesis instability explained', margin, yPosition);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Initial:', pageWidth - margin - 35, yPosition);
  pdf.setFont('helvetica', 'normal');

  // Draw underline for initial input
  const initial1X = pageWidth - margin - 20;
  pdf.setDrawColor(100, 100, 100);
  pdf.setLineWidth(0.2);
  pdf.line(initial1X, yPosition + 1, initial1X + 15, yPosition + 1);
  pdf.text(data.alternativesInitials?.noTreatment || '', initial1X + 2, yPosition);
  yPosition += 5;

  // Alternative 2: Conventional complete dentures
  pdf.setFont('helvetica', 'normal');
  pdf.text('Conventional complete dentures (lower stability limitations reviewed)', margin, yPosition);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Initial:', pageWidth - margin - 35, yPosition);
  pdf.setFont('helvetica', 'normal');

  const initial2X = pageWidth - margin - 20;
  pdf.line(initial2X, yPosition + 1, initial2X + 15, yPosition + 1);
  pdf.text(data.alternativesInitials?.conventionalDentures || '', initial2X + 2, yPosition);
  yPosition += 5;

  // Alternative 3: Segmented extraction/implant staging
  pdf.setFont('helvetica', 'normal');
  pdf.text('Segmented extraction/implant staging to preserve select teeth', margin, yPosition);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Initial:', pageWidth - margin - 35, yPosition);
  pdf.setFont('helvetica', 'normal');

  const initial3X = pageWidth - margin - 20;
  pdf.line(initial3X, yPosition + 1, initial3X + 15, yPosition + 1);
  pdf.text(data.alternativesInitials?.segmentedExtraction || '', initial3X + 2, yPosition);
  yPosition += 5;

  // Alternative 4: Removable implant-supported overdentures
  pdf.setFont('helvetica', 'normal');
  pdf.text('Removable implant-supported overdentures (locator/bar)', margin, yPosition);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Initial:', pageWidth - margin - 35, yPosition);
  pdf.setFont('helvetica', 'normal');

  const initial4X = pageWidth - margin - 20;
  pdf.line(initial4X, yPosition + 1, initial4X + 15, yPosition + 1);
  pdf.text(data.alternativesInitials?.removableOverdentures || '', initial4X + 2, yPosition);
  yPosition += 5;

  // Alternative 5: Referral for graft-less zygomatic or pterygoid implants
  pdf.setFont('helvetica', 'normal');
  pdf.text('Referral for graft-less zygomatic or pterygoid implants if indicated', margin, yPosition);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Initial:', pageWidth - margin - 35, yPosition);
  pdf.setFont('helvetica', 'normal');

  const initial5X = pageWidth - margin - 20;
  pdf.line(initial5X, yPosition + 1, initial5X + 15, yPosition + 1);
  pdf.text(data.alternativesInitials?.zygomaticImplants || '', initial5X + 2, yPosition);
  yPosition += 10;

  // Patient Initials Signature Section for Page 3 (Treatment Section)
  const treatmentSignatureLineStart = pageWidth - margin - 70;
  const treatmentSignatureLineEnd = pageWidth - margin - 5;
  const treatmentSignatureLineCenter = (treatmentSignatureLineStart + treatmentSignatureLineEnd) / 2;

  // Add signature above the line
  if (data.treatmentDescriptionInitials) {
    try {
      pdf.addImage(data.treatmentDescriptionInitials, 'PNG', treatmentSignatureLineCenter - 27.5, yPosition, 55, 15);
    } catch (error) {
      console.error('Error adding treatment description initials:', error);
    }
  }
  yPosition += 16;

  // Draw line
  pdf.setDrawColor(100, 100, 100);
  pdf.setLineWidth(0.2);
  pdf.line(treatmentSignatureLineStart, yPosition, treatmentSignatureLineEnd, yPosition);
  yPosition += 4;

  // Add "Patient Signature" text centered below the line
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(0, 0, 0);
  pdf.text('Patient Signature', treatmentSignatureLineCenter, yPosition, { align: 'center' });

  // Draw watermark on top of page 3 content
  addWatermarkOnTop(pdf, pageWidth, pageHeight, watermarkImg);

  // PAGE 4: Risks & Complications
  pdf.addPage();
  addWatermark(pdf, pageWidth, pageHeight, watermarkImg);
  addHeaderAndFooter(pdf, pageWidth, pageHeight, margin, data.date, logoImg, null, logoHeight);

  yPosition = topMargin + logoHeight + 1 + 8 + 6 + 6 + 10;

  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(55, 91, 220);
  pdf.text('Material Risks (estimated incidence shown)', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 12;

  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(0, 0, 0);

  // Define risks in a 2-column layout
  const risks = [
    { title: 'Early implant loss (< 1 yr)', rate: '2-5%', note: 'may require removal & re-placement' },
    { title: 'Permanent lower-lip/chin numbness', rate: '<= 2%', note: 'inferior alveolar nerve proximity' },
    { title: 'Sinus perforation -> chronic sinusitis', rate: '1-3% (upper arch)', note: 'may need ENT repair' },
    { title: 'Jaw fracture', rate: '< 0.5%', note: 'severely atrophic bone' },
    { title: 'Infection requiring IV antibiotics', rate: '1-4%', note: 'higher in smokers/uncontrolled DM' },
    { title: 'IV-sedation airway compromise', rate: '0.1-0.3%', note: 'emergency airway equipment on site' }
  ];

  // Two-column layout for risks
  const columnWidth = (pageWidth - 2 * margin - 5) / 2;
  const leftColumnX = margin;
  const rightColumnX = margin + columnWidth + 5;
  const boxHeight = 15;

  for (let i = 0; i < risks.length; i += 2) {
    // Left column risk
    const leftRisk = risks[i];
    pdf.setDrawColor(200, 220, 255);
    pdf.setFillColor(240, 245, 255);
    pdf.setLineWidth(0.3);
    pdf.roundedRect(leftColumnX, yPosition, columnWidth, boxHeight, 2, 2, 'FD');

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8);
    pdf.text(leftRisk.title, leftColumnX + 2, yPosition + 4);

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(7);
    pdf.setTextColor(55, 91, 220);
    pdf.text(leftRisk.rate, leftColumnX + columnWidth - 2, yPosition + 4, { align: 'right' });

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7);
    pdf.setTextColor(100, 100, 100);
    pdf.text(leftRisk.note, leftColumnX + 2, yPosition + 9);
    pdf.setTextColor(0, 0, 0);

    // Right column risk (if exists)
    if (i + 1 < risks.length) {
      const rightRisk = risks[i + 1];
      pdf.setDrawColor(200, 220, 255);
      pdf.setFillColor(240, 245, 255);
      pdf.roundedRect(rightColumnX, yPosition, columnWidth, boxHeight, 2, 2, 'FD');

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(8);
      pdf.text(rightRisk.title, rightColumnX + 2, yPosition + 4);

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(7);
      pdf.setTextColor(55, 91, 220);
      pdf.text(rightRisk.rate, rightColumnX + columnWidth - 2, yPosition + 4, { align: 'right' });

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(7);
      pdf.setTextColor(100, 100, 100);
      pdf.text(rightRisk.note, rightColumnX + 2, yPosition + 9);
      pdf.setTextColor(0, 0, 0);
    }

    yPosition += boxHeight + 3;
  }

  // Hospital admission / death - full width
  pdf.setDrawColor(200, 220, 255);
  pdf.setFillColor(240, 245, 255);
  pdf.roundedRect(margin, yPosition, pageWidth - 2 * margin, boxHeight, 2, 2, 'FD');

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8);
  pdf.text('Hospital admission / death', margin + 2, yPosition + 4);

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(7);
  pdf.setTextColor(55, 91, 220);
  pdf.text('< 0.05%', pageWidth - margin - 2, yPosition + 4, { align: 'right' });

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(7);
  pdf.setTextColor(100, 100, 100);
  pdf.text('reported in national databases', margin + 2, yPosition + 9);
  pdf.setTextColor(0, 0, 0);

  yPosition += boxHeight + 8;

  // Acknowledgment checkbox
  pdf.setDrawColor(200, 220, 255);
  pdf.setFillColor(240, 245, 255);
  pdf.setLineWidth(0.4);
  const risksAckBoxHeight = 18;
  pdf.roundedRect(margin, yPosition, pageWidth - 2 * margin, risksAckBoxHeight, 2, 2, 'FD');

  // Checkbox
  const checkboxSize = 4;
  const checkboxX = margin + 3;
  const checkboxY = yPosition + 4;
  pdf.setDrawColor(55, 91, 220);
  pdf.setLineWidth(0.3);
  pdf.roundedRect(checkboxX, checkboxY, checkboxSize, checkboxSize, 0.5, 0.5, 'S');

  // Add checkmark if risksUnderstood is true
  if (data.risksUnderstood) {
    pdf.setDrawColor(55, 91, 220);
    pdf.setLineWidth(0.5);
    pdf.line(checkboxX + 0.5, checkboxY + 2, checkboxX + 1.5, checkboxY + 3.5);
    pdf.line(checkboxX + 1.5, checkboxY + 3.5, checkboxX + 3.5, checkboxY + 0.5);
  }

  // Wrap text properly
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  pdf.setTextColor(0, 0, 0);
  const risksAckText = 'I have had the opportunity to ask about each risk and understand that percentages are population estimates, not guarantees of my individual outcome.';
  const risksAckTextLines = pdf.splitTextToSize(risksAckText, pageWidth - 2 * margin - checkboxSize - 10);
  let risksAckTextY = yPosition + 5;
  risksAckTextLines.forEach((line: string) => {
    pdf.text(line, checkboxX + checkboxSize + 3, risksAckTextY);
    risksAckTextY += 4;
  });

  yPosition += risksAckBoxHeight + 6;

  // Patient Initials Signature Section for Page 4 (Material Risks)
  const risksSignatureLineStart = pageWidth - margin - 70;
  const risksSignatureLineEnd = pageWidth - margin - 5;
  const risksSignatureLineCenter = (risksSignatureLineStart + risksSignatureLineEnd) / 2;

  // Add signature above the line
  if (data.materialRisksInitials) {
    try {
      pdf.addImage(data.materialRisksInitials, 'PNG', risksSignatureLineCenter - 27.5, yPosition, 55, 15);
    } catch (error) {
      console.error('Error adding material risks initials:', error);
    }
  }
  yPosition += 16;

  // Draw line
  pdf.setDrawColor(100, 100, 100);
  pdf.setLineWidth(0.2);
  pdf.line(risksSignatureLineStart, yPosition, risksSignatureLineEnd, yPosition);
  yPosition += 4;

  // Add "Patient Signature" text centered below the line
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(0, 0, 0);
  pdf.text('Patient Signature', risksSignatureLineCenter, yPosition, { align: 'center' });

  // Draw watermark on top of page 4 content
  addWatermarkOnTop(pdf, pageWidth, pageHeight, watermarkImg);

  // PAGE 5: Sedation & Anesthesia
  pdf.addPage();
  addWatermark(pdf, pageWidth, pageHeight, watermarkImg);
  addHeaderAndFooter(pdf, pageWidth, pageHeight, margin, data.date, logoImg, null, logoHeight);

  yPosition = topMargin + logoHeight + 1 + 8 + 6 + 6 + 10;

  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(55, 91, 220);
  pdf.text('Sedation & Anesthesia Consent (if applicable)', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 12;

  // Pre-operative Instructions & Requirements Section
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(55, 91, 220);
  pdf.text('Pre-operative Instructions & Requirements', margin, yPosition);
  yPosition += 8;

  // Two-column layout for requirements
  const reqColumnWidth = (pageWidth - 2 * margin - 5) / 2;
  const reqLeftColumnX = margin;
  const reqRightColumnX = margin + reqColumnWidth + 5;
  const reqBoxHeight = 18;

  // Row 1: NPO Requirements and Escort Required
  // Left: NPO Requirements
  pdf.setDrawColor(200, 220, 255);
  pdf.setFillColor(240, 245, 255);
  pdf.setLineWidth(0.3);
  pdf.roundedRect(reqLeftColumnX, yPosition, reqColumnWidth, reqBoxHeight, 2, 2, 'FD');

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8);
  pdf.setTextColor(0, 0, 0);
  pdf.text('1  NPO Requirements', reqLeftColumnX + 2, yPosition + 5);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(7);
  pdf.setTextColor(100, 100, 100);
  pdf.text('NPO for 8 hours (liquids = clear only <= 2 hours)', reqLeftColumnX + 2, yPosition + 10);
  pdf.setTextColor(0, 0, 0);

  // Right: Escort Required
  pdf.setDrawColor(200, 220, 255);
  pdf.setFillColor(240, 245, 255);
  pdf.roundedRect(reqRightColumnX, yPosition, reqColumnWidth, reqBoxHeight, 2, 2, 'FD');

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8);
  pdf.text('2  Escort Required', reqRightColumnX + 2, yPosition + 5);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(7);
  pdf.setTextColor(100, 100, 100);
  const escortText = 'Responsible adult will remain on premises and supervise me for 24 hours';
  const escortLines = pdf.splitTextToSize(escortText, reqColumnWidth - 4);
  let escortY = yPosition + 10;
  escortLines.forEach((line: string) => {
    pdf.text(line, reqRightColumnX + 2, escortY);
    escortY += 4;
  });
  pdf.setTextColor(0, 0, 0);

  yPosition += reqBoxHeight + 3;

  // Row 2: Medication Disclosure and Emergency Protocols
  // Left: Medication Disclosure
  pdf.setDrawColor(200, 220, 255);
  pdf.setFillColor(240, 245, 255);
  pdf.roundedRect(reqLeftColumnX, yPosition, reqColumnWidth, reqBoxHeight, 2, 2, 'FD');

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8);
  pdf.text('3  Medication Disclosure', reqLeftColumnX + 2, yPosition + 5);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(7);
  pdf.setTextColor(100, 100, 100);
  pdf.text('All medications disclosed: complete & accurate', reqLeftColumnX + 2, yPosition + 10);
  pdf.setTextColor(0, 0, 0);

  // Right: Emergency Protocols
  pdf.setDrawColor(255, 200, 200);
  pdf.setFillColor(255, 240, 240);
  pdf.roundedRect(reqRightColumnX, yPosition, reqColumnWidth, reqBoxHeight, 2, 2, 'FD');

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8);
  pdf.setTextColor(200, 0, 0);
  pdf.text('4  Emergency Protocols', reqRightColumnX + 2, yPosition + 5);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(7);
  pdf.setTextColor(100, 100, 100);
  const emergencyText = 'Office holds ACLS equipment, reversal agents, and written EMS transfer protocol';
  const emergencyLines = pdf.splitTextToSize(emergencyText, reqColumnWidth - 4);
  let emergencyY = yPosition + 10;
  emergencyLines.forEach((line: string) => {
    pdf.text(line, reqRightColumnX + 2, emergencyY);
    emergencyY += 4;
  });
  pdf.setTextColor(0, 0, 0);

  yPosition += reqBoxHeight + 10;

  // Escort Information Section
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(55, 91, 220);
  pdf.text('Escort Information', margin, yPosition);
  yPosition += 8;

  pdf.setDrawColor(200, 220, 255);
  pdf.setFillColor(240, 245, 255);
  pdf.setLineWidth(0.3);
  pdf.roundedRect(margin, yPosition, pageWidth - 2 * margin, 15, 2, 2, 'FD');

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8);
  pdf.setTextColor(0, 0, 0);
  pdf.text('Escort Name:', margin + 3, yPosition + 5);
  pdf.text('Escort Mobile #:', margin + 3, yPosition + 11);

  pdf.setFont('helvetica', 'normal');
  pdf.text(data.escortName || 'N/A', margin + 30, yPosition + 5);
  pdf.text(data.escortPhone ? `+1 ${data.escortPhone}` : 'N/A', margin + 30, yPosition + 11);

  yPosition += 20;

  // Patient Acknowledgments Section
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(55, 91, 220);
  pdf.text('Patient Acknowledgments', margin, yPosition);
  yPosition += 8;

  // Medications disclosed checkbox
  const ackBoxHeight1 = 18;
  pdf.setDrawColor(200, 220, 255);
  pdf.setFillColor(255, 255, 255);
  pdf.setLineWidth(0.3);
  pdf.roundedRect(margin, yPosition, pageWidth - 2 * margin, ackBoxHeight1, 2, 2, 'FD');

  // Checkbox for medications disclosed
  const medCheckboxSize = 4;
  const medCheckboxX = margin + 3;
  const medCheckboxY = yPosition + 4;
  pdf.setDrawColor(100, 200, 100);
  pdf.setLineWidth(0.3);
  pdf.roundedRect(medCheckboxX, medCheckboxY, medCheckboxSize, medCheckboxSize, 0.5, 0.5, 'S');

  // Add checkmark if medicationsDisclosed is true
  if (data.medicationsDisclosed) {
    pdf.setDrawColor(0, 150, 0);
    pdf.setLineWidth(0.5);
    pdf.line(medCheckboxX + 0.5, medCheckboxY + 2, medCheckboxX + 1.5, medCheckboxY + 3.5);
    pdf.line(medCheckboxX + 1.5, medCheckboxY + 3.5, medCheckboxX + 3.5, medCheckboxY + 0.5);
  }

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8);
  pdf.setTextColor(0, 0, 0);
  pdf.text('Medications disclosed: complete & accurate', medCheckboxX + medCheckboxSize + 3, yPosition + 6);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(7);
  pdf.setTextColor(100, 100, 100);
  const medText = 'I confirm that I have provided a complete and accurate list of all medications, supplements, and substances I am currently taking.';
  const medTextLines = pdf.splitTextToSize(medText, pageWidth - 2 * margin - medCheckboxSize - 10);
  let medTextY = yPosition + 11;
  medTextLines.forEach((line: string) => {
    pdf.text(line, medCheckboxX + medCheckboxSize + 3, medTextY);
    medTextY += 3.5;
  });
  pdf.setTextColor(0, 0, 0);

  yPosition += ackBoxHeight1 + 3;

  // Decline IV sedation checkbox
  const ackBoxHeight2 = 18;
  pdf.setDrawColor(200, 220, 255);
  pdf.setFillColor(255, 255, 255);
  pdf.roundedRect(margin, yPosition, pageWidth - 2 * margin, ackBoxHeight2, 2, 2, 'FD');

  // Checkbox for decline IV sedation
  const ivCheckboxSize = 4;
  const ivCheckboxX = margin + 3;
  const ivCheckboxY = yPosition + 4;
  pdf.setDrawColor(100, 200, 100);
  pdf.setLineWidth(0.3);
  pdf.roundedRect(ivCheckboxX, ivCheckboxY, ivCheckboxSize, ivCheckboxSize, 0.5, 0.5, 'S');

  // Add checkmark if declineIVSedation is true
  if (data.declineIVSedation) {
    pdf.setDrawColor(0, 150, 0);
    pdf.setLineWidth(0.5);
    pdf.line(ivCheckboxX + 0.5, ivCheckboxY + 2, ivCheckboxX + 1.5, ivCheckboxY + 3.5);
    pdf.line(ivCheckboxX + 1.5, ivCheckboxY + 3.5, ivCheckboxX + 3.5, ivCheckboxY + 0.5);
  }

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8);
  pdf.setTextColor(0, 0, 0);
  pdf.text('I decline IV sedation and elect local anesthesia only', ivCheckboxX + ivCheckboxSize + 3, yPosition + 6);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(7);
  pdf.setTextColor(100, 100, 100);
  const ivText = 'I understand the benefits of IV sedation but choose to proceed with local anesthesia only for my treatment.';
  const ivTextLines = pdf.splitTextToSize(ivText, pageWidth - 2 * margin - ivCheckboxSize - 10);
  let ivTextY = yPosition + 11;
  ivTextLines.forEach((line: string) => {
    pdf.text(line, ivCheckboxX + ivCheckboxSize + 3, ivTextY);
    ivTextY += 3.5;
  });
  pdf.setTextColor(0, 0, 0);

  yPosition += ackBoxHeight2 + 8;

  // Patient Initials Signature Section for Page 5 (Sedation)
  const sedationSignatureLineStart = pageWidth - margin - 70;
  const sedationSignatureLineEnd = pageWidth - margin - 5;
  const sedationSignatureLineCenter = (sedationSignatureLineStart + sedationSignatureLineEnd) / 2;

  // Add signature above the line
  if (data.sedationInitials) {
    try {
      pdf.addImage(data.sedationInitials, 'PNG', sedationSignatureLineCenter - 27.5, yPosition, 55, 15);
    } catch (error) {
      console.error('Error adding sedation initials:', error);
    }
  }
  yPosition += 16;

  // Draw line
  pdf.setDrawColor(100, 100, 100);
  pdf.setLineWidth(0.2);
  pdf.line(sedationSignatureLineStart, yPosition, sedationSignatureLineEnd, yPosition);
  yPosition += 4;

  // Add "Patient Initials" text centered below the line
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(0, 0, 0);
  pdf.text('Patient Initials', sedationSignatureLineCenter, yPosition, { align: 'center' });

  // Draw watermark on top of page 5 content
  addWatermarkOnTop(pdf, pageWidth, pageHeight, watermarkImg);

  // Continue with remaining pages...
  addFinancialPage(pdf, data, pageWidth, pageHeight, margin, logoImg, watermarkImg, logoHeight);
  addMediaPage(pdf, data, pageWidth, pageHeight, margin, logoImg, watermarkImg, logoHeight);
  addOpioidPage(pdf, data, pageWidth, pageHeight, margin, logoImg, watermarkImg, logoHeight);
  addFinalSignaturesPage(pdf, data, pageWidth, pageHeight, margin, logoImg, watermarkImg, logoHeight);

  // Add page numbers to all pages
  addPageNumbers(pdf, pageWidth, pageHeight, margin);

  // Save PDF
  pdf.save(`Consent_Full_Arch_${data.patientName.replace(/\s+/g, '_')}_${data.date}.pdf`);
}

/**
 * Add page numbers to all pages (called at the end)
 */
function addPageNumbers(
  pdf: jsPDF,
  pageWidth: number,
  pageHeight: number,
  margin: number
) {
  const totalPages = pdf.internal.pages.length - 1;

  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);

    const footerY = pageHeight - margin - 5;

    // Add page number
    pdf.setFontSize(8);
    pdf.setFont('Fira Sans', 'normal');
    pdf.setTextColor(0, 0, 0);
    const pageNumberText = `${i} of ${totalPages}`;
    pdf.text(pageNumberText, pageWidth - margin - 5, footerY - 3, { align: 'right' });
  }
}

/**
 * Add Financial Page
 */
function addFinancialPage(
  pdf: jsPDF,
  data: ConsentFullArchPdfData,
  pageWidth: number,
  pageHeight: number,
  margin: number,
  logoImg: HTMLImageElement | null,
  watermarkImg: HTMLImageElement | null,
  logoHeight: number
) {
  pdf.addPage();
  addWatermark(pdf, pageWidth, pageHeight, watermarkImg);
  addHeaderAndFooter(pdf, pageWidth, pageHeight, margin, data.date, logoImg, null, logoHeight);

  const topMargin = 5;
  let yPosition = topMargin + logoHeight + 1 + 8 + 6 + 6 + 10;

  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(55, 91, 220);
  pdf.text('Financial Disclosure & Surprise-Bill Notice', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 12;

  // Treatment Cost Breakdown Section
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(55, 91, 220);
  pdf.text('Treatment Cost Breakdown', margin, yPosition);
  yPosition += 8;

  // Table header
  pdf.setFontSize(7);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(0, 0, 0);

  const col1X = margin;
  const col2X = margin + 50;
  const col3X = margin + 65;
  const col4X = margin + 90;
  const col5X = margin + 115;

  pdf.text('Procedure', col1X, yPosition);
  pdf.text('Codes', col2X, yPosition);
  pdf.text('Count', col3X, yPosition);
  pdf.text('Est. Fee', col4X, yPosition);
  pdf.text('Covered?', col5X, yPosition);
  yPosition += 5;

  // Draw header line
  pdf.setDrawColor(200, 200, 200);
  pdf.setLineWidth(0.2);
  pdf.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 4;

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(7);

  // Row 1: Surgical Extractions
  pdf.setDrawColor(200, 220, 255);
  pdf.setFillColor(240, 245, 255);
  pdf.roundedRect(margin, yPosition, pageWidth - 2 * margin, 10, 2, 2, 'FD');

  pdf.setTextColor(0, 0, 0);
  pdf.text('Surgical Extractions', col1X + 1, yPosition + 4);
  pdf.setFontSize(6);
  pdf.setTextColor(100, 100, 100);
  pdf.text('CDT: D7140', col2X + 1, yPosition + 3);
  pdf.text('CPT: 41899', col2X + 1, yPosition + 7);
  pdf.setFontSize(7);
  pdf.setTextColor(0, 0, 0);
  pdf.text(data.surgicalExtractions?.count || 'N/A', col3X + 1, yPosition + 5);
  pdf.text(data.surgicalExtractions?.fee ? `$${data.surgicalExtractions.fee}` : 'N/A', col4X + 1, yPosition + 5);

  // Coverage indicator
  if (data.surgicalExtractions?.covered === 'yes') {
    pdf.setFillColor(0, 150, 0);
    pdf.circle(col5X + 8, yPosition + 4, 2, 'F');
    pdf.setFontSize(6);
    pdf.text('Yes', col5X + 12, yPosition + 5);
  } else if (data.surgicalExtractions?.covered === 'no') {
    pdf.setFillColor(200, 0, 0);
    pdf.circle(col5X + 8, yPosition + 4, 2, 'F');
    pdf.setFontSize(6);
    pdf.text('No', col5X + 12, yPosition + 5);
  }

  yPosition += 12;

  // Row 2: Endosteal implants
  pdf.setDrawColor(200, 220, 255);
  pdf.setFillColor(255, 255, 255);
  pdf.roundedRect(margin, yPosition, pageWidth - 2 * margin, 10, 2, 2, 'FD');

  pdf.setFontSize(7);
  pdf.setTextColor(0, 0, 0);
  pdf.text('Endosteal implants', col1X + 1, yPosition + 4);
  pdf.setFontSize(6);
  pdf.setTextColor(100, 100, 100);
  pdf.text('CDT: D6010', col2X + 1, yPosition + 3);
  pdf.text('CPT: 21249', col2X + 1, yPosition + 7);
  pdf.setFontSize(7);
  pdf.setTextColor(0, 0, 0);
  pdf.text(data.implantFixtures?.count || 'N/A', col3X + 1, yPosition + 5);
  pdf.text(data.implantFixtures?.fee ? `$${data.implantFixtures.fee}` : 'N/A', col4X + 1, yPosition + 5);

  if (data.implantFixtures?.covered === 'yes') {
    pdf.setFillColor(0, 150, 0);
    pdf.circle(col5X + 8, yPosition + 4, 2, 'F');
    pdf.setFontSize(6);
    pdf.text('Yes', col5X + 12, yPosition + 5);
  } else if (data.implantFixtures?.covered === 'no') {
    pdf.setFillColor(200, 0, 0);
    pdf.circle(col5X + 8, yPosition + 4, 2, 'F');
    pdf.setFontSize(6);
    pdf.text('No', col5X + 12, yPosition + 5);
  }

  yPosition += 12;

  // Row 3: Fixed Zirconia Bridge
  pdf.setDrawColor(200, 220, 255);
  pdf.setFillColor(240, 245, 255);
  pdf.roundedRect(margin, yPosition, pageWidth - 2 * margin, 10, 2, 2, 'FD');

  pdf.setFontSize(7);
  pdf.setTextColor(0, 0, 0);
  pdf.text('Fixed Zirconia Bridge per Arch', col1X + 1, yPosition + 4);
  pdf.setFontSize(6);
  pdf.setTextColor(100, 100, 100);
  pdf.text('CDT: D6078', col2X + 1, yPosition + 3);
  pdf.text('CPT: 21080', col2X + 1, yPosition + 7);
  pdf.setFontSize(7);
  pdf.setTextColor(0, 0, 0);
  pdf.text('per arch', col3X + 1, yPosition + 5);
  pdf.text(data.zirconiabridge?.fee ? `$${data.zirconiabridge.fee}` : 'N/A', col4X + 1, yPosition + 5);

  if (data.zirconiabridge?.covered === 'yes') {
    pdf.setFillColor(0, 150, 0);
    pdf.circle(col5X + 8, yPosition + 4, 2, 'F');
    pdf.setFontSize(6);
    pdf.text('Yes', col5X + 12, yPosition + 5);
  } else if (data.zirconiabridge?.covered === 'no') {
    pdf.setFillColor(200, 0, 0);
    pdf.circle(col5X + 8, yPosition + 4, 2, 'F');
    pdf.setFontSize(6);
    pdf.text('No', col5X + 12, yPosition + 5);
  }

  yPosition += 12;

  // Row 4: IV Sedation
  pdf.setDrawColor(200, 220, 255);
  pdf.setFillColor(255, 255, 255);
  pdf.roundedRect(margin, yPosition, pageWidth - 2 * margin, 10, 2, 2, 'FD');

  pdf.setFontSize(7);
  pdf.setTextColor(0, 0, 0);
  pdf.text('IV Sedation (first 60 min)', col1X + 1, yPosition + 4);
  pdf.setFontSize(6);
  pdf.setTextColor(100, 100, 100);
  pdf.text('CDT: D9223', col2X + 1, yPosition + 3);
  pdf.text('CPT: 99152', col2X + 1, yPosition + 7);
  pdf.setFontSize(7);
  pdf.setTextColor(0, 0, 0);
  pdf.text('per session', col3X + 1, yPosition + 5);
  pdf.text(data.ivSedation?.fee ? `$${data.ivSedation.fee}` : 'N/A', col4X + 1, yPosition + 5);

  if (data.ivSedation?.covered === 'yes') {
    pdf.setFillColor(0, 150, 0);
    pdf.circle(col5X + 8, yPosition + 4, 2, 'F');
    pdf.setFontSize(6);
    pdf.text('Yes', col5X + 12, yPosition + 5);
  } else if (data.ivSedation?.covered === 'no') {
    pdf.setFillColor(200, 0, 0);
    pdf.circle(col5X + 8, yPosition + 4, 2, 'F');
    pdf.setFontSize(6);
    pdf.text('No', col5X + 12, yPosition + 5);
  }

  yPosition += 15;

  // Additional Procedures Section
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(100, 100, 100);
  pdf.text('Additional Procedures (if applicable)', margin, yPosition);
  yPosition += 8;

  // Define additional procedures in a 2-column layout
  const additionalProcs = [
    { name: 'Bone Graft - Mandible', desc: 'Graft, bone; mandible, right and left', cdt: 'D7950', cpt: '21215 x 2' },
    { name: 'Bone Graft - Maxillary', desc: 'Graft, bone; nasal, maxillary, or malar areas', cdt: 'D7951', cpt: '21210 x 2' },
    { name: 'Alveoloplasty', desc: 'Each quadrant bone shaping', cdt: 'D7311', cpt: '41874 x 2' },
    { name: 'Bone Excision', desc: 'Facial bone excision', cdt: 'D7251', cpt: '21025 x 2' },
    { name: 'Surgical Splint', desc: 'Custom oral surgical splint', cdt: 'D7880', cpt: '21085 x 1' },
    { name: 'Interim Obturator', desc: 'Interim obturator prosthesis', cdt: 'D5987', cpt: '21079 x 1' },
    { name: 'Tumor/Cyst Excision', desc: 'Benign tumor or cyst removal', cdt: 'D7471', cpt: '21040 x 2' },
    { name: 'CT Scan', desc: '26 modifier', cdt: 'D0367', cpt: '70486' },
    { name: 'Final Obturator', desc: 'Final obturator prosthesis', cdt: 'D5929', cpt: '21080 x 1' }
  ];

  const procColumnWidth = (pageWidth - 2 * margin - 5) / 2;
  const procLeftColumnX = margin;
  const procRightColumnX = margin + procColumnWidth + 5;
  const procBoxHeight = 12;

  for (let i = 0; i < additionalProcs.length; i += 2) {
    // Left column procedure
    const leftProc = additionalProcs[i];
    pdf.setDrawColor(220, 220, 220);
    pdf.setFillColor(250, 250, 250);
    pdf.setLineWidth(0.2);
    pdf.roundedRect(procLeftColumnX, yPosition, procColumnWidth, procBoxHeight, 2, 2, 'FD');

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(7);
    pdf.setTextColor(0, 0, 0);
    pdf.text(leftProc.name, procLeftColumnX + 2, yPosition + 3);

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(6);
    pdf.setTextColor(100, 100, 100);
    pdf.text(leftProc.desc, procLeftColumnX + 2, yPosition + 7);

    // CDT and CPT codes
    pdf.setFontSize(6);
    pdf.setTextColor(55, 91, 220);
    pdf.text(`CDT: ${leftProc.cdt}`, procLeftColumnX + 2, yPosition + 10);
    pdf.setTextColor(128, 0, 128);
    pdf.text(`CPT: ${leftProc.cpt}`, procLeftColumnX + procColumnWidth - 25, yPosition + 10);
    pdf.setTextColor(0, 0, 0);

    // Right column procedure (if exists)
    if (i + 1 < additionalProcs.length) {
      const rightProc = additionalProcs[i + 1];
      pdf.setDrawColor(220, 220, 220);
      pdf.setFillColor(250, 250, 250);
      pdf.roundedRect(procRightColumnX, yPosition, procColumnWidth, procBoxHeight, 2, 2, 'FD');

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(7);
      pdf.setTextColor(0, 0, 0);
      pdf.text(rightProc.name, procRightColumnX + 2, yPosition + 3);

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(6);
      pdf.setTextColor(100, 100, 100);
      pdf.text(rightProc.desc, procRightColumnX + 2, yPosition + 7);

      // CDT and CPT codes
      pdf.setFontSize(6);
      pdf.setTextColor(55, 91, 220);
      pdf.text(`CDT: ${rightProc.cdt}`, procRightColumnX + 2, yPosition + 10);
      pdf.setTextColor(128, 0, 128);
      pdf.text(`CPT: ${rightProc.cpt}`, procRightColumnX + procColumnWidth - 25, yPosition + 10);
      pdf.setTextColor(0, 0, 0);
    }

    yPosition += procBoxHeight + 2;
  }

  yPosition += 6;

  // Insurance Notice
  pdf.setDrawColor(255, 200, 100);
  pdf.setFillColor(255, 250, 230);
  pdf.setLineWidth(0.4);
  const noticeHeight = 20;
  pdf.roundedRect(margin, yPosition, pageWidth - 2 * margin, noticeHeight, 2, 2, 'FD');

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(9);
  pdf.setTextColor(150, 100, 0);
  pdf.text('Important Insurance Notice', margin + 3, yPosition + 5);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(7);
  pdf.setTextColor(0, 0, 0);
  const noticeText = '*Coverage NOT confirmed with insurer. I may receive separate bills from outside labs or hospitals. I have received a Good-Faith Estimate under the No Surprises Act and understand my right to dispute charges that exceed the estimate by > $400.';
  const noticeLines = pdf.splitTextToSize(noticeText, pageWidth - 2 * margin - 8);
  let noticeY = yPosition + 10;
  noticeLines.forEach((line: string) => {
    pdf.text(line, margin + 3, noticeY);
    noticeY += 3.5;
  });

  yPosition += noticeHeight + 8;

  // Patient Initials Signature Section for Page 6 (Financial)
  const financialSignatureLineStart = pageWidth - margin - 70;
  const financialSignatureLineEnd = pageWidth - margin - 5;
  const financialSignatureLineCenter = (financialSignatureLineStart + financialSignatureLineEnd) / 2;

  // Add signature above the line
  if (data.financialInitials) {
    try {
      pdf.addImage(data.financialInitials, 'PNG', financialSignatureLineCenter - 27.5, yPosition, 55, 15);
    } catch (error) {
      console.error('Error adding financial initials:', error);
    }
  }
  yPosition += 16;

  // Draw line
  pdf.setDrawColor(100, 100, 100);
  pdf.setLineWidth(0.2);
  pdf.line(financialSignatureLineStart, yPosition, financialSignatureLineEnd, yPosition);
  yPosition += 4;

  // Add "Patient Initials" text centered below the line
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(0, 0, 0);
  pdf.text('Patient Initials', financialSignatureLineCenter, yPosition, { align: 'center' });

  // Draw watermark on top of financial page content
  addWatermarkOnTop(pdf, pageWidth, pageHeight, watermarkImg);
}

/**
 * Add Media Page
 */
function addMediaPage(
  pdf: jsPDF,
  data: ConsentFullArchPdfData,
  pageWidth: number,
  pageHeight: number,
  margin: number,
  logoImg: HTMLImageElement | null,
  watermarkImg: HTMLImageElement | null,
  logoHeight: number
) {
  pdf.addPage();
  addWatermark(pdf, pageWidth, pageHeight, watermarkImg);
  addHeaderAndFooter(pdf, pageWidth, pageHeight, margin, data.date, logoImg, null, logoHeight);

  const topMargin = 5;
  let yPosition = topMargin + logoHeight + 1 + 8 + 6 + 6 + 10;

  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(55, 91, 220);
  pdf.text('Photo / Video / Electronic Communication Authorization', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 12;

  // Media Usage Authorization Section
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(55, 91, 220);
  pdf.text('Media Usage Authorization', margin, yPosition);
  yPosition += 8;

  // Helper function to draw authorization item
  const drawAuthItem = (title: string, description: string, value: string, y: number, bgColor: number[]) => {
    const itemHeight = 12;

    // Draw box
    pdf.setDrawColor(200, 220, 255);
    pdf.setFillColor(bgColor[0], bgColor[1], bgColor[2]);
    pdf.setLineWidth(0.2);
    pdf.roundedRect(margin, y, pageWidth - 2 * margin, itemHeight, 2, 2, 'FD');

    // Title
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8);
    pdf.setTextColor(0, 0, 0);
    pdf.text(title, margin + 2, y + 4);

    // Description
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(6);
    pdf.setTextColor(100, 100, 100);
    pdf.text(description, margin + 2, y + 8);

    // Response buttons
    const buttonWidth = 20;
    const buttonHeight = 8;
    const buttonY = y + 2;
    const agreeX = pageWidth - margin - 2 * buttonWidth - 3;
    const denyX = pageWidth - margin - buttonWidth - 1;

    // Yes, I Agree button
    if (value === 'yes') {
      pdf.setDrawColor(0, 150, 0);
      pdf.setFillColor(220, 255, 220);
    } else {
      pdf.setDrawColor(200, 200, 200);
      pdf.setFillColor(255, 255, 255);
    }
    pdf.roundedRect(agreeX, buttonY, buttonWidth, buttonHeight, 1, 1, 'FD');
    pdf.setFontSize(7);
    pdf.setTextColor(value === 'yes' ? 0 : 100, value === 'yes' ? 100 : 100, value === 'yes' ? 0 : 100);
    pdf.text('Yes, I Agree', agreeX + buttonWidth / 2, buttonY + 5.5, { align: 'center' });

    // No, I Deny button
    if (value === 'no') {
      pdf.setDrawColor(200, 0, 0);
      pdf.setFillColor(255, 220, 220);
    } else {
      pdf.setDrawColor(200, 200, 200);
      pdf.setFillColor(255, 255, 255);
    }
    pdf.roundedRect(denyX, buttonY, buttonWidth, buttonHeight, 1, 1, 'FD');
    pdf.setTextColor(value === 'no' ? 150 : 100, value === 'no' ? 0 : 100, value === 'no' ? 0 : 100);
    pdf.text('No, I Deny', denyX + buttonWidth / 2, buttonY + 5.5, { align: 'center' });

    return itemHeight + 2;
  };

  // Internal Record-keeping
  yPosition += drawAuthItem(
    'Internal Record-keeping',
    'For medical documentation and patient care records',
    data.internalRecordKeeping || '',
    yPosition,
    [240, 245, 255]
  );

  // Professional Education
  yPosition += drawAuthItem(
    'Professional Education',
    'De-identified use for educational purposes and training',
    data.professionalEducation || '',
    yPosition,
    [255, 255, 255]
  );

  // Marketing / Social Media
  yPosition += drawAuthItem(
    'Marketing / Social Media',
    'Identifiable use for marketing and social media promotion',
    data.marketingSocialMedia || '',
    yPosition,
    [255, 245, 250]
  );

  yPosition += 6;

  // HIPAA Electronic Communication Authorization Section
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(0, 150, 150);
  pdf.text('HIPAA Electronic Communication Authorization', margin, yPosition);
  yPosition += 8;

  const hipaaItemHeight = data.hipaaEmailSms ? 22 : 12;

  // Draw box
  pdf.setDrawColor(200, 240, 240);
  pdf.setFillColor(240, 255, 255);
  pdf.setLineWidth(0.2);
  pdf.roundedRect(margin, yPosition, pageWidth - 2 * margin, hipaaItemHeight, 2, 2, 'FD');

  // Title
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8);
  pdf.setTextColor(0, 0, 0);
  pdf.text('HIPAA Email / SMS Authorization', margin + 2, yPosition + 4);

  // Description
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(6);
  pdf.setTextColor(100, 100, 100);
  pdf.text('I authorize the office to send unencrypted clinical instructions to the contact information provided below.', margin + 2, yPosition + 8);

  // Show email and phone if authorized
  if (data.hipaaEmailSms) {
    pdf.setFontSize(7);
    pdf.setTextColor(0, 0, 0);
    pdf.text(`Email: ${data.hipaaEmail || 'N/A'}`, margin + 2, yPosition + 13);
    pdf.text(`Phone: +1 ${data.hipaaPhone || 'N/A'}`, margin + 2, yPosition + 17);

    pdf.setFontSize(6);
    pdf.setTextColor(100, 100, 100);
    pdf.text('Important: Risks have been explained. I may revoke this authorization in writing at any time.', margin + 2, yPosition + 20);
  }

  // Response buttons
  const buttonWidth = 20;
  const buttonHeight = 8;
  const buttonY = yPosition + 2;
  const agreeX = pageWidth - margin - 2 * buttonWidth - 3;
  const denyX = pageWidth - margin - buttonWidth - 1;

  // Yes, I Agree button
  if (data.hipaaEmailSms) {
    pdf.setDrawColor(0, 150, 0);
    pdf.setFillColor(220, 255, 220);
  } else {
    pdf.setDrawColor(200, 200, 200);
    pdf.setFillColor(255, 255, 255);
  }
  pdf.roundedRect(agreeX, buttonY, buttonWidth, buttonHeight, 1, 1, 'FD');
  pdf.setFontSize(7);
  pdf.setTextColor(data.hipaaEmailSms ? 0 : 100, data.hipaaEmailSms ? 100 : 100, data.hipaaEmailSms ? 0 : 100);
  pdf.text('Yes, I Agree', agreeX + buttonWidth / 2, buttonY + 5.5, { align: 'center' });

  // No, I Deny button
  if (!data.hipaaEmailSms) {
    pdf.setDrawColor(200, 0, 0);
    pdf.setFillColor(255, 220, 220);
  } else {
    pdf.setDrawColor(200, 200, 200);
    pdf.setFillColor(255, 255, 255);
  }
  pdf.roundedRect(denyX, buttonY, buttonWidth, buttonHeight, 1, 1, 'FD');
  pdf.setTextColor(!data.hipaaEmailSms ? 150 : 100, !data.hipaaEmailSms ? 0 : 100, !data.hipaaEmailSms ? 0 : 100);
  pdf.text('No, I Deny', denyX + buttonWidth / 2, buttonY + 5.5, { align: 'center' });

  yPosition += hipaaItemHeight + 8;

  // Patient Initials Signature Section for Page 7 (Media)
  const mediaSignatureLineStart = pageWidth - margin - 70;
  const mediaSignatureLineEnd = pageWidth - margin - 5;
  const mediaSignatureLineCenter = (mediaSignatureLineStart + mediaSignatureLineEnd) / 2;

  // Add signature above the line
  if (data.photoVideoInitials) {
    try {
      pdf.addImage(data.photoVideoInitials, 'PNG', mediaSignatureLineCenter - 27.5, yPosition, 55, 15);
    } catch (error) {
      console.error('Error adding photo/video initials:', error);
    }
  }
  yPosition += 16;

  // Draw line
  pdf.setDrawColor(100, 100, 100);
  pdf.setLineWidth(0.2);
  pdf.line(mediaSignatureLineStart, yPosition, mediaSignatureLineEnd, yPosition);
  yPosition += 4;

  // Add "Patient Initials" text centered below the line
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(0, 0, 0);
  pdf.text('Patient Initials', mediaSignatureLineCenter, yPosition, { align: 'center' });

  // Draw watermark on top of media page content
  addWatermarkOnTop(pdf, pageWidth, pageHeight, watermarkImg);
}

/**
 * Add Opioid Page
 */
function addOpioidPage(
  pdf: jsPDF,
  data: ConsentFullArchPdfData,
  pageWidth: number,
  pageHeight: number,
  margin: number,
  logoImg: HTMLImageElement | null,
  watermarkImg: HTMLImageElement | null,
  logoHeight: number
) {
  pdf.addPage();
  addWatermark(pdf, pageWidth, pageHeight, watermarkImg);
  addHeaderAndFooter(pdf, pageWidth, pageHeight, margin, data.date, logoImg, null, logoHeight);

  const topMargin = 5;
  let yPosition = topMargin + logoHeight + 1 + 8 + 6 + 6 + 10;

  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(55, 91, 220);
  pdf.text('Opioid-Specific Consent (if postoperative narcotics are prescribed)', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 12;

  // Postoperative Pain Management Information Section
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(55, 91, 220);
  pdf.text('Postoperative Pain Management Information', margin, yPosition);
  yPosition += 8;

  // 3-column layout for medications, risks, and alternatives
  const columnWidth = (pageWidth - 2 * margin - 10) / 3;
  const col1X = margin;
  const col2X = margin + columnWidth + 5;
  const col3X = margin + 2 * columnWidth + 10;
  const boxHeight = 40;

  // Column 1: Prescribed Medications (Blue)
  pdf.setDrawColor(200, 220, 255);
  pdf.setFillColor(240, 245, 255);
  pdf.setLineWidth(0.2);
  pdf.roundedRect(col1X, yPosition, columnWidth, boxHeight, 2, 2, 'FD');

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8);
  pdf.setTextColor(55, 91, 220);
  pdf.text('Prescribed Medications', col1X + 2, yPosition + 4);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(7);
  pdf.setTextColor(0, 0, 0);

  // Medication 1
  pdf.setFont('helvetica', 'bold');
  pdf.text('Hydrocodone/Acetaminophen', col1X + 2, yPosition + 10);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(6);
  pdf.setTextColor(55, 91, 220);
  pdf.text('5/325 mg, max 24 tabs, 6-day supply', col1X + 2, yPosition + 14);

  // Medication 2
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(7);
  pdf.setTextColor(0, 0, 0);
  pdf.text('Percocet', col1X + 2, yPosition + 20);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(6);
  pdf.setTextColor(55, 91, 220);
  pdf.text('5/325mg, max 24 tabs, 6-day supply', col1X + 2, yPosition + 24);

  // Column 2: Known Risks (Red)
  pdf.setDrawColor(255, 200, 200);
  pdf.setFillColor(255, 240, 240);
  pdf.roundedRect(col2X, yPosition, columnWidth, boxHeight, 2, 2, 'FD');

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8);
  pdf.setTextColor(200, 0, 0);
  pdf.text('Known Risks', col2X + 2, yPosition + 4);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(6);
  pdf.setTextColor(150, 0, 0);
  pdf.text('• Addiction potential', col2X + 2, yPosition + 10);
  pdf.text('• Constipation', col2X + 2, yPosition + 15);
  pdf.text('• Respiratory depression', col2X + 2, yPosition + 20);
  pdf.text('• Impaired driving ability', col2X + 2, yPosition + 25);

  // Column 3: Alternative Options (Green)
  pdf.setDrawColor(200, 255, 200);
  pdf.setFillColor(240, 255, 240);
  pdf.roundedRect(col3X, yPosition, columnWidth, boxHeight, 2, 2, 'FD');

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8);
  pdf.setTextColor(0, 150, 0);
  pdf.text('Alternative Options', col3X + 2, yPosition + 4);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(6);
  pdf.setTextColor(0, 100, 0);
  pdf.text('• NSAIDs (anti-inflammatory)', col3X + 2, yPosition + 10);
  pdf.text('• Acetaminophen', col3X + 2, yPosition + 15);
  pdf.text('• Long-acting local anesthesia', col3X + 2, yPosition + 20);

  yPosition += boxHeight + 8;

  // Safety Information Reviewed Section
  pdf.setDrawColor(200, 220, 255);
  pdf.setFillColor(240, 245, 255);
  pdf.setLineWidth(0.2);
  const safetyBoxHeight = 12;
  pdf.roundedRect(margin, yPosition, pageWidth - 2 * margin, safetyBoxHeight, 2, 2, 'FD');

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8);
  pdf.setTextColor(55, 91, 220);
  pdf.text('Safety Information Reviewed', margin + 2, yPosition + 4);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(7);
  pdf.setTextColor(0, 0, 0);
  pdf.text('Safe-use instructions and Naloxone availability have been reviewed. Drug take-back sites have been listed and provided.', margin + 2, yPosition + 9);

  yPosition += safetyBoxHeight + 8;

  // Opioid Supply Preference Section
  pdf.setDrawColor(200, 240, 240);
  pdf.setFillColor(240, 255, 255);
  const prefBoxHeight = 12;
  pdf.roundedRect(margin, yPosition, pageWidth - 2 * margin, prefBoxHeight, 2, 2, 'FD');

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8);
  pdf.setTextColor(0, 0, 0);
  pdf.text('Opioid Supply Preference', margin + 2, yPosition + 4);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(6);
  pdf.setTextColor(100, 100, 100);
  pdf.text('You may request the smallest effective opioid supply to minimize risks and unused medication.', margin + 2, yPosition + 9);

  // Response buttons
  const buttonWidth = 25;
  const buttonHeight = 8;
  const buttonY = yPosition + 2;
  const smallestX = pageWidth - margin - 2 * buttonWidth - 3;
  const standardX = pageWidth - margin - buttonWidth - 1;

  // Yes, Smallest Supply button
  if (data.smallestOpioidSupply) {
    pdf.setDrawColor(0, 150, 0);
    pdf.setFillColor(220, 255, 220);
  } else {
    pdf.setDrawColor(200, 200, 200);
    pdf.setFillColor(255, 255, 255);
  }
  pdf.roundedRect(smallestX, buttonY, buttonWidth, buttonHeight, 1, 1, 'FD');
  pdf.setFontSize(7);
  pdf.setTextColor(data.smallestOpioidSupply ? 0 : 100, data.smallestOpioidSupply ? 100 : 100, data.smallestOpioidSupply ? 0 : 100);
  pdf.text('Yes, Smallest Supply', smallestX + buttonWidth / 2, buttonY + 5.5, { align: 'center' });

  // Standard Supply button
  if (!data.smallestOpioidSupply) {
    pdf.setDrawColor(55, 91, 220);
    pdf.setFillColor(220, 230, 255);
  } else {
    pdf.setDrawColor(200, 200, 200);
    pdf.setFillColor(255, 255, 255);
  }
  pdf.roundedRect(standardX, buttonY, buttonWidth, buttonHeight, 1, 1, 'FD');
  pdf.setTextColor(!data.smallestOpioidSupply ? 55 : 100, !data.smallestOpioidSupply ? 91 : 100, !data.smallestOpioidSupply ? 220 : 100);
  pdf.text('Standard Supply', standardX + buttonWidth / 2, buttonY + 5.5, { align: 'center' });

  yPosition += prefBoxHeight + 8;

  // Patient Initials Signature Section for Page 8 (Opioid)
  const opioidSignatureLineStart = pageWidth - margin - 70;
  const opioidSignatureLineEnd = pageWidth - margin - 5;
  const opioidSignatureLineCenter = (opioidSignatureLineStart + opioidSignatureLineEnd) / 2;

  // Add signature above the line
  if (data.opioidInitials) {
    try {
      pdf.addImage(data.opioidInitials, 'PNG', opioidSignatureLineCenter - 27.5, yPosition, 55, 15);
    } catch (error) {
      console.error('Error adding opioid initials:', error);
    }
  }
  yPosition += 16;

  // Draw line
  pdf.setDrawColor(100, 100, 100);
  pdf.setLineWidth(0.2);
  pdf.line(opioidSignatureLineStart, yPosition, opioidSignatureLineEnd, yPosition);
  yPosition += 4;

  // Add "Patient Initials" text centered below the line
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(0, 0, 0);
  pdf.text('Patient Initials', opioidSignatureLineCenter, yPosition, { align: 'center' });

  // Draw watermark on top of opioid page content
  addWatermarkOnTop(pdf, pageWidth, pageHeight, watermarkImg);
}

/**
 * Add Final Signatures Page
 */
function addFinalSignaturesPage(
  pdf: jsPDF,
  data: ConsentFullArchPdfData,
  pageWidth: number,
  pageHeight: number,
  margin: number,
  logoImg: HTMLImageElement | null,
  watermarkImg: HTMLImageElement | null,
  logoHeight: number
) {
  pdf.addPage();
  addWatermark(pdf, pageWidth, pageHeight, watermarkImg);
  addHeaderAndFooter(pdf, pageWidth, pageHeight, margin, data.date, logoImg, null, logoHeight);

  const topMargin = 5;
  let yPosition = topMargin + logoHeight + 1 + 8 + 6 + 6 + 10;

  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(0, 150, 0);
  pdf.text('Acknowledgment, Revocation, Witness & Notary', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 12;

  // Patient Acknowledgment & Authorization Section
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(0, 150, 0);
  pdf.text('Patient Acknowledgment & Authorization', margin, yPosition);
  yPosition += 8;

  // Helper function to draw checkbox item
  const drawCheckboxItem = (text: string, checked: boolean, y: number) => {
    const itemHeight = 15;

    // Draw box
    pdf.setDrawColor(200, 255, 200);
    pdf.setFillColor(255, 255, 255);
    pdf.setLineWidth(0.2);
    pdf.roundedRect(margin, y, pageWidth - 2 * margin, itemHeight, 2, 2, 'FD');

    // Checkbox
    const checkboxSize = 6;
    const checkboxX = margin + 3;
    const checkboxY = y + 4.5;

    if (checked) {
      pdf.setDrawColor(0, 150, 0);
      pdf.setFillColor(220, 255, 220);
    } else {
      pdf.setDrawColor(200, 200, 200);
      pdf.setFillColor(255, 255, 255);
    }
    pdf.roundedRect(checkboxX, checkboxY, checkboxSize, checkboxSize, 0.5, 0.5, 'FD');

    // Checkmark
    if (checked) {
      pdf.setDrawColor(0, 150, 0);
      pdf.setLineWidth(0.5);
      pdf.line(checkboxX + 1.5, checkboxY + 3, checkboxX + 2.5, checkboxY + 4.5);
      pdf.line(checkboxX + 2.5, checkboxY + 4.5, checkboxX + 4.5, checkboxY + 1.5);
    }

    // Text
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7);
    pdf.setTextColor(0, 0, 0);
    const textLines = pdf.splitTextToSize(text, pageWidth - 2 * margin - 15);
    let textY = y + 6;
    textLines.forEach((line: string) => {
      pdf.text(line, checkboxX + checkboxSize + 3, textY);
      textY += 3.5;
    });

    return itemHeight + 2;
  };

  // Checkbox 1
  yPosition += drawCheckboxItem(
    'I certify that I read or had read to me every page, received a duplicate copy today, and may revoke this consent up to the moment anesthesia is administered without penalty.',
    data.acknowledgmentRead || false,
    yPosition
  );

  // Checkbox 2
  yPosition += drawCheckboxItem(
    'I understand that outcome is not guaranteed and agree to follow all postoperative and hygiene instructions.',
    data.acknowledgmentOutcome || false,
    yPosition
  );

  // Checkbox 3
  yPosition += drawCheckboxItem(
    'I authorize Dr. Germain Jean-Charles, NY # [........], and named associates below to perform the procedures.',
    data.acknowledgmentAuthorize || false,
    yPosition
  );

  yPosition += 10;

  // Provider Signatures Section
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(55, 91, 220);
  pdf.text('Provider Signatures', margin, yPosition);
  yPosition += 8;

  // Single box with rounded corners for provider details and signature
  const providerBoxX = margin;
  const providerBoxY = yPosition;
  const providerBoxWidth = pageWidth - 2 * margin;
  const providerBoxHeight = 30;
  const cornerRadius = 2;

  // Draw rounded rectangle
  pdf.setDrawColor(200, 220, 255);
  pdf.setFillColor(250, 250, 255);
  pdf.setLineWidth(0.3);
  pdf.roundedRect(providerBoxX, providerBoxY, providerBoxWidth, providerBoxHeight, cornerRadius, cornerRadius, 'FD');

  // Left side: Provider details
  let infoY = providerBoxY + 5;
  const leftX = providerBoxX + 3;

  // Provider Name
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(7);
  pdf.setTextColor(100, 100, 100);
  pdf.text('Provider Name', leftX, infoY);
  infoY += 4;

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  pdf.setTextColor(0, 0, 0);
  pdf.text(data.surgeonName || '', leftX, infoY);
  infoY += 6;

  // Role
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(7);
  pdf.setTextColor(100, 100, 100);
  pdf.text('Role', leftX, infoY);
  infoY += 4;

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  pdf.setTextColor(55, 91, 220);
  pdf.text('Surgeon', leftX, infoY);
  infoY += 6;

  // Date/Time
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(7);
  pdf.setTextColor(100, 100, 100);
  pdf.text('Date/Time', leftX, infoY);
  infoY += 4;

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  pdf.setTextColor(0, 0, 0);
  const surgeonDateTime = data.surgeonDate || data.date || '';
  pdf.text(surgeonDateTime, leftX, infoY);

  // Right side: Signature
  const sigStartX = providerBoxX + providerBoxWidth - 75;
  const sigCenterX = providerBoxX + providerBoxWidth - 37.5;

  // Add signature above the line
  if (data.surgeonSignature) {
    try {
      pdf.addImage(data.surgeonSignature, 'PNG', sigCenterX - 27.5, providerBoxY + 3, 55, 15);
    } catch (error) {
      console.error('Error adding surgeon signature:', error);
    }
  }

  // Draw signature line
  const sigLineY = providerBoxY + providerBoxHeight - 7;
  pdf.setDrawColor(100, 100, 100);
  pdf.setLineWidth(0.2);
  pdf.line(sigStartX, sigLineY, providerBoxX + providerBoxWidth - 5, sigLineY);

  // Add "Surgeon Signature" text centered below the line
  pdf.setFontSize(7);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(100, 100, 100);
  pdf.text('Surgeon Signature', sigCenterX, sigLineY + 3, { align: 'center' });

  yPosition += providerBoxHeight + 8;

  // Patient Signature Section
  const patientBoxX = margin;
  const patientBoxY = yPosition;
  const patientBoxWidth = pageWidth - 2 * margin;
  const patientBoxHeight = 30;

  // Draw rounded rectangle
  pdf.setDrawColor(200, 220, 255);
  pdf.setFillColor(250, 250, 255);
  pdf.setLineWidth(0.3);
  pdf.roundedRect(patientBoxX, patientBoxY, patientBoxWidth, patientBoxHeight, cornerRadius, cornerRadius, 'FD');

  // Left side: Patient details
  let patientInfoY = patientBoxY + 5;
  const patientLeftX = patientBoxX + 3;

  // Patient Name
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(7);
  pdf.setTextColor(100, 100, 100);
  pdf.text('Patient Name', patientLeftX, patientInfoY);
  patientInfoY += 4;

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  pdf.setTextColor(0, 0, 0);
  pdf.text(data.patientName || '', patientLeftX, patientInfoY);
  patientInfoY += 6;

  // Role
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(7);
  pdf.setTextColor(100, 100, 100);
  pdf.text('Role', patientLeftX, patientInfoY);
  patientInfoY += 4;

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  pdf.setTextColor(55, 91, 220);
  pdf.text('Patient', patientLeftX, patientInfoY);
  patientInfoY += 6;

  // Date/Time
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(7);
  pdf.setTextColor(100, 100, 100);
  pdf.text('Date/Time', patientLeftX, patientInfoY);
  patientInfoY += 4;

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  pdf.setTextColor(0, 0, 0);
  const patientDateTime = data.patientSignatureDate || data.date || '';
  pdf.text(patientDateTime, patientLeftX, patientInfoY);

  // Right side: Patient Signature
  const patientSigStartX = patientBoxX + patientBoxWidth - 75;
  const patientSigCenterX = patientBoxX + patientBoxWidth - 37.5;

  // Add signature above the line
  if (data.patientSignature) {
    try {
      pdf.addImage(data.patientSignature, 'PNG', patientSigCenterX - 27.5, patientBoxY + 3, 55, 15);
    } catch (error) {
      console.error('Error adding patient signature:', error);
    }
  }

  // Draw signature line
  const patientSigLineY = patientBoxY + patientBoxHeight - 7;
  pdf.setDrawColor(100, 100, 100);
  pdf.setLineWidth(0.2);
  pdf.line(patientSigStartX, patientSigLineY, patientBoxX + patientBoxWidth - 5, patientSigLineY);

  // Add "Patient Signature" text centered below the line
  pdf.setFontSize(7);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(100, 100, 100);
  pdf.text('Patient Signature', patientSigCenterX, patientSigLineY + 3, { align: 'center' });

  yPosition += patientBoxHeight + 8;

  // Witness Signature Section
  const witnessBoxX = margin;
  const witnessBoxY = yPosition;
  const witnessBoxWidth = pageWidth - 2 * margin;
  const witnessBoxHeight = 30;

  // Draw rounded rectangle
  pdf.setDrawColor(200, 220, 255);
  pdf.setFillColor(250, 250, 255);
  pdf.setLineWidth(0.3);
  pdf.roundedRect(witnessBoxX, witnessBoxY, witnessBoxWidth, witnessBoxHeight, cornerRadius, cornerRadius, 'FD');

  // Left side: Witness details
  let witnessInfoY = witnessBoxY + 5;
  const witnessLeftX = witnessBoxX + 3;

  // Witness Name
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(7);
  pdf.setTextColor(100, 100, 100);
  pdf.text('Witness Name', witnessLeftX, witnessInfoY);
  witnessInfoY += 4;

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  pdf.setTextColor(0, 0, 0);
  pdf.text(data.witnessName || '', witnessLeftX, witnessInfoY);
  witnessInfoY += 6;

  // Role
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(7);
  pdf.setTextColor(100, 100, 100);
  pdf.text('Role', witnessLeftX, witnessInfoY);
  witnessInfoY += 4;

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  pdf.setTextColor(55, 91, 220);
  pdf.text('Witness', witnessLeftX, witnessInfoY);
  witnessInfoY += 6;

  // Date/Time
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(7);
  pdf.setTextColor(100, 100, 100);
  pdf.text('Date/Time', witnessLeftX, witnessInfoY);
  witnessInfoY += 4;

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  pdf.setTextColor(0, 0, 0);
  const witnessDateTime = data.witnessSignatureDate || data.date || '';
  pdf.text(witnessDateTime, witnessLeftX, witnessInfoY);

  // Right side: Witness Signature
  const witnessSigStartX = witnessBoxX + witnessBoxWidth - 75;
  const witnessSigCenterX = witnessBoxX + witnessBoxWidth - 37.5;

  // Add signature above the line
  if (data.witnessSignature) {
    try {
      pdf.addImage(data.witnessSignature, 'PNG', witnessSigCenterX - 27.5, witnessBoxY + 3, 55, 15);
    } catch (error) {
      console.error('Error adding witness signature:', error);
    }
  }

  // Draw signature line
  const witnessSigLineY = witnessBoxY + witnessBoxHeight - 7;
  pdf.setDrawColor(100, 100, 100);
  pdf.setLineWidth(0.2);
  pdf.line(witnessSigStartX, witnessSigLineY, witnessBoxX + witnessBoxWidth - 5, witnessSigLineY);

  // Add "Witness Signature" text centered below the line
  pdf.setFontSize(7);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(100, 100, 100);
  pdf.text('Witness Signature', witnessSigCenterX, witnessSigLineY + 3, { align: 'center' });

  // Draw watermark on top of final signatures page content
  addWatermarkOnTop(pdf, pageWidth, pageHeight, watermarkImg);
}

/**
 * Load image helper
 */
function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => {
      console.error(`Failed to load image: ${src}`);
      resolve(null);
    };
    img.src = src;
  });
}

