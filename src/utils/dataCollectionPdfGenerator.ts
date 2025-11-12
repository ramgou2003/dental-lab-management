import jsPDF from 'jspdf';

export interface DataCollectionPdfData {
  patientName: string;
  collectionDate: string;
  reasonsForCollection: string[];
  customReason?: string;
  currentUpperAppliance?: string;
  currentLowerAppliance?: string;
  preSurgicalPictures?: boolean | null;
  surgicalPictures?: boolean | null;
  followUpPictures?: boolean | null;
  fracturedAppliancePictures?: boolean | null;
  cbctTaken?: boolean | null;
  preSurgicalJawRecordsUpper?: boolean;
  preSurgicalJawRecordsLower?: boolean;
  facialScan?: boolean;
  jawRecordsUpper?: boolean;
  jawRecordsLower?: boolean;
  tissueScanUpper?: boolean;
  tissueScanLower?: boolean;
  photogrammetryUpper?: boolean;
  photogrammetryLower?: boolean;
  dcRefScanUpper?: boolean;
  dcRefScanLower?: boolean;
  appliance360Upper?: boolean;
  appliance360Lower?: boolean;
  additionalNotes?: string;
}

/**
 * Add watermark to PDF page
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
  pdf.text(`Date: ${formDate}`, pageWidth - margin, yPosition, { align: 'right' });

  yPosition += 6;

  // Add letterhead image if provided
  if (letterheadImg) {
    const letterheadWidth = pageWidth - 2 * margin;
    const letterheadHeight = (letterheadImg.height / letterheadImg.width) * letterheadWidth;
    pdf.addImage(letterheadImg, 'PNG', margin, yPosition, letterheadWidth, letterheadHeight);
    yPosition += letterheadHeight + 10;
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
 * Generate Data Collection PDF
 */
export async function generateDataCollectionPdf(data: DataCollectionPdfData) {
  const pdf: any = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'letter'
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 15;

  // Load images
  const logoImg = await loadImage('/logo.png');
  const watermarkImg = await loadImage('/template/Logo icon white.png');
  const letterheadImg = null;

  // Calculate logo height
  const logoWidth = 50;
  const logoHeight = logoImg ? (logoImg.height / logoImg.width) * logoWidth : 15;

  // Add watermark and header
  addWatermark(pdf, pageWidth, pageHeight, watermarkImg);
  addHeaderAndFooter(pdf, pageWidth, pageHeight, margin, data.collectionDate, logoImg, letterheadImg, logoHeight);

  // Starting Y position after header
  const topMargin = 5;
  let yPosition = topMargin + logoHeight + 1 + 8 + 6 + 6;

  // Title
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(16);
  pdf.setTextColor(55, 91, 220);
  pdf.text('Data Collection Sheet', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 8;

  // Patient Information Box
  pdf.setDrawColor(200, 200, 200);
  pdf.setFillColor(240, 245, 255);
  pdf.setLineWidth(0.2);

  // Set transparency for the box
  pdf.saveGraphicsState();
  pdf.setGState(new pdf.GState({ opacity: 0.85 }));
  pdf.roundedRect(margin, yPosition, pageWidth - 2 * margin, 18, 2, 2, 'FD');
  pdf.restoreGraphicsState();

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(12);
  pdf.setTextColor(55, 91, 220);
  yPosition += 6;
  pdf.text('Patient Information', margin + 6, yPosition);
  yPosition += 5.5;

  // Two columns for patient name and collection date
  const columnWidth = (pageWidth - 2 * margin - 12) / 2;

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  pdf.setTextColor(0, 0, 0);

  // Left column - Patient Name
  pdf.text(`Patient Name: ${data.patientName}`, margin + 6, yPosition);

  // Right column - Collection Date (yyyy-mm-dd format)
  const collectionDate = new Date(data.collectionDate);
  const formattedDate = collectionDate.toISOString().split('T')[0]; // yyyy-mm-dd
  pdf.text(`Collection Date: ${formattedDate}`, margin + 6 + columnWidth, yPosition);

  yPosition += 10;

  // Reasons for Collection Box
  const reasonsHeight = Math.max(22, 16 + Math.ceil(data.reasonsForCollection.length / 3) * 7);
  pdf.setDrawColor(200, 200, 200);
  pdf.setFillColor(240, 245, 255);

  // Set transparency for the box
  pdf.saveGraphicsState();
  pdf.setGState(new pdf.GState({ opacity: 0.85 }));
  pdf.roundedRect(margin, yPosition, pageWidth - 2 * margin, reasonsHeight, 2, 2, 'FD');
  pdf.restoreGraphicsState();

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(10);
  pdf.setTextColor(0, 0, 0);
  yPosition += 6;

  // Blue circle indicator
  pdf.setFillColor(55, 91, 220);
  pdf.circle(margin + 6 + 1.5, yPosition - 1.5, 1.5, 'F');

  pdf.text('Reasons for Collection', margin + 6 + 5, yPosition);
  yPosition += 7;

  // Display reasons as badges/pills
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  let xPos = margin + 6;
  const maxWidth = pageWidth - 2 * margin - 12;

  data.reasonsForCollection.forEach((reason, index) => {
    const textWidth = pdf.getTextWidth(reason);
    const badgeWidth = textWidth + 6;

    // Check if badge fits on current line
    if (xPos + badgeWidth > margin + maxWidth && index > 0) {
      yPosition += 7;
      xPos = margin + 6;
    }

    // Draw badge background with transparency
    pdf.setDrawColor(55, 91, 220);
    pdf.setFillColor(224, 231, 255);
    pdf.saveGraphicsState();
    pdf.setGState(new pdf.GState({ opacity: 0.85 }));
    pdf.roundedRect(xPos, yPosition - 4, badgeWidth, 5.5, 1, 1, 'FD');
    pdf.restoreGraphicsState();

    // Draw badge text
    pdf.setTextColor(55, 91, 220);
    pdf.text(reason, xPos + 3, yPosition);

    xPos += badgeWidth + 3;
  });

  if (data.customReason) {
    const textWidth = pdf.getTextWidth(data.customReason);
    const badgeWidth = textWidth + 6;

    if (xPos + badgeWidth > margin + maxWidth) {
      yPosition += 7;
      xPos = margin + 6;
    }

    pdf.setDrawColor(55, 91, 220);
    pdf.setFillColor(224, 231, 255);
    pdf.saveGraphicsState();
    pdf.setGState(new pdf.GState({ opacity: 0.85 }));
    pdf.roundedRect(xPos, yPosition - 4, badgeWidth, 5.5, 1, 1, 'FD');
    pdf.restoreGraphicsState();
    pdf.setTextColor(55, 91, 220);
    pdf.text(data.customReason, xPos + 3, yPosition);
  }

  yPosition += 14;

  // Current Appliances Box (if any)
  if (data.currentUpperAppliance || data.currentLowerAppliance) {
    pdf.setDrawColor(200, 200, 200);
    pdf.setFillColor(240, 245, 255);

    // Set transparency for the box
    pdf.saveGraphicsState();
    pdf.setGState(new pdf.GState({ opacity: 0.85 }));
    pdf.roundedRect(margin, yPosition, pageWidth - 2 * margin, 32, 2, 2, 'FD');
    pdf.restoreGraphicsState();

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(10);
    pdf.setTextColor(0, 0, 0);
    yPosition += 6;

    // Blue circle indicator
    pdf.setFillColor(55, 91, 220);
    pdf.circle(margin + 6 + 1.5, yPosition - 1.5, 1.5, 'F');

    pdf.text('Current Appliances', margin + 6 + 5, yPosition);
    yPosition += 7;

    const columnWidth3 = (pageWidth - 2 * margin - 16) / 2;

    // Upper Appliance Box
    if (data.currentUpperAppliance) {
      pdf.setDrawColor(55, 91, 220);
      pdf.setFillColor(224, 231, 255);
      pdf.saveGraphicsState();
      pdf.setGState(new pdf.GState({ opacity: 0.85 }));
      pdf.roundedRect(margin + 6, yPosition - 4, columnWidth3, 14, 1.5, 1.5, 'FD');
      pdf.restoreGraphicsState();

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(8);
      pdf.setTextColor(55, 91, 220);
      pdf.text('UPPER APPLIANCE', margin + 9, yPosition);

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);
      pdf.setTextColor(0, 0, 0);
      pdf.text(data.currentUpperAppliance, margin + 9, yPosition + 5.5);
    }

    // Lower Appliance Box
    if (data.currentLowerAppliance) {
      pdf.setDrawColor(55, 91, 220);
      pdf.setFillColor(224, 231, 255);
      pdf.saveGraphicsState();
      pdf.setGState(new pdf.GState({ opacity: 0.85 }));
      pdf.roundedRect(margin + 10 + columnWidth3, yPosition - 4, columnWidth3, 14, 1.5, 1.5, 'FD');
      pdf.restoreGraphicsState();

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(8);
      pdf.setTextColor(55, 91, 220);
      pdf.text('LOWER APPLIANCE', margin + 13 + columnWidth3, yPosition);

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);
      pdf.setTextColor(0, 0, 0);
      pdf.text(data.currentLowerAppliance, margin + 13 + columnWidth3, yPosition + 5.5);
    }

    yPosition += 24;
  }

  // Data Collection Status Box
  pdf.setDrawColor(200, 200, 200);
  pdf.setFillColor(240, 245, 255);

  // Calculate dynamic height based on number of items
  const pictureCount = [
    data.preSurgicalPictures, data.surgicalPictures, data.followUpPictures,
    data.fracturedAppliancePictures, data.cbctTaken
  ].filter(item => item !== null && item !== undefined).length;

  const scanCount = [
    data.preSurgicalJawRecordsUpper || data.preSurgicalJawRecordsLower,
    data.facialScan,
    data.jawRecordsUpper || data.jawRecordsLower,
    data.tissueScanUpper || data.tissueScanLower,
    data.photogrammetryUpper || data.photogrammetryLower,
    data.dcRefScanUpper || data.dcRefScanLower,
    data.appliance360Upper || data.appliance360Lower
  ].filter(Boolean).length;

  const pictureRows = Math.ceil(pictureCount / 2);
  const scanRows = Math.ceil(scanCount / 2);
  const statusBoxHeight = 26 + (pictureRows * 10) + (scanRows * 10);

  // Set transparency for the box
  pdf.saveGraphicsState();
  pdf.setGState(new pdf.GState({ opacity: 0.85 }));
  pdf.roundedRect(margin, yPosition, pageWidth - 2 * margin, statusBoxHeight, 2, 2, 'FD');
  pdf.restoreGraphicsState();

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(10);
  pdf.setTextColor(0, 0, 0);
  yPosition += 6;

  // Blue circle indicator
  pdf.setFillColor(55, 91, 220);
  pdf.circle(margin + 6 + 1.5, yPosition - 1.5, 1.5, 'F');

  pdf.text('Data Collection Status', margin + 6 + 5, yPosition);
  yPosition += 7;

  // Pictures Section Header with small blue circle
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(9);
  pdf.setTextColor(0, 0, 0);

  pdf.setFillColor(55, 91, 220);
  pdf.circle(margin + 9 + 1, yPosition - 1.5, 1, 'F');

  pdf.text('Pictures', margin + 9 + 3.5, yPosition);
  yPosition += 7;

  // Pictures in organized grid with boxes
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  const columnWidth2 = (pageWidth - 2 * margin - 22) / 2;

  // Collect all picture items
  const pictureItems: Array<{label: string, status: boolean | null | undefined, type: 'picture' | 'cbct'}> = [];

  if (data.preSurgicalPictures !== null && data.preSurgicalPictures !== undefined) {
    pictureItems.push({label: 'Pre-Surgical Pictures', status: data.preSurgicalPictures, type: 'picture'});
  }
  if (data.surgicalPictures !== null && data.surgicalPictures !== undefined) {
    pictureItems.push({label: 'Surgical Pictures', status: data.surgicalPictures, type: 'picture'});
  }
  if (data.followUpPictures !== null && data.followUpPictures !== undefined) {
    pictureItems.push({label: 'Follow-Up Pictures', status: data.followUpPictures, type: 'picture'});
  }
  if (data.fracturedAppliancePictures !== null && data.fracturedAppliancePictures !== undefined) {
    pictureItems.push({label: 'Fractured Appliance Pictures', status: data.fracturedAppliancePictures, type: 'picture'});
  }
  if (data.cbctTaken !== null && data.cbctTaken !== undefined) {
    pictureItems.push({label: 'CBCT', status: data.cbctTaken, type: 'cbct'});
  }

  // Display pictures in 2 columns with boxes
  pictureItems.forEach((item, index) => {
    const isLeft = index % 2 === 0;
    const xPos = isLeft ? margin + 9 : margin + 9 + columnWidth2 + 4;

    // Draw box background with more padding and transparency
    pdf.setDrawColor(item.status ? 34 : 220, item.status ? 197 : 38, item.status ? 94 : 38);
    pdf.setFillColor(item.status ? 240 : 254, item.status ? 253 : 242, item.status ? 244 : 242);
    pdf.saveGraphicsState();
    pdf.setGState(new pdf.GState({ opacity: 0.85 }));
    pdf.roundedRect(xPos, yPosition - 5, columnWidth2, 9, 1.5, 1.5, 'FD');
    pdf.restoreGraphicsState();

    // Label
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(0, 0, 0);
    pdf.text(item.label, xPos + 3, yPosition);

    // Status indicator circle and text on the right
    const statusText = item.type === 'cbct'
      ? (item.status ? 'Yes' : 'No')
      : (item.status ? 'Collected' : 'Not Collected');
    const statusWidth = pdf.getTextWidth(statusText);

    pdf.setFillColor(item.status ? 34 : 220, item.status ? 197 : 38, item.status ? 94 : 38);
    pdf.circle(xPos + columnWidth2 - statusWidth - 5, yPosition - 1, 0.8, 'F');

    pdf.setTextColor(item.status ? 34 : 220, item.status ? 197 : 38, item.status ? 94 : 38);
    pdf.text(statusText, xPos + columnWidth2 - statusWidth - 2, yPosition);

    if (!isLeft || index === pictureItems.length - 1) {
      yPosition += 10;
    }
  });

  yPosition += 2;

  // 3D Scans & Data Collection Section Header with small blue circle
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(9);
  pdf.setTextColor(0, 0, 0);

  pdf.setFillColor(55, 91, 220);
  pdf.circle(margin + 9 + 1, yPosition - 1.5, 1, 'F');

  pdf.text('3D Scans & Data Collection', margin + 9 + 3.5, yPosition);
  yPosition += 7;

  // Collect all scan items with upper/lower flags
  const scanItems: Array<{label: string, upper: boolean, lower: boolean, noArch?: boolean}> = [];

  if (data.preSurgicalJawRecordsUpper || data.preSurgicalJawRecordsLower) {
    scanItems.push({
      label: 'Pre-Surgical Jaw Records',
      upper: !!data.preSurgicalJawRecordsUpper,
      lower: !!data.preSurgicalJawRecordsLower
    });
  }

  if (data.facialScan) {
    scanItems.push({label: 'Facial Scan', upper: false, lower: false, noArch: true});
  }

  if (data.jawRecordsUpper || data.jawRecordsLower) {
    scanItems.push({
      label: 'Jaw Records (IOS)',
      upper: !!data.jawRecordsUpper,
      lower: !!data.jawRecordsLower
    });
  }

  if (data.tissueScanUpper || data.tissueScanLower) {
    scanItems.push({
      label: 'Tissue Scan',
      upper: !!data.tissueScanUpper,
      lower: !!data.tissueScanLower
    });
  }

  if (data.photogrammetryUpper || data.photogrammetryLower) {
    scanItems.push({
      label: 'Photogrammetry (ICAM)',
      upper: !!data.photogrammetryUpper,
      lower: !!data.photogrammetryLower
    });
  }

  if (data.dcRefScanUpper || data.dcRefScanLower) {
    scanItems.push({
      label: 'DC-REF Scan',
      upper: !!data.dcRefScanUpper,
      lower: !!data.dcRefScanLower
    });
  }

  if (data.appliance360Upper || data.appliance360Lower) {
    scanItems.push({
      label: 'Appliance 360',
      upper: !!data.appliance360Upper,
      lower: !!data.appliance360Lower
    });
  }

  // Display scans in 2 columns with boxes and badges
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);

  scanItems.forEach((item, index) => {
    const isLeft = index % 2 === 0;
    const xPos = isLeft ? margin + 9 : margin + 9 + columnWidth2 + 4;

    // Draw box background with more padding and transparency
    pdf.setDrawColor(55, 91, 220);
    pdf.setFillColor(224, 231, 255);
    pdf.saveGraphicsState();
    pdf.setGState(new pdf.GState({ opacity: 0.85 }));
    pdf.roundedRect(xPos, yPosition - 5, columnWidth2, 9, 1.5, 1.5, 'FD');
    pdf.restoreGraphicsState();

    // Scan name
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(0, 0, 0);
    pdf.text(item.label, xPos + 3, yPosition);

    // Arch badges on the right
    if (item.noArch) {
      // No badges for facial scan
    } else {
      let badgeX = xPos + columnWidth2 - 3;

      if (item.lower) {
        const lowerWidth = pdf.getTextWidth('Lower') + 4;
        badgeX -= lowerWidth;

        // Lower badge (green) with transparency
        pdf.setDrawColor(34, 197, 94);
        pdf.setFillColor(220, 252, 231);
        pdf.saveGraphicsState();
        pdf.setGState(new pdf.GState({ opacity: 0.85 }));
        pdf.roundedRect(badgeX, yPosition - 3, lowerWidth, 4.5, 0.8, 0.8, 'FD');
        pdf.restoreGraphicsState();

        pdf.setTextColor(22, 163, 74);
        pdf.setFontSize(7);
        pdf.text('Lower', badgeX + 2, yPosition);
        pdf.setFontSize(8);

        badgeX -= 2;
      }

      if (item.upper) {
        const upperWidth = pdf.getTextWidth('Upper') + 4;
        badgeX -= upperWidth;

        // Upper badge (blue) with transparency
        pdf.setDrawColor(59, 130, 246);
        pdf.setFillColor(219, 234, 254);
        pdf.saveGraphicsState();
        pdf.setGState(new pdf.GState({ opacity: 0.85 }));
        pdf.roundedRect(badgeX, yPosition - 3, upperWidth, 4.5, 0.8, 0.8, 'FD');
        pdf.restoreGraphicsState();

        pdf.setTextColor(37, 99, 235);
        pdf.setFontSize(7);
        pdf.text('Upper', badgeX + 2, yPosition);
        pdf.setFontSize(8);
      }
    }

    if (!isLeft || index === scanItems.length - 1) {
      yPosition += 10;
    }
  });

  yPosition += 3;

  // Additional Notes Box (if any)
  if (data.additionalNotes) {
    pdf.setDrawColor(200, 200, 200);
    pdf.setFillColor(240, 245, 255);
    const notesLines = pdf.splitTextToSize(data.additionalNotes, pageWidth - 2 * margin - 16);
    const notesHeight = 16 + (notesLines.length * 4);

    // Set transparency for the box
    pdf.saveGraphicsState();
    pdf.setGState(new pdf.GState({ opacity: 0.85 }));
    pdf.roundedRect(margin, yPosition, pageWidth - 2 * margin, notesHeight, 2, 2, 'FD');
    pdf.restoreGraphicsState();

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(10);
    pdf.setTextColor(55, 91, 220);
    yPosition += 6;
    pdf.text('Additional Notes', margin + 6, yPosition);
    yPosition += 6;

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.setTextColor(0, 0, 0);
    notesLines.forEach((line: string) => {
      pdf.text(line, margin + 6, yPosition);
      yPosition += 4;
    });
  }

  // Add page numbers
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

  const fileName = `DataCollection_${data.patientName.replace(/\s+/g, '_')}_${data.collectionDate}.pdf`;
  pdf.save(fileName);
}

/**
 * Helper function to load images
 */
function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => {
      console.warn(`Could not load image: ${src}`);
      resolve(null);
    };
    img.src = src;
  });
}

