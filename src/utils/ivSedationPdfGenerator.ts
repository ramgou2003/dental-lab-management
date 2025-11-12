import jsPDF from 'jspdf';

/**
 * Helper function to load an image
 */
async function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => {
      console.warn(`Could not load image: ${src}`);
      resolve(null);
    };
    img.src = src;
  });
}

/**
 * Helper function to wrap text to fit within a maximum width
 */
function wrapText(pdf: any, text: string, maxWidth: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const testWidth = testLine.length * 0.5 * 10; // Approximate width calculation

    if (testWidth > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
}

/**
 * Helper function to split text into lines that fit within maxWidth
 */
function splitTextToLines(pdf: any, text: string, maxWidth: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const testWidth = testLine.length * 0.5 * pdf.getFontSize();

    if (testWidth > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines.length > 0 ? lines : [text];
}

/**
 * Add watermark to the page
 */
function addWatermark(
  pdf: any,
  pageWidth: number,
  pageHeight: number,
  watermarkImg: HTMLImageElement | null
) {
  if (!watermarkImg) return;

  try {
    const watermarkWidth = 100;
    const watermarkHeight = (watermarkImg.height / watermarkImg.width) * watermarkWidth;

    const xPosition = (pageWidth - watermarkWidth) / 2;
    const yPosition = (pageHeight - watermarkHeight) / 2;

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

/**
 * Add header and footer to the page
 */
function addHeaderAndFooter(
  pdf: any,
  pageWidth: number,
  pageHeight: number,
  margin: number,
  pageNumber: number,
  totalPages: number,
  sedationDate: string,
  logoImg: HTMLImageElement | null,
  logoHeight: number
) {
  // Header
  const topMargin = 5;
  let yPosition = topMargin;

  // Add logo to top left corner
  if (logoImg) {
    const logoWidth = 50;
    pdf.addImage(logoImg, 'PNG', margin, topMargin, logoWidth, logoHeight);
  }

  // Add website text to top right
  pdf.setFontSize(12);
  pdf.setFont('Fira Sans', 'normal');
  pdf.setTextColor(55, 91, 220);
  pdf.text('www.nydentalimplants.com', pageWidth - margin, topMargin + logoHeight - 5, { align: 'right' });

  // Add blue horizontal line below logo
  yPosition = topMargin + logoHeight + 1;
  pdf.setDrawColor(55, 91, 220);
  pdf.setLineWidth(1);
  pdf.line(margin, yPosition, pageWidth - margin, yPosition);

  yPosition += 8;

  // Add date below the line
  pdf.setFontSize(10);
  pdf.setFont('Fira Sans', 'normal');
  pdf.setTextColor(0, 0, 0);
  pdf.text(`Date: ${sedationDate}`, pageWidth - margin, yPosition, { align: 'right' });

  yPosition += 6;

  // Footer
  const footerY = pageHeight - margin - 5;

  // Top border line for footer
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

  // Page number will be added later in the final loop
}

/**
 * Interface for IV Sedation form data
 */
export interface IVSedationPdfData {
  patient_name: string;
  sedation_date: string;
  // Step 1
  upper_treatment?: string;
  lower_treatment?: string;
  upper_surgery_type?: string;
  lower_surgery_type?: string;
  height_feet?: number;
  height_inches?: number;
  weight?: number;
  // Step 2
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
  // Step 3
  instruments_checklist?: string[];
  sedation_type?: string;
  medications_planned?: string[];
  medications_other?: string;
  administration_route?: string[];
  emergency_protocols?: string[];
  level_of_sedation?: string;
  // Step 4
  time_in_room?: string;
  sedation_start_time?: string;
  flow_entries?: any[];
  sedation_end_time?: string;
  out_of_room_time?: string;
  // Step 5
  alert_oriented?: string;
  protective_reflexes?: string;
  breathing_spontaneously?: string;
  post_op_nausea?: string;
  caregiver_present?: string;
  baseline_mental_status?: string;
  responsive_verbal_commands?: string;
  saturating_room_air?: string;
  vital_signs_baseline?: string;
  pain_during_recovery?: string;
  post_op_instructions_given_to?: string;
  follow_up_instructions_given_to?: string;
  discharged_to?: string;
  pain_level_discharge?: string;
  other_remarks?: string;
}

/**
 * Generate IV Sedation Flow Chart PDF
 */
export async function generateIVSedationPdf(data: IVSedationPdfData) {
  const pdf: any = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'letter'
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 15;

  // Use objects to allow mutation in nested functions
  const pageNumberRef = { value: 1 };
  const totalPagesRef = { value: 6 }; // Initial estimate: 6 pages

  // Load images
  const logoImg = await loadImage('/logo.png');
  const watermarkImg = await loadImage('/template/Logo icon white.png');

  // Calculate logo height
  const logoWidth = 50;
  const logoHeight = logoImg ? (logoImg.height / logoImg.width) * logoWidth : 15;

  // Generate each page
  for (let pageNum = 1; pageNum <= 5; pageNum++) {
    if (pageNum > 1) {
      pdf.addPage();
      pageNumberRef.value = pageNum;
    }

    // Add watermark and header/footer
    addWatermark(pdf, pageWidth, pageHeight, watermarkImg);
    addHeaderAndFooter(pdf, pageWidth, pageHeight, margin, pageNumberRef.value, totalPagesRef.value, data.sedation_date, logoImg, logoHeight);

    // Starting Y position after header
    const topMargin = 5;
    let yPosition = topMargin + logoHeight + 1 + 8 + 6;

    // Generate content for each step
    switch (pageNum) {
      case 1:
        generateStep1(pdf, data, pageWidth, pageHeight, margin, yPosition);
        break;
      case 2:
        generateStep2(pdf, data, pageWidth, pageHeight, margin, yPosition, logoImg, logoHeight, watermarkImg, data.sedation_date, pageNumberRef, totalPagesRef);
        break;
      case 3:
        generateStep3(pdf, data, pageWidth, pageHeight, margin, yPosition);
        break;
      case 4:
        generateStep3Continued(pdf, data, pageWidth, pageHeight, margin, yPosition, logoImg, logoHeight, watermarkImg, data.sedation_date, pageNumberRef, totalPagesRef);
        break;
      case 5:
        generateStep5(pdf, data, pageWidth, pageHeight, margin, yPosition);
        break;
    }
  }

  // Update page numbers on all pages after generation (above the footer line)
  const totalPages = pdf.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    const footerY = pageHeight - margin - 5;

    pdf.setFontSize(8);
    pdf.setFont('Fira Sans', 'normal');
    pdf.setTextColor(0, 0, 0);
    const pageNumberText = `${i} of ${totalPages}`;
    // Position page number ABOVE the footer line (5mm above the line)
    pdf.text(pageNumberText, pageWidth - margin, footerY - 5, { align: 'right' });
  }

  // Save the PDF
  const fileName = `IV_Sedation_Flow_Chart_${data.patient_name.replace(/\s+/g, '_')}_${data.sedation_date}.pdf`;
  pdf.save(fileName);
}

/**
 * Generate Step 1: Patient Information & Treatment Selection
 */
function generateStep1(pdf: any, data: IVSedationPdfData, pageWidth: number, pageHeight: number, margin: number, yPosition: number) {
  // Title
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(18);
  pdf.setTextColor(55, 91, 220);
  pdf.text('IV Sedation Flow Chart', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 10;

  pdf.setFontSize(14);
  pdf.setTextColor(34, 139, 34);
  pdf.text('Step 1: Patient Information & Treatment Selection', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 12;

  // Patient Information Box
  pdf.setDrawColor(200, 200, 200);
  pdf.setFillColor(240, 245, 255);
  pdf.setLineWidth(0.2);

  pdf.saveGraphicsState();
  pdf.setGState(new pdf.GState({ opacity: 0.85 }));
  pdf.roundedRect(margin, yPosition, pageWidth - 2 * margin, 18, 2, 2, 'FD');
  pdf.restoreGraphicsState();

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(11);
  pdf.setTextColor(55, 91, 220);
  yPosition += 6;
  pdf.text('Patient Information', margin + 6, yPosition);
  yPosition += 6;

  // Two columns for patient name and date
  const columnWidth = (pageWidth - 2 * margin - 12) / 2;

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  pdf.setTextColor(0, 0, 0);

  pdf.text(`Patient Name: ${data.patient_name}`, margin + 6, yPosition);
  pdf.text(`Date: ${data.sedation_date}`, margin + 6 + columnWidth, yPosition);

  yPosition += 10;

  // Upper Arch Treatment and Lower Arch Treatment (side by side)
  const boxWidth = (pageWidth - 2 * margin - 6) / 2;
  const leftBoxX = margin;
  const rightBoxX = margin + boxWidth + 6;

  // Upper Arch Treatment Box
  pdf.setDrawColor(200, 200, 200);
  pdf.setFillColor(240, 245, 255);

  pdf.saveGraphicsState();
  pdf.setGState(new pdf.GState({ opacity: 0.85 }));
  pdf.roundedRect(leftBoxX, yPosition, boxWidth, 32, 2, 2, 'FD');
  pdf.restoreGraphicsState();

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(11);
  pdf.setTextColor(59, 130, 246);
  let upperY = yPosition + 6;
  pdf.text('Upper Arch Treatment', leftBoxX + 6, upperY);
  upperY += 6;

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9);
  pdf.setTextColor(0, 0, 0);
  pdf.text(`Treatment Type: ${data.upper_treatment || 'Not specified'}`, leftBoxX + 6, upperY);
  upperY += 5;
  pdf.text(`Surgery Type: ${data.upper_surgery_type || 'Not specified'}`, leftBoxX + 6, upperY);

  // Lower Arch Treatment Box
  pdf.setDrawColor(200, 200, 200);
  pdf.setFillColor(240, 245, 255);

  pdf.saveGraphicsState();
  pdf.setGState(new pdf.GState({ opacity: 0.85 }));
  pdf.roundedRect(rightBoxX, yPosition, boxWidth, 32, 2, 2, 'FD');
  pdf.restoreGraphicsState();

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(11);
  pdf.setTextColor(34, 197, 94);
  let lowerY = yPosition + 6;
  pdf.text('Lower Arch Treatment', rightBoxX + 6, lowerY);
  lowerY += 6;

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9);
  pdf.setTextColor(0, 0, 0);
  pdf.text(`Treatment Type: ${data.lower_treatment || 'Not specified'}`, rightBoxX + 6, lowerY);
  lowerY += 5;
  pdf.text(`Surgery Type: ${data.lower_surgery_type || 'Not specified'}`, rightBoxX + 6, lowerY);

  yPosition += 38;

  // Physical Measurements Box
  pdf.setDrawColor(200, 200, 200);
  pdf.setFillColor(240, 245, 255);

  pdf.saveGraphicsState();
  pdf.setGState(new pdf.GState({ opacity: 0.85 }));
  pdf.roundedRect(margin, yPosition, pageWidth - 2 * margin, 28, 2, 2, 'FD');
  pdf.restoreGraphicsState();

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(11);
  pdf.setTextColor(55, 91, 220);
  yPosition += 6;
  pdf.text('Physical Measurements', margin + 6, yPosition);
  yPosition += 14;

  // Height and Weight side by side
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  pdf.setTextColor(0, 0, 0);

  const height = data.height_feet && data.height_inches ? `${data.height_feet} ft ${data.height_inches} in` : 'Not specified';
  const heightInches = data.height_feet && data.height_inches ? (data.height_feet * 12 + data.height_inches) : 0;
  const weight = data.weight || 0;

  pdf.text(`Height: ${height}`, margin + 6, yPosition);
  pdf.text(`Weight: ${weight} lbs`, margin + 6 + columnWidth, yPosition);

  yPosition += 12;

  // BMI Assessment - Two side-by-side boxes
  const bmiBoxWidth = (pageWidth - 2 * margin - 6) / 2;
  const leftBmiBoxX = margin;
  const rightBmiBoxX = margin + bmiBoxWidth + 6;

  // Calculate BMI
  let bmi = 0;
  let bmiStatus = 'Not calculated';
  let bmiColor = [0, 0, 0];
  let bmiBgColor = [240, 245, 255];
  let obesityAssessment = 'N/A';
  let obesityBgColor = [240, 245, 255];

  if (heightInches > 0 && weight > 0) {
    bmi = (weight / (heightInches * heightInches)) * 703;
    bmi = Math.round(bmi * 100) / 100;

    if (bmi < 18.5) {
      bmiStatus = 'Underweight';
      bmiColor = [59, 130, 246]; // Blue
      bmiBgColor = [219, 234, 254]; // Light blue
    } else if (bmi >= 18.5 && bmi < 25) {
      bmiStatus = 'Normal';
      bmiColor = [34, 197, 94]; // Green
      bmiBgColor = [220, 252, 231]; // Light green
    } else if (bmi >= 25 && bmi < 30) {
      bmiStatus = 'Overweight';
      bmiColor = [234, 179, 8]; // Yellow
      bmiBgColor = [254, 249, 195]; // Light yellow
    } else {
      bmiStatus = 'Obese';
      bmiColor = [239, 68, 68]; // Red
      bmiBgColor = [254, 226, 226]; // Light red
    }

    obesityAssessment = bmi >= 30 ? 'YES' : 'NO';
    obesityBgColor = bmi >= 30 ? [254, 226, 226] : [220, 252, 231]; // Light red or light green
  }

  // BMI Calculation Box (left)
  pdf.setDrawColor(200, 200, 200);
  pdf.setFillColor(bmiBgColor[0], bmiBgColor[1], bmiBgColor[2]);

  pdf.saveGraphicsState();
  pdf.setGState(new pdf.GState({ opacity: 0.85 }));
  pdf.roundedRect(leftBmiBoxX, yPosition, bmiBoxWidth, 38, 2, 2, 'FD');
  pdf.restoreGraphicsState();

  let bmiY = yPosition + 6;
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(10);
  pdf.setTextColor(55, 91, 220);
  pdf.text('BMI Calculation', leftBmiBoxX + 6, bmiY);
  bmiY += 8;

  // Large BMI value centered
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(20);
  pdf.setTextColor(bmiColor[0], bmiColor[1], bmiColor[2]);
  const bmiText = bmi > 0 ? bmi.toFixed(2) : 'N/A';
  const bmiTextWidth = pdf.getTextWidth(bmiText);
  pdf.text(bmiText, leftBmiBoxX + bmiBoxWidth / 2 - bmiTextWidth / 2, bmiY);
  bmiY += 6;

  // BMI unit and status
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9);
  pdf.setTextColor(100, 100, 100);
  const unitText = bmi > 0 ? 'BMI (kg/m²)' : '';
  const unitTextWidth = pdf.getTextWidth(unitText);
  pdf.text(unitText, leftBmiBoxX + bmiBoxWidth / 2 - unitTextWidth / 2, bmiY);
  bmiY += 5;

  // Status badge
  if (bmi > 0) {
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(10);
    pdf.setTextColor(bmiColor[0], bmiColor[1], bmiColor[2]);
    const statusTextWidth = pdf.getTextWidth(bmiStatus);
    pdf.text(bmiStatus, leftBmiBoxX + bmiBoxWidth / 2 - statusTextWidth / 2, bmiY);
  }

  // Obesity Assessment Box (right)
  pdf.setDrawColor(200, 200, 200);
  pdf.setFillColor(obesityBgColor[0], obesityBgColor[1], obesityBgColor[2]);

  pdf.saveGraphicsState();
  pdf.setGState(new pdf.GState({ opacity: 0.85 }));
  pdf.roundedRect(rightBmiBoxX, yPosition, bmiBoxWidth, 38, 2, 2, 'FD');
  pdf.restoreGraphicsState();

  let obesityY = yPosition + 6;
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(10);
  pdf.setTextColor(239, 68, 68);
  pdf.text('Obesity Assessment', rightBmiBoxX + 6, obesityY);
  obesityY += 8;

  // Question text
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9);
  pdf.setTextColor(0, 0, 0);
  pdf.text('Is the patient obese', rightBmiBoxX + 6, obesityY);
  obesityY += 4;
  pdf.text('(BMI over 30)?', rightBmiBoxX + 6, obesityY);
  obesityY += 8;

  // Answer
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(18);
  if (obesityAssessment === 'YES') {
    pdf.setTextColor(239, 68, 68); // Red
  } else if (obesityAssessment === 'NO') {
    pdf.setTextColor(34, 197, 94); // Green
  } else {
    pdf.setTextColor(100, 100, 100); // Gray
  }
  const answerTextWidth = pdf.getTextWidth(obesityAssessment);
  pdf.text(obesityAssessment, rightBmiBoxX + bmiBoxWidth / 2 - answerTextWidth / 2, obesityY);
}

/**
 * Helper function to check if we need a new page and add one if needed
 * Returns the new Y position
 */
function checkAndAddPage(
  pdf: any,
  yPosition: number,
  requiredHeight: number,
  pageWidth: number,
  pageHeight: number,
  margin: number,
  logoImg: HTMLImageElement | null,
  logoHeight: number,
  watermarkImg: HTMLImageElement,
  sedationDate: string,
  pageNumber: { value: number },
  totalPages: { value: number }
): number {
  const footerHeight = 30; // Approximate footer height
  const availableSpace = pageHeight - margin - footerHeight - yPosition;

  if (availableSpace < requiredHeight) {
    pdf.addPage();
    totalPages.value++; // Increment total pages
    pageNumber.value++; // Increment current page number

    // Add header, footer, and watermark to new page
    addWatermark(pdf, pageWidth, pageHeight, watermarkImg);
    addHeaderAndFooter(pdf, pageWidth, pageHeight, margin, pageNumber.value, totalPages.value, sedationDate, logoImg, logoHeight);

    // Calculate Y position after header (same as in main function)
    // topMargin (5) + logoHeight + 1 (space after logo) + 8 (header height) + 6 (space after header)
    const topMargin = 5;
    return topMargin + logoHeight + 1 + 8 + 6;
  }

  return yPosition;
}

/**
 * Generate Step 2: Pre-Assessment & Medical History
 */
function generateStep2(
  pdf: any,
  data: IVSedationPdfData,
  pageWidth: number,
  pageHeight: number,
  margin: number,
  yPosition: number,
  logoImg: HTMLImageElement | null,
  logoHeight: number,
  watermarkImg: HTMLImageElement,
  sedationDate: string,
  pageNumber: { value: number },
  totalPages: { value: number }
) {
  // Title
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(18);
  pdf.setTextColor(55, 91, 220);
  pdf.text('IV Sedation Flow Chart', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 10;

  pdf.setFontSize(14);
  pdf.setTextColor(34, 139, 34);
  pdf.text('Step 2: Pre-Assessment & Medical History', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 12;

  // Pre-Assessment Fields in a grid (4 columns) - Compact version with BLUE theme
  const fieldHeight = 18;
  const gapBetweenFields = 3;
  const fieldWidth = (pageWidth - 2 * margin - (3 * gapBetweenFields)) / 4; // 4 columns with gaps

  // Pre-Assessment Section Header Box (spans all 4 columns)
  const headerHeight = 8;
  pdf.setLineWidth(0.5);
  pdf.setDrawColor(59, 130, 246); // Blue border
  pdf.setFillColor(239, 246, 255); // Light blue background
  pdf.roundedRect(margin, yPosition, pageWidth - 2 * margin, headerHeight, 2, 2, 'FD');

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(11);
  pdf.setTextColor(37, 99, 235); // Blue color
  pdf.text('• Pre-Assessment', margin + 3, yPosition + 5.5);
  yPosition += headerHeight + 3;

  const fieldY = yPosition;

  // Set border and fill colors for all boxes - BLUE THEME
  pdf.setDrawColor(59, 130, 246); // Blue border
  pdf.setLineWidth(0.5);

  // NPO STATUS
  pdf.setFillColor(239, 246, 255); // Light blue background
  pdf.roundedRect(margin, fieldY, fieldWidth, fieldHeight, 2, 2, 'FD');
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(7);
  pdf.setTextColor(59, 130, 246); // Blue label
  pdf.text('NPO STATUS', margin + 3, fieldY + 4);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  pdf.setTextColor(0, 0, 0);
  pdf.text(data.npo_status || 'Not specified', margin + 3, fieldY + 11);

  // MORNING MEDICATIONS
  const field2X = margin + fieldWidth + gapBetweenFields;
  pdf.setFillColor(239, 246, 255); // Light blue background
  pdf.roundedRect(field2X, fieldY, fieldWidth, fieldHeight, 2, 2, 'FD');
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(7);
  pdf.setTextColor(59, 130, 246); // Blue label
  pdf.text('MORNING MEDICATIONS', field2X + 3, fieldY + 4);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  pdf.setTextColor(0, 0, 0);
  const morningMeds = data.morning_medications === 'no' ? 'No' : data.morning_medications || 'Not specified';
  pdf.text(morningMeds, field2X + 3, fieldY + 11);

  // ASA CLASSIFICATION
  const field3X = margin + (fieldWidth + gapBetweenFields) * 2;
  pdf.setFillColor(239, 246, 255); // Light blue background
  pdf.roundedRect(field3X, fieldY, fieldWidth, fieldHeight, 2, 2, 'FD');
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(7);
  pdf.setTextColor(59, 130, 246); // Blue label
  pdf.text('ASA CLASSIFICATION', field3X + 3, fieldY + 4);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  pdf.setTextColor(0, 0, 0);
  pdf.text(data.asa_classification || 'Not specified', field3X + 3, fieldY + 11);

  // MALLAMPATI SCORE
  const field4X = margin + (fieldWidth + gapBetweenFields) * 3;
  pdf.setFillColor(239, 246, 255); // Light blue background
  pdf.roundedRect(field4X, fieldY, fieldWidth, fieldHeight, 2, 2, 'FD');
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(7);
  pdf.setTextColor(59, 130, 246); // Blue label
  pdf.text('MALLAMPATI SCORE', field4X + 3, fieldY + 4);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  pdf.setTextColor(0, 0, 0);
  pdf.text(data.mallampati_score || 'Not specified', field4X + 3, fieldY + 11);

  yPosition += fieldHeight + 8;

  // Allergies Section Header Box (spans full width)
  const allergyHeaderHeight = 8;
  pdf.setLineWidth(0.5);
  pdf.setDrawColor(220, 38, 38); // Red border
  pdf.setFillColor(254, 242, 242); // Light red background
  pdf.roundedRect(margin, yPosition, pageWidth - 2 * margin, allergyHeaderHeight, 2, 2, 'FD');

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(11);
  pdf.setTextColor(220, 38, 38); // Red color
  pdf.text('• Allergies', margin + 3, yPosition + 5.5);
  yPosition += allergyHeaderHeight + 3;

  // Define all allergy options (ordered to match UI - 4 columns, left to right)
  const allergyOptions = [
    'NKDA',
    'Penicillin',
    'Sulfa',
    'Ibuprofen',
    'Codeine',
    'Aspirin',
    'Shellfish',
    'Dairy',
    'Latex',
    'Iodine',
    'Nuts',
    'Eggs',
    'Environmental',
    'Seasonal',
    'Other',
    ''  // Empty cell for alignment
  ];

  // Get selected allergies
  const selectedAllergies = data.allergies || [];

  // Grid layout: 4 columns
  const columns = 4;
  const checkboxSize = 3;
  const itemHeight = 6; // Reduced from 7 to 6
  const columnWidth = (pageWidth - 2 * margin - 9) / columns; // 9 = gaps between columns (3mm each)
  const allergiesBoxWidth = pageWidth - 2 * margin;
  const rows = Math.ceil(allergyOptions.length / columns);
  const baseAllergiesHeight = 5 + (rows * itemHeight) + 4; // Base height: 5 top + rows + 4 bottom

  // Calculate additional height for "Other" text if specified
  let otherTextHeight = 0;
  if (data.allergies_other) {
    otherTextHeight = 10; // Space for "Other allergies:" label and text
  }
  const totalAllergiesHeight = baseAllergiesHeight + otherTextHeight;

  // Check if we need a new page
  yPosition = checkAndAddPage(
    pdf, yPosition, totalAllergiesHeight, pageWidth, pageHeight, margin,
    logoImg, logoHeight, watermarkImg, sedationDate, pageNumber, totalPages
  );

  // Draw allergies box with RED theme - use totalAllergiesHeight to include "Other" text
  pdf.setLineWidth(0.5);
  pdf.setDrawColor(220, 38, 38); // Red border
  pdf.setFillColor(254, 242, 242); // Light red background
  pdf.roundedRect(margin, yPosition, allergiesBoxWidth, totalAllergiesHeight, 2, 2, 'FD');

  yPosition += 5;

  // Draw checkboxes in grid
  allergyOptions.forEach((allergy, index) => {
    // Skip empty cells
    if (allergy === '') return;

    const row = Math.floor(index / columns);
    const col = index % columns;
    const x = margin + 4 + (col * columnWidth);
    const y = yPosition + (row * itemHeight);

    // Check if this allergy is selected
    const isChecked = selectedAllergies.includes(allergy) ||
                      (allergy === 'Other' && data.allergies_other);

    // Draw checkbox
    pdf.setDrawColor(200, 200, 200);
    pdf.setFillColor(255, 255, 255);
    pdf.rect(x, y - 2.5, checkboxSize, checkboxSize, 'FD');

    // Draw checkmark if selected
    if (isChecked) {
      pdf.setDrawColor(220, 38, 38); // Red checkmark
      pdf.setLineWidth(0.5);
      // Draw checkmark
      pdf.line(x + 0.5, y - 1, x + 1.2, y - 0.2);
      pdf.line(x + 1.2, y - 0.2, x + 2.5, y - 2.3);
    }

    // Draw label
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    pdf.setTextColor(0, 0, 0);
    pdf.text(allergy, x + checkboxSize + 2, y);
  });

  yPosition += (rows * itemHeight) + 4;

  // Add "Other" text field if specified - INSIDE the box
  if (data.allergies_other) {
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.setTextColor(100, 100, 100);
    pdf.text('Other allergies:', margin + 4, yPosition);
    yPosition += 4;
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    pdf.setTextColor(0, 0, 0);
    pdf.text(data.allergies_other, margin + 4, yPosition);
    yPosition += 5;
  } else {
    yPosition += 2;
  }

  yPosition += 6; // Space before next section (reduced from 8 to 6)

  console.log('=== MEDICAL HISTORY SECTIONS - Y POSITION TRACKING ===');
  console.log(`Starting Y position for medical sections: ${yPosition}`);
  console.log(`Page height: ${pageHeight}, Margin: ${margin}`);
  console.log(`Available space: ${pageHeight - margin - 30 - yPosition}mm`);

  // Helper function to draw medical history section with checkboxes (for side-by-side layout)
  const drawMedicalSectionSideBySide = (
    title: string,
    options: string[],
    selectedOptions: string[] | undefined,
    otherValue: string | undefined,
    xPos: number,
    yPos: number,
    boxWidth: number,
    numColumns: number = 2 // Default to 2 columns, can override to 1
  ): number => {
    let currentY = yPos;

    // Calculate grid dimensions
    const cols = numColumns;
    const itemHeight = 7; // Adjusted for better spacing
    const leftPadding = 6; // Left padding inside box
    const rightPadding = 6; // Right padding inside box
    const itemWidth = (boxWidth - leftPadding - rightPadding) / cols;
    const totalRows = Math.ceil(options.filter(opt => opt !== '').length / cols);
    const otherTextHeight = otherValue ? 12 : 0; // Space for "Other" text
    const headerHeight = 6; // Height for header inside box
    const topPadding = 5;
    const bottomPadding = 4;
    const sectionHeight = headerHeight + topPadding + (totalRows * itemHeight) + bottomPadding + otherTextHeight;

    // Draw section box with blue theme
    pdf.setLineWidth(0.5);
    pdf.setDrawColor(59, 130, 246); // Blue border
    pdf.setFillColor(239, 246, 255); // Light blue background
    pdf.roundedRect(xPos, currentY, boxWidth, sectionHeight, 2, 2, 'FD');

    // Section header INSIDE the box
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(9.5);
    pdf.setTextColor(37, 99, 235); // Blue color
    pdf.text(`• ${title}`, xPos + 3, currentY + 4.5);
    currentY += headerHeight;

    currentY += topPadding;

    // Draw checkboxes in grid
    let itemIndex = 0;
    options.forEach((option) => {
      if (option === '') return;

      const row = Math.floor(itemIndex / cols);
      const col = itemIndex % cols;
      const x = xPos + leftPadding + (col * itemWidth);
      const y = currentY + (row * itemHeight);

      // Check if this option is selected
      const isChecked = selectedOptions?.includes(option) ||
                        (option === 'Other' && otherValue);

      // Draw checkbox - aligned properly with text baseline
      const checkboxSize = 3;
      const checkboxY = y - 2; // Align checkbox with text baseline
      pdf.setDrawColor(200, 200, 200);
      pdf.setFillColor(255, 255, 255);
      pdf.rect(x, checkboxY, checkboxSize, checkboxSize, 'FD');

      // Draw checkmark if selected
      if (isChecked) {
        pdf.setDrawColor(37, 99, 235); // Blue checkmark
        pdf.setLineWidth(0.5);
        pdf.line(x + 0.5, checkboxY + 1, x + 1.2, checkboxY + 1.8);
        pdf.line(x + 1.2, checkboxY + 1.8, x + 2.5, checkboxY + 0.2);
      }

      // Draw label - properly aligned with checkbox
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);
      pdf.setTextColor(0, 0, 0);
      pdf.text(option, x + checkboxSize + 2, y);

      itemIndex++;
    });

    currentY += (totalRows * itemHeight) + bottomPadding;

    // Add "Other" text if specified - inside the box with proper padding
    if (otherValue) {
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(7);
      pdf.setTextColor(120, 120, 120);
      pdf.text(`Please specify other:`, xPos + leftPadding, currentY);
      currentY += 3.5;
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);
      pdf.setTextColor(0, 0, 0);
      const otherLines = pdf.splitTextToSize(otherValue, boxWidth - leftPadding - rightPadding);
      pdf.text(otherLines, xPos + leftPadding, currentY);
      currentY += (otherLines.length * 3.5);
    }

    return currentY; // Return bottom Y position of this section
  };

  // Calculate dimensions for side-by-side layout
  const sectionGap = 4; // Gap between left and right sections
  const sectionWidth = (pageWidth - 2 * margin - sectionGap) / 2;

  // ROW 1: Anesthesia History (left) and Respiratory Problems (right)
  const anesthesiaOptions = [
    'No Previous Anesthetic History',
    'Previous Anesthetic without any problems or complications',
    'Family Hx of Anesthetic Complications',
    'Malignant Hyperthermia',
    'Other',
    ''
  ];
  const respiratoryOptions = [
    'NONE',
    'Asthma',
    'Anemia',
    'Reactive Airway',
    'Bronchitis',
    'COPD',
    'Dyspnea',
    'Orthopnea',
    'Recent URI',
    'SOB',
    'Tuberculosis',
    'Other'
  ];

  // Check if we need a new page for row 1
  const estimatedRow1Height = 60; // Reduced from 80 to 60 for more compact layout
  console.log(`\nROW 1 - Before checkAndAddPage: Y=${yPosition}, Required=${estimatedRow1Height}`);
  yPosition = checkAndAddPage(
    pdf, yPosition, estimatedRow1Height, pageWidth, pageHeight, margin,
    logoImg, logoHeight, watermarkImg, sedationDate, pageNumber, totalPages
  );
  console.log(`ROW 1 - After checkAndAddPage: Y=${yPosition}, Page=${pageNumber.value}`);

  // Draw left section (Anesthesia History) - 1 column only
  const leftBottomY1 = drawMedicalSectionSideBySide(
    'Anesthesia History',
    anesthesiaOptions,
    data.anesthesia_history ? [data.anesthesia_history] : undefined,
    data.anesthesia_history_other,
    margin,
    yPosition,
    sectionWidth,
    1 // 1 column for Anesthesia History
  );
  console.log(`Anesthesia History - Bottom Y: ${leftBottomY1}`);

  // Draw right section (Respiratory Problems)
  const rightBottomY1 = drawMedicalSectionSideBySide(
    'Respiratory Problems',
    respiratoryOptions,
    data.respiratory_problems,
    data.respiratory_problems_other,
    margin + sectionWidth + sectionGap,
    yPosition,
    sectionWidth
  );
  console.log(`Respiratory Problems - Bottom Y: ${rightBottomY1}`);

  // Move to next row (use the taller of the two sections)
  yPosition = Math.max(leftBottomY1, rightBottomY1) + 2;
  console.log(`ROW 1 Complete - Next Y position: ${yPosition}`);

  // ROW 2: Cardiovascular Problems (left) and Endocrine/Renal Problems (right)
  const cardiovascularOptions = [
    'NONE',
    'Anemia',
    'Congestive Heart Failure (CHF)',
    'Dysrhythmia',
    'Murmur',
    'Hypertension (HTN)',
    'Myocardial Infarction (MI)',
    'Valvular DX',
    'Rheumatic Fever',
    'Sickle Cell Disease',
    'Congenital Heart DX',
    'Pacemaker',
    'Other',
    ''
  ];
  const endocrineRenalOptions = [
    'Diabetes',
    'Thyroid DX',
    'Other',
    'Renal Failure',
    'Dialysis',
    ''
  ];

  // Check if we need a new page for row 2
  const estimatedRow2Height = 45; // Reduced to allow more content on same page
  console.log(`\nROW 2 - Before checkAndAddPage: Y=${yPosition}, Required=${estimatedRow2Height}`);
  yPosition = checkAndAddPage(
    pdf, yPosition, estimatedRow2Height, pageWidth, pageHeight, margin,
    logoImg, logoHeight, watermarkImg, sedationDate, pageNumber, totalPages
  );
  console.log(`ROW 2 - After checkAndAddPage: Y=${yPosition}, Page=${pageNumber.value}`);

  // Draw left section (Cardiovascular Problems)
  const leftBottomY2 = drawMedicalSectionSideBySide(
    'Cardiovascular Problems',
    cardiovascularOptions,
    data.cardiovascular_problems,
    data.cardiovascular_problems_other,
    margin,
    yPosition,
    sectionWidth
  );
  console.log(`Cardiovascular Problems - Bottom Y: ${leftBottomY2}`);

  // Draw right section (Endocrine/Renal Problems) with special fields
  let endoCurrentY = yPosition;

  // Calculate dimensions
  const endoCols = 2;
  const endoItemHeight = 7;
  const endoLeftPadding = 6;
  const endoRightPadding = 6;
  const endoItemWidth = (sectionWidth - endoLeftPadding - endoRightPadding) / endoCols;
  const endoTotalRows = Math.ceil(endocrineRenalOptions.filter(opt => opt !== '').length / endoCols);
  const endoOtherTextHeight = data.endocrine_renal_problems_other ? 12 : 0;
  const lastA1cHeight = data.last_a1c_level ? 12 : 0;
  const endoHeaderHeight = 6; // Height for header inside box
  const endoTopPadding = 5;
  const endoBottomPadding = 4;
  const endoSectionHeight = endoHeaderHeight + endoTopPadding + (endoTotalRows * endoItemHeight) + endoBottomPadding + endoOtherTextHeight + lastA1cHeight;

  // Draw section box
  const rightBoxX = margin + sectionWidth + sectionGap;
  pdf.setLineWidth(0.5);
  pdf.setDrawColor(59, 130, 246);
  pdf.setFillColor(239, 246, 255);
  pdf.roundedRect(rightBoxX, endoCurrentY, sectionWidth, endoSectionHeight, 2, 2, 'FD');

  // Section header INSIDE the box
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(9.5);
  pdf.setTextColor(37, 99, 235); // Blue color
  pdf.text(`• Endocrine/Renal Problems`, rightBoxX + 3, endoCurrentY + 4.5);
  endoCurrentY += endoHeaderHeight;

  endoCurrentY += endoTopPadding;

  // Draw checkboxes
  let endoItemIndex = 0;
  endocrineRenalOptions.forEach((option) => {
    if (option === '') return;

    const row = Math.floor(endoItemIndex / endoCols);
    const col = endoItemIndex % endoCols;
    const x = rightBoxX + endoLeftPadding + (col * endoItemWidth);
    const y = endoCurrentY + (row * endoItemHeight);

    const isChecked = data.endocrine_renal_problems?.includes(option) ||
                      (option === 'Other' && data.endocrine_renal_problems_other);

    // Draw checkbox
    const checkboxSize = 3;
    const checkboxY = y - 2;
    pdf.setDrawColor(200, 200, 200);
    pdf.setFillColor(255, 255, 255);
    pdf.rect(x, checkboxY, checkboxSize, checkboxSize, 'FD');

    // Draw checkmark if selected
    if (isChecked) {
      pdf.setDrawColor(37, 99, 235);
      pdf.setLineWidth(0.5);
      pdf.line(x + 0.5, checkboxY + 1, x + 1.2, checkboxY + 1.8);
      pdf.line(x + 1.2, checkboxY + 1.8, x + 2.5, checkboxY + 0.2);
    }

    // Draw label
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.setTextColor(0, 0, 0);
    pdf.text(option, x + checkboxSize + 2, y);

    endoItemIndex++;
  });

  endoCurrentY += (endoTotalRows * endoItemHeight) + endoBottomPadding;

  // Add "Other" text if specified
  if (data.endocrine_renal_problems_other) {
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7);
    pdf.setTextColor(120, 120, 120);
    pdf.text(`Other Details:`, rightBoxX + endoLeftPadding, endoCurrentY);
    endoCurrentY += 3.5;
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.setTextColor(0, 0, 0);
    const otherLines = pdf.splitTextToSize(data.endocrine_renal_problems_other, sectionWidth - endoLeftPadding - endoRightPadding);
    pdf.text(otherLines, rightBoxX + endoLeftPadding, endoCurrentY);
    endoCurrentY += (otherLines.length * 3.5);
  }

  // Add "Last A1C Level" if specified
  if (data.last_a1c_level) {
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7);
    pdf.setTextColor(120, 120, 120);
    pdf.text(`Last A1C Level:`, rightBoxX + endoLeftPadding, endoCurrentY);
    endoCurrentY += 3.5;
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.setTextColor(0, 0, 0);
    pdf.text(data.last_a1c_level, rightBoxX + endoLeftPadding, endoCurrentY);
    endoCurrentY += 3.5;
  }

  const rightBottomY2 = endoCurrentY;
  console.log(`Endocrine/Renal Problems - Bottom Y: ${rightBottomY2}`);

  // Move to next position
  yPosition = Math.max(leftBottomY2, rightBottomY2) + 2;
  console.log(`ROW 2 Complete - Next Y position: ${yPosition}`);

  // ROW 3: Neurologic Problems (left) and Gastrointestinal Problems (right)
  const neurologicOptions = [
    'Transient Ischemic Attack (TIA)',
    'Headaches',
    'Syncope',
    'Seizures',
    'Cerebral Vascular Accident (CVA)',
    ''
  ];
  const gastrointestinalOptions = [
    'NONE',
    'Cirrhosis',
    'Hepatitis',
    'Reflux',
    'Ulcers',
    'Oesophageal Issues',
    'Other',
    ''
  ];

  // Check if we need a new page for row 3
  const estimatedRow3Height = 35; // Reduced to allow more content on same page
  console.log(`\nROW 3 - Before checkAndAddPage: Y=${yPosition}, Required=${estimatedRow3Height}`);
  yPosition = checkAndAddPage(
    pdf, yPosition, estimatedRow3Height, pageWidth, pageHeight, margin,
    logoImg, logoHeight, watermarkImg, sedationDate, pageNumber, totalPages
  );
  console.log(`ROW 3 - After checkAndAddPage: Y=${yPosition}, Page=${pageNumber.value}`);

  // Draw left section (Neurologic Problems)
  const leftBottomY3 = drawMedicalSectionSideBySide(
    'Neurologic Problems',
    neurologicOptions,
    data.neurologic_problems,
    data.neurologic_problems_other,
    margin,
    yPosition,
    sectionWidth,
    2 // 2 columns
  );
  console.log(`Neurologic Problems - Bottom Y: ${leftBottomY3}`);

  // Draw right section (Gastrointestinal Problems)
  const rightBottomY3 = drawMedicalSectionSideBySide(
    'Gastrointestinal Problems',
    gastrointestinalOptions,
    data.gastrointestinal_problems,
    data.gastrointestinal_problems_other,
    margin + sectionWidth + sectionGap,
    yPosition,
    sectionWidth
  );
  console.log(`Gastrointestinal Problems - Bottom Y: ${rightBottomY3}`);

  // Move to next row
  yPosition = Math.max(leftBottomY3, rightBottomY3) + 2;
  console.log(`ROW 3 Complete - Next Y position: ${yPosition}`);

  // ROW 4: Miscellaneous Conditions (full width)
  const miscellaneousOptions = [
    'Bypass',
    'Seizures',
    'Rheumatoid Arthritis',
    'Artificial Valve',
    'Parkinson\'s Disease',
    'Dementia (Alzheimer\'s)',
    'Eating Disorder',
    'HIV',
    'Anxiety',
    'Stroke',
    'Heart Birth Defect',
    'Lupus',
    'Prolonged Bleeding',
    'Hemophilia',
    'Artificial Joint',
    'Chemotherapy',
    'Cancer',
    'Osteoporosis',
    'Sickle Cell',
    'Immunosuppressive Disease',
    'Fibromyalgia',
    'Platelet Disorder',
    'Chronic Kidney Disease',
    'Muscle Weakness',
    'AIDS',
    'Schizophrenia'
  ];

  // Check if we need a new page for row 4
  const estimatedRow4Height = 50; // Reduced from 80 to 50 to allow fitting on same page
  console.log(`\nROW 4 - Before checkAndAddPage: Y=${yPosition}, Required=${estimatedRow4Height}`);
  yPosition = checkAndAddPage(
    pdf, yPosition, estimatedRow4Height, pageWidth, pageHeight, margin,
    logoImg, logoHeight, watermarkImg, sedationDate, pageNumber, totalPages
  );
  console.log(`ROW 4 - After checkAndAddPage: Y=${yPosition}, Page=${pageNumber.value}`);

  // Draw Miscellaneous Conditions (full width, 3 columns)
  let miscCurrentY = yPosition;

  // Calculate dimensions for 3 columns
  const miscCols = 3;
  const miscItemHeight = 7;
  const miscBoxWidth = pageWidth - 2 * margin;
  const miscLeftPadding = 6;
  const miscRightPadding = 6;
  const miscItemWidth = (miscBoxWidth - miscLeftPadding - miscRightPadding) / miscCols;
  const miscTotalRows = Math.ceil(miscellaneousOptions.length / miscCols);
  const miscOtherTextHeight = data.miscellaneous_other ? 12 : 0;
  const miscHeaderHeight = 6; // Height for header inside box
  const miscTopPadding = 5;
  const miscBottomPadding = 4;
  const miscSectionHeight = miscHeaderHeight + miscTopPadding + (miscTotalRows * miscItemHeight) + miscBottomPadding + miscOtherTextHeight;

  // Draw section box
  pdf.setLineWidth(0.5);
  pdf.setDrawColor(59, 130, 246);
  pdf.setFillColor(239, 246, 255);
  pdf.roundedRect(margin, miscCurrentY, miscBoxWidth, miscSectionHeight, 2, 2, 'FD');

  // Section header INSIDE the box
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(9.5);
  pdf.setTextColor(37, 99, 235);
  pdf.text(`• Miscellaneous Conditions`, margin + 3, miscCurrentY + 4.5);
  miscCurrentY += miscHeaderHeight;

  miscCurrentY += miscTopPadding;

  // Draw checkboxes in 3 columns
  miscellaneousOptions.forEach((option, index) => {
    const row = Math.floor(index / miscCols);
    const col = index % miscCols;
    const x = margin + miscLeftPadding + (col * miscItemWidth);
    const y = miscCurrentY + (row * miscItemHeight);

    const isChecked = data.miscellaneous?.includes(option) ||
                      (option === 'Other' && data.miscellaneous_other);

    // Draw checkbox
    const checkboxSize = 3;
    const checkboxY = y - 2;
    pdf.setDrawColor(200, 200, 200);
    pdf.setFillColor(255, 255, 255);
    pdf.rect(x, checkboxY, checkboxSize, checkboxSize, 'FD');

    // Draw checkmark if selected
    if (isChecked) {
      pdf.setDrawColor(37, 99, 235);
      pdf.setLineWidth(0.5);
      pdf.line(x + 0.5, checkboxY + 1, x + 1.2, checkboxY + 1.8);
      pdf.line(x + 1.2, checkboxY + 1.8, x + 2.5, checkboxY + 0.2);
    }

    // Draw label
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.setTextColor(0, 0, 0);
    pdf.text(option, x + checkboxSize + 2, y);
  });

  miscCurrentY += (miscTotalRows * miscItemHeight) + miscBottomPadding;

  // Add "Other" text if specified
  if (data.miscellaneous_other) {
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7);
    pdf.setTextColor(120, 120, 120);
    pdf.text(`Please specify other:`, margin + miscLeftPadding, miscCurrentY);
    miscCurrentY += 3.5;
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.setTextColor(0, 0, 0);
    const otherLines = pdf.splitTextToSize(data.miscellaneous_other, miscBoxWidth - miscLeftPadding - miscRightPadding);
    pdf.text(otherLines, margin + miscLeftPadding, miscCurrentY);
    miscCurrentY += (otherLines.length * 3.5);
  }

  yPosition = miscCurrentY + 2;
  console.log(`ROW 4 Complete - Next Y position: ${yPosition}`);

  // ROW 5: Social History (full width)
  const socialHistoryOptions = [
    'ETOH Consumption',
    'Recreational Drugs',
    'Tobacco'
  ];

  // Check if we need a new page for row 5
  const estimatedRow5Height = 40;
  console.log(`\nROW 5 - Before checkAndAddPage: Y=${yPosition}, Required=${estimatedRow5Height}`);
  yPosition = checkAndAddPage(
    pdf, yPosition, estimatedRow5Height, pageWidth, pageHeight, margin,
    logoImg, logoHeight, watermarkImg, sedationDate, pageNumber, totalPages
  );
  console.log(`ROW 5 - After checkAndAddPage: Y=${yPosition}, Page=${pageNumber.value}`);

  // Draw Social History (full width, 3 columns)
  let socialCurrentY = yPosition;

  // Calculate dimensions
  const socialCols = 3;
  const socialItemHeight = 7;
  const socialBoxWidth = pageWidth - 2 * margin;
  const socialLeftPadding = 6;
  const socialRightPadding = 6;
  const socialItemWidth = (socialBoxWidth - socialLeftPadding - socialRightPadding) / socialCols;
  const socialTotalRows = Math.ceil(socialHistoryOptions.length / socialCols);
  const socialOtherTextHeight = data.social_history_other ? 12 : 0;
  const socialHeaderHeight = 6; // Height for header inside box
  const socialTopPadding = 5;
  const socialBottomPadding = 4;
  const socialSectionHeight = socialHeaderHeight + socialTopPadding + (socialTotalRows * socialItemHeight) + socialBottomPadding + socialOtherTextHeight;

  // Draw section box
  pdf.setLineWidth(0.5);
  pdf.setDrawColor(59, 130, 246);
  pdf.setFillColor(239, 246, 255);
  pdf.roundedRect(margin, socialCurrentY, socialBoxWidth, socialSectionHeight, 2, 2, 'FD');

  // Section header INSIDE the box
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(9.5);
  pdf.setTextColor(37, 99, 235);
  pdf.text(`• Social History`, margin + 3, socialCurrentY + 4.5);
  socialCurrentY += socialHeaderHeight;

  socialCurrentY += socialTopPadding;

  // Draw checkboxes
  socialHistoryOptions.forEach((option, index) => {
    const row = Math.floor(index / socialCols);
    const col = index % socialCols;
    const x = margin + socialLeftPadding + (col * socialItemWidth);
    const y = socialCurrentY + (row * socialItemHeight);

    const isChecked = data.social_history?.includes(option) ||
                      (option === 'Other' && data.social_history_other);

    // Draw checkbox
    const checkboxSize = 3;
    const checkboxY = y - 2;
    pdf.setDrawColor(200, 200, 200);
    pdf.setFillColor(255, 255, 255);
    pdf.rect(x, checkboxY, checkboxSize, checkboxSize, 'FD');

    // Draw checkmark if selected
    if (isChecked) {
      pdf.setDrawColor(37, 99, 235);
      pdf.setLineWidth(0.5);
      pdf.line(x + 0.5, checkboxY + 1, x + 1.2, checkboxY + 1.8);
      pdf.line(x + 1.2, checkboxY + 1.8, x + 2.5, checkboxY + 0.2);
    }

    // Draw label
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.setTextColor(0, 0, 0);
    pdf.text(option, x + checkboxSize + 2, y);
  });

  socialCurrentY += (socialTotalRows * socialItemHeight) + socialBottomPadding;

  // Add "Other" text if specified
  if (data.social_history_other) {
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7);
    pdf.setTextColor(120, 120, 120);
    pdf.text(`Please specify other:`, margin + socialLeftPadding, socialCurrentY);
    socialCurrentY += 3.5;
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.setTextColor(0, 0, 0);
    const otherLines = pdf.splitTextToSize(data.social_history_other, socialBoxWidth - socialLeftPadding - socialRightPadding);
    pdf.text(otherLines, margin + socialLeftPadding, socialCurrentY);
    socialCurrentY += (otherLines.length * 3.5);
  }

  yPosition = socialCurrentY + 2;
  console.log(`ROW 5 Complete - Next Y position: ${yPosition}`);

  // ROW 6: Patient Assessment (side-by-side fields)

  // Check if we need a new page for row 6
  const estimatedRow6Height = 40;
  console.log(`\nROW 6 - Before checkAndAddPage: Y=${yPosition}, Required=${estimatedRow6Height}`);
  yPosition = checkAndAddPage(
    pdf, yPosition, estimatedRow6Height, pageWidth, pageHeight, margin,
    logoImg, logoHeight, watermarkImg, sedationDate, pageNumber, totalPages
  );
  console.log(`ROW 6 - After checkAndAddPage: Y=${yPosition}, Page=${pageNumber.value}`);

  // Debug logging
  console.log('Patient Assessment Values:');
  console.log(`  well_developed_nourished: "${data.well_developed_nourished}"`);
  console.log(`  patient_anxious: "${data.patient_anxious}"`);

  // Patient Assessment Section Header Box (spans full width)
  const patientAssessmentHeaderHeight = 8;
  pdf.setLineWidth(0.5);
  pdf.setDrawColor(59, 130, 246); // Blue border
  pdf.setFillColor(239, 246, 255); // Light blue background
  pdf.roundedRect(margin, yPosition, pageWidth - 2 * margin, patientAssessmentHeaderHeight, 2, 2, 'FD');

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(9.5);
  pdf.setTextColor(37, 99, 235);
  pdf.text('• Patient Assessment', margin + 3, yPosition + 5.5);
  yPosition += patientAssessmentHeaderHeight + 3;

  // Calculate dimensions for side-by-side assessment fields
  const assessmentGap = 4;
  const assessmentFieldWidth = (pageWidth - 2 * margin - assessmentGap) / 2;
  const assessmentFieldHeight = 22;

  // Left field: "Patient is Well Developed and Well Nourished"
  const leftFieldX = margin;
  pdf.setLineWidth(0.5);
  pdf.setDrawColor(59, 130, 246);
  pdf.setFillColor(239, 246, 255);
  pdf.roundedRect(leftFieldX, yPosition, assessmentFieldWidth, assessmentFieldHeight, 2, 2, 'FD');

  // Label
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  pdf.setTextColor(0, 0, 0);
  pdf.text('Patient is Well Developed and Well Nourished', leftFieldX + 6, yPosition + 6);

  // Show selected value as text
  const selectedValue1 = data.well_developed_nourished ? data.well_developed_nourished.toUpperCase() : 'NOT SELECTED';
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(12);
  pdf.setTextColor(0, 0, 0); // Black
  pdf.text(selectedValue1, leftFieldX + 6, yPosition + 15);

  // Right field: "Patient is Anxious?"
  const rightFieldX = margin + assessmentFieldWidth + assessmentGap;
  pdf.setLineWidth(0.5);
  pdf.setDrawColor(59, 130, 246);
  pdf.setFillColor(239, 246, 255);
  pdf.roundedRect(rightFieldX, yPosition, assessmentFieldWidth, assessmentFieldHeight, 2, 2, 'FD');

  // Label
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  pdf.setTextColor(0, 0, 0);
  pdf.text('Patient is Anxious?', rightFieldX + 6, yPosition + 6);

  // Show selected value as text
  const selectedValue2 = data.patient_anxious ? data.patient_anxious.toUpperCase() : 'NOT SELECTED';
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(12);
  pdf.setTextColor(0, 0, 0); // Black
  pdf.text(selectedValue2, rightFieldX + 6, yPosition + 15);

  yPosition += assessmentFieldHeight + 8;
  console.log(`ROW 6 Complete - Final Y position: ${yPosition}`);

  // ROW 7: ASA Classification & Airway Evaluation (side-by-side)
  const estimatedRow7Height = 60;
  yPosition = checkAndAddPage(
    pdf, yPosition, estimatedRow7Height, pageWidth, pageHeight, margin,
    logoImg, logoHeight, watermarkImg, sedationDate, pageNumber, totalPages
  );
  console.log(`ROW 7 - After checkAndAddPage: Y=${yPosition}, Page=${pageNumber.value}`);

  const row7Gap = 4;
  const row7FieldWidth = (pageWidth - 2 * margin - row7Gap) / 2;

  // Left: ASA Classification
  const asaFieldX = margin;
  const asaFieldHeight = 50;

  pdf.setLineWidth(0.5);
  pdf.setDrawColor(59, 130, 246);
  pdf.setFillColor(239, 246, 255);
  pdf.roundedRect(asaFieldX, yPosition, row7FieldWidth, asaFieldHeight, 2, 2, 'FD');

  // ASA Header
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(9);
  pdf.setTextColor(37, 99, 235);
  pdf.text('* ASA Classification', asaFieldX + 4, yPosition + 5);

  // ASA Description
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(7);
  pdf.setTextColor(0, 0, 0);
  pdf.text('American Society of Anesthesiology Classification (ASA) Status', asaFieldX + 4, yPosition + 10);

  // ASA Options (1-5 buttons)
  const asaButtonY = yPosition + 15;
  const asaButtonWidth = 15; // Reduced from 16 to 15
  const asaButtonHeight = 10;
  const asaButtonGap = 3; // Increased from 2 to 3 for better spacing
  const asaOptions = ['1', '2', '3', '4', '5'];
  const asaLeftPadding = 4;
  const asaRightPadding = 4;

  // Calculate available width and adjust button width if needed to fit within box
  const availableWidth = row7FieldWidth - asaLeftPadding - asaRightPadding;
  const adjustedButtonWidth = Math.min(asaButtonWidth, (availableWidth - (asaButtonGap * 4)) / 5);

  asaOptions.forEach((option, index) => {
    const buttonX = asaFieldX + asaLeftPadding + (index * (adjustedButtonWidth + asaButtonGap));
    const isSelected = data.asa_classification === option;

    if (isSelected) {
      pdf.setFillColor(59, 130, 246); // Blue
      pdf.setDrawColor(59, 130, 246);
    } else {
      pdf.setFillColor(255, 255, 255); // White
      pdf.setDrawColor(209, 213, 219); // Gray border
    }
    pdf.setLineWidth(0.5);
    pdf.roundedRect(buttonX, asaButtonY, adjustedButtonWidth, asaButtonHeight, 1.5, 1.5, 'FD');

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(10);
    if (isSelected) {
      pdf.setTextColor(255, 255, 255); // White text
    } else {
      pdf.setTextColor(107, 114, 128); // Gray text
    }
    pdf.text(option, buttonX + adjustedButtonWidth / 2, asaButtonY + 7, { align: 'center' });
  });

  // Right: Airway Evaluation
  const airwayFieldX = margin + row7FieldWidth + row7Gap;
  const airwayFieldHeight = 50;

  pdf.setLineWidth(0.5);
  pdf.setDrawColor(59, 130, 246);
  pdf.setFillColor(239, 246, 255);
  pdf.roundedRect(airwayFieldX, yPosition, row7FieldWidth, airwayFieldHeight, 2, 2, 'FD');

  // Airway Header
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(9);
  pdf.setTextColor(37, 99, 235);
  pdf.text('* Airway Evaluation', airwayFieldX + 4, yPosition + 5);

  // Airway Options
  const airwayOptions = [
    'Good range of motion of neck and jaw',
    'Missing, Loose or Chipped Teeth',
    'Edentulous'
  ];

  let airwayCurrentY = yPosition + 10;
  const airwayArray = data.airway_evaluation || [];

  airwayOptions.forEach((option) => {
    const isChecked = airwayArray.includes(option);

    // Checkbox
    const checkboxSize = 3;
    const checkboxX = airwayFieldX + 4;
    const checkboxY = airwayCurrentY;

    pdf.setLineWidth(0.3);
    pdf.setDrawColor(59, 130, 246);
    if (isChecked) {
      pdf.setFillColor(59, 130, 246);
      pdf.rect(checkboxX, checkboxY, checkboxSize, checkboxSize, 'FD');
      pdf.setDrawColor(255, 255, 255);
      pdf.setLineWidth(0.5);
      pdf.line(checkboxX + 0.5, checkboxY + 1.5, checkboxX + 1.2, checkboxY + 2.3);
      pdf.line(checkboxX + 1.2, checkboxY + 2.3, checkboxX + 2.5, checkboxY + 0.7);
    } else {
      pdf.setFillColor(255, 255, 255);
      pdf.rect(checkboxX, checkboxY, checkboxSize, checkboxSize, 'FD');
      pdf.setDrawColor(59, 130, 246);
      pdf.rect(checkboxX, checkboxY, checkboxSize, checkboxSize, 'S');
    }

    // Label
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.setTextColor(0, 0, 0);
    pdf.text(option, checkboxX + checkboxSize + 2, checkboxY + 2.5);

    airwayCurrentY += 6;
  });

  // Other field
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(7);
  pdf.setTextColor(100, 100, 100);
  pdf.text('Other:', airwayFieldX + 4, airwayCurrentY + 2);

  if (data.airway_evaluation_other) {
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.setTextColor(0, 0, 0);
    const otherText = pdf.splitTextToSize(data.airway_evaluation_other, row7FieldWidth - 20);
    pdf.text(otherText, airwayFieldX + 15, airwayCurrentY + 2);
  }

  yPosition += Math.max(asaFieldHeight, airwayFieldHeight) + 8;
  console.log(`ROW 7 Complete - Final Y position: ${yPosition}`);

  // ROW 8: Mallampati Score & Heart and Lung Evaluation (side-by-side)
  const estimatedRow8Height = 60;
  yPosition = checkAndAddPage(
    pdf, yPosition, estimatedRow8Height, pageWidth, pageHeight, margin,
    logoImg, logoHeight, watermarkImg, sedationDate, pageNumber, totalPages
  );
  console.log(`ROW 8 - After checkAndAddPage: Y=${yPosition}, Page=${pageNumber.value}`);

  const row8Gap = 4;
  const row8FieldWidth = (pageWidth - 2 * margin - row8Gap) / 2;

  // Left: Mallampati Score
  const mallampatiFieldX = margin;
  const mallampatiFieldHeight = 50;

  pdf.setLineWidth(0.5);
  pdf.setDrawColor(59, 130, 246);
  pdf.setFillColor(239, 246, 255);
  pdf.roundedRect(mallampatiFieldX, yPosition, row8FieldWidth, mallampatiFieldHeight, 2, 2, 'FD');

  // Mallampati Header
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(9);
  pdf.setTextColor(37, 99, 235);
  pdf.text('* Mallampati Score', mallampatiFieldX + 4, yPosition + 5);

  // Mallampati Options (Class I-IV buttons in 2x2 grid)
  const mallampatiButtonY = yPosition + 12;
  const mallampatiLeftPadding = 4;
  const mallampatiRightPadding = 4;
  const mallampatiButtonGap = 2;
  const mallampatiButtonHeight = 10;

  // Calculate button width: (available width - gap between buttons) / 2 columns
  const mallampatiAvailableWidth = row8FieldWidth - mallampatiLeftPadding - mallampatiRightPadding;
  const mallampatiButtonWidth = (mallampatiAvailableWidth - mallampatiButtonGap) / 2;

  const mallampatiOptions = [
    { label: 'Class I', value: 'Class I' },
    { label: 'Class II', value: 'Class II' },
    { label: 'Class III', value: 'Class III' },
    { label: 'Class IV', value: 'Class IV' }
  ];

  mallampatiOptions.forEach((option, index) => {
    const col = index % 2;
    const row = Math.floor(index / 2);
    const buttonX = mallampatiFieldX + mallampatiLeftPadding + (col * (mallampatiButtonWidth + mallampatiButtonGap));
    const buttonY = mallampatiButtonY + (row * (mallampatiButtonHeight + mallampatiButtonGap));
    const isSelected = data.mallampati_score === option.value;

    if (isSelected) {
      pdf.setFillColor(59, 130, 246); // Blue
      pdf.setDrawColor(59, 130, 246);
    } else {
      pdf.setFillColor(255, 255, 255); // White
      pdf.setDrawColor(209, 213, 219); // Gray border
    }
    pdf.setLineWidth(0.5);
    pdf.roundedRect(buttonX, buttonY, mallampatiButtonWidth, mallampatiButtonHeight, 1.5, 1.5, 'FD');

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(9);
    if (isSelected) {
      pdf.setTextColor(255, 255, 255); // White text
    } else {
      pdf.setTextColor(59, 130, 246); // Blue text
    }
    pdf.text(option.label, buttonX + mallampatiButtonWidth / 2, buttonY + 7, { align: 'center' });
  });

  // Right: Heart and Lung Evaluation
  const heartLungFieldX = margin + row8FieldWidth + row8Gap;
  const heartLungFieldHeight = 50;

  pdf.setLineWidth(0.5);
  pdf.setDrawColor(59, 130, 246);
  pdf.setFillColor(239, 246, 255);
  pdf.roundedRect(heartLungFieldX, yPosition, row8FieldWidth, heartLungFieldHeight, 2, 2, 'FD');

  // Heart and Lung Header
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(9);
  pdf.setTextColor(37, 99, 235);
  pdf.text('* Heart and Lung Evaluation', heartLungFieldX + 4, yPosition + 5);

  // Heart and Lung Options
  const heartLungOptions = [
    'Heart Regular Rate and Rhythm',
    'Lung is Clear to Auscultation (CTA)',
    'Murmur'
  ];

  let heartLungCurrentY = yPosition + 10;
  const heartLungArray = data.heart_lung_evaluation || [];

  heartLungOptions.forEach((option) => {
    const isChecked = heartLungArray.includes(option);

    // Checkbox
    const checkboxSize = 3;
    const checkboxX = heartLungFieldX + 4;
    const checkboxY = heartLungCurrentY;

    pdf.setLineWidth(0.3);
    pdf.setDrawColor(59, 130, 246);
    if (isChecked) {
      pdf.setFillColor(59, 130, 246);
      pdf.rect(checkboxX, checkboxY, checkboxSize, checkboxSize, 'FD');
      pdf.setDrawColor(255, 255, 255);
      pdf.setLineWidth(0.5);
      pdf.line(checkboxX + 0.5, checkboxY + 1.5, checkboxX + 1.2, checkboxY + 2.3);
      pdf.line(checkboxX + 1.2, checkboxY + 2.3, checkboxX + 2.5, checkboxY + 0.7);
    } else {
      pdf.setFillColor(255, 255, 255);
      pdf.rect(checkboxX, checkboxY, checkboxSize, checkboxSize, 'FD');
      pdf.setDrawColor(59, 130, 246);
      pdf.rect(checkboxX, checkboxY, checkboxSize, checkboxSize, 'S');
    }

    // Label
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.setTextColor(0, 0, 0);
    pdf.text(option, checkboxX + checkboxSize + 2, checkboxY + 2.5);

    heartLungCurrentY += 6;
  });

  // Other field
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(7);
  pdf.setTextColor(100, 100, 100);
  pdf.text('Other:', heartLungFieldX + 4, heartLungCurrentY + 2);

  if (data.heart_lung_evaluation_other) {
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.setTextColor(0, 0, 0);
    const otherText = pdf.splitTextToSize(data.heart_lung_evaluation_other, row8FieldWidth - 20);
    pdf.text(otherText, heartLungFieldX + 15, heartLungCurrentY + 2);
  }

  yPosition += Math.max(mallampatiFieldHeight, heartLungFieldHeight) + 8;
  console.log(`ROW 8 Complete - Final Y position: ${yPosition}`);

  console.log(`=== END MEDICAL HISTORY SECTIONS ===\n`);
}

/**
 * Generate Step 3: Sedation Plan
 */
function generateStep3(pdf: any, data: IVSedationPdfData, pageWidth: number, pageHeight: number, margin: number, yPosition: number) {
  // Title
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(18);
  pdf.setTextColor(55, 91, 220);
  pdf.text('IV Sedation Flow Chart', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 10;

  pdf.setFontSize(14);
  pdf.setTextColor(34, 139, 34);
  pdf.text('Step 3: Sedation Plan', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 10;

  // Instruments Checklist Section
  const instrumentsBoxHeight = 40;
  pdf.setLineWidth(0.5);
  pdf.setDrawColor(59, 130, 246); // Blue border
  pdf.setFillColor(239, 246, 255); // Light blue background
  pdf.roundedRect(margin, yPosition, pageWidth - 2 * margin, instrumentsBoxHeight, 3, 3, 'FD');

  // Section header
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(10);
  pdf.setTextColor(37, 99, 235);
  pdf.text('* Instruments Checklist', margin + 5, yPosition + 6);

  // Instruments in a grid (4 columns x 2 rows)
  const instruments = [
    { label: 'ECG', key: 'ECG' },
    { label: 'BP', key: 'BP' },
    { label: 'Pulse OX', key: 'Pulse OX' },
    { label: 'ETCO2', key: 'ETCO2' },
    { label: 'Supplemental O2', key: 'Supplemental O2' },
    { label: 'PPV Available', key: 'PPV Available' },
    { label: 'Suction Available', key: 'Suction Available' }
  ];

  const instrumentsChecked = data.instruments_checklist || [];
  const instrumentCols = 4;
  const instrumentItemWidth = (pageWidth - 2 * margin - 20) / instrumentCols;
  const instrumentItemHeight = 12;
  let instrumentY = yPosition + 12;

  instruments.forEach((instrument, index) => {
    const row = Math.floor(index / instrumentCols);
    const col = index % instrumentCols;
    const x = margin + 10 + (col * instrumentItemWidth);
    const y = instrumentY + (row * instrumentItemHeight);

    const isChecked = instrumentsChecked.includes(instrument.key);

    // Draw box for each instrument
    const boxWidth = instrumentItemWidth - 3;
    const boxHeight = 10;

    if (isChecked) {
      pdf.setFillColor(220, 252, 231); // Light green background
      pdf.setDrawColor(34, 197, 94); // Green border
    } else {
      pdf.setFillColor(255, 255, 255); // White background
      pdf.setDrawColor(209, 213, 219); // Gray border
    }
    pdf.setLineWidth(0.5);
    pdf.roundedRect(x, y, boxWidth, boxHeight, 2, 2, 'FD');

    // Draw checkmark icon
    if (isChecked) {
      pdf.setDrawColor(34, 197, 94); // Green checkmark
      pdf.setLineWidth(0.8);
      const checkX = x + boxWidth - 5;
      const checkY = y + 2.5;
      pdf.circle(checkX, checkY, 2, 'FD');
      pdf.setDrawColor(255, 255, 255);
      pdf.setLineWidth(0.4);
      pdf.line(checkX - 0.8, checkY, checkX - 0.2, checkY + 0.6);
      pdf.line(checkX - 0.2, checkY + 0.6, checkX + 1, checkY - 0.8);
    }

    // Draw label
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(7.5);
    pdf.setTextColor(0, 0, 0);
    pdf.text(instrument.label, x + 2.5, y + 6);

    // Draw "Checked" text
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(6.5);
    if (isChecked) {
      pdf.setTextColor(34, 197, 94); // Green
      pdf.text('Checked', x + 2.5, y + 8.5);
    }
  });

  yPosition += instrumentsBoxHeight + 6;

  // Row with Sedation Type and Medications Planned (side by side)
  const sectionGap = 5;
  const sectionWidth = (pageWidth - 2 * margin - sectionGap) / 2;

  // Sedation Type Section (left)
  const sedationTypeHeight = 55;
  pdf.setLineWidth(0.5);
  pdf.setDrawColor(59, 130, 246);
  pdf.setFillColor(239, 246, 255);
  pdf.roundedRect(margin, yPosition, sectionWidth, sedationTypeHeight, 3, 3, 'FD');

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(10);
  pdf.setTextColor(37, 99, 235);
  pdf.text('* Sedation Type', margin + 5, yPosition + 6);

  const sedationTypes = [
    'Minimal Sedation',
    'Moderate Sedation',
    'Deep Sedation',
    'General Anesthesia'
  ];

  let sedationY = yPosition + 12;
  sedationTypes.forEach((type) => {
    const isSelected = data.sedation_type === type;
    const buttonWidth = sectionWidth - 10;
    const buttonHeight = 8.5;

    if (isSelected) {
      pdf.setFillColor(59, 130, 246); // Blue
      pdf.setDrawColor(59, 130, 246);
    } else {
      pdf.setFillColor(255, 255, 255); // White
      pdf.setDrawColor(209, 213, 219); // Gray border
    }
    pdf.setLineWidth(0.5);
    pdf.roundedRect(margin + 5, sedationY, buttonWidth, buttonHeight, 2, 2, 'FD');

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8);
    if (isSelected) {
      pdf.setTextColor(255, 255, 255); // White text
    } else {
      pdf.setTextColor(59, 130, 246); // Blue text
    }
    pdf.text(type, margin + 5 + buttonWidth / 2, sedationY + 5.5, { align: 'center' });

    sedationY += buttonHeight + 1.5;
  });

  // Medications Planned Section (right)
  const medicationsHeight = 55;
  const medicationsX = margin + sectionWidth + sectionGap;
  pdf.setLineWidth(0.5);
  pdf.setDrawColor(59, 130, 246);
  pdf.setFillColor(239, 246, 255);
  pdf.roundedRect(medicationsX, yPosition, sectionWidth, medicationsHeight, 3, 3, 'FD');

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(10);
  pdf.setTextColor(37, 99, 235);
  pdf.text('* Medications Planned', medicationsX + 5, yPosition + 6);

  const medications = [
    'Midazolam',
    'Propofol',
    'Fentanyl',
    'Ketamine',
    'Nitrous Oxide',
    'Other'
  ];

  const medicationsPlanned = data.medications_planned || [];
  const medCols = 2;
  const medColWidth = (sectionWidth - 15) / medCols;
  const medButtonHeight = 6.5;
  const medStartY = yPosition + 12;

  medications.forEach((med, index) => {
    const row = Math.floor(index / medCols);
    const col = index % medCols;
    const medX = medicationsX + 5 + (col * (medColWidth + 2));
    const medY = medStartY + (row * (medButtonHeight + 1.2));

    const isSelected = medicationsPlanned.includes(med) || (med === 'Other' && data.medications_other);

    if (isSelected) {
      pdf.setFillColor(59, 130, 246); // Blue
      pdf.setDrawColor(59, 130, 246);
    } else {
      pdf.setFillColor(255, 255, 255); // White
      pdf.setDrawColor(209, 213, 219); // Gray border
    }
    pdf.setLineWidth(0.5);
    pdf.roundedRect(medX, medY, medColWidth, medButtonHeight, 2, 2, 'FD');

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8);
    if (isSelected) {
      pdf.setTextColor(255, 255, 255); // White text
    } else {
      pdf.setTextColor(59, 130, 246); // Blue text
    }
    pdf.text(med, medX + medColWidth / 2, medY + 4.5, { align: 'center' });
  });

  yPosition += Math.max(sedationTypeHeight, medicationsHeight) + 6;

  // Row with Route of Administration and Emergency Protocols (side by side)
  const bottomSectionGap = 5;
  const bottomSectionWidth = (pageWidth - 2 * margin - bottomSectionGap) / 2;

  // Route of Administration Section (left)
  const routeHeight = 35;
  pdf.setLineWidth(0.5);
  pdf.setDrawColor(59, 130, 246);
  pdf.setFillColor(239, 246, 255);
  pdf.roundedRect(margin, yPosition, bottomSectionWidth, routeHeight, 3, 3, 'FD');

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(10);
  pdf.setTextColor(37, 99, 235);
  pdf.text('* Route of Administration', margin + 5, yPosition + 6);

  const routes = ['IV', 'Oral', 'Intranasal', 'Inhalation'];
  const routesSelected = data.administration_route || [];
  const routeButtonWidth = (bottomSectionWidth - 18) / 2;
  const routeButtonHeight = 8;
  let routeStartX = margin + 5;
  let routeStartY = yPosition + 12;

  routes.forEach((route, index) => {
    const row = Math.floor(index / 2);
    const col = index % 2;
    const routeX = routeStartX + (col * (routeButtonWidth + 2));
    const routeY = routeStartY + (row * (routeButtonHeight + 1.5));

    const isSelected = routesSelected.includes(route);

    if (isSelected) {
      pdf.setFillColor(59, 130, 246); // Blue
      pdf.setDrawColor(59, 130, 246);
    } else {
      pdf.setFillColor(255, 255, 255); // White
      pdf.setDrawColor(209, 213, 219); // Gray border
    }
    pdf.setLineWidth(0.5);
    pdf.roundedRect(routeX, routeY, routeButtonWidth, routeButtonHeight, 2, 2, 'FD');

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8);
    if (isSelected) {
      pdf.setTextColor(255, 255, 255); // White text
    } else {
      pdf.setTextColor(59, 130, 246); // Blue text
    }
    pdf.text(route, routeX + routeButtonWidth / 2, routeY + 5.5, { align: 'center' });
  });

  // Emergency Protocols Section (right)
  const emergencyHeight = 35;
  const emergencyX = margin + bottomSectionWidth + bottomSectionGap;
  pdf.setLineWidth(0.5);
  pdf.setDrawColor(59, 130, 246);
  pdf.setFillColor(239, 246, 255);
  pdf.roundedRect(emergencyX, yPosition, bottomSectionWidth, emergencyHeight, 3, 3, 'FD');

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(10);
  pdf.setTextColor(37, 99, 235);
  pdf.text('* Emergency Protocols', emergencyX + 5, yPosition + 6);

  const emergencyProtocols = [
    'Reversal Agents Available',
    'Emergency Cart Ready',
    'Crash Cart Accessible',
    'Emergency Contact List'
  ];

  const protocolsChecked = data.emergency_protocols || [];
  let emergencyY = yPosition + 12;

  emergencyProtocols.forEach((protocol) => {
    const isChecked = protocolsChecked.includes(protocol);

    // Draw checkbox with green checkmark
    const checkboxSize = 3.5;
    const checkboxX = emergencyX + 5;
    const checkboxY = emergencyY;

    if (isChecked) {
      pdf.setFillColor(34, 197, 94); // Green
      pdf.setDrawColor(34, 197, 94);
    } else {
      pdf.setFillColor(255, 255, 255); // White
      pdf.setDrawColor(209, 213, 219); // Gray border
    }
    pdf.setLineWidth(0.5);
    pdf.roundedRect(checkboxX, checkboxY, checkboxSize, checkboxSize, 1, 1, 'FD');

    // Draw checkmark if checked
    if (isChecked) {
      pdf.setDrawColor(255, 255, 255);
      pdf.setLineWidth(0.4);
      pdf.line(checkboxX + 0.7, checkboxY + 1.8, checkboxX + 1.3, checkboxY + 2.5);
      pdf.line(checkboxX + 1.3, checkboxY + 2.5, checkboxX + 2.8, checkboxY + 0.8);
    }

    // Draw label
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7.5);
    pdf.setTextColor(0, 0, 0);
    pdf.text(protocol, checkboxX + checkboxSize + 2.5, checkboxY + 2.5);

    emergencyY += 5.5;
  });
}

/**
 * Generate Step 4: Flow Monitoring
 */
function generateStep3Continued(
  pdf: any,
  data: IVSedationPdfData,
  pageWidth: number,
  pageHeight: number,
  margin: number,
  yPosition: number,
  logoImg: HTMLImageElement | null,
  logoHeight: number,
  watermarkImg: HTMLImageElement,
  sedationDate: string,
  pageNumber: { value: number },
  totalPages: { value: number }
) {
  // Title
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(18);
  pdf.setTextColor(55, 91, 220);
  pdf.text('IV Sedation Flow Chart', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 10;

  pdf.setFontSize(14);
  pdf.setTextColor(34, 139, 34);
  pdf.text('Step 4: Flow Monitoring', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 12;

  // Time fields section
  const timeFieldsHeight = 25;
  pdf.setLineWidth(0.5);
  pdf.setDrawColor(59, 130, 246);
  pdf.setFillColor(239, 246, 255);
  pdf.roundedRect(margin, yPosition, pageWidth - 2 * margin, timeFieldsHeight, 3, 3, 'FD');

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(10);
  pdf.setTextColor(37, 99, 235);
  pdf.text('* Time Tracking', margin + 5, yPosition + 6);

  // Time fields in a row
  const timeFields = [
    { label: 'Time in Room', value: data.time_in_room || 'N/A' },
    { label: 'Sedation Start', value: data.sedation_start_time || 'N/A' },
    { label: 'Sedation End', value: data.sedation_end_time || 'N/A' },
    { label: 'Out of Room', value: data.out_of_room_time || 'N/A' }
  ];

  const timeFieldWidth = (pageWidth - 2 * margin - 30) / 4;
  let timeX = margin + 10;
  const timeY = yPosition + 13;

  timeFields.forEach((field) => {
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(7);
    pdf.setTextColor(75, 85, 99);
    pdf.text(field.label, timeX, timeY);

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.setTextColor(0, 0, 0);
    pdf.text(field.value, timeX, timeY + 5);

    timeX += timeFieldWidth + 5;
  });

  yPosition += timeFieldsHeight + 8;

  // Flow Monitoring Table
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(10);
  pdf.setTextColor(37, 99, 235);
  pdf.text('* Monitoring Log', margin + 5, yPosition);
  yPosition += 6;

  const flowEntries = data.flow_entries || [];

  if (flowEntries.length > 0) {
    // Table setup - compact first 5 columns, maximize medications column
    const tableWidth = pageWidth - 2 * margin;
    const colWidths = {
      time: tableWidth * 0.08,    // Compact
      bp: tableWidth * 0.08,      // Compact
      hr: tableWidth * 0.06,      // Compact
      rr: tableWidth * 0.06,      // Compact
      spo2: tableWidth * 0.07,    // Compact
      medications: tableWidth * 0.65  // Maximized for wrapping
    };

    // Helper function to draw table header
    const drawTableHeader = (yPos: number): number => {
      pdf.setFillColor(59, 130, 246);
      pdf.setDrawColor(59, 130, 246);
      pdf.rect(margin, yPos, tableWidth, 8, 'FD');

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(7);
      pdf.setTextColor(255, 255, 255);

      let headerX = margin + 1;
      pdf.text('Time', headerX, yPos + 5.5);
      headerX += colWidths.time;
      pdf.text('BP', headerX, yPos + 5.5);
      headerX += colWidths.bp;
      pdf.text('HR', headerX, yPos + 5.5);
      headerX += colWidths.hr;
      pdf.text('RR', headerX, yPos + 5.5);
      headerX += colWidths.rr;
      pdf.text('SpO2', headerX, yPos + 5.5);
      headerX += colWidths.spo2;
      pdf.text('Medications', headerX, yPos + 5.5);

      return yPos + 8;
    };

    // Draw initial table header
    yPosition = drawTableHeader(yPosition);

    // Helper function to wrap text
    const wrapText = (text: string, maxWidth: number): string[] => {
      const words = text.split(' ');
      const lines: string[] = [];
      let currentLine = '';

      words.forEach(word => {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        const testWidth = pdf.getTextWidth(testLine);

        if (testWidth > maxWidth && currentLine) {
          lines.push(currentLine);
          currentLine = word;
        } else {
          currentLine = testLine;
        }
      });

      if (currentLine) {
        lines.push(currentLine);
      }

      return lines;
    };

    // Table rows with pagination
    const footerHeight = 20; // Reduced from 30 to 20 to allow more content
    const maxY = pageHeight - margin - footerHeight;

    flowEntries.forEach((entry: any, index: number) => {
      // Prepare medications text
      const meds = Array.isArray(entry.medications)
        ? entry.medications.join(', ')
        : (entry.medications || '');

      // Set font for text width calculation
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(7);

      // Wrap medications text
      const medLines = wrapText(meds, colWidths.medications - 4);
      const rowHeight = Math.max(7, medLines.length * 3.5 + 2); // Dynamic height based on wrapped lines

      // Check if we need a new page
      if (yPosition + rowHeight > maxY) {
        // Add new page
        pdf.addPage();
        totalPages.value++;
        pageNumber.value++;

        // Add header, footer, and watermark to new page
        addWatermark(pdf, pageWidth, pageHeight, watermarkImg);
        addHeaderAndFooter(pdf, pageWidth, pageHeight, margin, pageNumber.value, totalPages.value, sedationDate, logoImg, logoHeight);

        // Reset Y position after header
        const topMargin = 5;
        yPosition = topMargin + logoHeight + 1 + 8 + 6;

        // Add "Monitoring Log (continued)" title
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(10);
        pdf.setTextColor(37, 99, 235);
        pdf.text('* Monitoring Log (continued)', margin + 5, yPosition);
        yPosition += 6;

        // Redraw table header on new page
        yPosition = drawTableHeader(yPosition);
      }

      // Alternate row colors
      if (index % 2 === 0) {
        pdf.setFillColor(249, 250, 251);
      } else {
        pdf.setFillColor(255, 255, 255);
      }
      pdf.setDrawColor(229, 231, 235);
      pdf.rect(margin, yPosition, tableWidth, rowHeight, 'FD');

      // Draw cell borders
      pdf.setDrawColor(229, 231, 235);
      pdf.setLineWidth(0.1);
      let cellX = margin;
      [colWidths.time, colWidths.bp, colWidths.hr, colWidths.rr, colWidths.spo2, colWidths.medications].forEach((width) => {
        pdf.line(cellX, yPosition, cellX, yPosition + rowHeight);
        cellX += width;
      });
      pdf.line(cellX, yPosition, cellX, yPosition + rowHeight);

      // Cell content
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(7);
      pdf.setTextColor(0, 0, 0);

      // Vertical center alignment for single-line cells
      const singleLineY = yPosition + (rowHeight / 2) + 2;

      let contentX = margin + 1;
      pdf.text(entry.time || '', contentX, singleLineY);
      contentX += colWidths.time;
      pdf.text(entry.bp || '', contentX, singleLineY);
      contentX += colWidths.bp;
      pdf.text(entry.heartRate || entry.hr || '', contentX, singleLineY);
      contentX += colWidths.hr;
      pdf.text(entry.rr || '', contentX, singleLineY);
      contentX += colWidths.rr;
      pdf.text(entry.spo2 || '', contentX, singleLineY);
      contentX += colWidths.spo2;

      // Medications with wrapping
      let medY = yPosition + 3.5;
      medLines.forEach(line => {
        pdf.text(line, contentX + 1, medY);
        medY += 3.5;
      });

      yPosition += rowHeight;
    });

    // Bottom border
    pdf.setDrawColor(59, 130, 246);
    pdf.setLineWidth(0.5);
    pdf.line(margin, yPosition, margin + tableWidth, yPosition);
  } else {
    // No entries message
    pdf.setFont('helvetica', 'italic');
    pdf.setFontSize(8);
    pdf.setTextColor(107, 114, 128);
    pdf.text('No monitoring entries recorded', margin + 5, yPosition + 5);
    yPosition += 10;
  }

  yPosition += 8;

  // Helper function to calculate time difference in minutes
  const calculateTimeDiff = (startTime: string, endTime: string): string => {
    if (!startTime || !endTime) return '--';
    const start = startTime.split(':');
    const end = endTime.split(':');
    const startMinutes = parseInt(start[0]) * 60 + parseInt(start[1]);
    const endMinutes = parseInt(end[0]) * 60 + parseInt(end[1]);
    const diffMinutes = endMinutes - startMinutes;
    if (diffMinutes >= 0) {
      const hours = Math.floor(diffMinutes / 60);
      const mins = diffMinutes % 60;
      return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
    }
    return '--';
  };

  // Check if we need a new page for Time Summary section
  const summaryBoxHeight = 22;
  const footerHeight = 20; // Reduced from 30 to 20 to allow more content
  const maxY = pageHeight - margin - footerHeight;

  if (yPosition + summaryBoxHeight + 6 + 12 > maxY) {
    // Add new page
    pdf.addPage();
    totalPages.value++;
    pageNumber.value++;

    // Add header, footer, and watermark to new page
    addWatermark(pdf, pageWidth, pageHeight, watermarkImg);
    addHeaderAndFooter(pdf, pageWidth, pageHeight, margin, pageNumber.value, totalPages.value, sedationDate, logoImg, logoHeight);

    // Reset Y position after header
    const topMargin = 5;
    yPosition = topMargin + logoHeight + 1 + 8 + 6;
  }

  // Complete Time Summary Section - Compact with title inside box
  pdf.setLineWidth(0.5);
  pdf.setDrawColor(59, 130, 246);
  pdf.setFillColor(239, 246, 255);
  pdf.roundedRect(margin, yPosition, pageWidth - 2 * margin, summaryBoxHeight, 2, 2, 'FD');

  // Title inside box
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(10);
  pdf.setTextColor(37, 99, 235);
  pdf.text('Complete Time Summary', margin + 5, yPosition + 5);

  // Calculate durations
  const prepTime = calculateTimeDiff(data.time_in_room || '', data.sedation_start_time || '');
  const sedationDuration = calculateTimeDiff(data.sedation_start_time || '', data.sedation_end_time || '');
  const totalTime = calculateTimeDiff(data.time_in_room || '', data.out_of_room_time || '');

  // Display in compact format - labels and values
  const itemWidth = (pageWidth - 2 * margin - 10) / 3;
  let summaryX = margin + 5;
  const summaryY1 = yPosition + 11;
  const summaryY2 = yPosition + 18;

  // Preparation Time
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(7);
  pdf.setTextColor(75, 85, 99);
  pdf.text('Preparation Time:', summaryX, summaryY1);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9);
  pdf.setTextColor(0, 0, 0);
  pdf.text(prepTime, summaryX, summaryY2);

  summaryX += itemWidth;
  // Sedation Duration
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(7);
  pdf.setTextColor(75, 85, 99);
  pdf.text('Sedation Duration:', summaryX, summaryY1);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9);
  pdf.setTextColor(0, 0, 0);
  pdf.text(sedationDuration, summaryX, summaryY2);

  summaryX += itemWidth;
  // Total Room Time
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(7);
  pdf.setTextColor(75, 85, 99);
  pdf.text('Total Room Time:', summaryX, summaryY1);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9);
  pdf.setTextColor(0, 0, 0);
  pdf.text(totalTime, summaryX, summaryY2);

  yPosition += summaryBoxHeight + 6;

  // Level of Sedation Section - Compact with title inside box
  const levelBoxHeight = 12;
  pdf.setLineWidth(0.5);
  pdf.setDrawColor(34, 197, 94);
  pdf.setFillColor(240, 253, 244);
  pdf.roundedRect(margin, yPosition, pageWidth - 2 * margin, levelBoxHeight, 2, 2, 'FD');

  // Title inside box
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(10);
  pdf.setTextColor(37, 99, 235);
  pdf.text('Level of Sedation', margin + 5, yPosition + 5);

  // Selected level
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(7);
  pdf.setTextColor(75, 85, 99);
  pdf.text('Selected Level:', margin + 5, yPosition + 9);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9);
  pdf.setTextColor(22, 163, 74);
  const sedationLevel = data.level_of_sedation || 'Not specified';
  pdf.text(sedationLevel.toUpperCase(), margin + 30, yPosition + 9);
}

/**
 * Generate Step 5: Recovery Assessment
 */
function generateStep5(pdf: any, data: IVSedationPdfData, pageWidth: number, pageHeight: number, margin: number, yPosition: number) {
  // Title
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(18);
  pdf.setTextColor(37, 99, 235);
  pdf.text('IV Sedation Flow Chart', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 10;

  pdf.setFontSize(14);
  pdf.setTextColor(220, 38, 38);
  pdf.text('Step 5: Recovery Assessment', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 15;

  // Recovery Criteria Section
  const sectionWidth = pageWidth - 2 * margin;

  // Section Header
  pdf.setLineWidth(0.5);
  pdf.setDrawColor(220, 38, 38);
  pdf.setFillColor(254, 242, 242);
  pdf.roundedRect(margin, yPosition, sectionWidth, 10, 2, 2, 'FD');

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(11);
  pdf.setTextColor(153, 27, 27);
  pdf.text('Recovery Criteria', margin + 5, yPosition + 7);
  yPosition += 12;

  // Recovery criteria data
  const recoveryCriteria = [
    { label: 'Alert and Oriented', value: data.alert_oriented, reverse: false },
    { label: 'Protective Reflexes Intact', value: data.protective_reflexes, reverse: false },
    { label: 'Breathing Spontaneously', value: data.breathing_spontaneously, reverse: false },
    { label: 'Post-Op Nausea/Vomiting', value: data.post_op_nausea, reverse: true },
    { label: 'Patient Caregiver Present', value: data.caregiver_present, reverse: false },
    { label: 'Return to Baseline Mental Status', value: data.baseline_mental_status, reverse: false },
    { label: 'Responsive to Verbal Commands', value: data.responsive_verbal_commands, reverse: false },
    { label: 'Saturating Appropriately on Room Air', value: data.saturating_room_air, reverse: false },
    { label: 'Vital Signs Returned to Baseline', value: data.vital_signs_baseline, reverse: false },
    { label: 'Pain During Recovery', value: data.pain_during_recovery, reverse: true }
  ];

  // Display criteria in a 3-column grid
  const cardWidth = (sectionWidth - 10) / 3;
  const cardHeight = 12;
  let currentX = margin;
  let currentY = yPosition;
  let itemsInRow = 0;

  recoveryCriteria.forEach((criterion, index) => {
    const value = criterion.value?.toLowerCase();
    const isPositive = criterion.reverse ? value === 'no' : value === 'yes';
    const isNegative = criterion.reverse ? value === 'yes' : value === 'no';

    // Draw card background
    pdf.setLineWidth(0.3);
    pdf.setDrawColor(254, 202, 202);
    pdf.setFillColor(255, 255, 255);
    pdf.roundedRect(currentX, currentY, cardWidth, cardHeight, 2, 2, 'FD');

    // Label
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7);
    pdf.setTextColor(127, 29, 29);
    pdf.text(criterion.label, currentX + 3, currentY + 4, { maxWidth: cardWidth - 6 });

    // Status indicator (colored dot)
    const dotX = currentX + 3;
    const dotY = currentY + 7;
    const dotRadius = 1.5;

    if (isPositive) {
      pdf.setFillColor(34, 197, 94); // Green
    } else if (isNegative) {
      pdf.setFillColor(239, 68, 68); // Red
    } else {
      pdf.setFillColor(209, 213, 219); // Gray
    }
    pdf.circle(dotX, dotY, dotRadius, 'F');

    // Value text
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8);
    if (isPositive) {
      pdf.setTextColor(22, 163, 74);
    } else if (isNegative) {
      pdf.setTextColor(220, 38, 38);
    } else {
      pdf.setTextColor(107, 114, 128);
    }
    pdf.text((value || 'N/A').toUpperCase(), dotX + 3, currentY + 8.5);

    itemsInRow++;
    if (itemsInRow === 3) {
      currentX = margin;
      currentY += cardHeight + 2;
      itemsInRow = 0;
    } else {
      currentX += cardWidth + 2;
    }
  });

  // Move to next section
  if (itemsInRow > 0) {
    yPosition = currentY + cardHeight + 2;
  } else {
    yPosition = currentY;
  }
  yPosition += 6;

  // Discharge Information Section
  pdf.setLineWidth(0.5);
  pdf.setDrawColor(59, 130, 246);
  pdf.setFillColor(239, 246, 255);
  pdf.roundedRect(margin, yPosition, sectionWidth, 10, 2, 2, 'FD');

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(11);
  pdf.setTextColor(29, 78, 216);
  pdf.text('Discharge Information', margin + 5, yPosition + 7);
  yPosition += 12;

  // Discharge info in 2x2 grid
  const dischargeInfo = [
    { label: 'Post-Op Instructions Given To', value: data.post_op_instructions_given_to },
    { label: 'Follow-Up Instructions Given To', value: data.follow_up_instructions_given_to },
    { label: 'Discharged To', value: data.discharged_to },
    { label: 'Pain Level at Discharge', value: data.pain_level_discharge ? `${data.pain_level_discharge}/10` : null }
  ];

  const dischargeCardWidth = (sectionWidth - 5) / 2;
  const dischargeCardHeight = 14;
  currentX = margin;
  currentY = yPosition;
  itemsInRow = 0;

  dischargeInfo.forEach((info) => {
    // Draw card background
    pdf.setLineWidth(0.3);
    pdf.setDrawColor(191, 219, 254);
    pdf.setFillColor(255, 255, 255);
    pdf.roundedRect(currentX, currentY, dischargeCardWidth, dischargeCardHeight, 2, 2, 'FD');

    // Label
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(7);
    pdf.setTextColor(30, 64, 175);
    pdf.text(info.label.toUpperCase(), currentX + 3, currentY + 5);

    // Value
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    pdf.setTextColor(17, 24, 39);
    pdf.text(info.value || 'Not specified', currentX + 3, currentY + 10);

    itemsInRow++;
    if (itemsInRow === 2) {
      currentX = margin;
      currentY += dischargeCardHeight + 2;
      itemsInRow = 0;
    } else {
      currentX += dischargeCardWidth + 2.5;
    }
  });

  yPosition = currentY + 6;

  // Other Remarks Section
  if (data.other_remarks) {
    pdf.setLineWidth(0.5);
    pdf.setDrawColor(234, 179, 8);
    pdf.setFillColor(254, 252, 232);
    pdf.roundedRect(margin, yPosition, sectionWidth, 10, 2, 2, 'FD');

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(11);
    pdf.setTextColor(161, 98, 7);
    pdf.text('Other Remarks', margin + 5, yPosition + 7);
    yPosition += 12;

    // Remarks box
    pdf.setLineWidth(0.3);
    pdf.setDrawColor(253, 224, 71);
    pdf.setFillColor(255, 255, 255);

    // Calculate height needed for text
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    pdf.setTextColor(17, 24, 39);
    const remarksLines = pdf.splitTextToSize(data.other_remarks, sectionWidth - 10);
    const remarksHeight = Math.max(15, remarksLines.length * 4 + 6);

    pdf.roundedRect(margin, yPosition, sectionWidth, remarksHeight, 2, 2, 'FD');
    pdf.text(remarksLines, margin + 5, yPosition + 5);
  }
}

