import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface TreatmentPlanPdfData {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  planDate: string;
  treatments: any[];
  procedures: any[];
  discount: number;
  letterheadImagePath?: string;
}

/**
 * Add header and footer to a PDF page
 */
function addHeaderAndFooter(
  pdf: any,
  pageWidth: number,
  pageHeight: number,
  margin: number,
  data: TreatmentPlanPdfData,
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

  // Add treatment plan date on right side
  pdf.setFontSize(10);
  pdf.setFont('Fira Sans', 'normal');
  pdf.setTextColor(0, 0, 0);
  pdf.text(`Date: ${data.planDate}`, pageWidth - margin, yPosition, { align: 'right' });

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
 * Generate Treatment Plan PDF with custom letterhead
 * @param data - Treatment plan form data
 * @param letterheadImagePath - Path to the letterhead template image (default: '/letterhead.png')
 */
export const generateTreatmentPlanPDF = async (
  data: TreatmentPlanPdfData,
  letterheadImagePath: string = '/letterhead.png'
) => {
  try {
    console.log('Generating Treatment Plan PDF...', {
      patient: `${data.firstName} ${data.lastName}`,
      treatments: data.treatments.length,
      procedures: data.procedures.length
    });

    // Create new PDF document
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 15;
    const topMargin = 5; // Smaller margin for logo at top
    let yPosition = topMargin;
    let logoHeight = 0;
    let logoImg: HTMLImageElement | null = null;
    let letterheadImg: HTMLImageElement | null = null;
    let watermarkImg: HTMLImageElement | null = null;

    // Load logo image
    try {
      logoImg = new Image();
      logoImg.crossOrigin = 'anonymous';

      await new Promise((resolve, reject) => {
        logoImg.onload = resolve;
        logoImg.onerror = reject;
        logoImg.src = '/logo.png';
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
        letterheadImg.onload = resolve;
        letterheadImg.onerror = reject;
        letterheadImg.src = letterheadImagePath;
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
        watermarkImg.onload = resolve;
        watermarkImg.onerror = reject;
        watermarkImg.src = '/template/Logo icon white.png';
      });
    } catch (error) {
      console.warn('Could not load watermark image:', error);
      watermarkImg = null;
    }

    // Add watermark to first page (before header/footer so it's in background)
    addWatermark(pdf, pageWidth, pageHeight, watermarkImg);

    // Add header and footer to first page
    addHeaderAndFooter(pdf, pageWidth, pageHeight, margin, data, logoImg, letterheadImg, logoHeight);

    // Move yPosition below header
    yPosition = topMargin + logoHeight + 1 + 8 + 6 + 6 + (letterheadImg ? 60 : 0) + 10;

    // Add title (blue color) - above patient information
    yPosition -= 8; // Move title up to reduce empty space
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(55, 91, 220); // Blue color (#375BDC)
    pdf.text('Treatment Plan', pageWidth / 2, yPosition, { align: 'center' });

    pdf.setTextColor(0, 0, 0); // Reset to black for content
    yPosition += 8;

    // Patient Information (single row - no headline) - moved up more
    yPosition -= 4; // Move row up more

    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(0, 0, 0); // Black color

    // Patient Name on left
    pdf.text(`Patient Name: ${data.firstName} ${data.lastName}`, margin, yPosition);

    // Date of Birth on right (YYYY-MM-DD format) - right aligned
    pdf.text(`Date of Birth: ${formatDateOfBirth(data.dateOfBirth)}`, pageWidth - margin, yPosition, { align: 'right' });

    yPosition += 8;

    // Table configuration - Full width utilization
    const col1X = margin; // Treatment/Procedure Name
    const col2X = pageWidth - margin - 70; // CPT Code (moved further right to expand description)
    const col3X = pageWidth - margin - 55; // CDT Code (moved left to avoid overlap)
    const col4X = pageWidth - margin - 42; // Quantity (moved left to avoid overlap)
    const col5X = pageWidth - margin - 20; // Unit Cost (moved right to avoid overlap with qty)
    const col6X = pageWidth - margin - 5; // Total Cost (extended to right margin)
    const col1Width = col2X - col1X - 3; // Name column width
    const col2Width = 20; // CPT Code column width
    const col3Width = 20; // CDT Code column width
    const col4Width = 15; // Quantity column width
    const col5Width = 25; // Unit Cost column width
    const col6Width = 25; // Total column width (increased)
    const rowHeight = 6;

    // Table header
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'bold');
    pdf.setFillColor(55, 91, 220); // Blue background
    pdf.setTextColor(255, 255, 255); // White text

    // Draw one continuous header rectangle (only as wide as needed for columns)
    const totalHeaderWidth = (pageWidth - margin) - col1X;
    pdf.rect(col1X, yPosition - 4, totalHeaderWidth, rowHeight, 'F');

    pdf.text('Treatment/Procedure', col1X + 2, yPosition);
    pdf.text('CPT', col2X + 2, yPosition, { align: 'center' });
    pdf.text('CDT', col3X + 2, yPosition, { align: 'center' });
    pdf.text('Qty', col4X + 2, yPosition, { align: 'center' });
    pdf.text('Unit Cost', col5X + 2, yPosition, { align: 'right' });
    pdf.text('Total', col6X + 2, yPosition, { align: 'right' });

    pdf.setTextColor(0, 0, 0); // Reset to black
    yPosition += 8;

    // Treatments with procedures
    if (data.treatments && data.treatments.length > 0) {
      data.treatments.forEach((treatment: any) => {
        // Treatment row
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(9);
        pdf.setTextColor(0, 0, 0); // Black color
        pdf.text(`• ${treatment.name}`, col1X + 2, yPosition, { maxWidth: col1Width - 4 });
        yPosition += 6;

        // Procedures within treatment
        if (treatment.procedures && treatment.procedures.length > 0) {
          treatment.procedures.forEach((proc: any) => {
            const quantity = proc.quantity || 1;
            const costType = proc.cost_type || 'dental';
            const cost = parseFloat(costType === 'medical' ? proc.medical_cost || 0 : proc.dental_cost || 0);
            const total = quantity * cost;

            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(8);
            pdf.setTextColor(0, 0, 0); // Black color

            // Wrap long procedure names to multiple rows using splitTextToSize
            const procName = proc.name;
            const procLines = pdf.splitTextToSize(`• ${procName}`, col1Width - 4);

            // Display procedure name (can be 1, 2, 3+ lines)
            const firstLineY = yPosition;
            let currentY = firstLineY;

            procLines.forEach((line: string, index: number) => {
              if (index === 0) {
                pdf.setTextColor(0, 0, 0); // Black color
                pdf.text(line, col1X + 2, currentY);
              } else {
                currentY += 4;
                pdf.setTextColor(0, 0, 0); // Black color
                pdf.text(line, col1X + 2, currentY);
              }
            });

            // Display CPT, CDT, quantity, cost, and total on first line
            pdf.setTextColor(0, 0, 0); // Black color
            const cptCode = proc.cpt_code || '';
            const cdtCode = proc.cdt_code || '';
            pdf.text(cptCode, col2X + 2, firstLineY, { align: 'center' });
            pdf.text(cdtCode, col3X + 2, firstLineY, { align: 'center' });
            pdf.text(quantity.toString(), col4X + 2, firstLineY, { align: 'center' });
            pdf.text(`$${cost.toFixed(2)}`, col5X + 2, firstLineY, { align: 'right' });
            pdf.text(`$${total.toFixed(2)}`, col6X + 2, firstLineY, { align: 'right' });

            // Dynamic spacing based on number of lines
            const lineCount = procLines.length;
            yPosition += 4 + (lineCount - 1) * 4;
            yPosition += 3; // Add extra spacing after each procedure

            if (yPosition > pageHeight - margin - 30) {
              pdf.addPage();
              addWatermark(pdf, pageWidth, pageHeight, watermarkImg);
              addHeaderAndFooter(pdf, pageWidth, pageHeight, margin, data, logoImg, letterheadImg, logoHeight);
              yPosition = topMargin + logoHeight + 1 + 8 + 6 + 6 + (letterheadImg ? 60 : 0) + 10;
            }
          });
        }
        yPosition += 2;
      });
    }

    // Individual Procedures
    if (data.procedures && data.procedures.length > 0) {
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(9);
      pdf.setTextColor(0, 0, 0); // Black color
      pdf.text('Individual Procedures', col1X + 2, yPosition);
      yPosition += 6;

      data.procedures.forEach((proc: any) => {
        const quantity = proc.quantity || 1;
        const costType = proc.cost_type || 'dental';
        const cost = parseFloat(costType === 'medical' ? proc.medical_cost || 0 : proc.dental_cost || 0);
        const total = quantity * cost;

        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(8);
        pdf.setTextColor(0, 0, 0); // Black color

        // Wrap long procedure names to multiple rows using splitTextToSize
        const procName = proc.name;
        const procLines = pdf.splitTextToSize(`• ${procName}`, col1Width - 4);

        // Display procedure name (can be 1, 2, 3+ lines)
        const firstLineY = yPosition;
        let currentY = firstLineY;

        procLines.forEach((line: string, index: number) => {
          if (index === 0) {
            pdf.setTextColor(0, 0, 0); // Black color
            pdf.text(line, col1X + 2, currentY);
          } else {
            currentY += 4;
            pdf.setTextColor(0, 0, 0); // Black color
            pdf.text(line, col1X + 2, currentY);
          }
        });

        // Display CPT, CDT, quantity, cost, and total on first line
        pdf.setTextColor(0, 0, 0); // Black color
        const cptCode = proc.cpt_code || '';
        const cdtCode = proc.cdt_code || '';
        pdf.text(cptCode, col2X + 2, firstLineY, { align: 'center' });
        pdf.text(cdtCode, col3X + 2, firstLineY, { align: 'center' });
        pdf.text(quantity.toString(), col4X + 2, firstLineY, { align: 'center' });
        pdf.text(`$${cost.toFixed(2)}`, col5X + 2, firstLineY, { align: 'right' });
        pdf.text(`$${total.toFixed(2)}`, col6X + 2, firstLineY, { align: 'right' });

        // Dynamic spacing based on number of lines
        const lineCount = procLines.length;
        yPosition += 4 + (lineCount - 1) * 4;
        yPosition += 3; // Add extra spacing after each procedure

        if (yPosition > pageHeight - margin - 30) {
          pdf.addPage();
          addWatermark(pdf, pageWidth, pageHeight, watermarkImg);
          addHeaderAndFooter(pdf, pageWidth, pageHeight, margin, data, logoImg, letterheadImg, logoHeight);
          yPosition = topMargin + logoHeight + 1 + 8 + 6 + 6 + (letterheadImg ? 60 : 0) + 10;
        }
      });
    }

    yPosition += 2;

    // Cost Summary Section
    pdf.setDrawColor(0, 0, 0);
    pdf.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 6;

    // Calculate totals
    let subtotal = 0;

    // Sum treatment procedures
    if (data.treatments && data.treatments.length > 0) {
      data.treatments.forEach((treatment: any) => {
        if (treatment.procedures && treatment.procedures.length > 0) {
          treatment.procedures.forEach((proc: any) => {
            const quantity = proc.quantity || 1;
            const costType = proc.cost_type || 'dental';
            const cost = parseFloat(costType === 'medical' ? proc.medical_cost || 0 : proc.dental_cost || 0);
            subtotal += quantity * cost;
          });
        }
      });
    }

    // Sum individual procedures
    if (data.procedures && data.procedures.length > 0) {
      data.procedures.forEach((proc: any) => {
        const quantity = proc.quantity || 1;
        const costType = proc.cost_type || 'dental';
        const cost = parseFloat(costType === 'medical' ? proc.medical_cost || 0 : proc.dental_cost || 0);
        subtotal += quantity * cost;
      });
    }

    const discount = parseFloat(String(data.discount || 0));
    const finalTotal = subtotal - discount;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(0, 0, 0); // Ensure black text for cost summary

    const costSummary = [
      [`Subtotal:`, `$${subtotal.toFixed(2)}`],
      [`Discount/Courtesy:`, `-$${discount.toFixed(2)}`],
      [`Final Total:`, `$${finalTotal.toFixed(2)}`]
    ];

    costSummary.forEach(([label, value], index) => {
      if (index === costSummary.length - 1) {
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(11);
      }
      pdf.setTextColor(0, 0, 0); // Black color for labels
      pdf.text(label, pageWidth - margin - 50, yPosition, { align: 'right' });
      pdf.setTextColor(0, 0, 0); // Black color for values
      pdf.text(value, pageWidth - margin - 5, yPosition, { align: 'right' });
      yPosition += 6;
    });

    // Add page numbers to all pages
    const totalPages = pdf.internal.pages.length - 1; // -1 because pages array has an extra element at index 0
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      const pageWidth = pdf.internal.pageSize.getWidth();
      const margin = 15;
      const footerY = pdf.internal.pageSize.getHeight() - margin - 5;

      // Add page number
      pdf.setFontSize(8);
      pdf.setFont('Fira Sans', 'normal');
      pdf.setTextColor(0, 0, 0);
      const pageNumberText = `${i} of ${totalPages}`;
      pdf.text(pageNumberText, pageWidth - margin - 5, footerY - 3, { align: 'right' });
    }

    // Save the PDF
    const fileName = `TreatmentPlan_${data.firstName}_${data.lastName}_${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(fileName);

    console.log('Treatment Plan PDF generated successfully:', fileName);
    return true;
  } catch (error) {
    console.error('Error generating Treatment Plan PDF:', error);
    throw error;
  }
};

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
 * Format date string to readable format (Month Day, Year)
 */
function formatDate(dateString: string): string {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch {
    return dateString;
  }
}

/**
 * Format date of birth to YYYY-MM-DD format
 */
function formatDateOfBirth(dateString: string): string {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  } catch {
    return dateString;
  }
}

