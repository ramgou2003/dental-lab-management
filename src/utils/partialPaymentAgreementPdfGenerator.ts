import jsPDF from 'jspdf';

interface PartialPaymentAgreementPdfData {
  agreementDate: string;
  providerLicenseNumber: string;
  firstName: string;
  lastName: string;
  address: string;
  email: string;
  phone: string;
  paymentAmount: string;
  paymentDate: string;
  estimatedTotalCost: string;
  remainingBalance: string;
  finalPaymentDueDate: string;
  selectedTreatments: string[];
  readAndUnderstood: boolean;
  understandRefundPolicy: boolean;
  understandFullPaymentRequired: boolean;
  agreeNoDisputes: boolean;
  understandOneYearValidity: boolean;
  understandNoCashPayments: boolean;
  enteringVoluntarily: boolean;
  patientFullName: string;
  patientSignature: string;
  patientSignatureDate: string;
  providerRepName: string;
  providerRepTitle: string;
  practiceSignatureDate: string;
  formDate: string;
}

/**
 * Add header and footer to a PDF page (EXACT SAME as Thank You Pre-Surgery form)
 */
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

/**
 * Add watermark to a PDF page
 */
function addWatermark(pdf: any, pageWidth: number, pageHeight: number, watermarkImg: HTMLImageElement | null) {
  if (!watermarkImg) return;

  try {
    const watermarkWidth = 100;
    const watermarkHeight = (watermarkImg.height / watermarkImg.width) * watermarkWidth;
    const xPosition = (pageWidth - watermarkWidth) / 2;
    const yPosition = (pageHeight - watermarkHeight) / 2;

    if (pdf.setOpacity) {
      pdf.setOpacity(0.15);
    }
    pdf.addImage(watermarkImg, 'PNG', xPosition, yPosition, watermarkWidth, watermarkHeight);
    if (pdf.setOpacity) {
      pdf.setOpacity(1);
    }
  } catch (error) {
    console.warn('Could not add watermark:', error);
  }
}

export async function generatePartialPaymentAgreementPdf(data: PartialPaymentAgreementPdfData) {
  try {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 15;
    const topMargin = 5;
    let yPosition = topMargin;
    let logoHeight = 0;
    let logoImg: HTMLImageElement | null = null;
    let letterheadImg: HTMLImageElement | null = null;
    let watermarkImg: HTMLImageElement | null = null;

    // Load images
    try {
      logoImg = new Image();
      logoImg.crossOrigin = 'anonymous';
      await new Promise((resolve, reject) => {
        logoImg.onload = resolve;
        logoImg.onerror = reject;
        logoImg.src = '/logo.png';
      });
      const logoWidth = 50;
      logoHeight = (logoImg.height / logoImg.width) * logoWidth;
    } catch (error) {
      console.warn('Could not load logo image:', error);
      logoImg = null;
    }

    try {
      letterheadImg = new Image();
      letterheadImg.crossOrigin = 'anonymous';
      await new Promise((resolve, reject) => {
        letterheadImg.onload = resolve;
        letterheadImg.onerror = reject;
        letterheadImg.src = '/template/Letterhead.png';
      });
    } catch (error) {
      console.warn('Could not load letterhead image:', error);
      letterheadImg = null;
    }

    try {
      watermarkImg = new Image();
      watermarkImg.crossOrigin = 'anonymous';
      await new Promise((resolve, reject) => {
        watermarkImg.onload = resolve;
        watermarkImg.onerror = reject;
        watermarkImg.src = '/template/Logo icon white.png';
      });
    } catch (error) {
      console.warn('Could not load watermark image:', error);
      watermarkImg = null;
    }

    // Add watermark and header to first page
    addWatermark(pdf, pageWidth, pageHeight, watermarkImg);
    addHeaderAndFooter(pdf, pageWidth, pageHeight, margin, data.formDate, logoImg, letterheadImg, logoHeight);

    // Move yPosition below header
    yPosition = topMargin + logoHeight + 1 + 8 + 6 + 6 + (letterheadImg ? 60 : 0) + 10;
    yPosition -= 8;

    // Add title
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(55, 91, 220);
    pdf.text('Partial Payment Agreement for Future Treatment', pageWidth / 2, yPosition, { align: 'center' });
    pdf.setTextColor(0, 0, 0);
    yPosition += 10;

    // Agreement Details Section
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(55, 91, 220);
    pdf.text('Agreement Details', margin, yPosition);
    pdf.setTextColor(0, 0, 0);
    yPosition += 6;

    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    const agreementLabelWidth = 50;

    pdf.setFont('helvetica', 'bold');
    pdf.text('Agreement Date:', margin, yPosition);
    pdf.setFont('helvetica', 'normal');
    pdf.text(data.agreementDate, margin + agreementLabelWidth, yPosition);
    yPosition += 4;

    pdf.setFont('helvetica', 'bold');
    pdf.text('Provider License Number:', margin, yPosition);
    pdf.setFont('helvetica', 'normal');
    pdf.text(data.providerLicenseNumber, margin + agreementLabelWidth, yPosition);
    yPosition += 4;

    pdf.setFont('helvetica', 'bold');
    pdf.text('Provider Name:', margin, yPosition);
    pdf.setFont('helvetica', 'normal');
    pdf.text('New York Dental Implants', margin + agreementLabelWidth, yPosition);
    yPosition += 4;

    pdf.setFont('helvetica', 'bold');
    pdf.text('Patient Name:', margin, yPosition);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`${data.firstName} ${data.lastName}`, margin + agreementLabelWidth, yPosition);
    yPosition += 6;

    // Patient Information Section
    if (yPosition > pageHeight - 80) {
      pdf.addPage();
      addWatermark(pdf, pageWidth, pageHeight, watermarkImg);
      addHeaderAndFooter(pdf, pageWidth, pageHeight, margin, data.formDate, logoImg, letterheadImg, logoHeight);
      yPosition = margin + 25;
    }

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(55, 91, 220);
    pdf.text('Patient Information', margin, yPosition);
    pdf.setTextColor(0, 0, 0);
    yPosition += 6;

    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    const col1X = margin;
    const col2X = pageWidth / 2 + 5;
    const labelWidth = 40;
    let col1Y = yPosition;
    let col2Y = yPosition;

    // Column 1
    pdf.setFont('helvetica', 'bold');
    pdf.text('First Name:', col1X, col1Y);
    pdf.setFont('helvetica', 'normal');
    pdf.text(data.firstName, col1X + labelWidth, col1Y);
    col1Y += 4;

    pdf.setFont('helvetica', 'bold');
    pdf.text('Address:', col1X, col1Y);
    pdf.setFont('helvetica', 'normal');
    pdf.text(data.address, col1X + labelWidth, col1Y);
    col1Y += 4;

    pdf.setFont('helvetica', 'bold');
    pdf.text('Phone:', col1X, col1Y);
    pdf.setFont('helvetica', 'normal');
    pdf.text(data.phone, col1X + labelWidth, col1Y);
    col1Y += 6;

    // Column 2
    pdf.setFont('helvetica', 'bold');
    pdf.text('Last Name:', col2X, col2Y);
    pdf.setFont('helvetica', 'normal');
    pdf.text(data.lastName, col2X + labelWidth, col2Y);
    col2Y += 4;

    pdf.setFont('helvetica', 'bold');
    pdf.text('Email:', col2X, col2Y);
    pdf.setFont('helvetica', 'normal');
    pdf.text(data.email, col2X + labelWidth, col2Y);
    col2Y += 6;

    yPosition = Math.max(col1Y, col2Y) + 2;

    // Payment Details Section
    if (yPosition > pageHeight - 80) {
      pdf.addPage();
      addWatermark(pdf, pageWidth, pageHeight, watermarkImg);
      addHeaderAndFooter(pdf, pageWidth, pageHeight, margin, data.formDate, logoImg, letterheadImg, logoHeight);
      yPosition = margin + 25;
    }

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(55, 91, 220);
    pdf.text('Payment Details', margin, yPosition);
    pdf.setTextColor(0, 0, 0);
    yPosition += 6;

    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    col1Y = yPosition;
    col2Y = yPosition;
    const paymentLabelWidth = 50;

    pdf.setFont('helvetica', 'bold');
    pdf.text('Payment Amount:', col1X, col1Y);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`$${data.paymentAmount}`, col1X + paymentLabelWidth, col1Y);
    col1Y += 4;

    pdf.setFont('helvetica', 'bold');
    pdf.text('Estimated Total Cost:', col1X, col1Y);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`$${data.estimatedTotalCost}`, col1X + paymentLabelWidth, col1Y);
    col1Y += 4;

    pdf.setFont('helvetica', 'bold');
    pdf.text('Final Payment Due Date:', col1X, col1Y);
    pdf.setFont('helvetica', 'normal');
    pdf.text(data.finalPaymentDueDate, col1X + paymentLabelWidth, col1Y);
    col1Y += 6;

    pdf.setFont('helvetica', 'bold');
    pdf.text('Payment Date:', col2X, col2Y);
    pdf.setFont('helvetica', 'normal');
    pdf.text(data.paymentDate, col2X + paymentLabelWidth, col2Y);
    col2Y += 4;

    pdf.setFont('helvetica', 'bold');
    pdf.text('Remaining Balance:', col2X, col2Y);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`$${data.remainingBalance}`, col2X + paymentLabelWidth, col2Y);
    col2Y += 6;

    yPosition = Math.max(col1Y, col2Y) + 2;

    // Accepted Payment Methods Section
    if (yPosition > pageHeight - 50) {
      pdf.addPage();
      addWatermark(pdf, pageWidth, pageHeight, watermarkImg);
      addHeaderAndFooter(pdf, pageWidth, pageHeight, margin, data.formDate, logoImg, letterheadImg, logoHeight);
      yPosition = margin + 25;
    }

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(55, 91, 220);
    pdf.text('Accepted Payment Methods', margin, yPosition);
    pdf.setTextColor(0, 0, 0);
    yPosition += 4;

    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');

    // ACH Bank Transfer
    pdf.text('• ACH Bank Transfer (Checking Account)', margin + 3, yPosition);
    yPosition += 4;

    // Debit Cards
    pdf.text('• Debit Cards', margin + 3, yPosition);
    yPosition += 4;

    // Major Credit Cards
    pdf.text('• Major Credit Cards (Visa, Mastercard, Amex, Discover)', margin + 3, yPosition);
    yPosition += 4;

    // Cash installments NOT accepted
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(220, 53, 69);
    pdf.text('• Cash installments NOT accepted', margin + 3, yPosition);
    pdf.setTextColor(0, 0, 0);
    pdf.setFont('helvetica', 'normal');

    yPosition += 6;

    // Selected Treatments Section
    if (yPosition > pageHeight - 80) {
      pdf.addPage();
      addWatermark(pdf, pageWidth, pageHeight, watermarkImg);
      addHeaderAndFooter(pdf, pageWidth, pageHeight, margin, data.formDate, logoImg, letterheadImg, logoHeight);
      yPosition = margin + 25;
    }

    if (data.selectedTreatments && data.selectedTreatments.length > 0) {
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(55, 91, 220);
      pdf.text('Selected Treatments', margin, yPosition);
      pdf.setTextColor(0, 0, 0);
      yPosition += 6;

      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      for (const treatment of data.selectedTreatments) {
        if (yPosition > pageHeight - 30) {
          pdf.addPage();
          addWatermark(pdf, pageWidth, pageHeight, watermarkImg);
          addHeaderAndFooter(pdf, pageWidth, pageHeight, margin, data.formDate, logoImg, letterheadImg, logoHeight);
          yPosition = margin + 25;
        }
        pdf.text(`• ${treatment}`, margin + 5, yPosition);
        yPosition += 5;
      }
      yPosition += 3;
    }

    // Patient Acknowledgments Section
    if (yPosition > pageHeight - 80) {
      pdf.addPage();
      addWatermark(pdf, pageWidth, pageHeight, watermarkImg);
      addHeaderAndFooter(pdf, pageWidth, pageHeight, margin, data.formDate, logoImg, letterheadImg, logoHeight);
      yPosition = margin + 25;
    }

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(55, 91, 220);
    pdf.text('Patient Acknowledgments', margin, yPosition);
    yPosition += 6;

    const acknowledgments = [
      { key: 'readAndUnderstood', text: 'I have read and understood this agreement' },
      { key: 'understandRefundPolicy', text: 'I understand the refund policy' },
      { key: 'understandFullPaymentRequired', text: 'I understand full payment is required before treatment' },
      { key: 'agreeNoDisputes', text: 'I agree to no disputes regarding this agreement' },
      { key: 'understandOneYearValidity', text: 'I understand the credit is valid for one year' },
      { key: 'understandNoCashPayments', text: 'I understand no cash payments are accepted' },
      { key: 'enteringVoluntarily', text: 'I am entering this agreement voluntarily' }
    ];

    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(0, 0, 0);

    for (const ack of acknowledgments) {
      if (yPosition > pageHeight - 30) {
        pdf.addPage();
        addWatermark(pdf, pageWidth, pageHeight, watermarkImg);
        addHeaderAndFooter(pdf, pageWidth, pageHeight, margin, data.formDate, logoImg, letterheadImg, logoHeight);
        yPosition = margin + 25;
      }

      const isChecked = data[ack.key as keyof typeof data];
      pdf.setDrawColor(0, 0, 0);
      pdf.setLineWidth(0.3);
      pdf.rect(margin + 1, yPosition - 2.5, 3, 3, 'S');

      if (isChecked) {
        pdf.setDrawColor(0, 0, 0);
        pdf.setLineWidth(0.4);
        pdf.line(margin + 1.3, yPosition - 0.8, margin + 1.8, yPosition - 0.3);
        pdf.line(margin + 1.8, yPosition - 0.3, margin + 3.5, yPosition - 2.2);
      }

      pdf.text(ack.text, margin + 5, yPosition);
      yPosition += 5;
    }

    yPosition += 5;

    // Signatures Section
    if (yPosition > pageHeight - 60) {
      pdf.addPage();
      addWatermark(pdf, pageWidth, pageHeight, watermarkImg);
      addHeaderAndFooter(pdf, pageWidth, pageHeight, margin, data.formDate, logoImg, letterheadImg, logoHeight);
      yPosition = margin + 25;
    }

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(55, 91, 220);
    pdf.text('Signatures', margin, yPosition);
    yPosition += 8;

    const sigColWidth = (pageWidth - 2 * margin - 3) / 2;
    const sigCol1X = margin;
    const sigCol2X = margin + sigColWidth + 3;
    let sigCol1Y = yPosition;
    let sigCol2Y = yPosition;

    const sigLabelWidth = 30;

    // Provider Representative Section (LEFT)
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(0, 0, 0);
    pdf.text('Provider Representative', sigCol1X, sigCol1Y);
    sigCol1Y += 6;

    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Name:', sigCol1X, sigCol1Y);
    pdf.setFont('helvetica', 'normal');
    pdf.text(data.providerRepName || '', sigCol1X + sigLabelWidth, sigCol1Y);
    sigCol1Y += 4;

    pdf.setFont('helvetica', 'bold');
    pdf.text('Title:', sigCol1X, sigCol1Y);
    pdf.setFont('helvetica', 'normal');
    pdf.text(data.providerRepTitle || '', sigCol1X + sigLabelWidth, sigCol1Y);
    sigCol1Y += 4;

    pdf.setFont('helvetica', 'bold');
    pdf.text('Date:', sigCol1X, sigCol1Y);
    pdf.setFont('helvetica', 'normal');
    pdf.text(data.practiceSignatureDate || '', sigCol1X + sigLabelWidth, sigCol1Y);
    sigCol1Y += 6;

    // Patient Section (RIGHT)
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(0, 0, 0);
    pdf.text('Patient', sigCol2X, sigCol2Y);
    sigCol2Y += 4;

    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Name:', sigCol2X, sigCol2Y);
    pdf.setFont('helvetica', 'normal');
    pdf.text(data.patientFullName || '', sigCol2X + sigLabelWidth, sigCol2Y);
    sigCol2Y += 4;

    pdf.setFont('helvetica', 'bold');
    pdf.text('Date:', sigCol2X, sigCol2Y);
    pdf.setFont('helvetica', 'normal');
    pdf.text(data.patientSignatureDate || '', sigCol2X + sigLabelWidth, sigCol2Y);
    sigCol2Y += 6;

    if (data.patientSignature) {
      try {
        pdf.addImage(data.patientSignature, 'PNG', sigCol2X, sigCol2Y, sigColWidth - 2, 15);
      } catch (error) {
        console.warn('Could not add patient signature:', error);
      }
    }
    sigCol2Y += 18;

    // Add line below patient signature
    pdf.setDrawColor(200, 200, 200);
    pdf.setLineWidth(0.5);
    pdf.line(sigCol2X, sigCol2Y, sigCol2X + sigColWidth - 2, sigCol2Y);
    sigCol2Y += 4;
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    const lineCenter = sigCol2X + (sigColWidth - 2) / 2;
    pdf.text('Patient Signature', lineCenter, sigCol2Y, { align: 'center' });

    // Add page numbers
    const totalPages = pdf.internal.pages.length - 1;
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      const pageWidth = pdf.internal.pageSize.getWidth();
      const margin = 15;
      const footerY = pdf.internal.pageSize.getHeight() - margin - 5;

      pdf.setFontSize(8);
      pdf.setFont('Fira Sans', 'normal');
      pdf.setTextColor(0, 0, 0);
      const pageNumberText = `${i} of ${totalPages}`;
      pdf.text(pageNumberText, pageWidth - margin - 5, footerY - 3, { align: 'right' });
    }

    // Save PDF
    const fileName = `PartialPaymentAgreement_${data.firstName}_${data.lastName}_${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(fileName);

    console.log('Partial Payment Agreement PDF generated successfully:', fileName);
    return true;
  } catch (error) {
    console.error('Error generating Partial Payment Agreement PDF:', error);
    throw error;
  }
}

