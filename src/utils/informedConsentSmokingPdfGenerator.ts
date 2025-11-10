import jsPDF from 'jspdf';

export interface InformedConsentSmokingPdfData {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  nicotineUse: string;
  understandsNicotineEffects?: boolean;
  understandsRisks?: boolean;
  understandsTimeline?: boolean;
  understandsInsurance?: boolean;
  offeredResources?: boolean;
  takesResponsibility?: boolean;
  patientSignature?: string;
  signatureDate?: string;
  signedConsent?: string;
  refusalReason?: string;
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
 * Generate Informed Consent - Nicotine Use and Surgery PDF
 */
export async function generateInformedConsentSmokingPdf(data: InformedConsentSmokingPdfData) {
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
  yPosition -= 8;
  pdf.setFontSize(18);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(55, 91, 220);
  pdf.text('Informed Consent - Nicotine Use and Surgery', pageWidth / 2, yPosition, { align: 'center', charSpace: 0 });

  pdf.setTextColor(0, 0, 0);
  yPosition += 12;

  // Patient Information Section
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Patient Information', margin, yPosition, { charSpace: 0 });
  yPosition += 6;

  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  const patientInfo = [
    { label: 'First Name:', value: data.firstName || '' },
    { label: 'Last Name:', value: data.lastName || '' },
    { label: 'Date of Birth:', value: data.dateOfBirth || '' },
    { label: 'Nicotine Use:', value: data.nicotineUse === 'yes' ? 'Yes (includes cigarettes, e-cigarettes, vaping, chewing tobacco, nicotine patches/gum)' : 'No' }
  ];

  patientInfo.forEach((item) => {
    pdf.setFont('helvetica', 'bold');
    pdf.text(item.label, margin, yPosition, { charSpace: 0 });
    pdf.setFont('helvetica', 'normal');
    pdf.text(item.value, margin + 35, yPosition, { charSpace: 0 });
    yPosition += 5;
  });

  yPosition += 8;

  // Critical Information Alert Box
  const alertBoxWidth = pageWidth - 2 * margin;
  pdf.setDrawColor(220, 53, 69);
  pdf.setFillColor(254, 242, 242);
  pdf.setLineWidth(0.5);
  pdf.rect(margin, yPosition, alertBoxWidth, 20, 'FD');

  yPosition += 5;
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(220, 53, 69);
  pdf.text('Critical Information', margin + 3, yPosition, { charSpace: 0 });
  yPosition += 6;

  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  const criticalText = 'All nicotine use must stop at least 3 weeks before surgery to prevent serious complications and implant failure.';
  const criticalLines = pdf.splitTextToSize(criticalText, alertBoxWidth - 6);
  criticalLines.forEach((line: string) => {
    pdf.text(line, margin + 3, yPosition, { charSpace: 0 });
    yPosition += 4;
  });

  yPosition += 16;

  // Main Title
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(55, 91, 220);
  pdf.text('Understanding Nicotine Risks for Your Surgery', pageWidth / 2, yPosition, { align: 'center', charSpace: 0 });
  
  pdf.setTextColor(0, 0, 0);
  yPosition += 10;

  // Section A: Why This Matters
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(55, 91, 220);
  pdf.text('Why This Matters - We Want Your Surgery to Succeed', margin, yPosition, { charSpace: 0 });
  yPosition += 6;

  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(0, 0, 0);
  const whyMattersText = 'Your health and the success of your surgery are our top priorities. We\'re committed to working with you as partners to ensure the best possible outcome. This form helps us make sure you have all the information you need to make informed decisions about your care and recovery.';
  const whyMattersLines = pdf.splitTextToSize(whyMattersText, pageWidth - 2 * margin);
  whyMattersLines.forEach((line: string) => {
    pdf.text(line, margin, yPosition, { charSpace: 0 });
    yPosition += 4;
  });

  yPosition += 8;

  // Section B: How Nicotine Affects Healing
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(55, 91, 220);
  pdf.text('How Nicotine Affects Your Healing', margin, yPosition, { charSpace: 0 });
  yPosition += 6;

  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(0, 0, 0);
  const healingIntroText = 'Nicotine narrows your blood vessels, which reduces the amount of oxygen and nutrients that can reach your surgical site. This makes it much harder for your body to heal properly and significantly increases the risk of complications. Even small amounts of nicotine can have these effects.';
  const healingIntroLines = pdf.splitTextToSize(healingIntroText, pageWidth - 2 * margin);
  healingIntroLines.forEach((line: string) => {
    pdf.text(line, margin, yPosition, { charSpace: 0 });
    yPosition += 4;
  });

  yPosition += 8;

  // Section C: Serious Risks
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(220, 53, 69);
  pdf.text('Serious Risks if You Continue Nicotine Use', margin, yPosition, { charSpace: 0 });
  yPosition += 6;

  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(0, 0, 0);
  const seriousRisks = [
    'Complete implant failure requiring removal and replacement',
    'Wound healing problems, including wounds that won\'t close',
    'Loss of skin grafts or flaps',
    'Infection at the surgical site',
    'Need for additional surgeries',
    'Significant financial costs not covered by insurance'
  ];

  seriousRisks.forEach((risk) => {
    pdf.text(`• ${risk}`, margin + 3, yPosition, { charSpace: 0 });
    yPosition += 5;
  });

  yPosition += 6;

  // Section D: Timeline Requirements
  const timelineBoxWidth = pageWidth - 2 * margin;
  pdf.setDrawColor(255, 152, 0);
  pdf.setFillColor(255, 243, 224);
  pdf.setLineWidth(0.4);
  pdf.rect(margin, yPosition, timelineBoxWidth, 28, 'FD');

  yPosition += 5;
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(255, 152, 0);
  pdf.text('Required Timeline for Nicotine Cessation', margin + 3, yPosition, { charSpace: 0 });
  yPosition += 6;

  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  const timelineItems = [
    'Before Surgery: Stop ALL nicotine use at least 3 weeks prior',
    'After Surgery: Continue nicotine-free until cleared by doctor',
    'Secondhand Smoke: Also avoid exposure throughout recovery'
  ];

  timelineItems.forEach((item) => {
    pdf.text(`• ${item}`, margin + 5, yPosition, { charSpace: 0 });
    yPosition += 5;
  });

  yPosition += 10;

  // Add new page for Support Resources section (Page 2)
  pdf.addPage();
  addWatermark(pdf, pageWidth, pageHeight, watermarkImg);
  addHeaderAndFooter(pdf, pageWidth, pageHeight, margin, data.signatureDate || new Date().toISOString().split('T')[0], logoImg, letterheadImg, logoHeight);
  yPosition = topMargin + logoHeight + 1 + 8 + 6 + 6 + (letterheadImg ? 60 : 0) - 10; // Moved up by reducing +10 to -10

  // Section E: Support Resources
  const supportBoxWidth = pageWidth - 2 * margin;
  pdf.setDrawColor(76, 175, 80);
  pdf.setFillColor(232, 245, 233);
  pdf.setLineWidth(0.4);
  pdf.rect(margin, yPosition, supportBoxWidth, 40, 'FD');

  yPosition += 5;
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(76, 175, 80);
  pdf.text('Free Support Available - You Don\'t Have to Do This Alone', margin + 3, yPosition, { charSpace: 0 });
  yPosition += 7;

  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(0, 0, 0);

  // Organization name on separate row
  pdf.setFont('helvetica', 'bold');
  pdf.text('Organization:', margin + 5, yPosition, { charSpace: 0 });
  pdf.setFont('helvetica', 'normal');
  pdf.text('University of Rochester', margin + 35, yPosition, { charSpace: 0 });
  yPosition += 5;

  const supportInfo = [
    { label: 'Program:', value: 'Commit to Quit!' },
    { label: 'Phone:', value: '(585) 602-0720' },
    { label: 'Email:', value: 'healthyliving@urmc.rochester.edu' },
    { label: 'Format:', value: '6 virtual sessions' },
    { label: 'Cost:', value: 'FREE - No referral needed' }
  ];

  supportInfo.forEach((item) => {
    pdf.setFont('helvetica', 'bold');
    pdf.text(item.label, margin + 5, yPosition, { charSpace: 0 });
    pdf.setFont('helvetica', 'normal');
    pdf.text(item.value, margin + 35, yPosition, { charSpace: 0 });
    yPosition += 5;
  });

  yPosition += 10;

  // Section F: Encouragement Message
  const encouragementBoxWidth = pageWidth - 2 * margin;
  pdf.setDrawColor(55, 91, 220);
  pdf.setFillColor(240, 245, 255);
  pdf.setLineWidth(0.4);
  pdf.rect(margin, yPosition, encouragementBoxWidth, 20, 'FD');

  yPosition += 5;
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(55, 91, 220);
  pdf.text('You Can Do This!', pageWidth / 2, yPosition, { align: 'center', charSpace: 0 });
  yPosition += 6;

  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(0, 0, 0);
  const encouragementText = 'Many of our patients have successfully quit nicotine before surgery. Taking this step not only improves your surgical outcome but also benefits your overall health. We\'re here to support you through this process.';
  const encouragementLines = pdf.splitTextToSize(encouragementText, encouragementBoxWidth - 6);
  encouragementLines.forEach((line: string) => {
    pdf.text(line, pageWidth / 2, yPosition, { align: 'center', charSpace: 0 });
    yPosition += 4;
  });

  yPosition += 10;

  // Patient Understanding and Agreement Section
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(55, 91, 220);
  pdf.text('Patient Understanding and Agreement', margin, yPosition, { charSpace: 0 });
  yPosition += 8;

  const understandingItems = [
    { label: 'I understand how nicotine affects surgical healing', value: data.understandsNicotineEffects },
    { label: 'I understand the serious risks if I continue nicotine use', value: data.understandsRisks },
    { label: 'I understand I must stop all nicotine at least 3 weeks before surgery', value: data.understandsTimeline },
    { label: 'I understand insurance may not cover complications from nicotine use', value: data.understandsInsurance },
    { label: 'I have been offered free cessation resources', value: data.offeredResources },
    { label: 'I take full responsibility for my nicotine use decisions', value: data.takesResponsibility }
  ];

  understandingItems.forEach((item) => {
    // Draw checkbox
    const checkboxSize = 3;
    const checkboxX = margin;
    const checkboxY = yPosition - 2.5;

    pdf.setDrawColor(100, 100, 100);
    pdf.setLineWidth(0.3);
    pdf.rect(checkboxX, checkboxY, checkboxSize, checkboxSize, 'S');

    // Draw checkmark if checked
    if (item.value) {
      pdf.setDrawColor(55, 91, 220);
      pdf.setLineWidth(0.5);
      pdf.line(checkboxX + 0.5, checkboxY + 1.5, checkboxX + 1.2, checkboxY + 2.3);
      pdf.line(checkboxX + 1.2, checkboxY + 2.3, checkboxX + 2.5, checkboxY + 0.5);
    }

    // Label text
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(0, 0, 0);
    pdf.text(item.label, margin + 5, yPosition, { charSpace: 0 });
    yPosition += 6;
  });

  yPosition += 10;

  // Signature Section
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(55, 91, 220);
  pdf.text('Signature Section', margin, yPosition, { charSpace: 0 });
  yPosition += 10;

  // Patient Signature - Aligned to Right
  const rightColumnX = pageWidth - margin - 90; // Position for right alignment

  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(0, 0, 0);
  pdf.text('Patient:', rightColumnX, yPosition, { charSpace: 0 });
  yPosition += 6;

  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Name: ${data.firstName} ${data.lastName}`, rightColumnX, yPosition, { charSpace: 0 });
  yPosition += 5;
  pdf.text(`Date: ${data.signatureDate || ''}`, rightColumnX, yPosition, { charSpace: 0 });
  yPosition += 8;

  // Patient signature image
  if (data.patientSignature) {
    try {
      pdf.addImage(data.patientSignature, 'PNG', rightColumnX, yPosition - 3, 60, 15);
      yPosition += 12;
    } catch (error) {
      console.error('Error adding patient signature:', error);
    }
  }

  // Patient signature line (always show)
  pdf.setDrawColor(100, 100, 100);
  pdf.setLineWidth(0.3);
  pdf.line(rightColumnX, yPosition, rightColumnX + 80, yPosition);

  pdf.setFontSize(8);
  pdf.setTextColor(100, 100, 100);
  pdf.text('Patient Signature', rightColumnX, yPosition + 4, { charSpace: 0 });

  yPosition += 15;

  // Staff Use Only Section
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(55, 91, 220);
  pdf.text('For Office Use Only', margin, yPosition, { charSpace: 0 });
  yPosition += 8;

  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(0, 0, 0);
  pdf.text('Signature Status:', margin, yPosition, { charSpace: 0 });
  yPosition += 5;

  pdf.setFont('helvetica', 'normal');
  const signatureStatus = data.signedConsent === 'signed' ? 'Patient signed consent' :
                          data.signedConsent === 'refused' ? 'Patient refused to sign' :
                          'Not specified';
  pdf.text(signatureStatus, margin, yPosition, { charSpace: 0 });
  yPosition += 6;

  if (data.signedConsent === 'refused' && data.refusalReason) {
    pdf.setFont('helvetica', 'bold');
    pdf.text('Refusal Reason:', margin, yPosition, { charSpace: 0 });
    yPosition += 5;

    pdf.setFont('helvetica', 'normal');
    const refusalLines = pdf.splitTextToSize(data.refusalReason, pageWidth - 2 * margin);
    refusalLines.forEach((line: string) => {
      pdf.text(line, margin, yPosition, { charSpace: 0 });
      yPosition += 4;
    });
  }

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

  // Save and download PDF
  const fileName = `InformedConsent_Nicotine_${data.firstName}_${data.lastName}_${new Date().toISOString().split('T')[0]}.pdf`;
  pdf.save(fileName);

  return pdf;
}

