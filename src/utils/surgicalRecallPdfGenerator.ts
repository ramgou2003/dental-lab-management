import jsPDF from 'jspdf';

/**
 * Interface for Surgical Recall PDF data
 */
export interface SurgicalRecallPdfData {
  patientName: string;
  surgeryDate: string;
  archType: 'upper' | 'lower' | 'dual';
  upperSurgeryType?: string;
  lowerSurgeryType?: string;
  upperImplants: ImplantData[];
  lowerImplants: ImplantData[];
}

export interface ImplantData {
  position: string;
  implantBrand?: string;
  implantSubtype?: string;
  implantSize?: string;
  implantPictureUrl?: string;
  muaBrand?: string;
  muaSubtype?: string;
  muaSize?: string;
  muaPictureUrl?: string;
}

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
}

/**
 * Generate Surgical Recall Sheet PDF
 */
export async function generateSurgicalRecallPdf(data: SurgicalRecallPdfData) {
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

  // Calculate logo height
  const logoWidth = 50;
  const logoHeight = logoImg ? (logoImg.height / logoImg.width) * logoWidth : 15;

  // Add watermark and header
  addWatermark(pdf, pageWidth, pageHeight, watermarkImg);
  addHeaderAndFooter(pdf, pageWidth, pageHeight, margin, data.surgeryDate, logoImg, logoHeight);

  // Starting Y position after header
  const topMargin = 5;
  let yPosition = topMargin + logoHeight + 1 + 8 + 6 + 6;

  // Title
  pdf.setFontSize(18);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(55, 91, 220);
  pdf.text('Surgical Recall Sheet', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 4;

  // Calculate widths for side-by-side sections
  const sectionWidth = (pageWidth - 2 * margin - 5) / 2; // 5mm gap between sections
  const leftSectionX = margin;
  const rightSectionX = margin + sectionWidth + 5;

  // Determine the height needed for both sections
  const surgeryTypeHeight = data.archType === 'dual' ? 32 : (data.upperSurgeryType || data.lowerSurgeryType) ? 25 : 18;
  const sectionHeight = Math.max(25, surgeryTypeHeight);

  // Patient Information Section (Left)
  pdf.setLineWidth(0.5);
  pdf.setDrawColor(59, 130, 246);
  pdf.setFillColor(239, 246, 255);
  pdf.roundedRect(leftSectionX, yPosition, sectionWidth, sectionHeight, 2, 2, 'FD');

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(11);
  pdf.setTextColor(29, 78, 216);
  pdf.text('Patient Information', leftSectionX + 5, yPosition + 7);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9);
  pdf.setTextColor(17, 24, 39);

  // Patient Name
  pdf.setFont('helvetica', 'bold');
  pdf.text('Patient Name:', leftSectionX + 5, yPosition + 14);
  pdf.setFont('helvetica', 'normal');
  pdf.text(data.patientName, leftSectionX + 35, yPosition + 14);

  // Surgery Date
  pdf.setFont('helvetica', 'bold');
  pdf.text('Surgery Date:', leftSectionX + 5, yPosition + 20);
  pdf.setFont('helvetica', 'normal');
  pdf.text(new Date(data.surgeryDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }), leftSectionX + 35, yPosition + 20);

  // Surgery Type Section (Right)
  pdf.setLineWidth(0.5);
  pdf.setDrawColor(220, 38, 38);
  pdf.setFillColor(254, 242, 242);
  pdf.roundedRect(rightSectionX, yPosition, sectionWidth, sectionHeight, 2, 2, 'FD');

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(11);
  pdf.setTextColor(153, 27, 27);
  pdf.text('Surgery Type', rightSectionX + 5, yPosition + 7);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9);
  pdf.setTextColor(17, 24, 39);

  // Arch Type
  pdf.setFont('helvetica', 'bold');
  pdf.text('Arch Type:', rightSectionX + 5, yPosition + 14);
  pdf.setFont('helvetica', 'normal');
  pdf.text(data.archType.toUpperCase(), rightSectionX + 35, yPosition + 14);

  let surgeryYPos = yPosition + 14;
  if (data.upperSurgeryType) {
    surgeryYPos += 6;
    pdf.setFont('helvetica', 'bold');
    pdf.text('Upper Surgery:', rightSectionX + 5, surgeryYPos);
    pdf.setFont('helvetica', 'normal');
    pdf.text(data.upperSurgeryType, rightSectionX + 35, surgeryYPos);
  }

  if (data.lowerSurgeryType) {
    surgeryYPos += 6;
    pdf.setFont('helvetica', 'bold');
    pdf.text('Lower Surgery:', rightSectionX + 5, surgeryYPos);
    pdf.setFont('helvetica', 'normal');
    pdf.text(data.lowerSurgeryType, rightSectionX + 35, surgeryYPos);
  }

  yPosition += sectionHeight + 8;

  // Helper function to render implants section
  const renderImplantsSection = async (
    implants: ImplantData[],
    archLabel: string,
    color: { border: number[], fill: number[], text: number[] }
  ) => {
    if (implants.length === 0) return;

    // Sort implants by position in ascending order
    const sortedImplants = [...implants].sort((a, b) => {
      const posA = parseInt(a.position) || 0;
      const posB = parseInt(b.position) || 0;
      return posA - posB;
    });

    // Check if we need a new page
    if (yPosition > pageHeight - 80) {
      pdf.addPage();
      addWatermark(pdf, pageWidth, pageHeight, watermarkImg);
      addHeaderAndFooter(pdf, pageWidth, pageHeight, margin, data.surgeryDate, logoImg, logoHeight);
      yPosition = topMargin + logoHeight + 1 + 8 + 6 + 6;
    }

    // Section Header
    pdf.setLineWidth(0.5);
    pdf.setDrawColor(...color.border);
    pdf.setFillColor(...color.fill);
    pdf.roundedRect(margin, yPosition, pageWidth - 2 * margin, 10, 2, 2, 'FD');

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(11);
    pdf.setTextColor(...color.text);
    pdf.text(`${archLabel} Implants (${sortedImplants.length})`, pageWidth / 2, yPosition + 5, { align: 'center' });

    yPosition += 12;

    // Calculate column widths for 2-column layout
    const cardWidth = (pageWidth - 2 * margin - 4) / 2; // 4mm gap between columns
    const cardHeight = 46;
    const columnGap = 4;

    // Render implants in 2-column layout
    for (let i = 0; i < sortedImplants.length; i++) {
      const implant = sortedImplants[i];
      const isLeftColumn = i % 2 === 0;

      // Check if we need a new page (check before starting a new row)
      if (isLeftColumn && yPosition > pageHeight - 55) {
        pdf.addPage();
        addWatermark(pdf, pageWidth, pageHeight, watermarkImg);
        addHeaderAndFooter(pdf, pageWidth, pageHeight, margin, data.surgeryDate, logoImg, logoHeight);
        yPosition = topMargin + logoHeight + 1 + 8 + 6 + 6;

        // Add "(continued...)" header on the new page
        pdf.setLineWidth(0.5);
        pdf.setDrawColor(...color.border);
        pdf.setFillColor(...color.fill);
        pdf.roundedRect(margin, yPosition, pageWidth - 2 * margin, 10, 2, 2, 'FD');

        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(11);
        pdf.setTextColor(...color.text);
        pdf.text(`${archLabel} Implants (continued...)`, pageWidth / 2, yPosition + 5, { align: 'center' });

        yPosition += 12;
      }

      // Calculate card position
      const cardX = isLeftColumn ? margin : margin + cardWidth + columnGap;
      const cardY = yPosition;

      // Implant card
      pdf.setLineWidth(0.3);
      pdf.setDrawColor(209, 213, 219);
      pdf.setFillColor(255, 255, 255);
      pdf.roundedRect(cardX, cardY, cardWidth, cardHeight, 2, 2, 'FD');

      // Position label
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(10);
      pdf.setTextColor(37, 99, 235);
      pdf.text(`Position: ${implant.position}`, cardX + 3, cardY + 4);

      let contentY = cardY + 8;

      // Implant Information
      if (implant.implantBrand || implant.implantSubtype || implant.implantSize) {
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(7);
        pdf.setTextColor(107, 114, 128);
        pdf.text('IMPLANT:', cardX + 3, contentY);

        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(7);
        pdf.setTextColor(17, 24, 39);

        const implantInfo = [
          implant.implantBrand,
          implant.implantSubtype,
          implant.implantSize
        ].filter(Boolean).join(' | ').toUpperCase();

        pdf.text(implantInfo || 'Not specified', cardX + 20, contentY);
        contentY += 3;
      }

      // MUA Information
      if (implant.muaBrand || implant.muaSubtype || implant.muaSize) {
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(7);
        pdf.setTextColor(107, 114, 128);
        pdf.text('MUA:', cardX + 3, contentY);

        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(7);
        pdf.setTextColor(17, 24, 39);

        const muaInfo = [
          implant.muaBrand,
          implant.muaSubtype,
          implant.muaSize
        ].filter(Boolean).join(' | ').toUpperCase();

        pdf.text(muaInfo || 'Not specified', cardX + 20, contentY);
        contentY += 3;
      }

      // Images section
      const imageStartY = cardY + 10;
      const maxImageWidth = 40;
      const maxImageHeight = 40;
      const titleSpacingAbove = 6; // Space above title (increased)
      const titleSpacingBelow = -4; // Space below title (reduced)
      let imageX = cardX + 3;

      // Implant image
      if (implant.implantPictureUrl) {
        try {
          const implantImg = await loadImage(implant.implantPictureUrl);
          if (implantImg) {
            // Title above image
            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(7);
            pdf.setTextColor(55, 91, 220); // Blue color (#375BDC)
            pdf.text('Implant', imageX + maxImageWidth / 2, imageStartY + titleSpacingAbove, { align: 'center' });

            // Calculate aspect ratio to maintain image proportions
            const imgAspectRatio = implantImg.width / implantImg.height;
            let finalWidth = maxImageWidth;
            let finalHeight = maxImageHeight;

            if (imgAspectRatio > maxImageWidth / maxImageHeight) {
              // Image is wider - fit to width
              finalHeight = maxImageWidth / imgAspectRatio;
            } else {
              // Image is taller - fit to height
              finalWidth = maxImageHeight * imgAspectRatio;
            }

            // Center the image in the available space (below title)
            const imgX = imageX + (maxImageWidth - finalWidth) / 2;
            const imgY = imageStartY + titleSpacingAbove + titleSpacingBelow + (maxImageHeight - finalHeight) / 2;

            // Add image with preserved aspect ratio
            pdf.addImage(implantImg, 'JPEG', imgX, imgY, finalWidth, finalHeight);
          }
        } catch (error) {
          console.warn('Could not load implant image:', error);
        }
        imageX += maxImageWidth + 3;
      }

      // MUA image
      if (implant.muaPictureUrl) {
        try {
          const muaImg = await loadImage(implant.muaPictureUrl);
          if (muaImg) {
            // Title above image
            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(7);
            pdf.setTextColor(55, 91, 220); // Blue color (#375BDC)
            pdf.text('MUA', imageX + maxImageWidth / 2, imageStartY + titleSpacingAbove, { align: 'center' });

            // Calculate aspect ratio to maintain image proportions
            const imgAspectRatio = muaImg.width / muaImg.height;
            let finalWidth = maxImageWidth;
            let finalHeight = maxImageHeight;

            if (imgAspectRatio > maxImageWidth / maxImageHeight) {
              // Image is wider - fit to width
              finalHeight = maxImageWidth / imgAspectRatio;
            } else {
              // Image is taller - fit to height
              finalWidth = maxImageHeight * imgAspectRatio;
            }

            // Center the image in the available space (below title)
            const imgX = imageX + (maxImageWidth - finalWidth) / 2;
            const imgY = imageStartY + titleSpacingAbove + titleSpacingBelow + (maxImageHeight - finalHeight) / 2;

            // Add image with preserved aspect ratio
            pdf.addImage(muaImg, 'JPEG', imgX, imgY, finalWidth, finalHeight);
          }
        } catch (error) {
          console.warn('Could not load MUA image:', error);
        }
      }

      // Move to next row after right column
      if (!isLeftColumn || i === sortedImplants.length - 1) {
        yPosition += cardHeight + 1;
      }
    }

    yPosition += 2;
  };

  // Render Upper Implants
  if (data.archType === 'upper' || data.archType === 'dual') {
    await renderImplantsSection(
      data.upperImplants,
      'Upper',
      {
        border: [59, 130, 246],
        fill: [239, 246, 255],
        text: [29, 78, 216]
      }
    );
  }

  // Render Lower Implants
  if (data.archType === 'lower' || data.archType === 'dual') {
    // If dual arch, always start Lower Implants on a new page
    if (data.archType === 'dual') {
      pdf.addPage();
      addWatermark(pdf, pageWidth, pageHeight, watermarkImg);
      addHeaderAndFooter(pdf, pageWidth, pageHeight, margin, data.surgeryDate, logoImg, logoHeight);
      yPosition = topMargin + logoHeight + 1 + 8 + 6 + 6;
    }

    await renderImplantsSection(
      data.lowerImplants,
      'Lower',
      {
        border: [34, 197, 94],
        fill: [240, 253, 244],
        text: [22, 101, 52]
      }
    );
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

  // Save the PDF
  const fileName = `SurgicalRecallSheet_${data.patientName.replace(/\s+/g, '_')}_${data.surgeryDate}.pdf`;
  pdf.save(fileName);
}

