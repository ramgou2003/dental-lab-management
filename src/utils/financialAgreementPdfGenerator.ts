import jsPDF from 'jspdf';

export interface FinancialAgreementPdfData {
  patientName: string;
  chartNumber?: string;
  dateOfBirth?: string;
  dateOfExecution: string;
  timeOfExecution: string;
  acceptedTreatments: Array<{
    service: string;
    fee: string;
    cdtCode: string;
    cptCode: string;
    initials: string;
  }>;
  totalCostOfTreatment?: string;
  patientPaymentToday?: string;
  remainingBalance?: string;
  remainingPaymentPlan?: string;
  paymentAmount?: string;
  paymentTermsInitials?: string;
  labFeeInitials?: string;
  carePackageFee?: string;
  carePackageElection?: 'enroll' | 'defer' | '';
  warrantyInitials?: string;
  capacityConfirmed?: boolean;
  hipaaAcknowledged?: boolean;
  capacityInitials?: string;
  disputeInitials?: string;
  termsAgreed?: boolean;
  patientSignature?: string;
  patientSignatureDate?: string;
  patientSignatureTime?: string;
  witnessName?: string;
  witnessRole?: string;
  witnessSignature?: string;
  witnessSignatureDate?: string;
  witnessSignatureTime?: string;
  downloadedToDentalManagementSoftware?: boolean;
  confirmedByStaffInitials?: string;
}

/**
 * Load image and return as HTMLImageElement
 */
async function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

/**
 * Add watermark to page
 */
function addWatermark(pdf: jsPDF, pageWidth: number, pageHeight: number, watermarkImg: HTMLImageElement | null) {
  if (watermarkImg) {
    const watermarkWidth = 100;
    const watermarkHeight = (watermarkImg.height / watermarkImg.width) * watermarkWidth;
    const watermarkX = (pageWidth - watermarkWidth) / 2;
    const watermarkY = (pageHeight - watermarkHeight) / 2;
    
    pdf.saveGraphicsState();
    pdf.setGState(new pdf.GState({ opacity: 0.1 }));
    pdf.addImage(watermarkImg, 'PNG', watermarkX, watermarkY, watermarkWidth, watermarkHeight);
    pdf.restoreGraphicsState();
  }
}

/**
 * Add header and footer to page
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
 * Check if we need a new page
 */
function checkPageBreak(
  pdf: jsPDF,
  yPosition: number,
  spaceNeeded: number,
  pageWidth: number,
  pageHeight: number,
  margin: number,
  logoImg: HTMLImageElement | null,
  letterheadImg: HTMLImageElement | null,
  logoHeight: number,
  watermarkImg: HTMLImageElement | null,
  formDate: string
): number {
  const footerSpace = 25; // Space reserved for footer
  if (yPosition + spaceNeeded > pageHeight - margin - footerSpace) {
    pdf.addPage();

    // Add watermark and header to new page
    addWatermark(pdf, pageWidth, pageHeight, watermarkImg);
    addHeaderAndFooter(pdf, pageWidth, pageHeight, margin, formDate, logoImg, letterheadImg, logoHeight);

    // Return position below header (without letterhead on subsequent pages)
    const topMargin = 5;
    return topMargin + logoHeight + 1 + 8 + 6 + 6 + 10;
  }
  return yPosition;
}

/**
 * Generate Financial Agreement PDF
 */
export async function generateFinancialAgreementPdf(data: FinancialAgreementPdfData) {
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
      loadImage('/letterhead.png'),
      loadImage('/watermark.png')
    ]);
  } catch (error) {
    console.error('Error loading images:', error);
  }

  // Calculate logo height
  const logoWidth = 50;
  const logoHeight = logoImg ? (logoImg.height / logoImg.width) * logoWidth : 15;

  // Add watermark and header to first page
  addWatermark(pdf, pageWidth, pageHeight, watermarkImg);
  addHeaderAndFooter(pdf, pageWidth, pageHeight, margin, data.dateOfExecution || new Date().toISOString().split('T')[0], logoImg, letterheadImg, logoHeight);

  // Move yPosition below header
  const topMargin = 5;
  let yPosition = topMargin + logoHeight + 1 + 8 + 6 + 6 + (letterheadImg ? 60 : 0) + 10;

  // Add title
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(55, 91, 220);
  pdf.text('Financial Agreement', pageWidth / 2, yPosition, { align: 'center' });
  pdf.setTextColor(0, 0, 0);
  yPosition += 12;

  // Section 1: Patient & Treatment Identification
  yPosition = checkPageBreak(pdf, yPosition, 50, pageWidth, pageHeight, margin, logoImg, letterheadImg, logoHeight, watermarkImg, data.dateOfExecution || new Date().toISOString().split('T')[0]);

  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(55, 91, 220);
  pdf.text('1. Patient & Treatment Identification', margin, yPosition);
  yPosition += 8;

  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(0, 0, 0);

  const patientInfo = [
    { label: 'Patient Name:', value: data.patientName || '' },
    { label: 'Chart #:', value: data.chartNumber || '' },
    { label: 'Date of Birth:', value: data.dateOfBirth || '' },
    { label: 'Date of Execution:', value: data.dateOfExecution || '' },
    { label: 'Time of Execution:', value: data.timeOfExecution || '' }
  ];

  patientInfo.forEach((item) => {
    pdf.setFont('helvetica', 'bold');
    pdf.text(item.label, margin, yPosition);
    pdf.setFont('helvetica', 'normal');
    pdf.text(item.value, margin + 45, yPosition);
    yPosition += 5;
  });

  yPosition += 5;

  // Accepted Treatments Table
  if (data.acceptedTreatments && data.acceptedTreatments.length > 0) {
    const tableHeight = 30 + (data.acceptedTreatments.length * 8);
    yPosition = checkPageBreak(pdf, yPosition, tableHeight, pageWidth, pageHeight, margin, logoImg, letterheadImg, logoHeight, watermarkImg, data.dateOfExecution || new Date().toISOString().split('T')[0]);

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(55, 91, 220);
    pdf.text('Accepted Treatments:', margin, yPosition);
    yPosition += 6;

    // Table header
    const tableWidth = pageWidth - 2 * margin;
    pdf.setDrawColor(55, 91, 220);
    pdf.setFillColor(240, 245, 255);
    pdf.setLineWidth(0.3);
    pdf.rect(margin, yPosition, tableWidth, 8, 'FD');

    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(0, 0, 0);
    pdf.text('Service', margin + 2, yPosition + 5);
    pdf.text('Fee', margin + 80, yPosition + 5);
    pdf.text('CDT Code', margin + 105, yPosition + 5);
    pdf.text('CPT Code', margin + 130, yPosition + 5);
    pdf.text('Initials', margin + 155, yPosition + 5);
    yPosition += 8;

    // Table rows
    pdf.setFont('helvetica', 'normal');
    data.acceptedTreatments.forEach((treatment, index) => {
      if (index % 2 === 0) {
        pdf.setFillColor(250, 250, 250);
        pdf.rect(margin, yPosition, tableWidth, 7, 'F');
      }

      pdf.setFontSize(8);
      const serviceText = pdf.splitTextToSize(treatment.service, 75);
      pdf.text(serviceText[0], margin + 2, yPosition + 5);
      pdf.text(treatment.fee, margin + 80, yPosition + 5);
      pdf.text(treatment.cdtCode || 'N/A', margin + 105, yPosition + 5);
      pdf.text(treatment.cptCode || 'N/A', margin + 130, yPosition + 5);
      pdf.text(treatment.initials || '', margin + 155, yPosition + 5);
      yPosition += 7;
    });

    // Total Cost
    yPosition += 3;
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(9);
    pdf.text('Total Cost of Treatment:', margin + 80, yPosition);
    pdf.text(`$${data.totalCostOfTreatment || '0.00'}`, margin + 130, yPosition);
    yPosition += 10;
  }

  // Section 2: Non-Refundable & Lab Fees
  yPosition = checkPageBreak(pdf, yPosition, 50, pageWidth, pageHeight, margin, logoImg, letterheadImg, logoHeight, watermarkImg, data.dateOfExecution || new Date().toISOString().split('T')[0]);

  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(55, 91, 220);
  pdf.text('2. Non-Refundable & Lab Fees', margin, yPosition);
  yPosition += 8;

  // Content box
  const labFeeBoxWidth = pageWidth - 2 * margin;
  pdf.setDrawColor(55, 91, 220);
  pdf.setFillColor(240, 245, 255);
  pdf.setLineWidth(0.4);
  pdf.rect(margin, yPosition, labFeeBoxWidth, 35, 'FD');

  yPosition += 6;

  pdf.setFontSize(9);
  pdf.setTextColor(0, 0, 0);

  // First paragraph - using splitTextToSize with mixed formatting
  const paragraph1 = 'All payments made under this Agreement for listed services are non-refundable, even if I discontinue treatment.';
  const para1Lines = pdf.splitTextToSize(paragraph1, labFeeBoxWidth - 12);

  para1Lines.forEach((line: string, index: number) => {
    let xPos = margin + 6;

    // Check if this line contains "All payments" (first line)
    if (index === 0 && line.includes('All payments')) {
      pdf.setFont('helvetica', 'bold');
      pdf.text('All payments', xPos, yPosition);
      xPos += pdf.getTextWidth('All payments');

      pdf.setFont('helvetica', 'normal');
      const restOfLine = line.substring('All payments'.length);

      // Check if "non-refundable" is in this line
      if (restOfLine.includes('non-refundable')) {
        const beforeNonRefundable = restOfLine.substring(0, restOfLine.indexOf('non-refundable'));
        pdf.text(beforeNonRefundable, xPos, yPosition);
        xPos += pdf.getTextWidth(beforeNonRefundable);

        pdf.setFont('helvetica', 'bold');
        pdf.text('non-refundable', xPos, yPosition);
        xPos += pdf.getTextWidth('non-refundable');

        pdf.setFont('helvetica', 'normal');
        const afterNonRefundable = restOfLine.substring(restOfLine.indexOf('non-refundable') + 'non-refundable'.length);
        pdf.text(afterNonRefundable, xPos, yPosition);
      } else {
        pdf.text(restOfLine, xPos, yPosition);
      }
    } else {
      // Handle continuation lines
      if (line.includes('non-refundable')) {
        const beforeNonRefundable = line.substring(0, line.indexOf('non-refundable'));
        pdf.setFont('helvetica', 'normal');
        pdf.text(beforeNonRefundable, xPos, yPosition);
        xPos += pdf.getTextWidth(beforeNonRefundable);

        pdf.setFont('helvetica', 'bold');
        pdf.text('non-refundable', xPos, yPosition);
        xPos += pdf.getTextWidth('non-refundable');

        pdf.setFont('helvetica', 'normal');
        const afterNonRefundable = line.substring(line.indexOf('non-refundable') + 'non-refundable'.length);
        pdf.text(afterNonRefundable, xPos, yPosition);
      } else {
        pdf.setFont('helvetica', 'normal');
        pdf.text(line, xPos, yPosition);
      }
    }
    yPosition += 4.5;
  });

  yPosition += 2;

  // Second paragraph - Lab Fee
  const paragraph2 = 'Lab Fee: A $10,000 (ten thousand dollars) non-refundable lab advance is charged once records are submitted. I acknowledge this fee was discussed and consented to today.';
  const para2Lines = pdf.splitTextToSize(paragraph2, labFeeBoxWidth - 12);

  para2Lines.forEach((line: string, index: number) => {
    let xPos = margin + 6;

    if (index === 0 && line.includes('Lab Fee:')) {
      pdf.setFont('helvetica', 'bold');
      pdf.text('Lab Fee:', xPos, yPosition);
      xPos += pdf.getTextWidth('Lab Fee:');

      pdf.setFont('helvetica', 'normal');
      const restOfLine = line.substring('Lab Fee:'.length);

      if (restOfLine.includes('$10,000 (ten thousand dollars)')) {
        const beforeAmount = restOfLine.substring(0, restOfLine.indexOf('$10,000'));
        pdf.text(beforeAmount, xPos, yPosition);
        xPos += pdf.getTextWidth(beforeAmount);

        pdf.setFont('helvetica', 'bold');
        pdf.text('$10,000 (ten thousand dollars)', xPos, yPosition);
        xPos += pdf.getTextWidth('$10,000 (ten thousand dollars)');

        pdf.setFont('helvetica', 'normal');
        const afterAmount = restOfLine.substring(restOfLine.indexOf('$10,000 (ten thousand dollars)') + '$10,000 (ten thousand dollars)'.length);
        pdf.text(afterAmount, xPos, yPosition);
      } else {
        pdf.text(restOfLine, xPos, yPosition);
      }
    } else {
      // Handle continuation lines
      if (line.includes('$10,000 (ten thousand dollars)')) {
        const beforeAmount = line.substring(0, line.indexOf('$10,000'));
        pdf.setFont('helvetica', 'normal');
        pdf.text(beforeAmount, xPos, yPosition);
        xPos += pdf.getTextWidth(beforeAmount);

        pdf.setFont('helvetica', 'bold');
        pdf.text('$10,000 (ten thousand dollars)', xPos, yPosition);
        xPos += pdf.getTextWidth('$10,000 (ten thousand dollars)');

        pdf.setFont('helvetica', 'normal');
        const afterAmount = line.substring(line.indexOf('$10,000 (ten thousand dollars)') + '$10,000 (ten thousand dollars)'.length);
        pdf.text(afterAmount, xPos, yPosition);
      } else {
        pdf.setFont('helvetica', 'normal');
        pdf.text(line, xPos, yPosition);
      }
    }
    yPosition += 4.5;
  });

  yPosition += 2;

  // Patient initials - Right aligned
  if (data.labFeeInitials) {
    const rightColumnX = pageWidth - margin - 30;
    pdf.setFont('helvetica', 'bold');
    pdf.text('Patient initials:', rightColumnX - 30, yPosition);
    pdf.setFont('helvetica', 'normal');
    pdf.text(data.labFeeInitials, rightColumnX, yPosition);
  }

  yPosition += 15;

  // Section 3: Warranty & Care Package Conditions
  yPosition = checkPageBreak(pdf, yPosition, 90, pageWidth, pageHeight, margin, logoImg, letterheadImg, logoHeight, watermarkImg, data.dateOfExecution || new Date().toISOString().split('T')[0]);

  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(55, 91, 220);
  pdf.text('3. Warranty & Care Package Conditions', margin, yPosition);
  yPosition += 8;

  // Blue box for warranty content
  const warrantyBoxWidth = pageWidth - 2 * margin;
  pdf.setDrawColor(55, 91, 220);
  pdf.setFillColor(240, 245, 255);
  pdf.setLineWidth(0.4);
  pdf.rect(margin, yPosition, warrantyBoxWidth, 52, 'FD');

  yPosition += 6;

  pdf.setFontSize(9);
  pdf.setTextColor(0, 0, 0);

  // Title line - using splitTextToSize for proper wrapping
  const titleParagraph = '3-Year "Peace of Mind" Guarantee covers materials & workmanship only if BOTH conditions are met:';
  const titleLines = pdf.splitTextToSize(titleParagraph, warrantyBoxWidth - 12);

  titleLines.forEach((line: string, index: number) => {
    let xPos = margin + 6;

    // First line with bold parts
    if (index === 0) {
      if (line.includes('3-Year "Peace of Mind" Guarantee')) {
        pdf.setFont('helvetica', 'bold');
        const guaranteeText = '3-Year "Peace of Mind" Guarantee';
        pdf.text(guaranteeText, xPos, yPosition);
        xPos += pdf.getTextWidth(guaranteeText);

        const afterGuarantee = line.substring(line.indexOf('3-Year "Peace of Mind" Guarantee') + guaranteeText.length);

        if (afterGuarantee.includes('materials & workmanship')) {
          const beforeMaterials = afterGuarantee.substring(0, afterGuarantee.indexOf('materials & workmanship'));
          pdf.setFont('helvetica', 'normal');
          pdf.text(beforeMaterials, xPos, yPosition);
          xPos += pdf.getTextWidth(beforeMaterials);

          pdf.setFont('helvetica', 'bold');
          const materialsText = 'materials & workmanship';
          pdf.text(materialsText, xPos, yPosition);
          xPos += pdf.getTextWidth(materialsText);

          pdf.setFont('helvetica', 'normal');
          const afterMaterials = afterGuarantee.substring(afterGuarantee.indexOf('materials & workmanship') + materialsText.length);
          pdf.text(afterMaterials, xPos, yPosition);
        } else {
          pdf.setFont('helvetica', 'normal');
          pdf.text(afterGuarantee, xPos, yPosition);
        }
      } else {
        pdf.setFont('helvetica', 'normal');
        pdf.text(line, xPos, yPosition);
      }
    } else {
      // Continuation lines
      if (line.includes('materials & workmanship')) {
        const beforeMaterials = line.substring(0, line.indexOf('materials & workmanship'));
        pdf.setFont('helvetica', 'normal');
        pdf.text(beforeMaterials, xPos, yPosition);
        xPos += pdf.getTextWidth(beforeMaterials);

        pdf.setFont('helvetica', 'bold');
        const materialsText = 'materials & workmanship';
        pdf.text(materialsText, xPos, yPosition);
        xPos += pdf.getTextWidth(materialsText);

        pdf.setFont('helvetica', 'normal');
        const afterMaterials = line.substring(line.indexOf('materials & workmanship') + materialsText.length);
        pdf.text(afterMaterials, xPos, yPosition);
      } else {
        pdf.setFont('helvetica', 'normal');
        pdf.text(line, xPos, yPosition);
      }
    }
    yPosition += 4.5;
  });

  yPosition += 2;

  // Condition 1
  pdf.setFont('helvetica', 'normal');
  pdf.text('1. Attend scheduled follow-up visits every 6 months.', margin + 10, yPosition);
  yPosition += 5;

  // Condition 2
  pdf.text(`2. Enroll in the Post-Surgery Care Package at $${data.carePackageFee || '3450.00'} dollars.`, margin + 10, yPosition);
  yPosition += 7;

  // Checkboxes
  const warrantyCheckboxSize = 4;

  // Enroll checkbox
  pdf.setDrawColor(55, 91, 220);
  pdf.setFillColor(255, 255, 255);
  pdf.rect(margin + 10, yPosition, warrantyCheckboxSize, warrantyCheckboxSize, 'FD');
  if (data.carePackageElection === 'enroll') {
    pdf.setDrawColor(76, 175, 80);
    pdf.setLineWidth(0.8);
    pdf.line(margin + 10.5, yPosition + 2, margin + 11.5, yPosition + 3.5);
    pdf.line(margin + 11.5, yPosition + 3.5, margin + 13.5, yPosition + 0.5);
  }

  // Enroll text with proper wrapping
  const enrollText = 'I elect to enroll in the Care Package and understand its terms.';
  const enrollLines = pdf.splitTextToSize(enrollText, warrantyBoxWidth - 30);
  enrollLines.forEach((line: string, index: number) => {
    let xPos = margin + 17;
    const lineYPos = yPosition + 3 + (index * 4.5);

    if (line.includes('to enroll')) {
      const beforeEnroll = line.substring(0, line.indexOf('to enroll'));
      pdf.setFont('helvetica', 'normal');
      pdf.text(beforeEnroll, xPos, lineYPos);
      xPos += pdf.getTextWidth(beforeEnroll);

      pdf.setFont('helvetica', 'bold');
      pdf.text('to enroll', xPos, lineYPos);
      xPos += pdf.getTextWidth('to enroll');

      pdf.setFont('helvetica', 'normal');
      const afterEnroll = line.substring(line.indexOf('to enroll') + 'to enroll'.length);
      pdf.text(afterEnroll, xPos, lineYPos);
    } else {
      pdf.setFont('helvetica', 'normal');
      pdf.text(line, xPos, lineYPos);
    }
  });
  yPosition += 3 + (enrollLines.length * 4.5) + 2;

  // Defer checkbox
  pdf.setDrawColor(55, 91, 220);
  pdf.setFillColor(255, 255, 255);
  pdf.rect(margin + 10, yPosition, warrantyCheckboxSize, warrantyCheckboxSize, 'FD');
  if (data.carePackageElection === 'defer') {
    pdf.setDrawColor(76, 175, 80);
    pdf.setLineWidth(0.8);
    pdf.line(margin + 10.5, yPosition + 2, margin + 11.5, yPosition + 3.5);
    pdf.line(margin + 11.5, yPosition + 3.5, margin + 13.5, yPosition + 0.5);
  }

  // Defer text with proper wrapping
  const deferText = 'I elect to defer enrollment, and agree to pay for any complications within 3 years and thereafter.';
  const deferLines = pdf.splitTextToSize(deferText, warrantyBoxWidth - 30);
  deferLines.forEach((line: string, index: number) => {
    let xPos = margin + 17;
    const lineYPos = yPosition + 3 + (index * 4.5);

    if (line.includes('to defer')) {
      const beforeDefer = line.substring(0, line.indexOf('to defer'));
      pdf.setFont('helvetica', 'normal');
      pdf.text(beforeDefer, xPos, lineYPos);
      xPos += pdf.getTextWidth(beforeDefer);

      pdf.setFont('helvetica', 'bold');
      pdf.text('to defer', xPos, lineYPos);
      xPos += pdf.getTextWidth('to defer');

      pdf.setFont('helvetica', 'normal');
      const afterDefer = line.substring(line.indexOf('to defer') + 'to defer'.length);
      pdf.text(afterDefer, xPos, lineYPos);
    } else {
      pdf.setFont('helvetica', 'normal');
      pdf.text(line, xPos, lineYPos);
    }
  });
  yPosition += 3 + (deferLines.length * 4.5) + 5;

  // Patient initials - Right aligned inside the box at bottom right
  const warrantyInitialsX = pageWidth - margin - 12;
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(9);
  pdf.text('Patient initials:', warrantyInitialsX - 35, yPosition);

  // Draw underline for initials
  const initialsFieldX = warrantyInitialsX - 10;
  pdf.setLineWidth(0.3);
  pdf.setDrawColor(0, 0, 0);
  pdf.line(initialsFieldX, yPosition + 1, initialsFieldX + 8, yPosition + 1);

  // Display initials if present
  if (data.warrantyInitials) {
    pdf.setFont('helvetica', 'normal');
    pdf.text(data.warrantyInitials, initialsFieldX + 4, yPosition, { align: 'center' });
  }

  yPosition += 15;

  // Section 4: Payment & Balance Terms
  yPosition = checkPageBreak(pdf, yPosition, 90, pageWidth, pageHeight, margin, logoImg, letterheadImg, logoHeight, watermarkImg, data.dateOfExecution || new Date().toISOString().split('T')[0]);

  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(55, 91, 220);
  pdf.text('4. Payment & Balance Terms', margin, yPosition);
  yPosition += 8;

  // Two columns: Patient Payment Today and Remaining Balance
  const colWidth = (pageWidth - 2 * margin - 10) / 2;

  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(0, 0, 0);
  pdf.text('Patient Payment Today', margin, yPosition);

  // Remaining Balance label
  const remainingBalanceX = margin + colWidth + 10;
  pdf.text('Remaining Balance', remainingBalanceX, yPosition);

  // Auto-calculated text on next line
  yPosition += 5;
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(100, 100, 100);
  pdf.text('(Auto-calculated)', remainingBalanceX, yPosition);
  yPosition += 6;

  // Values
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(55, 91, 220);
  pdf.text(`$${data.patientPaymentToday || '0.00'}`, margin, yPosition);

  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(55, 91, 220);
  pdf.text(`$${data.remainingBalance || '0.00'}`, remainingBalanceX, yPosition);
  yPosition += 10;

  // Payment Calculation Summary box
  const summaryBoxWidth = pageWidth - 2 * margin;
  const summaryBoxHeight = data.carePackageElection === 'enroll' ? 50 : 45;
  pdf.setDrawColor(200, 200, 200);
  pdf.setFillColor(250, 250, 250);
  pdf.setLineWidth(0.3);
  pdf.rect(margin, yPosition, summaryBoxWidth, summaryBoxHeight, 'FD');

  yPosition += 6;

  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(100, 100, 100);
  pdf.text('Payment Calculation Summary', margin + 3, yPosition);
  yPosition += 7;

  // Base Treatment Cost
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(0, 0, 0);
  pdf.text('Base Treatment Cost:', margin + 3, yPosition);
  pdf.text(`$${data.totalCostOfTreatment || '0.00'}`, summaryBoxWidth + margin - 3, yPosition, { align: 'right' });
  yPosition += 6;

  // Care Package Fee (if enrolled)
  if (data.carePackageElection === 'enroll') {
    pdf.setTextColor(55, 91, 220);
    pdf.text('+ Care Package Fee:', margin + 3, yPosition);
    pdf.text(`+$${data.carePackageFee || '0.00'}`, summaryBoxWidth + margin - 3, yPosition, { align: 'right' });
    yPosition += 6;
  }

  // Total Amount Due
  pdf.setDrawColor(200, 200, 200);
  pdf.setLineWidth(0.2);
  pdf.line(margin + 3, yPosition, summaryBoxWidth + margin - 3, yPosition);
  yPosition += 5;

  const baseCost = parseFloat(data.totalCostOfTreatment) || 0;
  const carePackageFee = parseFloat(data.carePackageFee) || 0;
  const totalCost = data.carePackageElection === 'enroll' ? baseCost + carePackageFee : baseCost;

  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(0, 0, 0);
  pdf.text('Total Amount Due:', margin + 3, yPosition);
  pdf.text(`$${totalCost.toFixed(2)}`, summaryBoxWidth + margin - 3, yPosition, { align: 'right' });
  yPosition += 6;

  // Payment Today
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(76, 175, 80);
  pdf.text('- Payment Today:', margin + 3, yPosition);
  pdf.text(`-$${data.patientPaymentToday || '0.00'}`, summaryBoxWidth + margin - 3, yPosition, { align: 'right' });
  yPosition += 6;

  // Remaining Balance
  pdf.setDrawColor(200, 200, 200);
  pdf.line(margin + 3, yPosition, summaryBoxWidth + margin - 3, yPosition);
  yPosition += 5;

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(11);
  pdf.setTextColor(0, 0, 0);
  pdf.text('Remaining Balance:', margin + 3, yPosition);
  pdf.setTextColor(55, 91, 220);
  pdf.text(`$${data.remainingBalance || '0.00'}`, summaryBoxWidth + margin - 3, yPosition, { align: 'right' });
  yPosition += 12;

  // Remaining Payment Plan
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(0, 0, 0);
  pdf.text('Remaining Payment Plan', margin, yPosition);
  yPosition += 5;

  pdf.setFont('helvetica', 'normal');
  const paymentPlanText = data.remainingPaymentPlan
    ? data.remainingPaymentPlan.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())
    : 'Select payment plan...';
  pdf.text(paymentPlanText, margin, yPosition);
  yPosition += 8;

  // Late Payment Penalty and Credit Reporting box
  const penaltyBoxWidth = pageWidth - 2 * margin;
  pdf.setDrawColor(55, 91, 220);
  pdf.setFillColor(240, 245, 255);
  pdf.setLineWidth(0.4);
  pdf.rect(margin, yPosition, penaltyBoxWidth, 20, 'FD');

  yPosition += 5;

  pdf.setFontSize(9);
  pdf.setTextColor(55, 91, 220);

  // Late Payment Penalty
  pdf.setFont('helvetica', 'bold');
  pdf.text('Late Payment Penalty:', margin + 3, yPosition);
  pdf.setFont('helvetica', 'normal');
  const penaltyWidth = pdf.getTextWidth('Late Payment Penalty:');
  pdf.text(' A $100 will be charged on any unpaid balance.', margin + 3 + penaltyWidth, yPosition);
  yPosition += 5;

  // Credit Reporting
  pdf.setFont('helvetica', 'bold');
  pdf.text('Credit Reporting:', margin + 3, yPosition);
  pdf.setFont('helvetica', 'normal');
  const creditWidth = pdf.getTextWidth('Credit Reporting:');
  pdf.text(' I authorize referral of any unpaid balance to collections and credit bureaus if I default.', margin + 3 + creditWidth, yPosition);
  yPosition += 7;

  // Patient initials - Right aligned inside the box at bottom right
  const paymentInitialsX = pageWidth - margin - 12;
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(9);
  pdf.setTextColor(0, 0, 0);
  pdf.text('Patient initials:', paymentInitialsX - 35, yPosition);

  // Draw underline for initials
  const paymentInitialsFieldX = paymentInitialsX - 10;
  pdf.setLineWidth(0.3);
  pdf.setDrawColor(0, 0, 0);
  pdf.line(paymentInitialsFieldX, yPosition + 1, paymentInitialsFieldX + 8, yPosition + 1);

  // Display initials if present
  if (data.paymentTermsInitials) {
    pdf.setFont('helvetica', 'normal');
    pdf.text(data.paymentTermsInitials, paymentInitialsFieldX + 4, yPosition, { align: 'center' });
  }

  yPosition += 15;

  // Section 5: Capacity, Language & HIPAA Acknowledgment
  yPosition = checkPageBreak(pdf, yPosition, 50, pageWidth, pageHeight, margin, logoImg, letterheadImg, logoHeight, watermarkImg, data.dateOfExecution || new Date().toISOString().split('T')[0]);

  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(55, 91, 220);
  pdf.text('5. Capacity, Language & HIPAA Acknowledgment', margin, yPosition);
  yPosition += 8;

  // Blue box for capacity content
  const capacityBoxWidth = pageWidth - 2 * margin;
  pdf.setDrawColor(55, 91, 220);
  pdf.setFillColor(240, 245, 255);
  pdf.setLineWidth(0.4);
  pdf.rect(margin, yPosition, capacityBoxWidth, 30, 'FD');

  yPosition += 6;

  pdf.setFontSize(9);
  pdf.setTextColor(0, 0, 0);

  // Checkboxes
  const capacityCheckboxSize = 4;

  // Checkbox 1: Capacity confirmed
  pdf.setDrawColor(55, 91, 220);
  pdf.setFillColor(255, 255, 255);
  pdf.rect(margin + 6, yPosition, capacityCheckboxSize, capacityCheckboxSize, 'FD');
  if (data.capacityConfirmed) {
    pdf.setDrawColor(76, 175, 80);
    pdf.setLineWidth(0.8);
    pdf.line(margin + 6.5, yPosition + 2, margin + 7.5, yPosition + 3.5);
    pdf.line(margin + 7.5, yPosition + 3.5, margin + 9.5, yPosition + 0.5);
  }

  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(0, 0, 0);
  pdf.text('I confirm I am >= 18 years old, of sound mind, and fluent in English (or declined an interpreter).', margin + 13, yPosition + 3);
  yPosition += 7;

  // Checkbox 2: HIPAA acknowledged
  pdf.setDrawColor(55, 91, 220);
  pdf.setFillColor(255, 255, 255);
  pdf.rect(margin + 6, yPosition, capacityCheckboxSize, capacityCheckboxSize, 'FD');
  if (data.hipaaAcknowledged) {
    pdf.setDrawColor(76, 175, 80);
    pdf.setLineWidth(0.8);
    pdf.line(margin + 6.5, yPosition + 2, margin + 7.5, yPosition + 3.5);
    pdf.line(margin + 7.5, yPosition + 3.5, margin + 9.5, yPosition + 0.5);
  }

  pdf.setFont('helvetica', 'normal');
  const hipaaText = 'I acknowledge receipt of the Notice of Privacy Practices and consent to communication of billing';
  pdf.text(hipaaText, margin + 13, yPosition + 3);
  yPosition += 5;
  pdf.text('information via unencrypted email/SMS.', margin + 13, yPosition + 3);
  yPosition += 7;

  // Patient initials - Right aligned inside the box at bottom right
  const capacityInitialsX = pageWidth - margin - 12;
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(9);
  pdf.setTextColor(0, 0, 0);
  pdf.text('Patient initials:', capacityInitialsX - 35, yPosition);

  // Draw underline for initials
  const capacityInitialsFieldX = capacityInitialsX - 10;
  pdf.setLineWidth(0.3);
  pdf.setDrawColor(0, 0, 0);
  pdf.line(capacityInitialsFieldX, yPosition + 1, capacityInitialsFieldX + 8, yPosition + 1);

  // Display initials if present
  if (data.capacityInitials) {
    pdf.setFont('helvetica', 'normal');
    pdf.text(data.capacityInitials, capacityInitialsFieldX + 4, yPosition, { align: 'center' });
  }

  yPosition += 15;

  // Section 6: Dispute Resolution & Legal Provisions
  yPosition = checkPageBreak(pdf, yPosition, 60, pageWidth, pageHeight, margin, logoImg, letterheadImg, logoHeight, watermarkImg, data.dateOfExecution || new Date().toISOString().split('T')[0]);

  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(55, 91, 220);
  pdf.text('6. Dispute Resolution & Legal Provisions', margin, yPosition);
  yPosition += 8;

  // Blue box for dispute content
  const disputeBoxWidth = pageWidth - 2 * margin;
  pdf.setDrawColor(55, 91, 220);
  pdf.setFillColor(240, 245, 255);
  pdf.setLineWidth(0.4);
  pdf.rect(margin, yPosition, disputeBoxWidth, 42, 'FD');

  yPosition += 6;

  pdf.setFontSize(9);
  pdf.setTextColor(55, 91, 220);

  // 1. Governing Law & Venue
  pdf.setFont('helvetica', 'bold');
  pdf.text('1. Governing Law & Venue:', margin + 6, yPosition);
  pdf.setFont('helvetica', 'normal');
  const govLawWidth = pdf.getTextWidth('1. Governing Law & Venue:');
  pdf.text(' This Agreement is governed by New York Law. Any dispute shall be', margin + 6 + govLawWidth, yPosition);
  yPosition += 5;
  pdf.text('resolved by ', margin + 6, yPosition);
  const resolvedWidth = pdf.getTextWidth('resolved by ');
  pdf.setFont('helvetica', 'bold');
  pdf.text('binding arbitration', margin + 6 + resolvedWidth, yPosition);
  const arbitrationWidth = pdf.getTextWidth('binding arbitration');
  pdf.setFont('helvetica', 'normal');
  pdf.text(' in Monroe County, NY under AAA rules.', margin + 6 + resolvedWidth + arbitrationWidth, yPosition);
  yPosition += 8;

  // 2. Amendments
  pdf.setFont('helvetica', 'bold');
  pdf.text('2. Amendments:', margin + 6, yPosition);
  pdf.setFont('helvetica', 'normal');
  const amendWidth = pdf.getTextWidth('2. Amendments:');
  pdf.text(' No modification is effective unless in writing and signed by both parties.', margin + 6 + amendWidth, yPosition);
  yPosition += 8;

  // 3. Severability
  pdf.setFont('helvetica', 'bold');
  pdf.text('3. Severability:', margin + 6, yPosition);
  pdf.setFont('helvetica', 'normal');
  const severWidth = pdf.getTextWidth('3. Severability:');
  pdf.text(' If any provision is deemed invalid, the remainder shall remain in full force.', margin + 6 + severWidth, yPosition);
  yPosition += 8;

  // Patient initials - Right aligned inside the box at bottom right
  const disputeInitialsX = pageWidth - margin - 12;
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(9);
  pdf.setTextColor(0, 0, 0);
  pdf.text('Patient initials:', disputeInitialsX - 35, yPosition);

  // Draw underline for initials
  const disputeInitialsFieldX = disputeInitialsX - 10;
  pdf.setLineWidth(0.3);
  pdf.setDrawColor(0, 0, 0);
  pdf.line(disputeInitialsFieldX, yPosition + 1, disputeInitialsFieldX + 8, yPosition + 1);

  // Display initials if present
  if (data.disputeInitials) {
    pdf.setFont('helvetica', 'normal');
    pdf.text(data.disputeInitials, disputeInitialsFieldX + 4, yPosition, { align: 'center' });
  }

  yPosition += 15;

  // Section 7: Signatures & Witness
  yPosition = checkPageBreak(pdf, yPosition, 120, pageWidth, pageHeight, margin, logoImg, letterheadImg, logoHeight, watermarkImg, data.dateOfExecution || new Date().toISOString().split('T')[0]);

  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(55, 91, 220);
  pdf.text('7. Signatures & Witness', margin, yPosition);
  yPosition += 8;

  // Agreement checkbox
  const checkboxSize = 4;
  pdf.setDrawColor(55, 91, 220);
  pdf.setFillColor(255, 255, 255);
  pdf.rect(margin, yPosition, checkboxSize, checkboxSize, 'FD');

  if (data.termsAgreed) {
    pdf.setDrawColor(76, 175, 80);
    pdf.setLineWidth(0.8);
    pdf.line(margin + 0.5, yPosition + 2, margin + 1.5, yPosition + 3.5);
    pdf.line(margin + 1.5, yPosition + 3.5, margin + 3.5, yPosition + 0.5);
  }

  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(0, 0, 0);
  pdf.text('I have read, understood, and agreed to all terms above.', margin + 7, yPosition + 3);
  yPosition += 10;

  // Patient Signature Section
  const signatureBoxWidth = pageWidth - 2 * margin;
  pdf.setDrawColor(55, 91, 220);
  pdf.setLineWidth(0.4);
  pdf.rect(margin, yPosition, signatureBoxWidth, 32, 'S');

  yPosition += 6;

  // Patient info in columns
  const col1X = margin + 5;
  const col2X = margin + (signatureBoxWidth / 3) + 5;
  const col3X = margin + (2 * signatureBoxWidth / 3) + 5;

  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(0, 0, 0);

  // Column 1: Patient Name
  pdf.text('Patient Full Name (print)', col1X, yPosition);
  yPosition += 5;
  pdf.setFont('helvetica', 'normal');
  pdf.text(data.patientName || '', col1X, yPosition);

  // Column 2: Date/Time
  const col2YStart = yPosition - 5;
  pdf.setFont('helvetica', 'bold');
  pdf.text('Date/Time', col2X, col2YStart);
  pdf.setFont('helvetica', 'normal');
  const patientDateTime = data.patientSignatureDate && data.patientSignatureTime
    ? `${data.patientSignatureDate} ${data.patientSignatureTime}`
    : data.patientSignatureDate || '';
  pdf.text(patientDateTime, col2X, col2YStart + 5);

  // Column 3: Patient Signature
  const col3YStart = yPosition - 5;
  pdf.setFont('helvetica', 'bold');
  pdf.text('Patient Signature', col3X, col3YStart);

  yPosition += 5;

  if (data.patientSignature) {
    try {
      pdf.addImage(data.patientSignature, 'PNG', col3X, yPosition - 3, 50, 12);
    } catch (error) {
      console.error('Error adding patient signature:', error);
    }
  }

  yPosition += 10;

  // Signature line
  pdf.setDrawColor(100, 100, 100);
  pdf.setLineWidth(0.2);
  pdf.line(col3X, yPosition, col3X + 50, yPosition);

  yPosition += 15;

  // Witness Signature Section
  pdf.setDrawColor(55, 91, 220);
  pdf.setLineWidth(0.4);
  pdf.rect(margin, yPosition, signatureBoxWidth, 32, 'S');

  yPosition += 6;

  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(0, 0, 0);

  // Column 1: Witness Name & Role
  pdf.text('Staff Witness Name & Role', col1X, yPosition);
  yPosition += 5;
  pdf.setFont('helvetica', 'normal');
  pdf.text(data.witnessName || '', col1X, yPosition);
  yPosition += 4;
  pdf.text(data.witnessRole || '', col1X, yPosition);

  // Column 2: Date/Time
  const witnessCol2YStart = yPosition - 9;
  pdf.setFont('helvetica', 'bold');
  pdf.text('Date/Time', col2X, witnessCol2YStart);
  pdf.setFont('helvetica', 'normal');
  const witnessDateTime = data.witnessSignatureDate && data.witnessSignatureTime
    ? `${data.witnessSignatureDate} ${data.witnessSignatureTime}`
    : data.witnessSignatureDate || '';
  pdf.text(witnessDateTime, col2X, witnessCol2YStart + 5);

  // Column 3: Witness Signature
  const witnessCol3YStart = yPosition - 9;
  pdf.setFont('helvetica', 'bold');
  pdf.text('Witness Signature', col3X, witnessCol3YStart);

  yPosition += 5;

  if (data.witnessSignature) {
    try {
      pdf.addImage(data.witnessSignature, 'PNG', col3X, yPosition - 8, 50, 12);
    } catch (error) {
      console.error('Error adding witness signature:', error);
    }
  }

  yPosition += 5;

  // Signature line
  pdf.setDrawColor(100, 100, 100);
  pdf.setLineWidth(0.2);
  pdf.line(col3X, yPosition, col3X + 50, yPosition);

  yPosition += 15;

  // Office Use Only Section
  yPosition = checkPageBreak(pdf, yPosition, 30, pageWidth, pageHeight, margin, logoImg, letterheadImg, logoHeight, watermarkImg, data.dateOfExecution || new Date().toISOString().split('T')[0]);

  // Blue box for office use
  const officeBoxWidth = pageWidth - 2 * margin;
  pdf.setDrawColor(55, 91, 220);
  pdf.setFillColor(240, 245, 255);
  pdf.setLineWidth(0.4);
  pdf.rect(margin, yPosition, officeBoxWidth, 28, 'FD');

  yPosition += 5;

  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(55, 91, 220);
  pdf.text('Office Use Only:', margin + 4, yPosition);
  yPosition += 7;

  // Downloaded checkbox
  const officeCheckboxSize = 4;
  pdf.setDrawColor(55, 91, 220);
  pdf.setFillColor(255, 255, 255);
  pdf.rect(margin + 4, yPosition, officeCheckboxSize, officeCheckboxSize, 'FD');

  if (data.downloadedToDentalManagementSoftware) {
    pdf.setDrawColor(76, 175, 80);
    pdf.setLineWidth(0.8);
    pdf.line(margin + 4.5, yPosition + 2, margin + 5.5, yPosition + 3.5);
    pdf.line(margin + 5.5, yPosition + 3.5, margin + 7.5, yPosition + 0.5);
  }

  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(0, 0, 0);
  pdf.text('Downloaded to Dental Management Software', margin + 11, yPosition + 3);
  yPosition += 10;

  // Staff initials
  pdf.setFont('helvetica', 'bold');
  pdf.text('Confirmed by (Staff Initial):', margin + 4, yPosition);

  // Draw underline for staff initials
  const staffInitialsX = margin + 60;
  pdf.setLineWidth(0.3);
  pdf.setDrawColor(0, 0, 0);
  pdf.line(staffInitialsX, yPosition + 1, staffInitialsX + 10, yPosition + 1);

  // Display staff initials if present
  if (data.confirmedByStaffInitials) {
    pdf.setFont('helvetica', 'normal');
    pdf.text(data.confirmedByStaffInitials, staffInitialsX + 5, yPosition, { align: 'center' });
  }

  yPosition += 10;

  // Add page numbers to all pages
  const totalPages = pdf.internal.pages.length - 1;
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);

    const footerY = pageHeight - margin - 5;
    pdf.setFontSize(8);
    pdf.setFont('Fira Sans', 'normal');
    pdf.setTextColor(0, 0, 0);
    const pageNumberText = `${i} of ${totalPages}`;
    pdf.text(pageNumberText, pageWidth - margin - 5, footerY - 3, { align: 'right' });
  }

  // Save the PDF
  const fileName = `FinancialAgreement_${data.patientName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
  pdf.save(fileName);
}

