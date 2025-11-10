import jsPDF from 'jspdf';

export interface ThreeYearCarePackagePdfData {
  patientName: string;
  dateOfBirth: string;
  enrollmentDate: string;
  enrollmentTime: string;
  enrollmentChoice: string;
  paymentMethod: string;
  chlorhexidineRinse?: boolean;
  waterFlosser?: boolean;
  electricToothbrush?: boolean;
  attendCheckups?: boolean;
  cancellationPolicy?: boolean;
  governingLaw?: boolean;
  arbitrationClause?: boolean;
  hipaaConsent?: boolean;
  ageConfirmation?: boolean;
  languageConfirmation?: boolean;
  acknowledgmentRead?: boolean;
  patientSignature?: string;
  patientSignatureDate?: string;
  witnessName?: string;
  witnessSignature?: string;
  witnessSignatureDate?: string;
  staffProcessedBy?: string;
  staffProcessedDate?: string;
}

/**
 * Add header and footer to a PDF page
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

  // Add date on right side
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

  // Vertical separator 1 (after tagline)
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

  // Vertical separator 2 (after phone)
  pdf.setDrawColor(55, 91, 220);
  pdf.setLineWidth(0.5);
  pdf.line(margin + 85, footerContentY - 2, margin + 85, footerContentY + 12);

  // Center section - Email
  pdf.setFont('Fira Sans', 'bold');
  pdf.text('Email:', margin + 90, footerContentY);
  pdf.setFont('Fira Sans', 'normal');
  pdf.text('contact@nysdentalimplants.com', margin + 90, footerContentY + 5);

  // Vertical separator 3 (after email)
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
function addWatermark(
  pdf: any,
  pageWidth: number,
  pageHeight: number,
  watermarkImg: HTMLImageElement | null
) {
  if (!watermarkImg) return;

  try {
    // Calculate dimensions to maintain aspect ratio
    const watermarkWidth = 100; // Width of watermark
    const watermarkHeight = (watermarkImg.height / watermarkImg.width) * watermarkWidth;

    // Center the watermark on the page
    const xPosition = (pageWidth - watermarkWidth) / 2;
    const yPosition = (pageHeight - watermarkHeight) / 2;

    // Add the watermark image with opacity using setOpacity
    if (pdf.setOpacity) {
      pdf.setOpacity(0.15); // 15% opacity for subtle watermark
    }
    pdf.addImage(watermarkImg, 'PNG', xPosition, yPosition, watermarkWidth, watermarkHeight);
    if (pdf.setOpacity) {
      pdf.setOpacity(1); // Reset opacity to full
    }
  } catch (error) {
    console.warn('Could not add watermark:', error);
  }
}

/**
 * Generate 3-Year Care Package PDF
 */
export async function generateThreeYearCarePackagePdf(data: ThreeYearCarePackagePdfData) {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 15;

  // Load images
  let logoImg: HTMLImageElement | null = null;
  let letterheadImg: HTMLImageElement | null = null;
  let watermarkImg: HTMLImageElement | null = null;

  // Load logo image
  let logoHeight = 0;
  try {
    logoImg = new Image();
    logoImg.crossOrigin = 'anonymous';

    await new Promise((resolve, reject) => {
      logoImg!.onload = resolve;
      logoImg!.onerror = reject;
      logoImg!.src = '/logo.png';
    });

    // Calculate logo height to maintain aspect ratio
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
  addHeaderAndFooter(pdf, pageWidth, pageHeight, margin, data.enrollmentDate, logoImg, letterheadImg, logoHeight);

  // Move yPosition below header
  const topMargin = 5;
  let yPosition = topMargin + logoHeight + 1 + 8 + 6 + 6 + (letterheadImg ? 60 : 0) + 10;

  // Add title (blue color)
  yPosition -= 8;
  pdf.setFontSize(18);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(55, 91, 220);
  pdf.text('3-Year Care Package Enrollment Agreement', pageWidth / 2, yPosition, { align: 'center' });

  pdf.setTextColor(0, 0, 0);
  yPosition += 12;

  // Instructions Section with bounding box
  const boxPadding = 5;
  const boxWidth = pageWidth - 2 * margin;
  const instructionsBoxY = yPosition - 2;

  // Draw bounding box
  pdf.setDrawColor(220, 53, 69); // Red border
  pdf.setLineWidth(0.5);
  pdf.rect(margin, instructionsBoxY, boxWidth, 22, 'S'); // 'S' for stroke only - increased height from 18 to 22

  yPosition += 4;

  pdf.setFontSize(11); // Increased from 9 to 11
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(220, 53, 69); // Red text

  const instructionsText = [
    'Please complete this form to enroll in the 3-Year Care Package. This package includes essential',
    'dental care products and regular check-ups to maintain your dental implants. Review all sections',
    'carefully and sign at the bottom to confirm your enrollment.'
  ];

  instructionsText.forEach((line) => {
    pdf.text(line, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 5; // Increased from 4 to 5 for better spacing with larger font
  });

  pdf.setTextColor(0, 0, 0);
  yPosition += 6;

  // Patient Information Section
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Patient Information', margin, yPosition);
  yPosition += 6;

  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  const infoData = [
    { label: 'Patient Name:', value: data.patientName || '' },
    { label: 'Date of Birth:', value: data.dateOfBirth || '' },
    { label: 'Enrollment Date:', value: data.enrollmentDate || '' },
    { label: 'Enrollment Time:', value: data.enrollmentTime || '' }
  ];

  infoData.forEach((item) => {
    pdf.setFont('helvetica', 'bold');
    pdf.text(item.label, margin, yPosition);
    pdf.setFont('helvetica', 'normal');
    pdf.text(item.value, margin + 50, yPosition);
    yPosition += 5;
  });

  yPosition += 12; // Increased spacing to prevent overlap

  // WITH vs WITHOUT Care Package Comparison Section
  const colWidth = (pageWidth - 2 * margin - 4) / 2;
  const col1X = margin;
  const col2X = margin + colWidth + 4;
  const boxHeight = 26; // Reduced from 52 to 30 to fit content snugly
  const comparisonBoxY = yPosition;

  // LEFT BOX - WITH Care Package (Green)
  pdf.setDrawColor(34, 197, 94); // Green border
  pdf.setFillColor(240, 253, 244); // Light green background
  pdf.setLineWidth(0.3); // Thinner border (reduced from 1)
  pdf.setGState(new pdf.GState({ opacity: 0.7 })); // Add transparency
  pdf.rect(col1X, comparisonBoxY, colWidth, boxHeight, 'FD');
  pdf.setGState(new pdf.GState({ opacity: 1 })); // Reset opacity for text

  let leftY = comparisonBoxY + 5;

  // Title
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(34, 197, 94); // Green text
  pdf.text('WITH Care Package', col1X + 3, leftY);
  leftY += 5;

  // Benefits list - all 5 points
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(34, 197, 94);
  const withBenefits = [
    '• Full 3-year warranty coverage',
    '• All supplies included ($3,800+ value)',
    '• Priority scheduling',
    '• 80% lower complication rate',
    '• Free adjustments & repairs'
  ];

  withBenefits.forEach((benefit) => {
    pdf.text(benefit, col1X + 3, leftY);
    leftY += 3.2;
  });

  // RIGHT BOX - WITHOUT Care Package (Red)
  pdf.setDrawColor(220, 38, 38); // Red border
  pdf.setFillColor(254, 242, 242); // Light red background
  pdf.setLineWidth(0.3); // Thinner border (reduced from 1)
  pdf.setGState(new pdf.GState({ opacity: 0.7 })); // Add transparency
  pdf.rect(col2X, comparisonBoxY, colWidth, boxHeight, 'FD');
  pdf.setGState(new pdf.GState({ opacity: 1 })); // Reset opacity for text

  let rightY = comparisonBoxY + 5;

  // Title
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(220, 38, 38); // Red text
  pdf.text('WITHOUT Care Package', col2X + 3, rightY);
  rightY += 5;

  // Drawbacks list - all 5 points
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(220, 38, 38);
  const withoutDrawbacks = [
    '• NO warranty protection',
    '• Buy supplies yourself',
    '• Standard scheduling only',
    '• Higher risk of problems',
    '• Pay full price for repairs'
  ];

  withoutDrawbacks.forEach((drawback) => {
    pdf.text(drawback, col2X + 3, rightY);
    rightY += 3.2;
  });

  pdf.setTextColor(0, 0, 0); // Reset to black
  yPosition = comparisonBoxY + boxHeight + 12;

  // Payment Schedule Section Header
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(55, 91, 220); // Match PDF blue color
  pdf.text('Payment Schedule', margin, yPosition, { charSpace: 0 });
  yPosition += 7;

  // Total Investment - Simple text format
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(0, 0, 0);
  pdf.text('Total Investment: $3,450', margin, yPosition);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9);
  pdf.setTextColor(100, 100, 100);
  pdf.text('(10 payments of $345 every 3 months)', margin + 55, yPosition);
  yPosition += 10;

  // Payment grid - 2 columns, 5 rows - Simple and clean
  const paymentBoxWidth = (pageWidth - 2 * margin - 5) / 2;
  const paymentBoxHeight = 9;
  const paymentCol1X = margin;
  const paymentCol2X = margin + paymentBoxWidth + 5;

  const payments = [
    { num: 1, amount: '$345', due: 'Due at enrollment' },
    { num: 2, amount: '$345', due: 'Month 3' },
    { num: 3, amount: '$345', due: 'Month 6' },
    { num: 4, amount: '$345', due: 'Month 9' },
    { num: 5, amount: '$345', due: 'Month 12' },
    { num: 6, amount: '$345', due: 'Month 15' },
    { num: 7, amount: '$345', due: 'Month 18' },
    { num: 8, amount: '$345', due: 'Month 21' },
    { num: 9, amount: '$345', due: 'Month 24' },
    { num: 10, amount: '$345', due: 'Month 27' }
  ];

  payments.forEach((payment, index) => {
    const isLeftColumn = index % 2 === 0;
    const boxX = isLeftColumn ? paymentCol1X : paymentCol2X;
    const rowIndex = Math.floor(index / 2);
    const boxY = yPosition + (rowIndex * (paymentBoxHeight + 2));

    // Simple blue boxes - matching PDF color scheme
    pdf.setDrawColor(55, 91, 220); // Match PDF blue
    pdf.setFillColor(240, 245, 255); // Very light blue
    pdf.setLineWidth(0.2);
    pdf.rect(boxX, boxY, paymentBoxWidth, paymentBoxHeight, 'FD');

    // Payment number and amount
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(55, 91, 220); // Match PDF blue
    pdf.text(`Payment #${payment.num}`, boxX + 3, boxY + 4);

    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(0, 0, 0);
    pdf.text(payment.amount, boxX + 30, boxY + 4);

    // Due date
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(100, 100, 100);
    pdf.text(payment.due, boxX + 3, boxY + 7);
  });

  // Add new page for additional sections
  pdf.addPage();
  addWatermark(pdf, pageWidth, pageHeight, watermarkImg);
  addHeaderAndFooter(pdf, pageWidth, pageHeight, margin, data.enrollmentDate, logoImg, letterheadImg, logoHeight);

  yPosition = topMargin + logoHeight + 1 + 8 + 6 + 6 + (letterheadImg ? 60 : 0) + 10;

  // Package Contents Section
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(55, 91, 220);
  pdf.text('What\'s Included in Each Package', margin, yPosition, { charSpace: 0 });
  yPosition += 8;

  const packageContents = [
    '12 bottles of chlorhexidine rinse',
    'Oral-B electric toothbrush + head',
    'Oral-B water flosser',
    'Crest toothpaste',
    'Super-floss',
    'Interproximal brushes'
  ];

  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(0, 0, 0);

  packageContents.forEach((item) => {
    pdf.text(`• ${item}`, margin + 3, yPosition);
    yPosition += 5;
  });

  yPosition += 10;

  // Your 3-Year Care Journey Section
  const journeyBoxWidth = pageWidth - 2 * margin;
  const journeyBoxHeight = 28;

  // Draw light blue box
  pdf.setDrawColor(55, 91, 220);
  pdf.setFillColor(240, 245, 255);
  pdf.setLineWidth(0.3);
  pdf.rect(margin, yPosition, journeyBoxWidth, journeyBoxHeight, 'FD');

  yPosition += 5;

  // Title
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(55, 91, 220);
  pdf.text('Your 3-Year Care Journey', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 6;

  // Description
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(60, 60, 60);
  pdf.text('Receive a comprehensive care package every 3 months to maintain your dental implants', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 7;

  // Calculate expiration date (3 years from enrollment)
  let expirationDate = '';
  if (data.enrollmentDate) {
    const enrollment = new Date(data.enrollmentDate);
    const expiration = new Date(enrollment);
    expiration.setFullYear(expiration.getFullYear() + 3);
    expirationDate = expiration.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  // Expiration date
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(55, 91, 220);
  pdf.text(`Package Expiration Date: ${expirationDate || 'Not specified'}`, pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 6;

  // Footer text
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(55, 91, 220);
  pdf.text('Your care package coverage ends 3 years from enrollment', pageWidth / 2, yPosition, { align: 'center' });

  yPosition += 10;

  // Daily Care Requirements Section
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(55, 91, 220);
  pdf.text('Daily Care Requirements', margin, yPosition, { charSpace: 0 });
  yPosition += 8;

  const careRequirements = [
    { label: 'Rinse with chlorhexidine (First 90 days: 5x daily, After: 3x daily)', value: data.chlorhexidineRinse },
    { label: 'Use water flosser (Start 1 month after surgery)', value: data.waterFlosser },
    { label: 'Use electric toothbrush daily', value: data.electricToothbrush },
    { label: 'Attend all scheduled check-ups', value: data.attendCheckups }
  ];

  careRequirements.forEach((item) => {
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

  yPosition += 8;

  // IMPORTANT: What Voids Your Warranty Section - Red Box
  const warrantyBoxWidth = pageWidth - 2 * margin;
  const warrantyBoxStartY = yPosition;

  // Draw red box background
  pdf.setDrawColor(220, 53, 69);
  pdf.setFillColor(254, 242, 242);
  pdf.setLineWidth(0.4);
  pdf.rect(margin, warrantyBoxStartY, warrantyBoxWidth, 38, 'FD'); // Increased height to 38

  yPosition += 5;

  // Title
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(220, 53, 69);
  pdf.text('IMPORTANT: What Voids Your Warranty', margin + 3, yPosition, { charSpace: 0 });
  yPosition += 7;

  const warrantyVoids = [
    'Missing ANY daily care requirements',
    'Missing appointments without 48-hour notice',
    'Not enrolling by one-week deadline'
  ];

  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(220, 53, 69);

  warrantyVoids.forEach((item) => {
    pdf.text(`• ${item}`, margin + 5, yPosition, { charSpace: 0 });
    yPosition += 5;
  });

  yPosition += 3;

  // Consequence text
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(220, 53, 69);
  pdf.text('Consequence: Pay standard rates ($250/visit + $150/lab-hour)', margin + 5, yPosition, { charSpace: 0 });

  yPosition += 10;

  // We're Here to Help You Succeed Section - Green Box
  const supportBoxWidth = pageWidth - 2 * margin;
  const supportBoxStartY = yPosition;

  // Draw green box background
  pdf.setDrawColor(34, 197, 94);
  pdf.setFillColor(240, 253, 244);
  pdf.setLineWidth(0.4);
  pdf.rect(margin, supportBoxStartY, supportBoxWidth, 38, 'FD'); // Increased height to 38

  yPosition += 5;

  // Title
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(34, 197, 94);
  pdf.text('We\'re Here to Help You Succeed', margin + 3, yPosition, { charSpace: 0 });
  yPosition += 7;

  const supportItems = [
    'Text/email reminders available',
    'Support for struggling patients',
    'Flexible scheduling'
  ];

  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(34, 197, 94);

  supportItems.forEach((item) => {
    pdf.text(`• ${item}`, margin + 5, yPosition, { charSpace: 0 });
    yPosition += 5;
  });

  yPosition += 3;

  // Contact Information
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(0, 0, 0);
  pdf.text('Questions:', margin + 5, yPosition, { charSpace: 0 });
  pdf.setFont('helvetica', 'normal');
  pdf.text('(585) 394-5910', margin + 28, yPosition, { charSpace: 0 });

  pdf.setFont('helvetica', 'bold');
  pdf.text('Emergency:', margin + 70, yPosition, { charSpace: 0 });
  pdf.setFont('helvetica', 'normal');
  pdf.text('(585) 394-5910', margin + 95, yPosition, { charSpace: 0 });

  yPosition += 5;

  pdf.setFont('helvetica', 'bold');
  pdf.text('Email:', margin + 5, yPosition, { charSpace: 0 });
  pdf.setFont('helvetica', 'normal');
  pdf.text('contact@nysdentalimplants.com', margin + 28, yPosition, { charSpace: 0 });

  yPosition += 10;

  // Add new page for Enrollment Options (Page 3)
  pdf.addPage();
  addWatermark(pdf, pageWidth, pageHeight, watermarkImg);
  addHeaderAndFooter(pdf, pageWidth, pageHeight, margin, data.enrollmentDate, logoImg, letterheadImg, logoHeight);

  yPosition = topMargin + logoHeight + 1 + 8 + 6 + 6 + (letterheadImg ? 60 : 0) + 10;

  // Enrollment Options Section
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(55, 91, 220);
  pdf.text('Enrollment Options', margin, yPosition, { charSpace: 0 });
  yPosition += 8;

  const enrollmentOptions = [
    {
      value: 'enroll',
      label: 'ENROLL NOW - Protect investment, activate warranty',
      subtext: 'Start your 3-year warranty coverage and receive all care packages'
    },
    {
      value: 'defer',
      label: 'DEFER ENROLLMENT - Decline coverage, $150 reinstatement fee later',
      subtext: 'No warranty protection, pay full price for any issues'
    }
  ];

  enrollmentOptions.forEach((option) => {
    // Draw checkbox
    const checkboxSize = 3;
    const checkboxX = margin;
    const checkboxY = yPosition - 2.5;

    pdf.setDrawColor(100, 100, 100);
    pdf.setLineWidth(0.3);
    pdf.rect(checkboxX, checkboxY, checkboxSize, checkboxSize, 'S');

    // Draw checkmark if selected
    if (data.enrollmentChoice === option.value) {
      pdf.setDrawColor(55, 91, 220);
      pdf.setLineWidth(0.5);
      pdf.line(checkboxX + 0.5, checkboxY + 1.5, checkboxX + 1.2, checkboxY + 2.3);
      pdf.line(checkboxX + 1.2, checkboxY + 2.3, checkboxX + 2.5, checkboxY + 0.5);
    }

    // Main label text
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(0, 0, 0);
    pdf.text(option.label, margin + 5, yPosition, { charSpace: 0 });
    yPosition += 4;

    // Subtext
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(100, 100, 100);
    pdf.text(option.subtext, margin + 5, yPosition, { charSpace: 0 });
    yPosition += 7;
  });

  yPosition += 8;

  // Payment Method Section
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(55, 91, 220);
  pdf.text('Payment Method', margin, yPosition, { charSpace: 0 });
  yPosition += 8;

  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(0, 0, 0);
  pdf.text(`Selected: ${data.paymentMethod || 'Not specified'}`, margin, yPosition, { charSpace: 0 });
  yPosition += 10;

  // Legal Acknowledgments Section
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(55, 91, 220);
  pdf.text('Legal Terms (Simplified)', margin, yPosition, { charSpace: 0 });
  yPosition += 8;

  const legalItems = [
    { label: 'I understand the cancellation policy', value: data.cancellationPolicy },
    { label: 'I agree to New York governing law', value: data.governingLaw },
    { label: 'I agree to arbitration clause', value: data.arbitrationClause },
    { label: 'I provide HIPAA consent', value: data.hipaaConsent }
  ];

  legalItems.forEach((item) => {
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

  yPosition += 4;

  // Age and Language Confirmation (separate section)
  const ageLanguageItem = {
    label: 'I confirm I am 18+ years old and understand this document in English',
    value: data.ageConfirmation || data.languageConfirmation
  };

  // Draw checkbox
  const checkboxSize = 3;
  const checkboxX = margin;
  const checkboxY = yPosition - 2.5;

  pdf.setDrawColor(100, 100, 100);
  pdf.setLineWidth(0.3);
  pdf.rect(checkboxX, checkboxY, checkboxSize, checkboxSize, 'S');

  // Draw checkmark if checked
  if (ageLanguageItem.value) {
    pdf.setDrawColor(55, 91, 220);
    pdf.setLineWidth(0.5);
    pdf.line(checkboxX + 0.5, checkboxY + 1.5, checkboxX + 1.2, checkboxY + 2.3);
    pdf.line(checkboxX + 1.2, checkboxY + 2.3, checkboxX + 2.5, checkboxY + 0.5);
  }

  // Label text
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(0, 0, 0);
  pdf.text(ageLanguageItem.label, margin + 5, yPosition, { charSpace: 0 });

  yPosition += 10;

  // Signatures Section
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(55, 91, 220);
  pdf.text('Signature Section', margin, yPosition, { charSpace: 0 });
  yPosition += 10;

  // Acknowledgment Section (after headline)
  const acknowledgmentText = '* I acknowledge that I have read and understand this 3-Year Care Package Enrollment Agreement. I understand the benefits, requirements, and consequences outlined above.';

  // Draw checkbox
  const ackCheckboxSize = 3;
  const ackCheckboxX = margin;
  const ackCheckboxY = yPosition - 2.5;

  pdf.setDrawColor(100, 100, 100);
  pdf.setLineWidth(0.3);
  pdf.rect(ackCheckboxX, ackCheckboxY, ackCheckboxSize, ackCheckboxSize, 'S');

  // Draw checkmark if checked
  if (data.acknowledgmentRead) {
    pdf.setDrawColor(55, 91, 220);
    pdf.setLineWidth(0.5);
    pdf.line(ackCheckboxX + 0.5, ackCheckboxY + 1.5, ackCheckboxX + 1.2, ackCheckboxY + 2.3);
    pdf.line(ackCheckboxX + 1.2, ackCheckboxY + 2.3, ackCheckboxX + 2.5, ackCheckboxY + 0.5);
  }

  // Acknowledgment text with word wrap
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(0, 0, 0);

  const maxWidth = pageWidth - 2 * margin - 7; // Leave space for checkbox
  const lines = pdf.splitTextToSize(acknowledgmentText, maxWidth);

  lines.forEach((line: string, index: number) => {
    pdf.text(line, margin + 5, yPosition + (index * 5), { charSpace: 0 });
  });

  yPosition += (lines.length * 5) + 10;

  // Two-column layout for signatures
  const witnessColX = margin; // Witness column (left)
  const patientColX = pageWidth / 2 + 5; // Patient column (right)
  const signatureStartY = yPosition;

  // LEFT COLUMN - Witness
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(0, 0, 0);
  pdf.text('Witness:', witnessColX, signatureStartY, { charSpace: 0 });

  let witnessY = signatureStartY + 6;
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Name: ${data.witnessName || ''}`, witnessColX, witnessY, { charSpace: 0 });
  witnessY += 5;
  pdf.text(`Date: ${data.witnessSignatureDate || ''}`, witnessColX, witnessY, { charSpace: 0 });
  witnessY += 8;

  // Witness signature image
  if (data.witnessSignature) {
    try {
      pdf.addImage(data.witnessSignature, 'PNG', witnessColX, witnessY - 3, 60, 15);
      witnessY += 12;
    } catch (error) {
      console.error('Error adding witness signature:', error);
    }
  }

  // Witness signature line (always show)
  pdf.setDrawColor(100, 100, 100);
  pdf.setLineWidth(0.3);
  pdf.line(witnessColX, witnessY, witnessColX + 80, witnessY);

  pdf.setFontSize(8);
  pdf.setTextColor(100, 100, 100);
  pdf.text('Witness Signature', witnessColX, witnessY + 4, { charSpace: 0 });

  // RIGHT COLUMN - Patient
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(0, 0, 0);
  pdf.text('Patient:', patientColX, signatureStartY, { charSpace: 0 });

  let patientY = signatureStartY + 6;
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Name: ${data.patientName || ''}`, patientColX, patientY, { charSpace: 0 });
  patientY += 5;
  pdf.text(`Date: ${data.patientSignatureDate || ''}`, patientColX, patientY, { charSpace: 0 });
  patientY += 8;

  // Patient signature image
  if (data.patientSignature) {
    try {
      pdf.addImage(data.patientSignature, 'PNG', patientColX, patientY - 3, 60, 15);
      patientY += 12;
    } catch (error) {
      console.error('Error adding patient signature:', error);
    }
  }

  // Patient signature line (always show)
  pdf.setDrawColor(100, 100, 100);
  pdf.setLineWidth(0.3);
  pdf.line(patientColX, patientY, patientColX + 80, patientY);

  pdf.setFontSize(8);
  pdf.setTextColor(100, 100, 100);
  pdf.text('Patient Signature', patientColX, patientY + 4, { charSpace: 0 });

  yPosition = Math.max(witnessY, patientY) + 15;

  // Staff Use Only Section
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(55, 91, 220);
  pdf.text('Staff Use Only', margin, yPosition, { charSpace: 0 });
  yPosition += 10;

  // Two-column layout for staff fields
  const staffCol1X = margin;
  const staffCol2X = pageWidth / 2 + 5;

  // Left Column - Form Processed By
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(0, 0, 0);
  pdf.text('Form Processed By:', staffCol1X, yPosition, { charSpace: 0 });
  yPosition += 5;

  pdf.setFont('helvetica', 'normal');
  pdf.text(data.staffProcessedBy || '', staffCol1X, yPosition, { charSpace: 0 });

  // Right Column - Processing Date
  let staffDateY = yPosition - 5;
  pdf.setFont('helvetica', 'bold');
  pdf.text('Processing Date:', staffCol2X, staffDateY, { charSpace: 0 });
  staffDateY += 5;

  pdf.setFont('helvetica', 'normal');
  pdf.text(data.staffProcessedDate || '', staffCol2X, staffDateY, { charSpace: 0 });

  // Add page numbers to all pages
  const totalPages = pdf.internal.pages.length - 1;
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

  const fileName = `ThreeYearCarePackage_${data.patientName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
  pdf.save(fileName);
}

