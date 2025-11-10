import jsPDF from 'jspdf';

export interface MedicalRecordsReleasePdfData {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  hasAgreed?: boolean;
  patientSignature?: string;
  signatureDate?: string;
  signatureTime?: string;
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

  // Add website text
  pdf.setFontSize(12);
  pdf.setFont('Fira Sans', 'normal');
  pdf.setTextColor(55, 91, 220);
  pdf.text('www.nydentalimplants.com', pageWidth - margin, yPosition - 5, { align: 'right', charSpace: 0 });

  // Add blue line
  pdf.setDrawColor(55, 91, 220);
  pdf.setLineWidth(1);
  pdf.line(margin, yPosition, pageWidth - margin, yPosition);

  yPosition += 8;

  // Add date
  pdf.setFontSize(10);
  pdf.setFont('Fira Sans', 'normal');
  pdf.setTextColor(0, 0, 0);
  pdf.text(`Date: ${formDate}`, pageWidth - margin, yPosition, { align: 'right', charSpace: 0 });

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
 * Generate Medical Records Release Authorization PDF
 */
export async function generateMedicalRecordsReleasePdf(data: MedicalRecordsReleasePdfData) {
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
  addHeaderAndFooter(pdf, pageWidth, pageHeight, margin, data.signatureDate || new Date().toISOString().split('T')[0], logoImg, letterheadImg, logoHeight);

  // Move yPosition below header
  const topMargin = 5;
  let yPosition = topMargin + logoHeight + 1 + 8 + 6 + 6 + (letterheadImg ? 60 : 0) + 10;

  // Add title
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(55, 91, 220);
  pdf.text('Medical Records Release Authorization', pageWidth / 2, yPosition, { align: 'center', charSpace: 0 });

  pdf.setTextColor(0, 0, 0);
  yPosition += 12;

  // Patient Information Section
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(55, 91, 220);
  pdf.text('Patient Information', margin, yPosition, { charSpace: 0 });
  yPosition += 8;

  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(0, 0, 0);
  const patientInfo = [
    { label: 'First Name:', value: data.firstName || '' },
    { label: 'Last Name:', value: data.lastName || '' },
    { label: 'Date of Birth:', value: data.dateOfBirth || '' }
  ];

  patientInfo.forEach((item) => {
    pdf.setFont('helvetica', 'bold');
    pdf.text(item.label, margin, yPosition, { charSpace: 0 });
    pdf.setFont('helvetica', 'normal');
    pdf.text(item.value, margin + 35, yPosition, { charSpace: 0 });
    yPosition += 6;
  });

  yPosition += 10;

  // Authorization Content Section
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(55, 91, 220);
  pdf.text('Authorization Content', margin, yPosition, { charSpace: 0 });
  yPosition += 8;

  // Authorization text in blue box
  const authBoxWidth = pageWidth - 2 * margin;
  pdf.setDrawColor(55, 91, 220);
  pdf.setFillColor(240, 245, 255);
  pdf.setLineWidth(0.4);
  pdf.rect(margin, yPosition, authBoxWidth, 50, 'FD');

  yPosition += 6;

  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(0, 0, 0);
  const authText = 'By signing this form, I authorize you to release confidential health information about me, by releasing a copy of my medical records, or a summary or narrative of my protected health information, to the physician/person/facility/entity listed:';
  const authLines = pdf.splitTextToSize(authText, authBoxWidth - 12);
  authLines.forEach((line: string) => {
    pdf.text(line, margin + 6, yPosition, { charSpace: 0 });
    yPosition += 4.5;
  });

  yPosition += 3;

  // Recipient information box
  pdf.setDrawColor(55, 91, 220);
  pdf.setFillColor(255, 255, 255);
  pdf.setLineWidth(0.3);
  pdf.rect(margin + 6, yPosition, authBoxWidth - 12, 18, 'FD');

  yPosition += 5;
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(55, 91, 220);
  pdf.text('New York State Dental Implants & Oral Surgery', margin + 10, yPosition, { charSpace: 0 });
  yPosition += 5;
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(0, 0, 0);
  pdf.text('344 N. Main St, Canandaigua, New York, 14424', margin + 10, yPosition, { charSpace: 0 });
  yPosition += 5;
  pdf.text('Phone: (585) 394-5910', margin + 10, yPosition, { charSpace: 0 });

  yPosition += 25;

  // Signature Section
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(55, 91, 220);
  pdf.text('Signature', margin, yPosition, { charSpace: 0 });
  yPosition += 10;

  // Agreement checkbox
  pdf.setDrawColor(55, 91, 220);
  pdf.setFillColor(240, 245, 255);
  pdf.setLineWidth(0.4);
  pdf.rect(margin, yPosition, authBoxWidth, 10, 'FD');

  yPosition += 3;

  // Checkbox
  const checkboxSize = 4;
  pdf.setDrawColor(55, 91, 220);
  pdf.setFillColor(255, 255, 255);
  pdf.rect(margin + 3, yPosition, checkboxSize, checkboxSize, 'FD');

  // Checkmark if agreed
  if (data.hasAgreed) {
    pdf.setDrawColor(76, 175, 80);
    pdf.setLineWidth(0.8);
    pdf.line(margin + 3.5, yPosition + 2, margin + 4.5, yPosition + 3.5);
    pdf.line(margin + 4.5, yPosition + 3.5, margin + 6.5, yPosition + 0.5);
  }

  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(55, 91, 220);
  pdf.text('I have read, understood, and agreed to all terms above.', margin + 10, yPosition + 3, { charSpace: 0 });

  yPosition += 15;

  // Patient Signature - Right aligned
  const rightColumnX = pageWidth - margin - 90;

  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(0, 0, 0);
  pdf.text('Patient:', rightColumnX, yPosition, { charSpace: 0 });
  yPosition += 6;

  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Name: ${data.firstName} ${data.lastName}`, rightColumnX, yPosition, { charSpace: 0 });
  yPosition += 5;

  // Date and Time
  const dateTimeText = data.signatureDate && data.signatureTime
    ? `Date/Time: ${data.signatureDate} ${data.signatureTime}`
    : data.signatureDate
    ? `Date: ${data.signatureDate}`
    : '';
  if (dateTimeText) {
    pdf.text(dateTimeText, rightColumnX, yPosition, { charSpace: 0 });
    yPosition += 8;
  } else {
    yPosition += 8;
  }

  // Patient signature image
  if (data.patientSignature) {
    try {
      pdf.addImage(data.patientSignature, 'PNG', rightColumnX, yPosition - 3, 60, 15);
      yPosition += 12;
    } catch (error) {
      console.error('Error adding patient signature:', error);
    }
  }

  // Patient signature line
  pdf.setDrawColor(100, 100, 100);
  pdf.setLineWidth(0.3);
  pdf.line(rightColumnX, yPosition, rightColumnX + 80, yPosition);

  pdf.setFontSize(8);
  pdf.setTextColor(100, 100, 100);
  pdf.text('Patient Signature', rightColumnX, yPosition + 4, { charSpace: 0 });

  // Add page numbers to all pages
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

  // Save the PDF
  const fileName = `MedicalRecordsRelease_${data.firstName}_${data.lastName}_${new Date().toISOString().split('T')[0]}.pdf`;
  pdf.save(fileName);
}

