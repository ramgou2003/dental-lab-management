import jsPDF from 'jspdf';
import { NewPatientFormData } from '@/types/newPatientPacket';

/**
 * Add watermark to the page (drawn behind content)
 */
function addWatermark(pdf: jsPDF, pageWidth: number, pageHeight: number, watermarkImg: HTMLImageElement | null) {
  if (watermarkImg) {
    try {
      const watermarkWidth = 120;
      const watermarkHeight = 120;
      const watermarkX = (pageWidth - watermarkWidth) / 2;
      const watermarkY = (pageHeight - watermarkHeight) / 2;

      pdf.saveGraphicsState();
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

  // Add website text
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(12);
  pdf.setTextColor(55, 91, 220);
  const websiteText = 'www.nydentalimplants.com';
  const websiteWidth = pdf.getTextWidth(websiteText);
  pdf.text(websiteText, pageWidth - margin - websiteWidth, yPosition + logoHeight - 5);

  yPosition += logoHeight + 1;

  // Add blue line
  pdf.setDrawColor(55, 91, 220);
  pdf.setLineWidth(1);
  pdf.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 8;

  // Add date
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  pdf.setTextColor(0, 0, 0);
  const dateText = `Date: ${formDate}`;
  const dateWidth = pdf.getTextWidth(dateText);
  pdf.text(dateText, pageWidth - margin - dateWidth, yPosition);
  yPosition += 6;

  // Add letterhead if on first page
  if (letterheadImg) {
    const letterheadWidth = pageWidth - 2 * margin;
    const letterheadHeight = 60;
    pdf.addImage(letterheadImg, 'PNG', margin, yPosition, letterheadWidth, letterheadHeight);
    yPosition += letterheadHeight + 10;
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
 * Add page numbers to all pages
 */
function addPageNumbers(pdf: jsPDF, pageWidth: number, pageHeight: number, margin: number) {
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

/**
 * Generate New Patient Packet PDF
 */
export async function generateNewPatientPacketPdf(data: NewPatientFormData) {
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

  let logoHeight = 15;
  if (logoImg) {
    const logoWidth = 50;
    logoHeight = (logoImg.height / logoImg.width) * logoWidth;
  }

  const topMargin = 5;
  let yPosition = topMargin;

  // Format date to YYYY-MM-DD
  const formatDateYYYYMMDD = (dateValue: any): string => {
    const date = dateValue ? new Date(dateValue) : new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  const formDate = formatDateYYYYMMDD(data.date);

  // PAGE 1: Overview & Patient Information
  addWatermark(pdf, pageWidth, pageHeight, watermarkImg);
  addHeaderAndFooter(pdf, pageWidth, pageHeight, margin, formDate, logoImg, letterheadImg, logoHeight);

  yPosition = topMargin + logoHeight + 1 + 8 + 6 + 6 + 10;

  // Title
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(16);
  pdf.setTextColor(55, 91, 220);
  pdf.text('New Patient Packet', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 10;

  yPosition += 5;

  // Patient Information Section
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(14);
  pdf.setTextColor(55, 91, 220);
  pdf.text('Patient Identification & Contacts', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 10;

  // === PERSONAL INFORMATION BOX ===
  const personalInfoBoxHeight = 38;
  pdf.setDrawColor(200, 200, 200);
  pdf.setFillColor(240, 245, 255);
  pdf.setLineWidth(0.2);
  pdf.saveGraphicsState();
  pdf.setGState(new pdf.GState({ opacity: 0.85 }));
  pdf.roundedRect(margin, yPosition, pageWidth - 2 * margin, personalInfoBoxHeight, 2, 2, 'FD');
  pdf.restoreGraphicsState();

  // Section header
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(10);
  pdf.setTextColor(55, 91, 220);
  yPosition += 6;
  pdf.text('Personal Information', margin + 5, yPosition);
  yPosition += 6;

  // Patient Name (full width)
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(9);
  pdf.setTextColor(100, 100, 100);
  pdf.text('Patient Name:', margin + 5, yPosition);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  pdf.setTextColor(0, 0, 0);
  pdf.text(`${data.firstName} ${data.lastName}`, margin + 35, yPosition);
  yPosition += 6;

  // Two-column layout for remaining fields
  const leftColX = margin + 5;
  const rightColX = pageWidth / 2 + 5;
  const labelWidth = 28;

  // Left column - Date of Birth
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(9);
  pdf.setTextColor(100, 100, 100);
  pdf.text('Date of Birth:', leftColX, yPosition);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(0, 0, 0);
  const dob = data.dateOfBirth ? new Date(data.dateOfBirth).toLocaleDateString() : '';
  pdf.text(dob, leftColX + labelWidth, yPosition);

  // Right column - Gender
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(100, 100, 100);
  pdf.text('Gender:', rightColX, yPosition);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(0, 0, 0);
  const gender = data.gender === 'male' ? 'Male' : data.gender === 'female' ? 'Female' : 'Prefer not to answer';
  pdf.text(gender, rightColX + labelWidth, yPosition);
  yPosition += 6;

  // Left column - Height
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(100, 100, 100);
  pdf.text('Height:', leftColX, yPosition);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(0, 0, 0);
  const height = data.height ? `${data.height.feet}' ${data.height.inches}"` : '';
  pdf.text(height, leftColX + labelWidth, yPosition);

  // Right column - Weight
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(100, 100, 100);
  pdf.text('Weight:', rightColX, yPosition);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(0, 0, 0);
  pdf.text(data.weight ? `${data.weight} lbs` : '', rightColX + labelWidth, yPosition);
  yPosition += 6;

  // BMI (if available)
  if (data.bmi) {
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(100, 100, 100);
    pdf.text('BMI:', leftColX, yPosition);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(0, 0, 0);
    pdf.text(data.bmi.toFixed(1), leftColX + labelWidth, yPosition);

    // BMI Category
    let bmiCategory = '';
    let bmiColor: [number, number, number] = [0, 0, 0];
    if (data.bmi < 18.5) {
      bmiCategory = 'Underweight';
      bmiColor = [220, 38, 38];
    } else if (data.bmi < 25) {
      bmiCategory = 'Normal';
      bmiColor = [34, 197, 94];
    } else if (data.bmi < 30) {
      bmiCategory = 'Overweight';
      bmiColor = [234, 179, 8];
    } else {
      bmiCategory = 'Obese';
      bmiColor = [220, 38, 38];
    }

    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(100, 100, 100);
    pdf.text('Category:', rightColX, yPosition);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(bmiColor[0], bmiColor[1], bmiColor[2]);
    pdf.text(bmiCategory, rightColX + labelWidth, yPosition);
    yPosition += 6;
  }

  yPosition += 5;

  // === CONTACT INFORMATION BOX ===
  const contactBoxHeight = 30;
  pdf.setDrawColor(200, 200, 200);
  pdf.setFillColor(240, 245, 255);
  pdf.setLineWidth(0.2);
  pdf.saveGraphicsState();
  pdf.setGState(new pdf.GState({ opacity: 0.85 }));
  pdf.roundedRect(margin, yPosition, pageWidth - 2 * margin, contactBoxHeight, 2, 2, 'FD');
  pdf.restoreGraphicsState();

  // Section header
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(10);
  pdf.setTextColor(55, 91, 220);
  yPosition += 6;
  pdf.text('Contact Information', margin + 5, yPosition);
  yPosition += 6;

  // Address (full width)
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(9);
  pdf.setTextColor(100, 100, 100);
  pdf.text('Address:', margin + 5, yPosition);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(0, 0, 0);
  const address = `${data.address.street}, ${data.address.city}, ${data.address.state} ${data.address.zip}`;
  pdf.text(address, margin + 25, yPosition);
  yPosition += 6;

  // Phone numbers
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(100, 100, 100);
  pdf.text('Cell Phone:', leftColX, yPosition);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(0, 0, 0);
  pdf.text(data.phone.cell, leftColX + labelWidth, yPosition);

  if (data.phone.work) {
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(100, 100, 100);
    pdf.text('Work Phone:', rightColX, yPosition);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(0, 0, 0);
    pdf.text(data.phone.work, rightColX + labelWidth, yPosition);
  }
  yPosition += 6;

  // Email
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(100, 100, 100);
  pdf.text('Email:', leftColX, yPosition);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(0, 0, 0);
  pdf.text(data.email, leftColX + labelWidth, yPosition);
  yPosition += 5;

  yPosition += 5;

  // === EMERGENCY CONTACT BOX ===
  const emergencyBoxHeight = 24;
  pdf.setDrawColor(200, 200, 200);
  pdf.setFillColor(254, 242, 242);
  pdf.setLineWidth(0.2);
  pdf.saveGraphicsState();
  pdf.setGState(new pdf.GState({ opacity: 0.85 }));
  pdf.roundedRect(margin, yPosition, pageWidth - 2 * margin, emergencyBoxHeight, 2, 2, 'FD');
  pdf.restoreGraphicsState();

  // Section header
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(10);
  pdf.setTextColor(220, 38, 38);
  yPosition += 6;
  pdf.text('Emergency Contact', margin + 5, yPosition);
  yPosition += 6;

  // Emergency contact details
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(9);
  pdf.setTextColor(100, 100, 100);
  pdf.text('Name:', leftColX, yPosition);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(0, 0, 0);
  pdf.text(data.emergencyContact.name, leftColX + labelWidth, yPosition);

  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(100, 100, 100);
  pdf.text('Relationship:', rightColX, yPosition);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(0, 0, 0);
  pdf.text(data.emergencyContact.relationship, rightColX + labelWidth, yPosition);
  yPosition += 6;

  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(100, 100, 100);
  pdf.text('Phone:', leftColX, yPosition);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(0, 0, 0);
  pdf.text(data.emergencyContact.phone, leftColX + labelWidth, yPosition);
  yPosition += 5;

  yPosition += 5;

  // === PRIMARY CARE PHYSICIAN BOX ===
  if (data.primaryCarePhysician?.hasPCP) {
    const pcpBoxHeight = 24;
    pdf.setDrawColor(200, 200, 200);
    pdf.setFillColor(240, 253, 244);
    pdf.setLineWidth(0.2);
    pdf.saveGraphicsState();
    pdf.setGState(new pdf.GState({ opacity: 0.85 }));
    pdf.roundedRect(margin, yPosition, pageWidth - 2 * margin, pcpBoxHeight, 2, 2, 'FD');
    pdf.restoreGraphicsState();

    // Section header
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(10);
    pdf.setTextColor(34, 197, 94);
    yPosition += 6;
    pdf.text('Primary Care Physician', margin + 5, yPosition);
    yPosition += 6;

    // PCP details
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(9);
    pdf.setTextColor(100, 100, 100);
    pdf.text('Name:', leftColX, yPosition);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(0, 0, 0);
    pdf.text(data.primaryCarePhysician.name || '', leftColX + labelWidth, yPosition);

    if (data.primaryCarePhysician.practice) {
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(100, 100, 100);
      pdf.text('Practice:', rightColX, yPosition);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(0, 0, 0);
      pdf.text(data.primaryCarePhysician.practice, rightColX + labelWidth, yPosition);
    }
    yPosition += 6;

    if (data.primaryCarePhysician.phone) {
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(100, 100, 100);
      pdf.text('Phone:', leftColX, yPosition);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(0, 0, 0);
      pdf.text(data.primaryCarePhysician.phone, leftColX + labelWidth, yPosition);
    }
  } else {
    const noPcpBoxHeight = 12;
    pdf.setDrawColor(200, 200, 200);
    pdf.setFillColor(249, 250, 251);
    pdf.setLineWidth(0.2);
    pdf.saveGraphicsState();
    pdf.setGState(new pdf.GState({ opacity: 0.85 }));
    pdf.roundedRect(margin, yPosition, pageWidth - 2 * margin, noPcpBoxHeight, 2, 2, 'FD');
    pdf.restoreGraphicsState();

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    pdf.setTextColor(100, 100, 100);
    yPosition += 7;
    pdf.text('No Primary Care Physician on file', margin + 5, yPosition);
  }

  // Draw watermark on top of page 1 content
  addWatermarkOnTop(pdf, pageWidth, pageHeight, watermarkImg);

  // Continue with remaining pages...
  addMedicalHistoryPage(pdf, data, pageWidth, pageHeight, margin, logoImg, watermarkImg, logoHeight, formDate);
  addAllergiesMedicationsPage(pdf, data, pageWidth, pageHeight, margin, logoImg, watermarkImg, logoHeight, formDate);
  addOralHealthPage(pdf, data, pageWidth, pageHeight, margin, logoImg, watermarkImg, logoHeight, formDate);
  addLifestylePage(pdf, data, pageWidth, pageHeight, margin, logoImg, watermarkImg, logoHeight, formDate);
  addComfortPreferencesPage(pdf, data, pageWidth, pageHeight, margin, logoImg, watermarkImg, logoHeight, formDate);
  addComfortPreferencesPage2(pdf, data, pageWidth, pageHeight, margin, logoImg, watermarkImg, logoHeight, formDate);
  addOfficePoliciesPage(pdf, data, pageWidth, pageHeight, margin, logoImg, watermarkImg, logoHeight, formDate);
  addLegalDocumentationPage(pdf, data, pageWidth, pageHeight, margin, logoImg, watermarkImg, logoHeight, formDate);
  addSignaturesPage(pdf, data, pageWidth, pageHeight, margin, logoImg, watermarkImg, logoHeight, formDate);

  // Add page numbers to all pages
  addPageNumbers(pdf, pageWidth, pageHeight, margin);

  // Save the PDF
  const fileName = `NewPatientPacket_${data.firstName}_${data.lastName}_${new Date().toISOString().split('T')[0]}.pdf`;
  pdf.save(fileName);
}

/**
 * Add Medical History Page (Page 2)
 */
function addMedicalHistoryPage(
  pdf: jsPDF,
  data: NewPatientFormData,
  pageWidth: number,
  pageHeight: number,
  margin: number,
  logoImg: HTMLImageElement | null,
  watermarkImg: HTMLImageElement | null,
  logoHeight: number,
  formDate: string
) {
  pdf.addPage();
  addWatermark(pdf, pageWidth, pageHeight, watermarkImg);
  addHeaderAndFooter(pdf, pageWidth, pageHeight, margin, formDate, logoImg, null, logoHeight);

  const topMargin = 5;
  let yPosition = topMargin + logoHeight + 1 + 8 + 6 + 6 + 10;

  // Title
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(14);
  pdf.setTextColor(55, 91, 220);
  pdf.text('Complete Medical History', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 10;

  // === CRITICAL MEDICAL CONDITIONS BOX ===
  const conditions = [
    { key: 'acidReflux', label: 'Acid Reflux, GERD', value: data.criticalConditions?.acidReflux, critical: false },
    { key: 'cancer', label: 'Cancer', value: data.criticalConditions?.cancer?.has, critical: true },
    { key: 'depressionAnxiety', label: 'Depression, Anxiety', value: data.criticalConditions?.depressionAnxiety, critical: false },
    { key: 'diabetes', label: 'Diabetes', value: data.criticalConditions?.diabetes?.has, critical: true },
    { key: 'heartDisease', label: 'Heart Disease', value: data.criticalConditions?.heartDisease, critical: true },
    { key: 'periodontalDisease', label: 'Periodontal Disease', value: data.criticalConditions?.periodontalDisease, critical: false },
    { key: 'substanceAbuse', label: 'Substance Abuse', value: data.criticalConditions?.substanceAbuse, critical: true },
    { key: 'highBloodPressure', label: 'High Blood Pressure', value: data.criticalConditions?.highBloodPressure, critical: false }
  ];

  // Calculate box height based on conditions and details
  let criticalBoxHeight = 12; // Header
  criticalBoxHeight += Math.ceil(conditions.length / 2) * 5.5; // Conditions in 2 columns

  // Add height for details if present
  let detailsCount = 0;
  if (data.criticalConditions?.cancer?.has && data.criticalConditions.cancer.type) {
    detailsCount++;
  }
  if (data.criticalConditions?.diabetes?.has && data.criticalConditions.diabetes.type) {
    detailsCount++;
  }
  if (detailsCount > 0) {
    criticalBoxHeight += 4 + (detailsCount * 3.5) + 3; // Details header + items + spacing
  } else {
    criticalBoxHeight += 3; // Just bottom padding
  }

  const criticalBoxStartY = yPosition;
  pdf.setDrawColor(200, 200, 200);
  pdf.setFillColor(254, 242, 242);
  pdf.setLineWidth(0.2);
  pdf.saveGraphicsState();
  pdf.setGState(new pdf.GState({ opacity: 0.85 }));
  pdf.roundedRect(margin, yPosition, pageWidth - 2 * margin, criticalBoxHeight, 2, 2, 'FD');
  pdf.restoreGraphicsState();

  // Section header
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(10);
  pdf.setTextColor(220, 38, 38);
  yPosition += 6;
  pdf.text('Critical Medical Conditions', margin + 5, yPosition);
  yPosition += 6;

  // Display conditions in 2 columns
  const columnWidth = (pageWidth - 2 * margin - 10) / 2;
  let leftY = yPosition;
  let rightY = yPosition;

  conditions.forEach((condition, index) => {
    const isLeftColumn = index % 2 === 0;
    const xPos = isLeftColumn ? margin + 5 : margin + 5 + columnWidth + 5;
    const currentY = isLeftColumn ? leftY : rightY;

    // Checkbox
    const checkboxSize = 3.5;
    pdf.setDrawColor(condition.critical ? 220 : 150, condition.critical ? 38 : 150, condition.critical ? 38 : 150);
    pdf.setFillColor(condition.value ? (condition.critical ? 220 : 239) : 255, condition.value ? (condition.critical ? 38 : 68) : 255, condition.value ? (condition.critical ? 38 : 68) : 255);
    pdf.setLineWidth(0.3);
    pdf.roundedRect(xPos, currentY - 3, checkboxSize, checkboxSize, 0.5, 0.5, 'FD');

    // Checkmark if selected
    if (condition.value) {
      pdf.setDrawColor(255, 255, 255);
      pdf.setLineWidth(0.5);
      pdf.line(xPos + 0.7, currentY - 1.5, xPos + 1.3, currentY - 0.8);
      pdf.line(xPos + 1.3, currentY - 0.8, xPos + 2.7, currentY - 2.5);
    }

    // Label
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.setTextColor(0, 0, 0);
    pdf.text(condition.label, xPos + checkboxSize + 2, currentY);

    if (isLeftColumn) {
      leftY += 5.5;
    } else {
      rightY += 5.5;
    }
  });

  yPosition = Math.max(leftY, rightY) + 3;

  // Additional details for critical conditions
  let hasDetails = false;
  if (data.criticalConditions?.cancer?.has && data.criticalConditions.cancer.type) {
    if (!hasDetails) {
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(7);
      pdf.setTextColor(100, 100, 100);
      pdf.text('Details:', margin + 5, yPosition);
      yPosition += 4;
      hasDetails = true;
    }
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7);
    pdf.setTextColor(0, 0, 0);
    pdf.text(`Cancer Type: ${data.criticalConditions.cancer.type}`, margin + 8, yPosition);
    yPosition += 3.5;
  }

  if (data.criticalConditions?.diabetes?.has && data.criticalConditions.diabetes.type) {
    if (!hasDetails) {
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(7);
      pdf.setTextColor(100, 100, 100);
      pdf.text('Details:', margin + 5, yPosition);
      yPosition += 4;
      hasDetails = true;
    }
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7);
    pdf.setTextColor(0, 0, 0);
    pdf.text(`Diabetes Type: ${data.criticalConditions.diabetes.type}${data.criticalConditions.diabetes.a1cLevel ? `, A1C: ${data.criticalConditions.diabetes.a1cLevel}` : ''}`, margin + 8, yPosition);
    yPosition += 3.5;
  }

  yPosition += 5;

  // === SYSTEM-SPECIFIC CONDITIONS BOX ===
  const systems = [
    { key: 'respiratory', label: 'Respiratory', items: data.systemSpecific?.respiratory || [], color: [59, 130, 246] },
    { key: 'cardiovascular', label: 'Cardiovascular', items: data.systemSpecific?.cardiovascular || [], color: [239, 68, 68] },
    { key: 'gastrointestinal', label: 'Gastrointestinal', items: data.systemSpecific?.gastrointestinal || [], color: [34, 197, 94] },
    { key: 'neurological', label: 'Neurological', items: data.systemSpecific?.neurological || [], color: [168, 85, 247] },
    { key: 'endocrineRenal', label: 'Endocrine, Renal', items: data.systemSpecific?.endocrineRenal || [], color: [234, 179, 8] }
  ];

  const systemsWithItems = systems.filter(s => s.items.length > 0);

  if (systemsWithItems.length > 0) {
    // Calculate total height needed for 2-column layout
    const columnWidth = (pageWidth - 2 * margin - 10) / 2;

    // Calculate height for each column
    let leftColumnHeight = 0;
    let rightColumnHeight = 0;

    systemsWithItems.forEach((system, index) => {
      const systemHeight = 4 + (system.items.length * 3.5) + 1.5; // Label + items + spacing
      if (index % 2 === 0) {
        leftColumnHeight += systemHeight;
      } else {
        rightColumnHeight += systemHeight;
      }
    });

    const totalSystemHeight = 12 + Math.max(leftColumnHeight, rightColumnHeight) + 3; // Header + max column height + padding

    const systemBoxStartY = yPosition;
    pdf.setDrawColor(200, 200, 200);
    pdf.setFillColor(240, 245, 255);
    pdf.setLineWidth(0.2);
    pdf.saveGraphicsState();
    pdf.setGState(new pdf.GState({ opacity: 0.85 }));
    pdf.roundedRect(margin, yPosition, pageWidth - 2 * margin, totalSystemHeight, 2, 2, 'FD');
    pdf.restoreGraphicsState();

    // Section header
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(10);
    pdf.setTextColor(55, 91, 220);
    yPosition += 6;
    pdf.text('System-Specific Conditions', margin + 5, yPosition);
    yPosition += 6;

    // Display systems in 2 columns
    let leftY = yPosition;
    let rightY = yPosition;

    systemsWithItems.forEach((system, index) => {
      const isLeftColumn = index % 2 === 0;
      const xPos = isLeftColumn ? margin + 5 : margin + 5 + columnWidth + 5;
      let currentY = isLeftColumn ? leftY : rightY;

      // System label with color indicator
      pdf.setDrawColor(system.color[0], system.color[1], system.color[2]);
      pdf.setFillColor(system.color[0], system.color[1], system.color[2]);
      pdf.circle(xPos + 2, currentY - 1.5, 1, 'F');

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(8);
      pdf.setTextColor(system.color[0], system.color[1], system.color[2]);
      pdf.text(`${system.label}:`, xPos + 5, currentY);
      currentY += 4;

      // Items
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(7);
      pdf.setTextColor(0, 0, 0);
      system.items.forEach(item => {
        pdf.text(`- ${item}`, xPos + 7, currentY);
        currentY += 3.5;
      });
      currentY += 1.5;

      // Update column Y position
      if (isLeftColumn) {
        leftY = currentY;
      } else {
        rightY = currentY;
      }
    });

    yPosition = Math.max(leftY, rightY) + 3;
  }

  // === ADDITIONAL CONDITIONS BOX ===
  if (data.additionalConditions && data.additionalConditions.length > 0) {
    yPosition += 2;
    const additionalHeight = 10 + (data.additionalConditions.length * 3.5) + 3;

    const additionalBoxStartY = yPosition;
    pdf.setDrawColor(200, 200, 200);
    pdf.setFillColor(249, 250, 251);
    pdf.setLineWidth(0.2);
    pdf.saveGraphicsState();
    pdf.setGState(new pdf.GState({ opacity: 0.85 }));
    pdf.roundedRect(margin, yPosition, pageWidth - 2 * margin, additionalHeight, 2, 2, 'FD');
    pdf.restoreGraphicsState();

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(9);
    pdf.setTextColor(100, 100, 100);
    yPosition += 5;
    pdf.text('Additional Conditions', margin + 5, yPosition);
    yPosition += 5;

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7);
    pdf.setTextColor(0, 0, 0);
    data.additionalConditions.forEach(condition => {
      pdf.text(`- ${condition}`, margin + 7, yPosition);
      yPosition += 3.5;
    });

    yPosition += 3;
  }

  // === RECENT HEALTH CHANGES BOX ===
  yPosition += 2;

  // Calculate box height
  let changesHeight = 12; // Header
  if (data.recentHealthChanges?.hasChanges && data.recentHealthChanges.description) {
    const descLines = pdf.splitTextToSize(data.recentHealthChanges.description, pageWidth - 2 * margin - 14);
    changesHeight += 5 + (descLines.length * 3.5) + 3; // Checkbox + description + padding
  } else {
    changesHeight += 5 + 3; // Just checkbox + padding
  }

  // Draw box
  pdf.setDrawColor(220, 38, 38);
  pdf.setFillColor(254, 242, 242);
  pdf.setLineWidth(0.3);
  pdf.saveGraphicsState();
  pdf.setGState(new pdf.GState({ opacity: 0.85 }));
  pdf.roundedRect(margin, yPosition, pageWidth - 2 * margin, changesHeight, 2, 2, 'FD');
  pdf.restoreGraphicsState();

  // Header
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(9);
  pdf.setTextColor(220, 38, 38);
  yPosition += 5;
  pdf.text('Recent Health Changes', margin + 5, yPosition);
  yPosition += 5;

  // Checkbox
  const checkboxSize = 3.5;
  const checkboxX = margin + 5;
  const checkboxY = yPosition - 3;

  pdf.setDrawColor(220, 38, 38);
  pdf.setFillColor(data.recentHealthChanges?.hasChanges ? 220 : 255, data.recentHealthChanges?.hasChanges ? 38 : 255, data.recentHealthChanges?.hasChanges ? 38 : 255);
  pdf.setLineWidth(0.3);
  pdf.roundedRect(checkboxX, checkboxY, checkboxSize, checkboxSize, 0.5, 0.5, 'FD');

  // Checkmark if selected
  if (data.recentHealthChanges?.hasChanges) {
    pdf.setDrawColor(255, 255, 255);
    pdf.setLineWidth(0.5);
    pdf.line(checkboxX + 0.7, checkboxY + 1.5, checkboxX + 1.3, checkboxY + 2.2);
    pdf.line(checkboxX + 1.3, checkboxY + 2.2, checkboxX + 2.7, checkboxY + 0.5);
  }

  // Label
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  pdf.setTextColor(0, 0, 0);
  pdf.text('I have experienced recent changes in my health', checkboxX + checkboxSize + 2, yPosition);
  yPosition += 5;

  // Description if provided
  if (data.recentHealthChanges?.hasChanges && data.recentHealthChanges.description) {
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(7);
    pdf.setTextColor(100, 100, 100);
    pdf.text('Please describe the recent health changes:', margin + 5, yPosition);
    yPosition += 4;

    const descLines = pdf.splitTextToSize(data.recentHealthChanges.description, pageWidth - 2 * margin - 14);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7);
    pdf.setTextColor(0, 0, 0);
    descLines.forEach((line: string) => {
      pdf.text(line, margin + 7, yPosition);
      yPosition += 3.5;
    });
  }

  yPosition += 3;

  // Draw watermark on top
  addWatermarkOnTop(pdf, pageWidth, pageHeight, watermarkImg);
}

/**
 * Add Allergies & Medications Page (Page 3)
 */
function addAllergiesMedicationsPage(
  pdf: jsPDF,
  data: NewPatientFormData,
  pageWidth: number,
  pageHeight: number,
  margin: number,
  logoImg: HTMLImageElement | null,
  watermarkImg: HTMLImageElement | null,
  logoHeight: number,
  formDate: string
) {
  pdf.addPage();
  addWatermark(pdf, pageWidth, pageHeight, watermarkImg);
  addHeaderAndFooter(pdf, pageWidth, pageHeight, margin, formDate, logoImg, null, logoHeight);

  const topMargin = 5;
  let yPosition = topMargin + logoHeight + 1 + 8 + 6 + 6 + 10;

  // Title
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(14);
  pdf.setTextColor(55, 91, 220);
  pdf.text('Allergies & Medications', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 10;

  // === ALLERGIES BOX ===
  const allergyCategories = [
    { key: 'dentalRelated', label: 'Dental-Related', items: data.allergies?.dentalRelated || [], color: [220, 38, 38] },
    { key: 'medications', label: 'Medications', items: data.allergies?.medications || [], color: [239, 68, 68] },
    { key: 'other', label: 'Other Allergies & Foods', items: data.allergies?.other || [], color: [234, 179, 8] },
    { key: 'food', label: 'Any other Allergies (please specify)', items: data.allergies?.food ? [data.allergies.food] : [], color: [34, 197, 94] }
  ];

  const categoriesWithItems = allergyCategories.filter(cat => cat.items.length > 0);

  if (data.allergies?.none) {
    // No allergies box
    const noAllergyHeight = 18;
    pdf.setDrawColor(34, 197, 94);
    pdf.setFillColor(240, 253, 244);
    pdf.setLineWidth(0.2);
    pdf.saveGraphicsState();
    pdf.setGState(new pdf.GState({ opacity: 0.85 }));
    pdf.roundedRect(margin, yPosition, pageWidth - 2 * margin, noAllergyHeight, 2, 2, 'FD');
    pdf.restoreGraphicsState();

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(10);
    pdf.setTextColor(34, 197, 94);
    yPosition += 6;
    pdf.text('Allergies', margin + 5, yPosition);
    yPosition += 6;

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    pdf.setTextColor(0, 0, 0);
    pdf.text('No known allergies', margin + 5, yPosition);
    yPosition += 12;
  } else if (categoriesWithItems.length > 0) {
    // Calculate total height for 2-column layout
    const columnWidth = (pageWidth - 2 * margin - 10) / 2;

    let leftColumnHeight = 0;
    let rightColumnHeight = 0;

    categoriesWithItems.forEach((category, index) => {
      const categoryHeight = 4 + (category.items.length * 3.5) + 1.5;
      if (index % 2 === 0) {
        leftColumnHeight += categoryHeight;
      } else {
        rightColumnHeight += categoryHeight;
      }
    });

    const totalAllergyHeight = 12 + Math.max(leftColumnHeight, rightColumnHeight) + 3;

    pdf.setDrawColor(220, 38, 38);
    pdf.setFillColor(254, 242, 242);
    pdf.setLineWidth(0.2);
    pdf.saveGraphicsState();
    pdf.setGState(new pdf.GState({ opacity: 0.85 }));
    pdf.roundedRect(margin, yPosition, pageWidth - 2 * margin, totalAllergyHeight, 2, 2, 'FD');
    pdf.restoreGraphicsState();

    // Section header
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(10);
    pdf.setTextColor(220, 38, 38);
    yPosition += 6;
    pdf.text('Allergies', margin + 5, yPosition);
    yPosition += 6;

    // Display categories in 2 columns
    let leftY = yPosition;
    let rightY = yPosition;

    categoriesWithItems.forEach((category, index) => {
      const isLeftColumn = index % 2 === 0;
      const xPos = isLeftColumn ? margin + 5 : margin + 5 + columnWidth + 5;
      let currentY = isLeftColumn ? leftY : rightY;

      // Category label with color indicator
      pdf.setDrawColor(category.color[0], category.color[1], category.color[2]);
      pdf.setFillColor(category.color[0], category.color[1], category.color[2]);
      pdf.circle(xPos + 2, currentY - 1.5, 1, 'F');

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(8);
      pdf.setTextColor(category.color[0], category.color[1], category.color[2]);
      pdf.text(`${category.label}:`, xPos + 5, currentY);
      currentY += 4;

      // Items
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(7);
      pdf.setTextColor(0, 0, 0);
      category.items.forEach(item => {
        pdf.text(`- ${item}`, xPos + 7, currentY);
        currentY += 3.5;
      });
      currentY += 1.5;

      // Update column Y position
      if (isLeftColumn) {
        leftY = currentY;
      } else {
        rightY = currentY;
      }
    });

    yPosition = Math.max(leftY, rightY) + 3;
  }

  // === CURRENT MEDICATIONS BOX ===
  yPosition += 5;

  const medicationCategories = [
    { key: 'emergency', label: 'Emergency/Critical', items: data.currentMedications?.emergency || [], color: [220, 38, 38], critical: true },
    { key: 'boneOsteoporosis', label: 'Bone/Osteoporosis', items: data.currentMedications?.boneOsteoporosis || [], color: [239, 68, 68], critical: true }
  ];

  const medCategoriesWithItems = medicationCategories.filter(cat => cat.items.length > 0);
  const hasCompleteList = data.currentMedications?.complete;

  if (data.currentMedications?.none) {
    // No medications box
    const noMedHeight = 18;
    pdf.setDrawColor(34, 197, 94);
    pdf.setFillColor(240, 253, 244);
    pdf.setLineWidth(0.2);
    pdf.saveGraphicsState();
    pdf.setGState(new pdf.GState({ opacity: 0.85 }));
    pdf.roundedRect(margin, yPosition, pageWidth - 2 * margin, noMedHeight, 2, 2, 'FD');
    pdf.restoreGraphicsState();

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(10);
    pdf.setTextColor(34, 197, 94);
    yPosition += 6;
    pdf.text('Current Medications', margin + 5, yPosition);
    yPosition += 6;

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    pdf.setTextColor(0, 0, 0);
    pdf.text('Not currently taking any medications', margin + 5, yPosition);
    yPosition += 12;
  } else if (medCategoriesWithItems.length > 0 || hasCompleteList) {
    // Calculate total height
    let totalMedHeight = 12; // Header

    // Critical medications in 2 columns
    if (medCategoriesWithItems.length > 0) {
      let leftColumnHeight = 0;
      let rightColumnHeight = 0;

      medCategoriesWithItems.forEach((category, index) => {
        const categoryHeight = 4 + (category.items.length * 3.5) + 1.5;
        if (index % 2 === 0) {
          leftColumnHeight += categoryHeight;
        } else {
          rightColumnHeight += categoryHeight;
        }
      });

      totalMedHeight += Math.max(leftColumnHeight, rightColumnHeight);
    }

    // Complete list
    if (hasCompleteList) {
      const medLines = pdf.splitTextToSize(data.currentMedications.complete, pageWidth - 2 * margin - 14);
      totalMedHeight += 4 + (medLines.length * 3.5) + 3;
    } else {
      totalMedHeight += 3;
    }

    pdf.setDrawColor(55, 91, 220);
    pdf.setFillColor(240, 245, 255);
    pdf.setLineWidth(0.2);
    pdf.saveGraphicsState();
    pdf.setGState(new pdf.GState({ opacity: 0.85 }));
    pdf.roundedRect(margin, yPosition, pageWidth - 2 * margin, totalMedHeight, 2, 2, 'FD');
    pdf.restoreGraphicsState();

    // Section header
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(10);
    pdf.setTextColor(55, 91, 220);
    yPosition += 6;
    pdf.text('Current Medications', margin + 5, yPosition);
    yPosition += 6;

    // Display critical medications in 2 columns
    if (medCategoriesWithItems.length > 0) {
      const columnWidth = (pageWidth - 2 * margin - 10) / 2;
      let leftY = yPosition;
      let rightY = yPosition;

      medCategoriesWithItems.forEach((category, index) => {
        const isLeftColumn = index % 2 === 0;
        const xPos = isLeftColumn ? margin + 5 : margin + 5 + columnWidth + 5;
        let currentY = isLeftColumn ? leftY : rightY;

        // Category label with color indicator
        pdf.setDrawColor(category.color[0], category.color[1], category.color[2]);
        pdf.setFillColor(category.color[0], category.color[1], category.color[2]);
        pdf.circle(xPos + 2, currentY - 1.5, 1, 'F');

        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(8);
        pdf.setTextColor(category.color[0], category.color[1], category.color[2]);
        pdf.text(`${category.label}:`, xPos + 5, currentY);
        currentY += 4;

        // Items
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(7);
        pdf.setTextColor(0, 0, 0);
        category.items.forEach(item => {
          pdf.text(`- ${item}`, xPos + 7, currentY);
          currentY += 3.5;
        });
        currentY += 1.5;

        // Update column Y position
        if (isLeftColumn) {
          leftY = currentY;
        } else {
          rightY = currentY;
        }
      });

      yPosition = Math.max(leftY, rightY);
    }

    // Complete medication list
    if (hasCompleteList) {
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(7);
      pdf.setTextColor(100, 100, 100);
      pdf.text('Complete Medication List:', margin + 5, yPosition);
      yPosition += 4;

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(7);
      pdf.setTextColor(0, 0, 0);
      const medLines = pdf.splitTextToSize(data.currentMedications.complete, pageWidth - 2 * margin - 14);
      medLines.forEach((line: string) => {
        pdf.text(line, margin + 7, yPosition);
        yPosition += 3.5;
      });
    }

    yPosition += 3;
  }

  // === CURRENT PHARMACY BOX ===
  if (data.currentPharmacy?.name) {
    yPosition += 5;

    const pharmacyHeight = 24;
    pdf.setDrawColor(168, 85, 247);
    pdf.setFillColor(250, 245, 255);
    pdf.setLineWidth(0.2);
    pdf.saveGraphicsState();
    pdf.setGState(new pdf.GState({ opacity: 0.85 }));
    pdf.roundedRect(margin, yPosition, pageWidth - 2 * margin, pharmacyHeight, 2, 2, 'FD');
    pdf.restoreGraphicsState();

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(10);
    pdf.setTextColor(168, 85, 247);
    yPosition += 6;
    pdf.text('Current Pharmacy', margin + 5, yPosition);
    yPosition += 6;

    // Two-column layout for pharmacy details
    const columnWidth = (pageWidth - 2 * margin - 10) / 2;
    const leftX = margin + 5;
    const rightX = margin + 5 + columnWidth + 5;

    // Pharmacy Name
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(7);
    pdf.setTextColor(100, 100, 100);
    pdf.text('Pharmacy Name:', leftX, yPosition);
    yPosition += 4;

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.setTextColor(0, 0, 0);
    pdf.text(data.currentPharmacy.name, leftX, yPosition);

    // City/Location
    const cityY = yPosition - 4;
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(7);
    pdf.setTextColor(100, 100, 100);
    pdf.text('City/Location:', rightX, cityY);

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.setTextColor(0, 0, 0);
    pdf.text(data.currentPharmacy.city, rightX, yPosition);

    yPosition += 12;
  }

  // === CRITICAL ALLERGY ALERT ===
  const hasCriticalAllergies = (data.allergies?.dentalRelated && data.allergies.dentalRelated.length > 0) ||
                                (data.allergies?.medications && data.allergies.medications.length > 0);

  if (hasCriticalAllergies && !data.allergies?.none) {
    yPosition += 5;

    // Calculate dynamic height based on text
    const alertText = 'You have indicated allergies to anesthetics or antibiotics. This information will be prominently displayed in your chart and communicated to all treatment providers.';
    const alertLines = pdf.splitTextToSize(alertText, pageWidth - 2 * margin - 10);
    const alertHeight = 6 + 4 + (alertLines.length * 3.5) + 3; // Header + spacing + text lines + bottom padding

    pdf.setDrawColor(220, 38, 38);
    pdf.setFillColor(254, 242, 242);
    pdf.setLineWidth(0.3);
    pdf.saveGraphicsState();
    pdf.setGState(new pdf.GState({ opacity: 0.9 }));
    pdf.roundedRect(margin, yPosition, pageWidth - 2 * margin, alertHeight, 2, 2, 'FD');
    pdf.restoreGraphicsState();

    // Alert text
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8);
    pdf.setTextColor(153, 27, 27);
    yPosition += 6;
    pdf.text('Critical Allergy Alert:', margin + 5, yPosition);
    yPosition += 4;

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7);
    pdf.setTextColor(0, 0, 0);
    alertLines.forEach((line: string) => {
      pdf.text(line, margin + 5, yPosition);
      yPosition += 3.5;
    });

    yPosition += 3;
  }

  // === MEDICATION ALERT ===
  const hasCriticalMedications = (data.currentMedications?.emergency && data.currentMedications.emergency.length > 0) ||
                                  (data.currentMedications?.boneOsteoporosis && data.currentMedications.boneOsteoporosis.length > 0) ||
                                  data.currentMedications?.complete;

  if (hasCriticalMedications && !data.currentMedications?.none) {
    yPosition += 2;

    const medAlertHeight = 14;
    pdf.setDrawColor(234, 179, 8);
    pdf.setFillColor(254, 252, 232);
    pdf.setLineWidth(0.3);
    pdf.saveGraphicsState();
    pdf.setGState(new pdf.GState({ opacity: 0.9 }));
    pdf.roundedRect(margin, yPosition, pageWidth - 2 * margin, medAlertHeight, 2, 2, 'FD');
    pdf.restoreGraphicsState();

    // Alert text
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8);
    pdf.setTextColor(161, 98, 7);
    yPosition += 6;
    pdf.text('Medication Alert:', margin + 5, yPosition);
    yPosition += 4;

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7);
    pdf.setTextColor(0, 0, 0);
    const medAlertText = 'You are taking medications that may require special precautions during dental treatment. Our team will coordinate with your physician as needed.';
    const medAlertLines = pdf.splitTextToSize(medAlertText, pageWidth - 2 * margin - 10);
    medAlertLines.forEach((line: string) => {
      pdf.text(line, margin + 5, yPosition);
      yPosition += 3.5;
    });

    yPosition += 3;
  }

  // Draw watermark on top
  addWatermarkOnTop(pdf, pageWidth, pageHeight, watermarkImg);
}

/**
 * Add Oral Health Page (Page 4)
 */
function addOralHealthPage(
  pdf: jsPDF,
  data: NewPatientFormData,
  pageWidth: number,
  pageHeight: number,
  margin: number,
  logoImg: HTMLImageElement | null,
  watermarkImg: HTMLImageElement | null,
  logoHeight: number,
  formDate: string
) {
  pdf.addPage();
  addWatermark(pdf, pageWidth, pageHeight, watermarkImg);
  addHeaderAndFooter(pdf, pageWidth, pageHeight, margin, formDate, logoImg, null, logoHeight);

  const topMargin = 5;
  let yPosition = topMargin + logoHeight + 1 + 8 + 6 + 6 + 10;

  // Title
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(14);
  pdf.setTextColor(55, 91, 220);
  pdf.text('Current Oral Health Status', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 10;

  // === CURRENT DENTAL STATUS BOX ===
  const dentalStatusHeight = 24;
  pdf.setDrawColor(34, 197, 94);
  pdf.setFillColor(240, 253, 244);
  pdf.setLineWidth(0.2);
  pdf.saveGraphicsState();
  pdf.setGState(new pdf.GState({ opacity: 0.85 }));
  pdf.roundedRect(margin, yPosition, pageWidth - 2 * margin, dentalStatusHeight, 2, 2, 'FD');
  pdf.restoreGraphicsState();

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(10);
  pdf.setTextColor(34, 197, 94);
  yPosition += 6;
  pdf.text('Current Dental Status', margin + 5, yPosition);
  yPosition += 6;

  // Two-column layout for jaw status
  const columnWidth = (pageWidth - 2 * margin - 10) / 2;
  const leftX = margin + 5;
  const rightX = margin + 5 + columnWidth + 5;

  // Upper Jaw
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(7);
  pdf.setTextColor(100, 100, 100);
  pdf.text('Upper Jaw Status:', leftX, yPosition);
  yPosition += 4;

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  pdf.setTextColor(0, 0, 0);
  const upperJawText = data.dentalStatus?.upperJaw === 'all-teeth' ? 'All teeth present' :
                       data.dentalStatus?.upperJaw === 'some-missing' ? 'Some teeth missing' : 'No teeth remaining';
  pdf.text(upperJawText, leftX, yPosition);

  // Lower Jaw
  const lowerY = yPosition - 4;
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(7);
  pdf.setTextColor(100, 100, 100);
  pdf.text('Lower Jaw Status:', rightX, lowerY);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  pdf.setTextColor(0, 0, 0);
  const lowerJawText = data.dentalStatus?.lowerJaw === 'all-teeth' ? 'All teeth present' :
                       data.dentalStatus?.lowerJaw === 'some-missing' ? 'Some teeth missing' : 'No teeth remaining';
  pdf.text(lowerJawText, rightX, yPosition);

  yPosition += 12;

  // === PREVIOUS DENTAL SOLUTIONS BOX ===
  if (data.previousSolutions && data.previousSolutions.length > 0) {
    yPosition += 5;

    // Calculate height for 2-column layout
    const itemsPerColumn = Math.ceil(data.previousSolutions.length / 2);
    const solutionsHeight = 12 + (itemsPerColumn * 3.5) + 3;

    pdf.setDrawColor(55, 91, 220);
    pdf.setFillColor(240, 245, 255);
    pdf.setLineWidth(0.2);
    pdf.saveGraphicsState();
    pdf.setGState(new pdf.GState({ opacity: 0.85 }));
    pdf.roundedRect(margin, yPosition, pageWidth - 2 * margin, solutionsHeight, 2, 2, 'FD');
    pdf.restoreGraphicsState();

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(10);
    pdf.setTextColor(55, 91, 220);
    yPosition += 6;
    pdf.text('Previous Dental Solutions', margin + 5, yPosition);
    yPosition += 6;

    // Display solutions in 2 columns
    let leftY = yPosition;
    let rightY = yPosition;

    data.previousSolutions.forEach((solution, index) => {
      const isLeftColumn = index < itemsPerColumn;
      const xPos = isLeftColumn ? leftX : rightX;
      let currentY = isLeftColumn ? leftY : rightY;

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(7);
      pdf.setTextColor(0, 0, 0);
      pdf.text(`- ${solution}`, xPos, currentY);
      currentY += 3.5;

      if (isLeftColumn) {
        leftY = currentY;
      } else {
        rightY = currentY;
      }
    });

    yPosition = Math.max(leftY, rightY) + 3;
  }

  // === CURRENT SYMPTOMS BOX ===
  yPosition += 5;

  const symptoms = [
    { key: 'facialOralPain', label: 'Facial or oral pain', value: data.currentSymptoms?.facialOralPain },
    { key: 'jawPainOpening', label: 'Jaw pain when opening mouth', value: data.currentSymptoms?.jawPainOpening },
    { key: 'jawClicking', label: 'Jaw clicking or popping', value: data.currentSymptoms?.jawClicking },
    { key: 'digestiveProblems', label: 'Digestive problems related to chewing', value: data.currentSymptoms?.digestiveProblems }
  ];

  const checkedSymptoms = symptoms.filter(s => s.value);
  const hasSymptoms = checkedSymptoms.length > 0;

  let symptomsHeight = 12; // Header
  if (hasSymptoms) {
    symptomsHeight += checkedSymptoms.length * 4.5; // Checkboxes
    if (data.currentSymptoms?.symptomDuration) {
      symptomsHeight += 8; // Duration section
    }
  } else {
    symptomsHeight += 5; // "No symptoms" text
  }
  symptomsHeight += 3; // Bottom padding

  pdf.setDrawColor(239, 68, 68);
  pdf.setFillColor(254, 242, 242);
  pdf.setLineWidth(0.2);
  pdf.saveGraphicsState();
  pdf.setGState(new pdf.GState({ opacity: 0.85 }));
  pdf.roundedRect(margin, yPosition, pageWidth - 2 * margin, symptomsHeight, 2, 2, 'FD');
  pdf.restoreGraphicsState();

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(10);
  pdf.setTextColor(239, 68, 68);
  yPosition += 6;
  pdf.text('Current Symptoms', margin + 5, yPosition);
  yPosition += 6;

  if (hasSymptoms) {
    checkedSymptoms.forEach(symptom => {
      // Checkbox
      const checkboxSize = 3;
      const checkboxX = margin + 5;
      const checkboxY = yPosition - 2.5;

      pdf.setDrawColor(239, 68, 68);
      pdf.setFillColor(239, 68, 68);
      pdf.setLineWidth(0.3);
      pdf.roundedRect(checkboxX, checkboxY, checkboxSize, checkboxSize, 0.5, 0.5, 'FD');

      // Checkmark
      pdf.setDrawColor(255, 255, 255);
      pdf.setLineWidth(0.5);
      pdf.line(checkboxX + 0.6, checkboxY + 1.3, checkboxX + 1.1, checkboxY + 1.9);
      pdf.line(checkboxX + 1.1, checkboxY + 1.9, checkboxX + 2.3, checkboxY + 0.4);

      // Label
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);
      pdf.setTextColor(0, 0, 0);
      pdf.text(symptom.label, checkboxX + checkboxSize + 2, yPosition);
      yPosition += 4.5;
    });

    // Duration
    if (data.currentSymptoms?.symptomDuration) {
      yPosition += 2;
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(7);
      pdf.setTextColor(100, 100, 100);
      pdf.text('Duration:', margin + 5, yPosition);

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);
      pdf.setTextColor(0, 0, 0);
      pdf.text(data.currentSymptoms.symptomDuration, margin + 20, yPosition);
      yPosition += 6;
    }
  } else {
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.setTextColor(100, 100, 100);
    pdf.text('No symptoms reported', margin + 5, yPosition);
    yPosition += 5;
  }

  yPosition += 3;

  // === HEALING ISSUES BOX ===
  yPosition += 5;

  const healingIssues = [
    { key: 'bleedingBruising', label: 'Excessive bleeding or bruising', value: data.healingIssues?.bleedingBruising },
    { key: 'delayedHealing', label: 'Delayed healing after dental procedures', value: data.healingIssues?.delayedHealing },
    { key: 'recurrentInfections', label: 'Recurrent infections in mouth', value: data.healingIssues?.recurrentInfections }
  ];

  const checkedHealingIssues = healingIssues.filter(h => h.value);
  const hasHealingIssues = checkedHealingIssues.length > 0;

  let healingHeight = 12; // Header
  if (data.healingIssues?.none) {
    healingHeight += 5; // "No issues" text
  } else if (hasHealingIssues) {
    healingHeight += checkedHealingIssues.length * 4.5; // Checkboxes
  } else {
    healingHeight += 5; // "No issues" text
  }
  healingHeight += 3; // Bottom padding

  const healingColor = data.healingIssues?.none || !hasHealingIssues ? [34, 197, 94] : [220, 38, 38];
  const healingBgColor = data.healingIssues?.none || !hasHealingIssues ? [240, 253, 244] : [254, 242, 242];

  pdf.setDrawColor(healingColor[0], healingColor[1], healingColor[2]);
  pdf.setFillColor(healingBgColor[0], healingBgColor[1], healingBgColor[2]);
  pdf.setLineWidth(0.2);
  pdf.saveGraphicsState();
  pdf.setGState(new pdf.GState({ opacity: 0.85 }));
  pdf.roundedRect(margin, yPosition, pageWidth - 2 * margin, healingHeight, 2, 2, 'FD');
  pdf.restoreGraphicsState();

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(10);
  pdf.setTextColor(healingColor[0], healingColor[1], healingColor[2]);
  yPosition += 6;
  pdf.text('Healing Issues', margin + 5, yPosition);
  yPosition += 6;

  if (data.healingIssues?.none || !hasHealingIssues) {
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.setTextColor(100, 100, 100);
    pdf.text('No healing issues reported', margin + 5, yPosition);
    yPosition += 5;
  } else {
    checkedHealingIssues.forEach(issue => {
      // Checkbox
      const checkboxSize = 3;
      const checkboxX = margin + 5;
      const checkboxY = yPosition - 2.5;

      pdf.setDrawColor(220, 38, 38);
      pdf.setFillColor(220, 38, 38);
      pdf.setLineWidth(0.3);
      pdf.roundedRect(checkboxX, checkboxY, checkboxSize, checkboxSize, 0.5, 0.5, 'FD');

      // Checkmark
      pdf.setDrawColor(255, 255, 255);
      pdf.setLineWidth(0.5);
      pdf.line(checkboxX + 0.6, checkboxY + 1.3, checkboxX + 1.1, checkboxY + 1.9);
      pdf.line(checkboxX + 1.1, checkboxY + 1.9, checkboxX + 2.3, checkboxY + 0.4);

      // Label
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);
      pdf.setTextColor(0, 0, 0);
      pdf.text(issue.label, checkboxX + checkboxSize + 2, yPosition);
      yPosition += 4.5;
    });
  }

  yPosition += 3;

  // === ALERTS ===
  // Concerning symptoms alert
  const hasConcerningSymptoms = data.currentSymptoms?.facialOralPain ||
                               data.currentSymptoms?.jawPainOpening ||
                               hasHealingIssues;

  if (hasConcerningSymptoms) {
    yPosition += 5;

    const concernAlertText = 'You have indicated symptoms that may require immediate attention. Our clinical team will prioritize evaluation of these concerns during your visit.';
    const concernAlertLines = pdf.splitTextToSize(concernAlertText, pageWidth - 2 * margin - 10);
    const concernAlertHeight = 6 + 4 + (concernAlertLines.length * 3.5) + 3;

    pdf.setDrawColor(239, 68, 68);
    pdf.setFillColor(254, 242, 242);
    pdf.setLineWidth(0.3);
    pdf.saveGraphicsState();
    pdf.setGState(new pdf.GState({ opacity: 0.9 }));
    pdf.roundedRect(margin, yPosition, pageWidth - 2 * margin, concernAlertHeight, 2, 2, 'FD');
    pdf.restoreGraphicsState();

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8);
    pdf.setTextColor(153, 27, 27);
    yPosition += 6;
    pdf.text('Important:', margin + 5, yPosition);
    yPosition += 4;

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7);
    pdf.setTextColor(0, 0, 0);
    concernAlertLines.forEach((line: string) => {
      pdf.text(line, margin + 5, yPosition);
      yPosition += 3.5;
    });

    yPosition += 3;
  }

  // Missing teeth alert
  if (data.dentalStatus?.upperJaw === 'no-teeth' || data.dentalStatus?.lowerJaw === 'no-teeth') {
    yPosition += 2;

    const teethAlertText = 'You have indicated missing teeth. Our team will discuss comprehensive treatment options including implants, dentures, and other restorative solutions.';
    const teethAlertLines = pdf.splitTextToSize(teethAlertText, pageWidth - 2 * margin - 10);
    const teethAlertHeight = 6 + 4 + (teethAlertLines.length * 3.5) + 3;

    pdf.setDrawColor(55, 91, 220);
    pdf.setFillColor(240, 245, 255);
    pdf.setLineWidth(0.3);
    pdf.saveGraphicsState();
    pdf.setGState(new pdf.GState({ opacity: 0.9 }));
    pdf.roundedRect(margin, yPosition, pageWidth - 2 * margin, teethAlertHeight, 2, 2, 'FD');
    pdf.restoreGraphicsState();

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8);
    pdf.setTextColor(30, 58, 138);
    yPosition += 6;
    pdf.text('Treatment Planning:', margin + 5, yPosition);
    yPosition += 4;

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7);
    pdf.setTextColor(0, 0, 0);
    teethAlertLines.forEach((line: string) => {
      pdf.text(line, margin + 5, yPosition);
      yPosition += 3.5;
    });

    yPosition += 3;
  }

  // Healing concerns alert
  if (hasHealingIssues) {
    yPosition += 2;

    const healingAlertText = 'You have indicated healing issues that may affect treatment planning. We may need to coordinate with your physician and take special precautions during procedures.';
    const healingAlertLines = pdf.splitTextToSize(healingAlertText, pageWidth - 2 * margin - 10);
    const healingAlertHeight = 6 + 4 + (healingAlertLines.length * 3.5) + 3;

    pdf.setDrawColor(220, 38, 38);
    pdf.setFillColor(254, 242, 242);
    pdf.setLineWidth(0.3);
    pdf.saveGraphicsState();
    pdf.setGState(new pdf.GState({ opacity: 0.9 }));
    pdf.roundedRect(margin, yPosition, pageWidth - 2 * margin, healingAlertHeight, 2, 2, 'FD');
    pdf.restoreGraphicsState();

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8);
    pdf.setTextColor(153, 27, 27);
    yPosition += 6;
    pdf.text('Healing Concerns:', margin + 5, yPosition);
    yPosition += 4;

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7);
    pdf.setTextColor(0, 0, 0);
    healingAlertLines.forEach((line: string) => {
      pdf.text(line, margin + 5, yPosition);
      yPosition += 3.5;
    });

    yPosition += 3;
  }

  // Draw watermark on top
  addWatermarkOnTop(pdf, pageWidth, pageHeight, watermarkImg);
}

/**
 * Add Lifestyle Page (Page 5)
 */
function addLifestylePage(
  pdf: jsPDF,
  data: NewPatientFormData,
  pageWidth: number,
  pageHeight: number,
  margin: number,
  logoImg: HTMLImageElement | null,
  watermarkImg: HTMLImageElement | null,
  logoHeight: number,
  formDate: string
) {
  pdf.addPage();
  addWatermark(pdf, pageWidth, pageHeight, watermarkImg);
  addHeaderAndFooter(pdf, pageWidth, pageHeight, margin, formDate, logoImg, null, logoHeight);

  const topMargin = 5;
  let yPosition = topMargin + logoHeight + 1 + 8 + 6 + 6 + 10;

  // Title
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(14);
  pdf.setTextColor(55, 91, 220);
  pdf.text('Lifestyle Factors', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 10;

  // === PREGNANCY STATUS BOX ===
  const pregnancyHeight = data.pregnancy?.status === 'pregnant' && data.pregnancy.weeks ? 28 : 24;
  const pregnancyColor = data.pregnancy?.status === 'pregnant' ? [236, 72, 153] :
                         data.pregnancy?.status === 'nursing' ? [59, 130, 246] : [34, 197, 94];
  const pregnancyBgColor = data.pregnancy?.status === 'pregnant' ? [252, 231, 243] :
                           data.pregnancy?.status === 'nursing' ? [239, 246, 255] : [240, 253, 244];

  pdf.setDrawColor(pregnancyColor[0], pregnancyColor[1], pregnancyColor[2]);
  pdf.setFillColor(pregnancyBgColor[0], pregnancyBgColor[1], pregnancyBgColor[2]);
  pdf.setLineWidth(0.2);
  pdf.saveGraphicsState();
  pdf.setGState(new pdf.GState({ opacity: 0.85 }));
  pdf.roundedRect(margin, yPosition, pageWidth - 2 * margin, pregnancyHeight, 2, 2, 'FD');
  pdf.restoreGraphicsState();

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(10);
  pdf.setTextColor(pregnancyColor[0], pregnancyColor[1], pregnancyColor[2]);
  yPosition += 6;
  pdf.text('Pregnancy Status', margin + 5, yPosition);
  yPosition += 6;

  // Current Status
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(7);
  pdf.setTextColor(100, 100, 100);
  pdf.text('Current Status:', margin + 5, yPosition);
  yPosition += 4;

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  pdf.setTextColor(0, 0, 0);
  const pregnancyStatus = data.pregnancy?.status === 'pregnant' ? 'Currently pregnant' :
                          data.pregnancy?.status === 'nursing' ? 'Currently nursing' : 'Not applicable';
  pdf.text(pregnancyStatus, margin + 5, yPosition);
  yPosition += 6;

  // Weeks if pregnant
  if (data.pregnancy?.status === 'pregnant' && data.pregnancy.weeks) {
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(7);
    pdf.setTextColor(100, 100, 100);
    pdf.text('How many weeks pregnant?', margin + 5, yPosition);
    yPosition += 4;

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.setTextColor(0, 0, 0);
    pdf.text(`${data.pregnancy.weeks} weeks`, margin + 5, yPosition);
    yPosition += 6;
  }

  yPosition += 6;

  // === SMOKING STATUS BOX ===
  yPosition += 5;

  let smokingHeight = 24; // Base height
  if (data.tobaccoUse?.type !== 'none') {
    smokingHeight += 12; // Type and amount section
    if (data.tobaccoUse?.duration) {
      smokingHeight += 8; // Duration section
    }
  }

  const smokingColor = data.tobaccoUse?.type === 'none' ? [34, 197, 94] : [251, 146, 60];
  const smokingBgColor = data.tobaccoUse?.type === 'none' ? [240, 253, 244] : [255, 247, 237];

  pdf.setDrawColor(smokingColor[0], smokingColor[1], smokingColor[2]);
  pdf.setFillColor(smokingBgColor[0], smokingBgColor[1], smokingBgColor[2]);
  pdf.setLineWidth(0.2);
  pdf.saveGraphicsState();
  pdf.setGState(new pdf.GState({ opacity: 0.85 }));
  pdf.roundedRect(margin, yPosition, pageWidth - 2 * margin, smokingHeight, 2, 2, 'FD');
  pdf.restoreGraphicsState();

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(10);
  pdf.setTextColor(smokingColor[0], smokingColor[1], smokingColor[2]);
  yPosition += 6;
  pdf.text('Smoking Status', margin + 5, yPosition);
  yPosition += 6;

  // Do you smoke?
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(7);
  pdf.setTextColor(100, 100, 100);
  pdf.text('Do you smoke?', margin + 5, yPosition);
  yPosition += 4;

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  pdf.setTextColor(0, 0, 0);
  pdf.text(data.tobaccoUse?.type === 'none' ? 'No' : 'Yes', margin + 5, yPosition);
  yPosition += 6;

  if (data.tobaccoUse?.type !== 'none') {
    // Type and Amount
    const columnWidth = (pageWidth - 2 * margin - 10) / 2;
    const leftX = margin + 5;
    const rightX = margin + 5 + columnWidth + 5;

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(7);
    pdf.setTextColor(100, 100, 100);
    pdf.text('Type and Amount of Smoking:', leftX, yPosition);
    yPosition += 4;

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.setTextColor(0, 0, 0);
    const tobaccoType = data.tobaccoUse.type === 'few-cigarettes' ? 'Few cigarettes per day (1-5)' :
                        data.tobaccoUse.type === 'half-pack' ? 'Half pack per day (10 cigarettes)' :
                        data.tobaccoUse.type === 'one-pack' ? 'One pack per day (20 cigarettes)' :
                        data.tobaccoUse.type === 'more-than-pack' ? 'More than one pack per day' :
                        data.tobaccoUse.type === 'vaping' ? 'Vaping' :
                        data.tobaccoUse.type === 'recreational-marijuana' ? 'Recreational marijuana' :
                        data.tobaccoUse.type === 'medicinal-marijuana' ? 'Medicinal marijuana' : '';
    pdf.text(tobaccoType, leftX, yPosition);
    yPosition += 6;

    // Duration
    if (data.tobaccoUse?.duration) {
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(7);
      pdf.setTextColor(100, 100, 100);
      pdf.text('How long have you been smoking?', leftX, yPosition);
      yPosition += 4;

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);
      pdf.setTextColor(0, 0, 0);
      const durationText = data.tobaccoUse.duration === 'less-than-1' ? 'Less than 1 year' :
                          data.tobaccoUse.duration === '1-year' ? '1 year' :
                          data.tobaccoUse.duration === '2-years' ? '2 years' :
                          data.tobaccoUse.duration === '3-years' ? '3 years' :
                          data.tobaccoUse.duration === '4-years' ? '4 years' :
                          data.tobaccoUse.duration === '5-years' ? '5 years' :
                          data.tobaccoUse.duration === '5-plus-years' ? '5+ years' : '';
      pdf.text(durationText, leftX, yPosition);
      yPosition += 6;
    }
  }

  yPosition += 6;

  // === ALCOHOL CONSUMPTION BOX ===
  yPosition += 5;

  let alcoholHeight = 24; // Base height
  if (data.alcoholConsumption?.frequency !== 'none') {
    alcoholHeight += 12; // Frequency section
    if (data.alcoholConsumption?.duration) {
      alcoholHeight += 8; // Duration section
    }
  }

  const alcoholColor = data.alcoholConsumption?.frequency === 'none' ? [34, 197, 94] :
                       data.alcoholConsumption?.frequency === 'heavy' ? [220, 38, 38] : [168, 85, 247];
  const alcoholBgColor = data.alcoholConsumption?.frequency === 'none' ? [240, 253, 244] :
                         data.alcoholConsumption?.frequency === 'heavy' ? [254, 242, 242] : [250, 245, 255];

  pdf.setDrawColor(alcoholColor[0], alcoholColor[1], alcoholColor[2]);
  pdf.setFillColor(alcoholBgColor[0], alcoholBgColor[1], alcoholBgColor[2]);
  pdf.setLineWidth(0.2);
  pdf.saveGraphicsState();
  pdf.setGState(new pdf.GState({ opacity: 0.85 }));
  pdf.roundedRect(margin, yPosition, pageWidth - 2 * margin, alcoholHeight, 2, 2, 'FD');
  pdf.restoreGraphicsState();

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(10);
  pdf.setTextColor(alcoholColor[0], alcoholColor[1], alcoholColor[2]);
  yPosition += 6;
  pdf.text('Alcohol Consumption', margin + 5, yPosition);
  yPosition += 6;

  // Do you drink alcohol?
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(7);
  pdf.setTextColor(100, 100, 100);
  pdf.text('Do you drink alcohol?', margin + 5, yPosition);
  yPosition += 4;

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  pdf.setTextColor(0, 0, 0);
  pdf.text(data.alcoholConsumption?.frequency === 'none' ? 'No' : 'Yes', margin + 5, yPosition);
  yPosition += 6;

  if (data.alcoholConsumption?.frequency !== 'none') {
    // Frequency
    const columnWidth = (pageWidth - 2 * margin - 10) / 2;
    const leftX = margin + 5;

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(7);
    pdf.setTextColor(100, 100, 100);
    pdf.text('Frequency of Alcohol Consumption:', leftX, yPosition);
    yPosition += 4;

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.setTextColor(0, 0, 0);
    const alcoholFreq = data.alcoholConsumption.frequency === 'casual' ? 'Casual (1-2 drinks per week)' :
                        data.alcoholConsumption.frequency === 'regular' ? 'Regular (3-7 drinks per week)' :
                        data.alcoholConsumption.frequency === 'heavy' ? 'Heavy (8+ drinks per week)' : '';
    pdf.text(alcoholFreq, leftX, yPosition);
    yPosition += 6;

    // Duration
    if (data.alcoholConsumption?.duration) {
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(7);
      pdf.setTextColor(100, 100, 100);
      pdf.text('How long have you been drinking alcohol regularly?', leftX, yPosition);
      yPosition += 4;

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);
      pdf.setTextColor(0, 0, 0);
      const durationText = data.alcoholConsumption.duration === 'less-than-1' ? 'Less than 1 year' :
                          data.alcoholConsumption.duration === '1-year' ? '1 year' :
                          data.alcoholConsumption.duration === '2-years' ? '2 years' :
                          data.alcoholConsumption.duration === '3-years' ? '3 years' :
                          data.alcoholConsumption.duration === '4-years' ? '4 years' :
                          data.alcoholConsumption.duration === '5-years' ? '5 years' :
                          data.alcoholConsumption.duration === '5-plus-years' ? '5+ years' : '';
      pdf.text(durationText, leftX, yPosition);
      yPosition += 6;
    }
  }

  yPosition += 6;

  // === ALERTS ===
  // Pregnancy alert
  if (data.pregnancy?.status === 'pregnant') {
    yPosition += 5;

    const pregnancyAlertText = 'We will take special precautions during your treatment to ensure the safety of both you and your baby. Some procedures may be postponed until after delivery.';
    const pregnancyAlertLines = pdf.splitTextToSize(pregnancyAlertText, pageWidth - 2 * margin - 10);
    const pregnancyAlertHeight = 6 + 4 + (pregnancyAlertLines.length * 3.5) + 3;

    pdf.setDrawColor(236, 72, 153);
    pdf.setFillColor(252, 231, 243);
    pdf.setLineWidth(0.3);
    pdf.saveGraphicsState();
    pdf.setGState(new pdf.GState({ opacity: 0.9 }));
    pdf.roundedRect(margin, yPosition, pageWidth - 2 * margin, pregnancyAlertHeight, 2, 2, 'FD');
    pdf.restoreGraphicsState();

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8);
    pdf.setTextColor(157, 23, 77);
    yPosition += 6;
    pdf.text('Pregnancy Considerations:', margin + 5, yPosition);
    yPosition += 4;

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7);
    pdf.setTextColor(0, 0, 0);
    pregnancyAlertLines.forEach((line: string) => {
      pdf.text(line, margin + 5, yPosition);
      yPosition += 3.5;
    });

    yPosition += 3;
  }

  // Nursing alert
  if (data.pregnancy?.status === 'nursing') {
    yPosition += 5;

    const nursingAlertText = 'We will carefully select medications that are safe during nursing and discuss any necessary precautions.';
    const nursingAlertLines = pdf.splitTextToSize(nursingAlertText, pageWidth - 2 * margin - 10);
    const nursingAlertHeight = 6 + 4 + (nursingAlertLines.length * 3.5) + 3;

    pdf.setDrawColor(59, 130, 246);
    pdf.setFillColor(239, 246, 255);
    pdf.setLineWidth(0.3);
    pdf.saveGraphicsState();
    pdf.setGState(new pdf.GState({ opacity: 0.9 }));
    pdf.roundedRect(margin, yPosition, pageWidth - 2 * margin, nursingAlertHeight, 2, 2, 'FD');
    pdf.restoreGraphicsState();

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8);
    pdf.setTextColor(30, 58, 138);
    yPosition += 6;
    pdf.text('Nursing Considerations:', margin + 5, yPosition);
    yPosition += 4;

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7);
    pdf.setTextColor(0, 0, 0);
    nursingAlertLines.forEach((line: string) => {
      pdf.text(line, margin + 5, yPosition);
      yPosition += 3.5;
    });

    yPosition += 3;
  }

  // Tobacco use alert
  if (data.tobaccoUse?.type !== 'none') {
    yPosition += 2;

    const tobaccoAlertText = 'Tobacco use can significantly affect healing after dental procedures and increase the risk of complications. We strongly recommend cessation and can provide resources to help.';
    const tobaccoAlertLines = pdf.splitTextToSize(tobaccoAlertText, pageWidth - 2 * margin - 10);
    const tobaccoAlertHeight = 6 + 4 + (tobaccoAlertLines.length * 3.5) + 3;

    pdf.setDrawColor(251, 146, 60);
    pdf.setFillColor(255, 247, 237);
    pdf.setLineWidth(0.3);
    pdf.saveGraphicsState();
    pdf.setGState(new pdf.GState({ opacity: 0.9 }));
    pdf.roundedRect(margin, yPosition, pageWidth - 2 * margin, tobaccoAlertHeight, 2, 2, 'FD');
    pdf.restoreGraphicsState();

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8);
    pdf.setTextColor(154, 52, 18);
    yPosition += 6;
    pdf.text('Tobacco Use Impact:', margin + 5, yPosition);
    yPosition += 4;

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7);
    pdf.setTextColor(0, 0, 0);
    tobaccoAlertLines.forEach((line: string) => {
      pdf.text(line, margin + 5, yPosition);
      yPosition += 3.5;
    });

    yPosition += 3;
  }

  // Heavy alcohol alert
  if (data.alcoholConsumption?.frequency === 'heavy') {
    yPosition += 2;

    const heavyAlcoholAlertText = 'Heavy alcohol consumption can interact with medications and affect healing. Please inform us of any alcohol consumption before procedures.';
    const heavyAlcoholAlertLines = pdf.splitTextToSize(heavyAlcoholAlertText, pageWidth - 2 * margin - 10);
    const heavyAlcoholAlertHeight = 6 + 4 + (heavyAlcoholAlertLines.length * 3.5) + 3;

    pdf.setDrawColor(220, 38, 38);
    pdf.setFillColor(254, 242, 242);
    pdf.setLineWidth(0.3);
    pdf.saveGraphicsState();
    pdf.setGState(new pdf.GState({ opacity: 0.9 }));
    pdf.roundedRect(margin, yPosition, pageWidth - 2 * margin, heavyAlcoholAlertHeight, 2, 2, 'FD');
    pdf.restoreGraphicsState();

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8);
    pdf.setTextColor(153, 27, 27);
    yPosition += 6;
    pdf.text('Alcohol Interaction Warning:', margin + 5, yPosition);
    yPosition += 4;

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7);
    pdf.setTextColor(0, 0, 0);
    heavyAlcoholAlertLines.forEach((line: string) => {
      pdf.text(line, margin + 5, yPosition);
      yPosition += 3.5;
    });

    yPosition += 3;
  }

  // Confidential information alert (always show)
  yPosition += 2;

  const confidentialAlertText = 'All lifestyle information is kept strictly confidential and is used solely for providing you with the safest and most effective dental care.';
  const confidentialAlertLines = pdf.splitTextToSize(confidentialAlertText, pageWidth - 2 * margin - 10);
  const confidentialAlertHeight = 6 + 4 + (confidentialAlertLines.length * 3.5) + 3;

  pdf.setDrawColor(59, 130, 246);
  pdf.setFillColor(239, 246, 255);
  pdf.setLineWidth(0.3);
  pdf.saveGraphicsState();
  pdf.setGState(new pdf.GState({ opacity: 0.9 }));
  pdf.roundedRect(margin, yPosition, pageWidth - 2 * margin, confidentialAlertHeight, 2, 2, 'FD');
  pdf.restoreGraphicsState();

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8);
  pdf.setTextColor(30, 58, 138);
  yPosition += 6;
  pdf.text('Confidential Information:', margin + 5, yPosition);
  yPosition += 4;

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(7);
  pdf.setTextColor(0, 0, 0);
  confidentialAlertLines.forEach((line: string) => {
    pdf.text(line, margin + 5, yPosition);
    yPosition += 3.5;
  });

  yPosition += 3;

  // Draw watermark on top
  addWatermarkOnTop(pdf, pageWidth, pageHeight, watermarkImg);
}

/**
 * Add Comfort Preferences Page (Page 6)
 */
function addComfortPreferencesPage(
  pdf: jsPDF,
  data: NewPatientFormData,
  pageWidth: number,
  pageHeight: number,
  margin: number,
  logoImg: HTMLImageElement | null,
  watermarkImg: HTMLImageElement | null,
  logoHeight: number,
  formDate: string
) {
  pdf.addPage();
  addWatermark(pdf, pageWidth, pageHeight, watermarkImg);
  addHeaderAndFooter(pdf, pageWidth, pageHeight, margin, formDate, logoImg, null, logoHeight);

  const topMargin = 5;
  let yPosition = topMargin + logoHeight + 1 + 8 + 6 + 6 + 10;

  // Title
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(14);
  pdf.setTextColor(55, 91, 220);
  pdf.text('Patient Comfort Preferences', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 10;

  const columnWidth = (pageWidth - 2 * margin - 10) / 2;
  const leftX = margin + 5;
  const rightX = margin + 5 + columnWidth + 5;

  // === ANXIETY CONTROL BOX ===
  const anxietyItems = data.anxietyControl || [];
  const hasAnxiety = anxietyItems.length > 0;

  let anxietyHeight = 12; // Header
  if (hasAnxiety) {
    const itemsPerColumn = Math.ceil(anxietyItems.length / 2);
    anxietyHeight += (itemsPerColumn * 4.5) + 3;
  } else {
    anxietyHeight += 8;
  }

  pdf.setDrawColor(55, 91, 220);
  pdf.setFillColor(240, 245, 255);
  pdf.setLineWidth(0.2);
  pdf.saveGraphicsState();
  pdf.setGState(new pdf.GState({ opacity: 0.85 }));
  pdf.roundedRect(margin, yPosition, pageWidth - 2 * margin, anxietyHeight, 2, 2, 'FD');
  pdf.restoreGraphicsState();

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(10);
  pdf.setTextColor(55, 91, 220);
  yPosition += 6;
  pdf.text('Anxiety Control', margin + 5, yPosition);
  yPosition += 6;

  if (hasAnxiety) {
    // Display in 2 columns
    let leftY = yPosition;
    let rightY = yPosition;
    const itemsPerColumn = Math.ceil(anxietyItems.length / 2);

    anxietyItems.forEach((item, index) => {
      const isLeftColumn = index < itemsPerColumn;
      const xPos = isLeftColumn ? leftX : rightX;
      let currentY = isLeftColumn ? leftY : rightY;

      // Checkbox
      const checkboxSize = 3;
      const checkboxX = xPos;
      const checkboxY = currentY - 2.5;

      pdf.setDrawColor(55, 91, 220);
      pdf.setFillColor(55, 91, 220);
      pdf.setLineWidth(0.3);
      pdf.roundedRect(checkboxX, checkboxY, checkboxSize, checkboxSize, 0.5, 0.5, 'FD');

      // Checkmark
      pdf.setDrawColor(255, 255, 255);
      pdf.setLineWidth(0.5);
      pdf.line(checkboxX + 0.6, checkboxY + 1.3, checkboxX + 1.1, checkboxY + 1.9);
      pdf.line(checkboxX + 1.1, checkboxY + 1.9, checkboxX + 2.3, checkboxY + 0.4);

      // Label
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(7);
      pdf.setTextColor(0, 0, 0);
      const labelText = pdf.splitTextToSize(item, columnWidth - 10);
      pdf.text(labelText[0], checkboxX + checkboxSize + 2, currentY);
      currentY += 4.5;

      if (isLeftColumn) {
        leftY = currentY;
      } else {
        rightY = currentY;
      }
    });

    yPosition = Math.max(leftY, rightY) + 3;
  } else {
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.setTextColor(100, 100, 100);
    pdf.text('No anxiety concerns indicated', leftX, yPosition);
    yPosition += 8;
  }

  // === PAIN MANAGEMENT & INJECTION PREFERENCES BOX ===
  yPosition += 5;

  const painItems = data.painInjection || [];
  const hasPain = painItems.length > 0;

  let painHeight = 12; // Header
  if (hasPain) {
    const itemsPerColumn = Math.ceil(painItems.length / 2);
    painHeight += (itemsPerColumn * 4.5) + 3;
  } else {
    painHeight += 8;
  }

  pdf.setDrawColor(55, 91, 220);
  pdf.setFillColor(240, 245, 255);
  pdf.setLineWidth(0.2);
  pdf.saveGraphicsState();
  pdf.setGState(new pdf.GState({ opacity: 0.85 }));
  pdf.roundedRect(margin, yPosition, pageWidth - 2 * margin, painHeight, 2, 2, 'FD');
  pdf.restoreGraphicsState();

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(10);
  pdf.setTextColor(55, 91, 220);
  yPosition += 6;
  pdf.text('Pain Management & Injection Preferences', margin + 5, yPosition);
  yPosition += 6;

  if (hasPain) {
    // Display in 2 columns
    let leftY = yPosition;
    let rightY = yPosition;
    const itemsPerColumn = Math.ceil(painItems.length / 2);

    painItems.forEach((item, index) => {
      const isLeftColumn = index < itemsPerColumn;
      const xPos = isLeftColumn ? leftX : rightX;
      let currentY = isLeftColumn ? leftY : rightY;

      // Checkbox
      const checkboxSize = 3;
      const checkboxX = xPos;
      const checkboxY = currentY - 2.5;

      pdf.setDrawColor(55, 91, 220);
      pdf.setFillColor(55, 91, 220);
      pdf.setLineWidth(0.3);
      pdf.roundedRect(checkboxX, checkboxY, checkboxSize, checkboxSize, 0.5, 0.5, 'FD');

      // Checkmark
      pdf.setDrawColor(255, 255, 255);
      pdf.setLineWidth(0.5);
      pdf.line(checkboxX + 0.6, checkboxY + 1.3, checkboxX + 1.1, checkboxY + 1.9);
      pdf.line(checkboxX + 1.1, checkboxY + 1.9, checkboxX + 2.3, checkboxY + 0.4);

      // Label
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(7);
      pdf.setTextColor(0, 0, 0);
      const labelText = pdf.splitTextToSize(item, columnWidth - 10);
      pdf.text(labelText[0], checkboxX + checkboxSize + 2, currentY);
      currentY += 4.5;

      if (isLeftColumn) {
        leftY = currentY;
      } else {
        rightY = currentY;
      }
    });

    yPosition = Math.max(leftY, rightY) + 3;
  } else {
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.setTextColor(100, 100, 100);
    pdf.text('No pain management preferences indicated', leftX, yPosition);
    yPosition += 8;
  }

  // === COMMUNICATION PREFERENCES BOX ===
  yPosition += 5;

  const commItems = data.communication || [];
  const hasComm = commItems.length > 0;

  let commHeight = 12;
  if (hasComm) {
    const itemsPerColumn = Math.ceil(commItems.length / 2);
    commHeight += (itemsPerColumn * 4.5) + 3;
  } else {
    commHeight += 8;
  }

  pdf.setDrawColor(59, 130, 246);
  pdf.setFillColor(239, 246, 255);
  pdf.setLineWidth(0.2);
  pdf.saveGraphicsState();
  pdf.setGState(new pdf.GState({ opacity: 0.85 }));
  pdf.roundedRect(margin, yPosition, pageWidth - 2 * margin, commHeight, 2, 2, 'FD');
  pdf.restoreGraphicsState();

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(10);
  pdf.setTextColor(59, 130, 246);
  yPosition += 6;
  pdf.text('Communication Preferences', margin + 5, yPosition);
  yPosition += 6;

  if (hasComm) {
    let leftY = yPosition;
    let rightY = yPosition;
    const itemsPerColumn = Math.ceil(commItems.length / 2);

    commItems.forEach((item, index) => {
      const isLeftColumn = index < itemsPerColumn;
      const xPos = isLeftColumn ? leftX : rightX;
      let currentY = isLeftColumn ? leftY : rightY;

      const checkboxSize = 3;
      const checkboxX = xPos;
      const checkboxY = currentY - 2.5;

      pdf.setDrawColor(59, 130, 246);
      pdf.setFillColor(59, 130, 246);
      pdf.setLineWidth(0.3);
      pdf.roundedRect(checkboxX, checkboxY, checkboxSize, checkboxSize, 0.5, 0.5, 'FD');

      pdf.setDrawColor(255, 255, 255);
      pdf.setLineWidth(0.5);
      pdf.line(checkboxX + 0.6, checkboxY + 1.3, checkboxX + 1.1, checkboxY + 1.9);
      pdf.line(checkboxX + 1.1, checkboxY + 1.9, checkboxX + 2.3, checkboxY + 0.4);

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(7);
      pdf.setTextColor(0, 0, 0);
      const labelText = pdf.splitTextToSize(item, columnWidth - 10);
      pdf.text(labelText[0], checkboxX + checkboxSize + 2, currentY);
      currentY += 4.5;

      if (isLeftColumn) {
        leftY = currentY;
      } else {
        rightY = currentY;
      }
    });

    yPosition = Math.max(leftY, rightY) + 3;
  } else {
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.setTextColor(100, 100, 100);
    pdf.text('No communication preferences indicated', leftX, yPosition);
    yPosition += 8;
  }

  // === SENSORY SENSITIVITIES BOX ===
  yPosition += 5;

  const sensoryItems = data.sensorySensitivities || [];
  const hasSensory = sensoryItems.length > 0;

  let sensoryHeight = 12;
  if (hasSensory) {
    const itemsPerColumn = Math.ceil(sensoryItems.length / 2);
    sensoryHeight += (itemsPerColumn * 4.5) + 3;
  } else {
    sensoryHeight += 8;
  }

  pdf.setDrawColor(55, 91, 220);
  pdf.setFillColor(240, 245, 255);
  pdf.setLineWidth(0.2);
  pdf.saveGraphicsState();
  pdf.setGState(new pdf.GState({ opacity: 0.85 }));
  pdf.roundedRect(margin, yPosition, pageWidth - 2 * margin, sensoryHeight, 2, 2, 'FD');
  pdf.restoreGraphicsState();

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(10);
  pdf.setTextColor(55, 91, 220);
  yPosition += 6;
  pdf.text('Sensory Sensitivities', margin + 5, yPosition);
  yPosition += 6;

  if (hasSensory) {
    let leftY = yPosition;
    let rightY = yPosition;
    const itemsPerColumn = Math.ceil(sensoryItems.length / 2);

    sensoryItems.forEach((item, index) => {
      const isLeftColumn = index < itemsPerColumn;
      const xPos = isLeftColumn ? leftX : rightX;
      let currentY = isLeftColumn ? leftY : rightY;

      const checkboxSize = 3;
      const checkboxX = xPos;
      const checkboxY = currentY - 2.5;

      pdf.setDrawColor(55, 91, 220);
      pdf.setFillColor(55, 91, 220);
      pdf.setLineWidth(0.3);
      pdf.roundedRect(checkboxX, checkboxY, checkboxSize, checkboxSize, 0.5, 0.5, 'FD');

      pdf.setDrawColor(255, 255, 255);
      pdf.setLineWidth(0.5);
      pdf.line(checkboxX + 0.6, checkboxY + 1.3, checkboxX + 1.1, checkboxY + 1.9);
      pdf.line(checkboxX + 1.1, checkboxY + 1.9, checkboxX + 2.3, checkboxY + 0.4);

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(7);
      pdf.setTextColor(0, 0, 0);
      const labelText = pdf.splitTextToSize(item, columnWidth - 10);
      pdf.text(labelText[0], checkboxX + checkboxSize + 2, currentY);
      currentY += 4.5;

      if (isLeftColumn) {
        leftY = currentY;
      } else {
        rightY = currentY;
      }
    });

    yPosition = Math.max(leftY, rightY) + 3;
  } else {
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.setTextColor(100, 100, 100);
    pdf.text('No sensory sensitivities indicated', leftX, yPosition);
    yPosition += 8;
  }

  // Draw watermark on top
  addWatermarkOnTop(pdf, pageWidth, pageHeight, watermarkImg);
}

/**
 * Add Comfort Preferences Page 2 (Page 7)
 */
function addComfortPreferencesPage2(
  pdf: jsPDF,
  data: NewPatientFormData,
  pageWidth: number,
  pageHeight: number,
  margin: number,
  logoImg: HTMLImageElement | null,
  watermarkImg: HTMLImageElement | null,
  logoHeight: number,
  formDate: string
) {
  pdf.addPage();
  addWatermark(pdf, pageWidth, pageHeight, watermarkImg);
  addHeaderAndFooter(pdf, pageWidth, pageHeight, margin, formDate, logoImg, null, logoHeight);

  const topMargin = 5;
  let yPosition = topMargin + logoHeight + 1 + 8 + 6 + 6 + 10;

  // Title
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(14);
  pdf.setTextColor(55, 91, 220);
  pdf.text('Patient Comfort Preferences (continued)', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 10;

  const columnWidth = (pageWidth - 2 * margin - 10) / 2;
  const leftX = margin + 5;
  const rightX = margin + 5 + columnWidth + 5;

  // === PHYSICAL COMFORT NEEDS BOX ===
  const physicalItems = data.physicalComfort || [];
  const hasPhysical = physicalItems.length > 0;

  let physicalHeight = 12;
  if (hasPhysical) {
    const itemsPerColumn = Math.ceil(physicalItems.length / 2);
    physicalHeight += (itemsPerColumn * 4.5) + 3;
  } else {
    physicalHeight += 8;
  }

  pdf.setDrawColor(55, 91, 220);
  pdf.setFillColor(240, 245, 255);
  pdf.setLineWidth(0.2);
  pdf.saveGraphicsState();
  pdf.setGState(new pdf.GState({ opacity: 0.85 }));
  pdf.roundedRect(margin, yPosition, pageWidth - 2 * margin, physicalHeight, 2, 2, 'FD');
  pdf.restoreGraphicsState();

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(10);
  pdf.setTextColor(55, 91, 220);
  yPosition += 6;
  pdf.text('Physical Comfort Needs', margin + 5, yPosition);
  yPosition += 6;

  if (hasPhysical) {
    let leftY = yPosition;
    let rightY = yPosition;
    const itemsPerColumn = Math.ceil(physicalItems.length / 2);

    physicalItems.forEach((item, index) => {
      const isLeftColumn = index < itemsPerColumn;
      const xPos = isLeftColumn ? leftX : rightX;
      let currentY = isLeftColumn ? leftY : rightY;

      const checkboxSize = 3;
      const checkboxX = xPos;
      const checkboxY = currentY - 2.5;

      pdf.setDrawColor(55, 91, 220);
      pdf.setFillColor(55, 91, 220);
      pdf.setLineWidth(0.3);
      pdf.roundedRect(checkboxX, checkboxY, checkboxSize, checkboxSize, 0.5, 0.5, 'FD');

      pdf.setDrawColor(255, 255, 255);
      pdf.setLineWidth(0.5);
      pdf.line(checkboxX + 0.6, checkboxY + 1.3, checkboxX + 1.1, checkboxY + 1.9);
      pdf.line(checkboxX + 1.1, checkboxY + 1.9, checkboxX + 2.3, checkboxY + 0.4);

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(7);
      pdf.setTextColor(0, 0, 0);
      const labelText = pdf.splitTextToSize(item, columnWidth - 10);
      pdf.text(labelText[0], checkboxX + checkboxSize + 2, currentY);
      currentY += 4.5;

      if (isLeftColumn) {
        leftY = currentY;
      } else {
        rightY = currentY;
      }
    });

    yPosition = Math.max(leftY, rightY) + 3;
  } else {
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.setTextColor(100, 100, 100);
    pdf.text('No physical comfort needs indicated', leftX, yPosition);
    yPosition += 8;
  }

  // === SERVICE PREFERENCES BOX ===
  yPosition += 5;

  const serviceItems = data.servicePreferences || [];
  const hasService = serviceItems.length > 0;

  let serviceHeight = 12;
  if (hasService) {
    const itemsPerColumn = Math.ceil(serviceItems.length / 2);
    serviceHeight += (itemsPerColumn * 4.5) + 3;
  } else {
    serviceHeight += 8;
  }

  pdf.setDrawColor(55, 91, 220);
  pdf.setFillColor(240, 245, 255);
  pdf.setLineWidth(0.2);
  pdf.saveGraphicsState();
  pdf.setGState(new pdf.GState({ opacity: 0.85 }));
  pdf.roundedRect(margin, yPosition, pageWidth - 2 * margin, serviceHeight, 2, 2, 'FD');
  pdf.restoreGraphicsState();

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(10);
  pdf.setTextColor(55, 91, 220);
  yPosition += 6;
  pdf.text('Service Preferences', margin + 5, yPosition);
  yPosition += 6;

  if (hasService) {
    let leftY = yPosition;
    let rightY = yPosition;
    const itemsPerColumn = Math.ceil(serviceItems.length / 2);

    serviceItems.forEach((item, index) => {
      const isLeftColumn = index < itemsPerColumn;
      const xPos = isLeftColumn ? leftX : rightX;
      let currentY = isLeftColumn ? leftY : rightY;

      const checkboxSize = 3;
      const checkboxX = xPos;
      const checkboxY = currentY - 2.5;

      pdf.setDrawColor(55, 91, 220);
      pdf.setFillColor(55, 91, 220);
      pdf.setLineWidth(0.3);
      pdf.roundedRect(checkboxX, checkboxY, checkboxSize, checkboxSize, 0.5, 0.5, 'FD');

      pdf.setDrawColor(255, 255, 255);
      pdf.setLineWidth(0.5);
      pdf.line(checkboxX + 0.6, checkboxY + 1.3, checkboxX + 1.1, checkboxY + 1.9);
      pdf.line(checkboxX + 1.1, checkboxY + 1.9, checkboxX + 2.3, checkboxY + 0.4);

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(7);
      pdf.setTextColor(0, 0, 0);
      const labelText = pdf.splitTextToSize(item, columnWidth - 10);
      pdf.text(labelText[0], checkboxX + checkboxSize + 2, currentY);
      currentY += 4.5;

      if (isLeftColumn) {
        leftY = currentY;
      } else {
        rightY = currentY;
      }
    });

    yPosition = Math.max(leftY, rightY) + 3;
  } else {
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.setTextColor(100, 100, 100);
    pdf.text('No service preferences indicated', leftX, yPosition);
    yPosition += 8;
  }

  // === ADDITIONAL CONCERNS OR PREFERENCES BOX ===
  yPosition += 5;

  const hasOtherConcerns = data.otherConcerns && data.otherConcerns.trim().length > 0;

  let concernsHeight = 12; // Header
  if (hasOtherConcerns) {
    const concernLines = pdf.splitTextToSize(data.otherConcerns, pageWidth - 2 * margin - 10);
    concernsHeight += 4 + (concernLines.length * 3.5) + 3;
  } else {
    concernsHeight += 8;
  }

  pdf.setDrawColor(55, 91, 220);
  pdf.setFillColor(240, 245, 255);
  pdf.setLineWidth(0.2);
  pdf.saveGraphicsState();
  pdf.setGState(new pdf.GState({ opacity: 0.85 }));
  pdf.roundedRect(margin, yPosition, pageWidth - 2 * margin, concernsHeight, 2, 2, 'FD');
  pdf.restoreGraphicsState();

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(10);
  pdf.setTextColor(55, 91, 220);
  yPosition += 6;
  pdf.text('Additional Concerns or Preferences', margin + 5, yPosition);
  yPosition += 6;

  if (hasOtherConcerns) {
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(7);
    pdf.setTextColor(100, 100, 100);
    pdf.text('Please describe any other concerns, preferences, or special needs:', leftX, yPosition);
    yPosition += 4;

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.setTextColor(0, 0, 0);
    const concernLines = pdf.splitTextToSize(data.otherConcerns, pageWidth - 2 * margin - 10);
    concernLines.forEach((line: string) => {
      pdf.text(line, leftX, yPosition);
      yPosition += 3.5;
    });
    yPosition += 3;
  } else {
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.setTextColor(100, 100, 100);
    pdf.text('No additional concerns or preferences indicated', leftX, yPosition);
    yPosition += 8;
  }

  // === ALERTS ===
  // Get all preference flags
  const hasAnxiety = (data.anxietyControl || []).length > 0;
  const hasPain = (data.painInjection || []).length > 0;
  const hasComm = (data.communication || []).length > 0;
  const hasSensory = (data.sensorySensitivities || []).length > 0;

  // Personalized Care Plan alert (always show if any preferences selected)
  const hasAnyPreferences = hasAnxiety || hasPain || hasComm || hasSensory || hasPhysical || hasService;

  if (hasAnyPreferences) {
    yPosition += 5;

    const carePlanText = 'Based on your preferences, we will create a customized approach to ensure your comfort during treatment. Our team will review these preferences before your visit.';
    const carePlanLines = pdf.splitTextToSize(carePlanText, pageWidth - 2 * margin - 10);
    const carePlanHeight = 6 + 4 + (carePlanLines.length * 3.5) + 3;

    pdf.setDrawColor(59, 130, 246);
    pdf.setFillColor(239, 246, 255);
    pdf.setLineWidth(0.3);
    pdf.saveGraphicsState();
    pdf.setGState(new pdf.GState({ opacity: 0.9 }));
    pdf.roundedRect(margin, yPosition, pageWidth - 2 * margin, carePlanHeight, 2, 2, 'FD');
    pdf.restoreGraphicsState();

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8);
    pdf.setTextColor(30, 58, 138);
    yPosition += 6;
    pdf.text('Personalized Care Plan:', margin + 5, yPosition);
    yPosition += 4;

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7);
    pdf.setTextColor(0, 0, 0);
    carePlanLines.forEach((line: string) => {
      pdf.text(line, margin + 5, yPosition);
      yPosition += 3.5;
    });

    yPosition += 3;
  }

  // Anxiety Support alert
  if (hasAnxiety) {
    yPosition += 2;

    const anxietySupportText = 'We understand dental anxiety and have many options to help you feel comfortable, including sedation options, relaxation techniques, and taking breaks as needed.';
    const anxietySupportLines = pdf.splitTextToSize(anxietySupportText, pageWidth - 2 * margin - 10);
    const anxietySupportHeight = 6 + 4 + (anxietySupportLines.length * 3.5) + 3;

    pdf.setDrawColor(34, 197, 94);
    pdf.setFillColor(240, 253, 244);
    pdf.setLineWidth(0.3);
    pdf.saveGraphicsState();
    pdf.setGState(new pdf.GState({ opacity: 0.9 }));
    pdf.roundedRect(margin, yPosition, pageWidth - 2 * margin, anxietySupportHeight, 2, 2, 'FD');
    pdf.restoreGraphicsState();

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8);
    pdf.setTextColor(22, 101, 52);
    yPosition += 6;
    pdf.text('Anxiety Support:', margin + 5, yPosition);
    yPosition += 4;

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7);
    pdf.setTextColor(0, 0, 0);
    anxietySupportLines.forEach((line: string) => {
      pdf.text(line, margin + 5, yPosition);
      yPosition += 3.5;
    });

    yPosition += 3;
  }

  // Draw watermark on top
  addWatermarkOnTop(pdf, pageWidth, pageHeight, watermarkImg);
}

/**
 * Add Office Policies Page (Page 8)
 */
function addOfficePoliciesPage(
  pdf: jsPDF,
  data: NewPatientFormData,
  pageWidth: number,
  pageHeight: number,
  margin: number,
  logoImg: HTMLImageElement | null,
  watermarkImg: HTMLImageElement | null,
  logoHeight: number,
  formDate: string
) {
  pdf.addPage();
  addWatermark(pdf, pageWidth, pageHeight, watermarkImg);
  addHeaderAndFooter(pdf, pageWidth, pageHeight, margin, formDate, logoImg, null, logoHeight);

  const topMargin = 5;
  let yPosition = topMargin + logoHeight + 1 + 8 + 6 + 6 + 10;

  // Title
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(14);
  pdf.setTextColor(55, 91, 220);
  pdf.text('Office Policies & Procedures', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 8;

  // === POLICY ACKNOWLEDGMENTS BOX ===
  const policies = [
    {
      key: 'treatmentBasedOnHealth',
      title: 'Treatment Based on Health History',
      description: 'I understand that treatment recommendations are based on my complete health history and current condition. I agree to provide accurate and complete information.',
      value: data.acknowledgments?.treatmentBasedOnHealth
    },
    {
      key: 'financialResponsibility',
      title: 'Financial Responsibility',
      description: 'I understand that I am financially responsible for all treatment provided, regardless of insurance coverage. Payment is due at the time of service unless other arrangements have been made.',
      value: data.acknowledgments?.financialResponsibility
    },
    {
      key: 'insuranceCourtesy',
      title: 'Insurance as a Courtesy',
      description: 'I understand that insurance filing is a courtesy service. I am responsible for knowing my benefits and any limitations. I will pay any deductibles, co-pays, or non-covered services.',
      value: data.acknowledgments?.insuranceCourtesy
    },
    {
      key: 'punctualityImportance',
      title: 'Punctuality and Scheduling',
      description: 'I understand the importance of keeping scheduled appointments. I will arrive on time and provide at least 24 hours notice for cancellations to avoid charges.',
      value: data.acknowledgments?.punctualityImportance
    },
    {
      key: 'lateFeePolicy',
      title: 'Late Fee Policy',
      description: 'I understand that appointments cancelled with less than 24 hours notice or missed appointments may result in a fee. Emergency situations will be considered on a case-by-case basis.',
      value: data.acknowledgments?.lateFeePolicy
    },
    {
      key: 'depositRequirement',
      title: 'Deposit Requirements',
      description: 'I understand that certain treatments may require a deposit before scheduling. This deposit will be applied to the final treatment cost.',
      value: data.acknowledgments?.depositRequirement
    },
    {
      key: 'emergencyDefinition',
      title: 'Emergency Definition',
      description: 'I understand what constitutes a dental emergency (severe pain, trauma, swelling, bleeding) and the appropriate procedures for seeking emergency care.',
      value: data.acknowledgments?.emergencyDefinition
    },
    {
      key: 'emergencyProcedure',
      title: 'Emergency Contact Procedures',
      description: 'I understand the office emergency contact procedures and after-hours care instructions. I have received information about emergency care protocols.',
      value: data.acknowledgments?.emergencyProcedure
    }
  ];

  // Static height for Policy Acknowledgments box - adjust this value manually to fit content
  const totalPolicyHeight = 110; // Manually set height (increase/decrease as needed)

  const policyBoxStartY = yPosition;

  pdf.setDrawColor(55, 91, 220);
  pdf.setFillColor(240, 245, 255);
  pdf.setLineWidth(0.2);
  pdf.saveGraphicsState();
  pdf.setGState(new pdf.GState({ opacity: 0.85 }));
  pdf.roundedRect(margin, policyBoxStartY, pageWidth - 2 * margin, totalPolicyHeight, 2, 2, 'FD');
  pdf.restoreGraphicsState();

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(11);
  pdf.setTextColor(55, 91, 220);
  yPosition += 6;
  pdf.text('Policy Acknowledgments', margin + 5, yPosition);
  yPosition += 6;

  // Display each policy
  policies.forEach(policy => {
    const checkboxSize = 3;
    const checkboxX = margin + 5;
    const checkboxY = yPosition - 2.5;

    // Checkbox
    if (policy.value) {
      pdf.setDrawColor(55, 91, 220);
      pdf.setFillColor(55, 91, 220);
      pdf.setLineWidth(0.3);
      pdf.roundedRect(checkboxX, checkboxY, checkboxSize, checkboxSize, 0.5, 0.5, 'FD');

      // Checkmark
      pdf.setDrawColor(255, 255, 255);
      pdf.setLineWidth(0.4);
      pdf.line(checkboxX + 0.6, checkboxY + 1.3, checkboxX + 1.1, checkboxY + 1.9);
      pdf.line(checkboxX + 1.1, checkboxY + 1.9, checkboxX + 2.3, checkboxY + 0.4);
    } else {
      pdf.setDrawColor(150, 150, 150);
      pdf.setFillColor(255, 255, 255);
      pdf.setLineWidth(0.3);
      pdf.roundedRect(checkboxX, checkboxY, checkboxSize, checkboxSize, 0.5, 0.5, 'FD');
    }

    // Policy title
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8.5);
    pdf.setTextColor(0, 0, 0);
    pdf.text(policy.title, checkboxX + checkboxSize + 2, yPosition);
    yPosition += 4;

    // Policy description
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7.5);
    pdf.setTextColor(60, 60, 60);
    const descLines = pdf.splitTextToSize(policy.description, pageWidth - 2 * margin - 15);
    descLines.forEach((line: string) => {
      pdf.text(line, checkboxX + checkboxSize + 2, yPosition);
      yPosition += 3.5;
    });
    yPosition += 1.5;
  });

  // Set yPosition to the end of the policy box
  yPosition = policyBoxStartY + totalPolicyHeight;

  // === FINANCIAL INFORMATION BOX ===
  yPosition += 1;

  // Calculate financial box height
  const financialText = 'I would like to receive detailed information about treatment costs, payment options, and financing plans before beginning treatment.';
  const financialLines = pdf.splitTextToSize(financialText, pageWidth - 2 * margin - 15);
  const financialHeight = 10 + (financialLines.length * 3) + 2;

  const financialBoxStartY = yPosition;

  pdf.setDrawColor(55, 91, 220);
  pdf.setFillColor(240, 245, 255);
  pdf.setLineWidth(0.2);
  pdf.saveGraphicsState();
  pdf.setGState(new pdf.GState({ opacity: 0.85 }));
  pdf.roundedRect(margin, financialBoxStartY, pageWidth - 2 * margin, financialHeight, 2, 2, 'FD');
  pdf.restoreGraphicsState();

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(10);
  pdf.setTextColor(55, 91, 220);
  yPosition += 5;
  pdf.text('Financial Information', margin + 5, yPosition);
  yPosition += 5;

  const checkboxSize = 3;
  const checkboxX = margin + 5;
  const checkboxY = yPosition - 2.5;

  // Checkbox
  if (data.wantsFinancialInfo) {
    pdf.setDrawColor(55, 91, 220);
    pdf.setFillColor(55, 91, 220);
    pdf.setLineWidth(0.3);
    pdf.roundedRect(checkboxX, checkboxY, checkboxSize, checkboxSize, 0.5, 0.5, 'FD');

    // Checkmark
    pdf.setDrawColor(255, 255, 255);
    pdf.setLineWidth(0.4);
    pdf.line(checkboxX + 0.6, checkboxY + 1.3, checkboxX + 1.1, checkboxY + 1.9);
    pdf.line(checkboxX + 1.1, checkboxY + 1.9, checkboxX + 2.3, checkboxY + 0.4);
  } else {
    pdf.setDrawColor(150, 150, 150);
    pdf.setFillColor(255, 255, 255);
    pdf.setLineWidth(0.3);
    pdf.roundedRect(checkboxX, checkboxY, checkboxSize, checkboxSize, 0.5, 0.5, 'FD');
  }

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  pdf.setTextColor(0, 0, 0);
  financialLines.forEach((line: string) => {
    pdf.text(line, checkboxX + checkboxSize + 2, yPosition);
    yPosition += 3;
  });

  // Set yPosition to the end of the financial box
  yPosition = financialBoxStartY + financialHeight;

  // === IMPORTANT POLICY INFORMATION BOX ===
  yPosition += 1;

  // Calculate height for important info box
  const schedText = 'We reserve appointment times specifically for you. Please arrive 15 minutes early for your first visit to complete any remaining paperwork.';
  const schedLines = pdf.splitTextToSize(schedText, pageWidth - 2 * margin - 10);
  const paymentText = 'We accept cash, checks, and major credit cards. We also offer financing options through CareCredit and other approved providers.';
  const paymentLines = pdf.splitTextToSize(paymentText, pageWidth - 2 * margin - 10);
  const emergencyText = 'For after-hours emergencies, please call our main number. You will receive instructions on how to reach the on-call doctor.';
  const emergencyLines = pdf.splitTextToSize(emergencyText, pageWidth - 2 * margin - 10);

  const importantInfoHeight = 10 + // Header
    (3.5 + schedLines.length * 2.8 + 2.5) + // Appointment Scheduling
    (3.5 + paymentLines.length * 2.8 + 2.5) + // Payment Options
    (3.5 + emergencyLines.length * 2.8) + // Emergency Care
    2; // Bottom padding

  const importantBoxStartY = yPosition;

  pdf.setDrawColor(59, 130, 246);
  pdf.setFillColor(239, 246, 255);
  pdf.setLineWidth(0.2);
  pdf.saveGraphicsState();
  pdf.setGState(new pdf.GState({ opacity: 0.85 }));
  pdf.roundedRect(margin, importantBoxStartY, pageWidth - 2 * margin, importantInfoHeight, 2, 2, 'FD');
  pdf.restoreGraphicsState();

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(10);
  pdf.setTextColor(30, 58, 138);
  yPosition += 5;
  pdf.text('Important Policy Information', margin + 5, yPosition);
  yPosition += 5;

  // Appointment Scheduling
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8);
  pdf.setTextColor(0, 0, 0);
  pdf.text('Appointment Scheduling:', margin + 5, yPosition);
  yPosition += 3.5;

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(7.5);
  pdf.setTextColor(60, 60, 60);
  schedLines.forEach((line: string) => {
    pdf.text(line, margin + 5, yPosition);
    yPosition += 2.8;
  });
  yPosition += 2.5;

  // Payment Options
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8);
  pdf.setTextColor(0, 0, 0);
  pdf.text('Payment Options:', margin + 5, yPosition);
  yPosition += 3.5;

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(7.5);
  pdf.setTextColor(60, 60, 60);
  paymentLines.forEach((line: string) => {
    pdf.text(line, margin + 5, yPosition);
    yPosition += 2.8;
  });
  yPosition += 2.5;

  // Emergency Care
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8);
  pdf.setTextColor(0, 0, 0);
  pdf.text('Emergency Care:', margin + 5, yPosition);
  yPosition += 3.5;

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(7.5);
  pdf.setTextColor(60, 60, 60);
  emergencyLines.forEach((line: string) => {
    pdf.text(line, margin + 5, yPosition);
    yPosition += 2.8;
  });

  // Set yPosition to the end of the important info box
  yPosition = importantBoxStartY + importantInfoHeight;

  // === ALERTS ===
  const totalAcknowledgments = policies.length;
  const completedAcknowledgments = policies.filter(p => p.value).length;
  const allAcknowledged = completedAcknowledgments === totalAcknowledgments;

  if (!allAcknowledged) {
    yPosition += 1;

    const displayText = `Please review and acknowledge all office policies before proceeding. You have completed ${completedAcknowledgments} of ${totalAcknowledgments} required acknowledgments.`;
    const displayLines = pdf.splitTextToSize(displayText, pageWidth - 2 * margin - 10);
    const incompleteHeight = 5 + 3.5 + (displayLines.length * 2.8) + 2;

    const incompleteBoxStartY = yPosition;

    pdf.setDrawColor(251, 146, 60);
    pdf.setFillColor(255, 247, 237);
    pdf.setLineWidth(0.3);
    pdf.saveGraphicsState();
    pdf.setGState(new pdf.GState({ opacity: 0.9 }));
    pdf.roundedRect(margin, incompleteBoxStartY, pageWidth - 2 * margin, incompleteHeight, 2, 2, 'FD');
    pdf.restoreGraphicsState();

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(7);
    pdf.setTextColor(154, 52, 18);
    yPosition += 5;
    pdf.text('Incomplete Acknowledgments:', margin + 5, yPosition);
    yPosition += 3.5;

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(6.5);
    pdf.setTextColor(0, 0, 0);
    displayLines.forEach((line: string) => {
      pdf.text(line, margin + 5, yPosition);
      yPosition += 2.8;
    });

    // Set yPosition to the end of the incomplete box
    yPosition = incompleteBoxStartY + incompleteHeight;
  }

  if (allAcknowledged) {
    yPosition += 3;

    const displayText = 'Thank you for reviewing and acknowledging our office policies. This helps ensure a smooth and efficient treatment experience.';
    const displayLines = pdf.splitTextToSize(displayText, pageWidth - 2 * margin - 10);
    const completeHeight = 5 + 3.5 + (displayLines.length * 2.8) + 2;

    const completeBoxStartY = yPosition;

    pdf.setDrawColor(34, 197, 94);
    pdf.setFillColor(240, 253, 244);
    pdf.setLineWidth(0.3);
    pdf.saveGraphicsState();
    pdf.setGState(new pdf.GState({ opacity: 0.9 }));
    pdf.roundedRect(margin, completeBoxStartY, pageWidth - 2 * margin, completeHeight, 2, 2, 'FD');
    pdf.restoreGraphicsState();

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8);
    pdf.setTextColor(22, 101, 52);
    yPosition += 5;
    pdf.text('All Policies Acknowledged:', margin + 5, yPosition);
    yPosition += 3.5;

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7.5);
    pdf.setTextColor(0, 0, 0);
    displayLines.forEach((line: string) => {
      pdf.text(line, margin + 5, yPosition);
      yPosition += 2.8;
    });

    // Set yPosition to the end of the complete box
    yPosition = completeBoxStartY + completeHeight;
  }

  if (data.wantsFinancialInfo) {
    yPosition += 2;

    const financialInfoText = 'Financial Information Requested: Our financial coordinator will provide detailed cost estimates and discuss payment options during your consultation.';
    const financialInfoLines = pdf.splitTextToSize(financialInfoText, pageWidth - 2 * margin - 10);
    const financialInfoHeight = 5 + 3.5 + (financialInfoLines.length * 2.8) + 2;

    pdf.setDrawColor(59, 130, 246);
    pdf.setFillColor(239, 246, 255);
    pdf.setLineWidth(0.3);
    pdf.saveGraphicsState();
    pdf.setGState(new pdf.GState({ opacity: 0.9 }));
    pdf.roundedRect(margin, yPosition, pageWidth - 2 * margin, financialInfoHeight, 2, 2, 'FD');
    pdf.restoreGraphicsState();

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8);
    pdf.setTextColor(30, 58, 138);
    yPosition += 5;
    pdf.text('Financial Information Requested:', margin + 5, yPosition);
    yPosition += 3.5;

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7.5);
    pdf.setTextColor(0, 0, 0);
    const displayText = 'Our financial coordinator will provide detailed cost estimates and discuss payment options during your consultation.';
    const displayLines = pdf.splitTextToSize(displayText, pageWidth - 2 * margin - 10);
    displayLines.forEach((line: string) => {
      pdf.text(line, margin + 5, yPosition);
      yPosition += 2.8;
    });

    yPosition += 2;
  }

  // Draw watermark on top
  addWatermarkOnTop(pdf, pageWidth, pageHeight, watermarkImg);
}

/**
 * Add Legal Documentation & Privacy Page (Page 8)
 */
function addLegalDocumentationPage(
  pdf: jsPDF,
  data: NewPatientFormData,
  pageWidth: number,
  pageHeight: number,
  margin: number,
  logoImg: HTMLImageElement | null,
  watermarkImg: HTMLImageElement | null,
  logoHeight: number,
  formDate: string
) {
  pdf.addPage();
  addWatermark(pdf, pageWidth, pageHeight, watermarkImg);
  addHeaderAndFooter(pdf, pageWidth, pageHeight, margin, formDate, logoImg, null, logoHeight);

  const topMargin = 5;
  let yPosition = topMargin + logoHeight + 1 + 8 + 6 + 6 + 6;

  // Title
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(13);
  pdf.setTextColor(55, 91, 220);
  pdf.text('Legal Documentation & Privacy', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 8;

  // === PHOTO & VIDEO AUTHORIZATION BOX ===
  const photoInfoText = [
    'Clinical Documentation: Photos may be taken for your treatment records, progress tracking, and case documentation.',
    'Educational Purposes: With your permission, de-identified images may be used for staff training, professional education, or case presentations.',
    'Marketing Materials: With explicit consent, images may be used in practice marketing materials, website, or social media.',
    'Your Rights: You may withdraw consent at any time. Refusal will not affect your treatment quality.'
  ];

  // Calculate height for photo info box
  let photoInfoHeight = 12; // Header + subtitle
  photoInfoText.forEach(text => {
    const lines = pdf.splitTextToSize(text, pageWidth - 2 * margin - 10);
    photoInfoHeight += (lines.length * 2.8) + 1.5;
  });
  photoInfoHeight += 13; // Space for authorization choice

  const photoBoxStartY = yPosition;

  pdf.setDrawColor(59, 130, 246);
  pdf.setFillColor(239, 246, 255);
  pdf.setLineWidth(0.2);
  pdf.saveGraphicsState();
  pdf.setGState(new pdf.GState({ opacity: 0.85 }));
  pdf.roundedRect(margin, photoBoxStartY, pageWidth - 2 * margin, photoInfoHeight, 2, 2, 'FD');
  pdf.restoreGraphicsState();

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(10);
  pdf.setTextColor(30, 58, 138);
  yPosition += 4;
  pdf.text('Photo & Video Authorization', margin + 5, yPosition);
  yPosition += 5.5;

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(9);
  pdf.setTextColor(30, 58, 138);
  pdf.text('Photo & Video Usage Information', margin + 5, yPosition);
  yPosition += 4;

  // Photo info text
  pdf.setFontSize(7.5);
  pdf.setTextColor(60, 60, 60);

  photoInfoText.forEach(text => {
    // Split the text into label and content
    const colonIndex = text.indexOf(':');
    if (colonIndex !== -1) {
      const label = text.substring(0, colonIndex + 1);
      const content = text.substring(colonIndex + 1).trim();

      // Render bold label
      pdf.setFont('helvetica', 'bold');
      const labelWidth = pdf.getTextWidth(label);
      pdf.text(label, margin + 5, yPosition);

      // Render normal content
      pdf.setFont('helvetica', 'normal');
      const lines = pdf.splitTextToSize(content, pageWidth - 2 * margin - 10 - labelWidth - 1);
      lines.forEach((line: string, index: number) => {
        if (index === 0) {
          pdf.text(line, margin + 5 + labelWidth + 1, yPosition);
        } else {
          pdf.text(line, margin + 5, yPosition);
        }
        yPosition += 2.8;
      });
    } else {
      pdf.setFont('helvetica', 'normal');
      const lines = pdf.splitTextToSize(text, pageWidth - 2 * margin - 10);
      lines.forEach((line: string) => {
        pdf.text(line, margin + 5, yPosition);
        yPosition += 2.8;
      });
    }
    yPosition += 1.5;
  });

  yPosition += 1.5;

  // Authorization choice
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8);
  pdf.setTextColor(0, 0, 0);

  const agreeCheckbox = data.photoVideoAuth === 'agree';
  const disagreeCheckbox = data.photoVideoAuth === 'disagree';

  // I AGREE checkbox
  const checkboxSize = 3;
  const checkbox1X = margin + 5;
  const checkbox1Y = yPosition - 2.5;

  if (agreeCheckbox) {
    pdf.setDrawColor(59, 130, 246);
    pdf.setFillColor(59, 130, 246);
    pdf.setLineWidth(0.3);
    pdf.roundedRect(checkbox1X, checkbox1Y, checkboxSize, checkboxSize, 0.5, 0.5, 'FD');

    pdf.setDrawColor(255, 255, 255);
    pdf.setLineWidth(0.4);
    pdf.line(checkbox1X + 0.6, checkbox1Y + 1.3, checkbox1X + 1.1, checkbox1Y + 1.9);
    pdf.line(checkbox1X + 1.1, checkbox1Y + 1.9, checkbox1X + 2.3, checkbox1Y + 0.4);
  } else {
    pdf.setDrawColor(150, 150, 150);
    pdf.setFillColor(255, 255, 255);
    pdf.setLineWidth(0.3);
    pdf.roundedRect(checkbox1X, checkbox1Y, checkboxSize, checkboxSize, 0.5, 0.5, 'FD');
  }

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(7.5);
  pdf.setTextColor(0, 0, 0);
  pdf.text('I AGREE', checkbox1X + checkboxSize + 2, yPosition);

  pdf.setFont('helvetica', 'normal');
  const agreeText = 'to allow photos and videos to be taken for clinical documentation, educational purposes, and potential marketing use.';
  const agreeLines = pdf.splitTextToSize(agreeText, pageWidth - 2 * margin - 25);
  let agreeY = yPosition;
  agreeLines.forEach((line: string, index: number) => {
    pdf.text(line, checkbox1X + checkboxSize + 15, agreeY);
    agreeY += 3;
  });

  yPosition = agreeY + 2;

  // I DO NOT AGREE checkbox
  const checkbox2X = margin + 5;
  const checkbox2Y = yPosition - 2.5;

  if (disagreeCheckbox) {
    pdf.setDrawColor(59, 130, 246);
    pdf.setFillColor(59, 130, 246);
    pdf.setLineWidth(0.3);
    pdf.roundedRect(checkbox2X, checkbox2Y, checkboxSize, checkboxSize, 0.5, 0.5, 'FD');

    pdf.setDrawColor(255, 255, 255);
    pdf.setLineWidth(0.4);
    pdf.line(checkbox2X + 0.6, checkbox2Y + 1.3, checkbox2X + 1.1, checkbox2Y + 1.9);
    pdf.line(checkbox2X + 1.1, checkbox2Y + 1.9, checkbox2X + 2.3, checkbox2Y + 0.4);
  } else {
    pdf.setDrawColor(150, 150, 150);
    pdf.setFillColor(255, 255, 255);
    pdf.setLineWidth(0.3);
    pdf.roundedRect(checkbox2X, checkbox2Y, checkboxSize, checkboxSize, 0.5, 0.5, 'FD');
  }

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(7.5);
  pdf.setTextColor(0, 0, 0);
  pdf.text('I DO NOT AGREE', checkbox2X + checkboxSize + 2, yPosition);

  pdf.setFont('helvetica', 'normal');
  const disagreeText = 'to photos and videos beyond what is absolutely necessary for my clinical treatment and documentation.';
  const disagreeLines = pdf.splitTextToSize(disagreeText, pageWidth - 2 * margin - 35);
  let disagreeY = yPosition;
  disagreeLines.forEach((line: string, index: number) => {
    pdf.text(line, checkbox2X + checkboxSize + 25, disagreeY);
    disagreeY += 3;
  });

  yPosition = photoBoxStartY + photoInfoHeight + 2;

  // === HIPAA PRIVACY ACKNOWLEDGMENT BOX ===
  const hipaaInfoText = [
    'Protected Information: Your health information is protected by federal privacy laws (HIPAA).',
    'How We Use Information: We use your health information for treatment, payment, and healthcare operations.',
    'Your Rights: You have the right to access, amend, and request restrictions on your health information.',
    'Our Responsibilities: We are required to maintain privacy of your health information and notify you of breaches.',
    'Full Notice: You will receive our complete Notice of Privacy Practices, which details all your rights and our obligations.'
  ];

  // Calculate height for HIPAA box
  let hipaaHeight = 8; // Header
  hipaaInfoText.forEach(text => {
    const lines = pdf.splitTextToSize(text, pageWidth - 2 * margin - 10);
    hipaaHeight += (lines.length * 2.8) + 1.5;
  });
  hipaaHeight += 17; // Space for checkboxes

  const hipaaBoxStartY = yPosition;

  pdf.setDrawColor(34, 197, 94);
  pdf.setFillColor(240, 253, 244);
  pdf.setLineWidth(0.2);
  pdf.saveGraphicsState();
  pdf.setGState(new pdf.GState({ opacity: 0.85 }));
  pdf.roundedRect(margin, hipaaBoxStartY, pageWidth - 2 * margin, hipaaHeight, 2, 2, 'FD');
  pdf.restoreGraphicsState();

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(10);
  pdf.setTextColor(22, 101, 52);
  yPosition += 4;
  pdf.text('HIPAA Privacy Acknowledgment', margin + 5, yPosition);
  yPosition += 5;

  // HIPAA info text
  pdf.setFontSize(7.5);
  pdf.setTextColor(60, 60, 60);

  hipaaInfoText.forEach(text => {
    // Split the text into label and content
    const colonIndex = text.indexOf(':');
    if (colonIndex !== -1) {
      const label = text.substring(0, colonIndex + 1);
      const content = text.substring(colonIndex + 1).trim();

      // Render bold label
      pdf.setFont('helvetica', 'bold');
      const labelWidth = pdf.getTextWidth(label);
      pdf.text(label, margin + 5, yPosition);

      // Render normal content
      pdf.setFont('helvetica', 'normal');
      const lines = pdf.splitTextToSize(content, pageWidth - 2 * margin - 10 - labelWidth - 1);
      lines.forEach((line: string, index: number) => {
        if (index === 0) {
          pdf.text(line, margin + 5 + labelWidth + 1, yPosition);
        } else {
          pdf.text(line, margin + 5, yPosition);
        }
        yPosition += 2.8;
      });
    } else {
      pdf.setFont('helvetica', 'normal');
      const lines = pdf.splitTextToSize(text, pageWidth - 2 * margin - 10);
      lines.forEach((line: string) => {
        pdf.text(line, margin + 5, yPosition);
        yPosition += 2.8;
      });
    }
    yPosition += 1.5;
  });

  yPosition += 2;

  // HIPAA Acknowledgment checkboxes
  const hipaaItems = [
    {
      label: 'I acknowledge that I have received or will receive a copy of this practice\'s Notice of Privacy Practices, which describes how my health information may be used and disclosed.',
      value: data.hipaaAcknowledgment?.receivedNotice
    },
    {
      label: 'I understand my rights regarding my protected health information, including my right to request restrictions, access my records, and file complaints.',
      value: data.hipaaAcknowledgment?.understandsRights
    }
  ];

  hipaaItems.forEach(item => {
    const checkX = margin + 5;
    const checkY = yPosition - 2.5;

    if (item.value) {
      pdf.setDrawColor(34, 197, 94);
      pdf.setFillColor(34, 197, 94);
      pdf.setLineWidth(0.3);
      pdf.roundedRect(checkX, checkY, checkboxSize, checkboxSize, 0.5, 0.5, 'FD');

      pdf.setDrawColor(255, 255, 255);
      pdf.setLineWidth(0.4);
      pdf.line(checkX + 0.6, checkY + 1.3, checkX + 1.1, checkY + 1.9);
      pdf.line(checkX + 1.1, checkY + 1.9, checkX + 2.3, checkY + 0.4);
    } else {
      pdf.setDrawColor(150, 150, 150);
      pdf.setFillColor(255, 255, 255);
      pdf.setLineWidth(0.3);
      pdf.roundedRect(checkX, checkY, checkboxSize, checkboxSize, 0.5, 0.5, 'FD');
    }

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7.5);
    pdf.setTextColor(0, 0, 0);
    const itemLines = pdf.splitTextToSize(item.label, pageWidth - 2 * margin - 15);
    itemLines.forEach((line: string, index: number) => {
      pdf.text(line, checkX + checkboxSize + 2, yPosition + (index * 3));
    });
    yPosition += (itemLines.length * 3) + 3;
  });

  yPosition = hipaaBoxStartY + hipaaHeight + 2;

  // === LEGAL COMPLIANCE & PATIENT RIGHTS BOX ===
  const complianceItems = [
    {
      title: 'Privacy Protection',
      text: 'Your personal and health information is protected by state and federal privacy laws. We maintain strict confidentiality protocols.'
    },
    {
      title: 'Informed Consent',
      text: 'You have the right to be fully informed about your treatment options, risks, and alternatives before consenting to any procedure.'
    },
    {
      title: 'Right to Refuse',
      text: 'You have the right to refuse any treatment or procedure. We will discuss alternative options if you decline recommended treatment.'
    }
  ];

  // Calculate height for compliance box
  let complianceHeight = 7; // Header padding
  complianceItems.forEach(item => {
    const titleLines = pdf.splitTextToSize(item.title, pageWidth - 2 * margin - 16);
    const textLines = pdf.splitTextToSize(item.text, pageWidth - 2 * margin - 16);
    complianceHeight += (titleLines.length * 3.2) + (textLines.length * 2.8) + 3.5;
  });
  complianceHeight += 3; // Bottom padding

  const complianceBoxStartY = yPosition;

  pdf.setDrawColor(99, 102, 241);
  pdf.setFillColor(238, 242, 255);
  pdf.setLineWidth(0.3);
  pdf.saveGraphicsState();
  pdf.setGState(new pdf.GState({ opacity: 0.85 }));
  pdf.roundedRect(margin, complianceBoxStartY, pageWidth - 2 * margin, complianceHeight, 2, 2, 'FD');
  pdf.restoreGraphicsState();

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(10);
  pdf.setTextColor(67, 56, 202);
  yPosition += 4.5;
  pdf.text('Legal Compliance & Patient Rights', margin + 8, yPosition);
  yPosition += 5.5;

  // Compliance items
  complianceItems.forEach((item, index) => {
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8);
    pdf.setTextColor(0, 0, 0);
    pdf.text(item.title, margin + 8, yPosition);
    yPosition += 3.2;

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7.5);
    pdf.setTextColor(60, 60, 60);
    const textLines = pdf.splitTextToSize(item.text, pageWidth - 2 * margin - 16);
    textLines.forEach((line: string) => {
      pdf.text(line, margin + 8, yPosition);
      yPosition += 2.8;
    });

    // Add spacing between items, but not after the last one
    if (index < complianceItems.length - 1) {
      yPosition += 3.5;
    }
  });

  yPosition = complianceBoxStartY + complianceHeight + 2;

  // === STATUS ALERTS ===
  const isPhotoVideoComplete = data.photoVideoAuth === 'agree' || data.photoVideoAuth === 'disagree';
  const isHipaaComplete = data.hipaaAcknowledgment?.receivedNotice && data.hipaaAcknowledgment?.understandsRights;
  const isLegalComplete = isPhotoVideoComplete && isHipaaComplete;

  // Legal Documentation Complete Alert
  if (isLegalComplete) {
    const completeText = 'Legal Documentation Complete: Thank you for completing all required legal documentation and privacy acknowledgments.';
    const completeLines = pdf.splitTextToSize(completeText, pageWidth - 2 * margin - 16);
    const completeHeight = 5 + (completeLines.length * 3) + 2.5;

    pdf.setDrawColor(34, 197, 94);
    pdf.setFillColor(240, 253, 244);
    pdf.setLineWidth(0.3);
    pdf.saveGraphicsState();
    pdf.setGState(new pdf.GState({ opacity: 0.9 }));
    pdf.roundedRect(margin, yPosition, pageWidth - 2 * margin, completeHeight, 2, 2, 'FD');
    pdf.restoreGraphicsState();

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.setTextColor(22, 101, 52);
    yPosition += 4;
    completeLines.forEach((line: string) => {
      pdf.text(line, margin + 8, yPosition);
      yPosition += 3;
    });

    yPosition += 6;
  }

  // Photo/Video Authorization Status
  if (data.photoVideoAuth === 'agree') {
    const photoText = 'Photo/Video Authorization Granted: You have authorized the use of photos and videos for clinical and educational purposes. Additional consent will be obtained for any marketing use.';
    const photoLines = pdf.splitTextToSize(photoText, pageWidth - 2 * margin - 16);
    const photoHeight = 5 + (photoLines.length * 3) + 2.5;

    pdf.setDrawColor(59, 130, 246);
    pdf.setFillColor(239, 246, 255);
    pdf.setLineWidth(0.3);
    pdf.saveGraphicsState();
    pdf.setGState(new pdf.GState({ opacity: 0.9 }));
    pdf.roundedRect(margin, yPosition, pageWidth - 2 * margin, photoHeight, 2, 2, 'FD');
    pdf.restoreGraphicsState();

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.setTextColor(30, 58, 138);
    yPosition += 4;
    photoLines.forEach((line: string) => {
      pdf.text(line, margin + 8, yPosition);
      yPosition += 3;
    });
  }

  // Draw watermark on top
  addWatermarkOnTop(pdf, pageWidth, pageHeight, watermarkImg);
}

/**
 * Add Form Summary & Signature Page (Page 9)
 */
function addSignaturesPage(
  pdf: jsPDF,
  data: NewPatientFormData,
  pageWidth: number,
  pageHeight: number,
  margin: number,
  logoImg: HTMLImageElement | null,
  watermarkImg: HTMLImageElement | null,
  logoHeight: number,
  formDate: string
) {
  pdf.addPage();
  addWatermark(pdf, pageWidth, pageHeight, watermarkImg);
  addHeaderAndFooter(pdf, pageWidth, pageHeight, margin, formDate, logoImg, null, logoHeight);

  const topMargin = 5;
  let yPosition = topMargin + logoHeight + 1 + 8 + 6 + 6 + 6;

  // Title
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(13);
  pdf.setTextColor(55, 91, 220);
  pdf.text('Patient Attestation & Signatures', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 10;

  // === PATIENT ATTESTATION SECTION ===
  // Section header
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(10);
  pdf.setTextColor(37, 99, 235);

  pdf.text('Patient Attestation', margin, yPosition);
  yPosition += 5;

  // Attestation items
  const attestationItems = [
    {
      title: 'Complete Review',
      description: 'I have reviewed all sections of this patient packet and answered all questions to the best of my knowledge.',
      value: data.patientAttestation?.reviewedAll
    },
    {
      title: 'No Omissions',
      description: 'I have not omitted any important medical, dental, or personal information that could affect my treatment.',
      value: data.patientAttestation?.noOmissions
    },
    {
      title: 'Future Updates',
      description: 'I will notify the dental office of any changes to my health status, medications, or contact information.',
      value: data.patientAttestation?.willNotifyChanges
    },
    {
      title: 'Information Accuracy',
      description: 'I certify that all information provided in this form is true, complete, and accurate to the best of my knowledge.',
      value: data.patientAttestation?.informationAccurate
    }
  ];

  attestationItems.forEach((item, index) => {
    const boxStartY = yPosition;
    const boxHeight = 11;

    // Draw light blue background box
    pdf.setDrawColor(59, 130, 246);
    pdf.setFillColor(239, 246, 255);
    pdf.setLineWidth(0.3);
    pdf.roundedRect(margin, boxStartY, pageWidth - 2 * margin, boxHeight, 1.5, 1.5, 'FD');

    // Draw checkbox circle
    const checkboxX = margin + 3;
    const checkboxY = boxStartY + 5.5;
    const checkboxRadius = 2;

    if (item.value) {
      // Filled blue circle with checkmark
      pdf.setDrawColor(59, 130, 246);
      pdf.setFillColor(59, 130, 246);
      pdf.circle(checkboxX, checkboxY, checkboxRadius, 'FD');

      // White checkmark
      pdf.setDrawColor(255, 255, 255);
      pdf.setLineWidth(0.4);
      pdf.line(checkboxX - 0.8, checkboxY, checkboxX - 0.3, checkboxY + 0.7);
      pdf.line(checkboxX - 0.3, checkboxY + 0.7, checkboxX + 1, checkboxY - 1);
    } else {
      // Empty circle
      pdf.setDrawColor(59, 130, 246);
      pdf.setFillColor(255, 255, 255);
      pdf.setLineWidth(0.3);
      pdf.circle(checkboxX, checkboxY, checkboxRadius, 'FD');
    }

    // Title
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8.5);
    pdf.setTextColor(0, 0, 0);
    pdf.text(item.title, checkboxX + 4, boxStartY + 4);

    // Description
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7.5);
    pdf.setTextColor(60, 60, 60);
    const descLines = pdf.splitTextToSize(item.description, pageWidth - 2 * margin - 12);
    descLines.forEach((line: string, lineIndex: number) => {
      pdf.text(line, checkboxX + 4, boxStartY + 7.5 + (lineIndex * 2.8));
    });

    yPosition += boxHeight + 3;
  });

  yPosition += 4;

  // === PATIENT SIGNATURE SECTION ===
  // Draw outer box with light gray background
  const signatureBoxStartY = yPosition;
  const signatureBoxHeight = 40;

  pdf.setDrawColor(220, 220, 220);
  pdf.setFillColor(249, 250, 251);
  pdf.setLineWidth(0.3);
  pdf.roundedRect(margin, signatureBoxStartY, pageWidth - 2 * margin, signatureBoxHeight, 2, 2, 'FD');

  // Left side - "Patient Signature" header and patient details
  const leftColumnX = margin + 5;
  const rightColumnX = pageWidth / 2 + 5;
  let leftYPosition = signatureBoxStartY + 6;

  // "Patient Signature" header (blue)
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(11);
  pdf.setTextColor(59, 130, 246);
  pdf.text('Patient Signature', leftColumnX, leftYPosition);
  leftYPosition += 7;

  // Patient Name label
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8);
  pdf.setTextColor(100, 100, 100);
  pdf.text('Patient Name', leftColumnX, leftYPosition);
  leftYPosition += 4;

  // Patient Name value
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(9);
  pdf.setTextColor(0, 0, 0);
  const patientName = `${data.firstName || ''} ${data.lastName || ''}`.trim() || data.patientNameSignature || 'Test Patient';
  pdf.text(patientName, leftColumnX, leftYPosition);
  leftYPosition += 6;

  // Date/Time label
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8);
  pdf.setTextColor(100, 100, 100);
  pdf.text('Date/Time', leftColumnX, leftYPosition);
  leftYPosition += 4;

  // Date/Time value
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(9);
  pdf.setTextColor(0, 0, 0);
  const formatDateYYYYMMDD = (dateValue: any): string => {
    if (!dateValue) {
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
    const date = new Date(dateValue);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  const signatureDate = formatDateYYYYMMDD(data.date);
  pdf.text(signatureDate, leftColumnX, leftYPosition);

  // Right side - Signature area
  const signatureLineStartX = rightColumnX + 5;
  const signatureLineEndX = pageWidth - margin - 5;
  const signatureLineCenterX = (signatureLineStartX + signatureLineEndX) / 2;

  // "Patient Signature" label (gray, small)
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(7);
  pdf.setTextColor(150, 150, 150);
  pdf.text('Patient Signature', signatureLineCenterX, signatureBoxStartY + 6, { align: 'center' });

  // Add signature image if available (centered)
  if (data.signature) {
    try {
      const signatureWidth = 55;
      const signatureHeight = 18;
      const signatureX = signatureLineCenterX - (signatureWidth / 2);
      const signatureY = signatureBoxStartY + 12;
      pdf.addImage(data.signature, 'PNG', signatureX, signatureY, signatureWidth, signatureHeight);
    } catch (error) {
      console.error('Error adding signature:', error);
    }
  }

  // Signature line
  const signatureLineY = signatureBoxStartY + signatureBoxHeight - 6;
  pdf.setDrawColor(180, 180, 180);
  pdf.setLineWidth(0.3);
  pdf.line(signatureLineStartX, signatureLineY, signatureLineEndX, signatureLineY);

  yPosition = signatureBoxStartY + signatureBoxHeight;

  yPosition += 4;

  // === LEGAL STATEMENT SECTION ===
  // Draw light blue background box
  const legalBoxStartY = yPosition;
  const legalBoxHeight = 45;

  pdf.setDrawColor(191, 219, 254);
  pdf.setFillColor(239, 246, 255);
  pdf.setLineWidth(0.3);
  pdf.roundedRect(margin, legalBoxStartY, pageWidth - 2 * margin, legalBoxHeight, 2, 2, 'FD');

  yPosition += 6;

  // Legal Statement header
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(14);
  pdf.setTextColor(37, 99, 235);

  pdf.text('Legal Statement', margin + 5, yPosition);
  yPosition += 6;

  // "By signing this document, I acknowledge that:"
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(12);
  pdf.setTextColor(37, 99, 235);
  pdf.text('By signing this document, I acknowledge that:', margin + 5, yPosition);
  yPosition += 4;

  // Legal statement items
  const legalStatements = [
    'I have read and understood all sections of this patient packet',
    'All information provided is true and complete to the best of my knowledge',
    'I understand that withholding information may compromise my treatment',
    'I consent to the dental examination and treatment as outlined',
    'I have received and understand the office policies and privacy practices',
    'This signature has the same legal effect as a handwritten signature'
  ];

  legalStatements.forEach(statement => {
    // Bullet point
    pdf.setFillColor(37, 99, 235);
    pdf.circle(margin + 7, yPosition - 1, 0.8, 'F');

    // Statement text
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    pdf.setTextColor(37, 99, 235);
    const lines = pdf.splitTextToSize(statement, pageWidth - 2 * margin - 15);
    lines.forEach((line: string, index: number) => {
      pdf.text(line, margin + 10, yPosition + (index * 3.5));
    });
    yPosition += Math.max(4.5, lines.length * 3.5);
  });

  yPosition = legalBoxStartY + legalBoxHeight + 3;

  // === FORM COMPLETE MESSAGE ===
  const completeBoxHeight = 10;

  pdf.setDrawColor(34, 197, 94);
  pdf.setFillColor(240, 253, 244);
  pdf.setLineWidth(0.3);
  pdf.roundedRect(margin, yPosition, pageWidth - 2 * margin, completeBoxHeight, 2, 2, 'FD');

  // Form Complete text
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8);
  pdf.setTextColor(22, 101, 52);
  const formCompleteLabel = 'Form Complete: ';
  pdf.text(formCompleteLabel, margin + 5, yPosition + 4);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(7.5);
  pdf.setTextColor(22, 101, 52);
  const completeText = 'Thank you for completing the New Patient Packet. Your information has been recorded and will be reviewed by our clinical team before your appointment.';

  // Calculate available width for the first line (after "Form Complete: ")
  const labelWidth = pdf.getTextWidth(formCompleteLabel);
  const firstLineMaxWidth = pageWidth - 2 * margin - 15 - labelWidth;
  const remainingLinesMaxWidth = pageWidth - 2 * margin - 15;

  // Split text manually to handle first line differently
  const words = completeText.split(' ');
  const lines: string[] = [];
  let currentLine = '';
  let isFirstLine = true;

  words.forEach((word) => {
    const testLine = currentLine ? currentLine + ' ' + word : word;
    const maxWidth = isFirstLine ? firstLineMaxWidth : remainingLinesMaxWidth;
    const testWidth = pdf.getTextWidth(testLine);

    if (testWidth > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
      isFirstLine = false;
    } else {
      currentLine = testLine;
    }
  });
  if (currentLine) {
    lines.push(currentLine);
  }

  // Render the lines
  lines.forEach((line: string, index: number) => {
    if (index === 0) {
      pdf.text(line, margin + 5 + labelWidth + 3, yPosition + 4);
    } else {
      pdf.text(line, margin + 5, yPosition + 4 + (index * 3));
    }
  });

  yPosition += completeBoxHeight + 3;

  // === FORM COMPLETION SUMMARY ===
  const summaryBoxHeight = 20;

  pdf.setDrawColor(34, 197, 94);
  pdf.setFillColor(240, 253, 244);
  pdf.setLineWidth(0.3);
  pdf.roundedRect(margin, yPosition, pageWidth - 2 * margin, summaryBoxHeight, 2, 2, 'FD');

  yPosition += 4;

  // Summary header
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(9);
  pdf.setTextColor(22, 101, 52);
  pdf.text('Form Completion Summary', margin + 5, yPosition);
  yPosition += 5;

  // Summary details - two columns
  const summaryLeftX = margin + 5;
  const summaryRightX = pageWidth / 2 + 10;

  // Patient Name
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(7.5);
  pdf.setTextColor(22, 101, 52);
  pdf.text('Patient Name:', summaryLeftX, yPosition);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(7.5);
  const summaryPatientName = `${data.firstName || ''} ${data.lastName || ''}`.trim() || 'Test Patient';
  pdf.text(summaryPatientName, summaryLeftX + 22, yPosition);

  // Form Status
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(7.5);
  pdf.text('Form Status:', summaryRightX, yPosition);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(7.5);
  pdf.text('Complete', summaryRightX + 20, yPosition);
  yPosition += 4;

  // Completion Date
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(7.5);
  pdf.text('Completion Date:', summaryLeftX, yPosition);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(7.5);
  const completionDate = data.date ? new Date(data.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'November 10, 2025';
  pdf.text(completionDate, summaryLeftX + 28, yPosition);

  // Signature Status
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(7.5);
  pdf.text('Signature Status:', summaryRightX, yPosition);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(7.5);
  pdf.text('Digitally Signed', summaryRightX + 26, yPosition);
  yPosition += 5;

  // Footer note
  pdf.setFont('helvetica', 'italic');
  pdf.setFontSize(7);
  pdf.setTextColor(22, 101, 52);
  pdf.text('This completed form will be securely stored in your patient record and reviewed by our clinical team.', margin + 5, yPosition);

  // Draw watermark on top
  addWatermarkOnTop(pdf, pageWidth, pageHeight, watermarkImg);
}

