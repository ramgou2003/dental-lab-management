import jsPDF from 'jspdf';

export interface ThankYouPreSurgeryPdfData {
  patientName: string;
  phone: string;
  dateOfBirth: string;
  email: string;
  treatmentType: string;
  formDate: string;

  // Medical Screening
  heartConditions: boolean;
  bloodThinners: boolean;
  diabetes: boolean;
  highBloodPressure: boolean;
  allergies: boolean;
  pregnancyNursing: boolean;
  recentIllness: boolean;
  medicationChanges: boolean;

  // Timeline - 3 Days Before
  startMedrol: boolean;
  startAmoxicillin: boolean;
  noAlcohol3Days: boolean;
  arrangeRide: boolean;

  // Timeline - Night Before
  takeDiazepam: boolean;
  noFoodAfterMidnight: boolean;
  noWaterAfter6Am: boolean;
  confirmRide: boolean;

  // Timeline - Morning Of
  noBreakfast: boolean;
  noPills: boolean;
  wearComfortable: boolean;
  arriveOnTime: boolean;

  // Timeline - After Surgery
  noAlcohol24Hrs: boolean;
  noDriving24Hrs: boolean;
  followInstructions: boolean;
  callIfConcerns: boolean;

  // Patient Acknowledgments
  readInstructions: boolean;
  understandMedications: boolean;
  understandSedation: boolean;
  arrangedTransport: boolean;
  understandRestrictions: boolean;
  willFollowInstructions: boolean;
  understandEmergency: boolean;

  // Signature
  patientSignature: string;
  signatureDate: string;
  signatureTime: string;
  patientPrintName: string;

  // Additional fields for future use
  [key: string]: any;
}

/**
 * Add header and footer to a PDF page (EXACT SAME as treatment plan)
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

  // Add form date on right side (same as treatment plan)
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

  // Footer content (EXACT SAME as treatment plan)
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
 * Generate Thank You and Pre-Surgery Instructions PDF
 */
export const generateThankYouPreSurgeryPdf = async (data: ThankYouPreSurgeryPdfData): Promise<boolean> => {
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
    let checkmarkIconImg: HTMLImageElement | null = null;

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
        letterheadImg.src = '/template/Letterhead.png';
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

    // Load checkmark icon image
    try {
      checkmarkIconImg = new Image();
      checkmarkIconImg.crossOrigin = 'anonymous';

      await new Promise((resolve, reject) => {
        checkmarkIconImg.onload = resolve;
        checkmarkIconImg.onerror = reject;
        checkmarkIconImg.src = '/Template/checkmark-icon.png.png';
      });
    } catch (error) {
      console.warn('Could not load checkmark icon image:', error);
      checkmarkIconImg = null;
    }

    // Add watermark to first page (before header/footer so it's in background)
    addWatermark(pdf, pageWidth, pageHeight, watermarkImg);

    // Add header and footer to first page
    addHeaderAndFooter(pdf, pageWidth, pageHeight, margin, data.formDate, logoImg, letterheadImg, logoHeight);

    // Move yPosition below header
    yPosition = topMargin + logoHeight + 1 + 8 + 6 + 6 + (letterheadImg ? 60 : 0) + 10;

    // Add title (blue color) - same as treatment plan
    yPosition -= 8; // Move title up to reduce empty space
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(55, 91, 220); // Blue color (#375BDC)
    pdf.text('Thank You & Pre-Surgery Instructions', pageWidth / 2, yPosition, { align: 'center' });

    pdf.setTextColor(0, 0, 0); // Reset to black for content
    yPosition += 10;

    // Patient Information Section - 2 Column Layout
    const col1X = margin; // Left column
    const col2X = pageWidth / 2 + 5; // Right column (middle of page + spacing)

    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(0, 0, 0);

    // Row 1: Patient Name (left) | Phone Number (right)
    pdf.text('Patient Name: ', col1X, yPosition);
    pdf.setFont('helvetica', 'normal');
    pdf.text(data.patientName || 'N/A', col1X + 40, yPosition);

    pdf.setFont('helvetica', 'bold');
    pdf.text('Phone Number: ', col2X, yPosition);
    pdf.setFont('helvetica', 'normal');
    pdf.text(data.phone || 'N/A', col2X + 40, yPosition);

    yPosition += 6;

    // Row 2: Date of Birth (left) | Email Address (right)
    pdf.setFont('helvetica', 'bold');
    pdf.text('Date of Birth: ', col1X, yPosition);
    pdf.setFont('helvetica', 'normal');
    pdf.text(data.dateOfBirth || 'N/A', col1X + 40, yPosition);

    pdf.setFont('helvetica', 'bold');
    pdf.text('Email Address: ', col2X, yPosition);
    pdf.setFont('helvetica', 'normal');
    pdf.text(data.email || 'N/A', col2X + 40, yPosition);

    yPosition += 6;

    // Row 3: Treatment Type (right column)
    pdf.setFont('helvetica', 'bold');
    pdf.text('Treatment Type: ', col2X, yPosition);
    pdf.setFont('helvetica', 'normal');
    pdf.text(data.treatmentType || 'N/A', col2X + 40, yPosition);

    yPosition += 10;

    // Add thin separator line
    pdf.setDrawColor(200, 200, 200); // Light gray
    pdf.setLineWidth(0.3);
    pdf.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 8;

    // Emergency Contacts Section - Simple and Clean
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(220, 20, 60); // Red color
    pdf.text('Emergency Contacts', margin, yPosition);
    yPosition += 6;

    // Three columns for emergency contacts - simple layout
    const emergencyCol1 = margin;
    const emergencyCol2 = margin + (pageWidth - 2 * margin) / 3;
    const emergencyCol3 = margin + 2 * (pageWidth - 2 * margin) / 3;

    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(220, 20, 60);

    pdf.text('Office Hours', emergencyCol1, yPosition);
    pdf.text('After Hours', emergencyCol2, yPosition);
    pdf.text('Life Threatening', emergencyCol3, yPosition);

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.setTextColor(0, 0, 0);
    yPosition += 4;

    pdf.text('(585) 394-5910', emergencyCol1, yPosition);
    pdf.text('[Emergency Number]', emergencyCol2, yPosition);
    pdf.text('911', emergencyCol3, yPosition);

    yPosition += 10;

    // Thank You Section - Simple and Clean
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(55, 91, 220); // Blue color
    pdf.text('Thank You for Choosing New York Dental Implants!', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 7;

    // Thank you message
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(0, 0, 0);

    const thankYouText = 'We are honored that you have chosen our practice for your dental implant treatment. Our mission is to provide exceptional care with compassion, using the latest technology and techniques to help you achieve your best smile. Your comfort, safety, and satisfaction are our top priorities throughout your treatment journey.';
    const wrappedText = pdf.splitTextToSize(thankYouText, pageWidth - (2 * margin) - 4);

    pdf.text(wrappedText, margin + 2, yPosition);
    yPosition += (wrappedText.length * 3.5) + 3;

    // Signature line
    pdf.setFont('helvetica', 'italic');
    pdf.setFontSize(8);
    pdf.setTextColor(55, 91, 220);
    pdf.text('- The New York Dental Implants Team', pageWidth / 2, yPosition, { align: 'center' });

    yPosition += 12;

    // Critical Medical Screening Section
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(0, 0, 0);
    pdf.text('Critical Medical Screening', margin, yPosition);
    yPosition += 8;

    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(0, 0, 0);
    pdf.text('Please check any that apply to you:', margin, yPosition);
    yPosition += 9;

    // Medical screening items in 2 columns
    const medicalItems = [
      { label: 'Heart conditions or pacemaker', value: data.heartConditions },
      { label: 'Taking blood thinners', value: data.bloodThinners },
      { label: 'Diabetes (Type 1 or 2)', value: data.diabetes },
      { label: 'High blood pressure', value: data.highBloodPressure },
      { label: 'Drug allergies or reactions', value: data.allergies },
      { label: 'Pregnant or nursing', value: data.pregnancyNursing },
      { label: 'Recent illness or fever', value: data.recentIllness },
      { label: 'Recent medication changes', value: data.medicationChanges }
    ];

    const medicalCol1X = margin;
    const medicalCol2X = pageWidth / 2;

    for (let i = 0; i < medicalItems.length; i += 2) {
      const item1 = medicalItems[i];
      const item2 = medicalItems[i + 1];

      // Left column item
      const checkboxSize = 5;
      const checkboxX1 = medicalCol1X;
      const checkboxY1 = yPosition;

      // Draw checkbox with rounded corners and blue border
      pdf.setDrawColor(55, 91, 220); // Blue border
      pdf.setLineWidth(0.8);
      pdf.roundedRect(checkboxX1, checkboxY1 - 3, checkboxSize, checkboxSize, 0.5, 0.5, 'S'); // Rounded corners, stroke only

      // Draw blue dot if checked
      if (item1.value) {
        pdf.setFillColor(55, 91, 220); // Blue color (#375BDC)
        pdf.circle(checkboxX1 + 2.5, checkboxY1 - 0.5, 1.5, 'F'); // Blue filled circle
      }

      // Item label
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9);
      pdf.setTextColor(0, 0, 0);
      pdf.text(item1.label, checkboxX1 + 6.5, checkboxY1);

      // Right column item (if exists)
      if (item2) {
        const checkboxX2 = medicalCol2X;
        const checkboxY2 = yPosition;

        // Draw checkbox with rounded corners and blue border
        pdf.setDrawColor(55, 91, 220); // Blue border
        pdf.setLineWidth(0.8);
        pdf.roundedRect(checkboxX2, checkboxY2 - 3, checkboxSize, checkboxSize, 0.5, 0.5, 'S'); // Rounded corners, stroke only

        // Draw blue dot if checked
        if (item2.value) {
          pdf.setFillColor(55, 91, 220); // Blue color (#375BDC)
          pdf.circle(checkboxX2 + 2.5, checkboxY2 - 0.5, 1.5, 'F'); // Blue filled circle
        }

        // Item label
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(9);
        pdf.setTextColor(0, 0, 0);
        pdf.text(item2.label, checkboxX2 + 6.5, checkboxY2);
      }

      yPosition += 8;
    }

    // Important Note Section
    yPosition += 5;

    // Red border (transparent background)
    pdf.setDrawColor(220, 53, 69); // Red border
    pdf.setLineWidth(0.5);
    pdf.rect(margin, yPosition - 4, pageWidth - 2 * margin, 18, 'S');

    // Important title
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(220, 53, 69); // Red text
    pdf.text('Important', margin + 3, yPosition);

    // Important note text
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(0, 0, 0); // Black text
    const noteText = 'If you checked any boxes above, please call our office immediately at (585) 394-5910. These conditions may require special precautions or medication adjustments.';
    const splitText = pdf.splitTextToSize(noteText, pageWidth - 2 * margin - 6);
    pdf.text(splitText, margin + 3, yPosition + 4);

    yPosition += 20;

    // Check if we need a new page for surgical timeline
    if (yPosition > pageHeight - 100) {
      pdf.addPage();
      addWatermark(pdf, pageWidth, pageHeight, watermarkImg);
      addHeaderAndFooter(pdf, pageWidth, pageHeight, margin, data.formDate, logoImg, letterheadImg, logoHeight);
      yPosition = margin + 35;
    }

    // Your Surgical Timeline Section
    yPosition += 5;

    // Section title
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(55, 91, 220); // Blue color
    pdf.text('Your Surgical Timeline', margin, yPosition);
    yPosition += 8;

    // Timeline items with green checkmarks
    const timelineItems = [
      {
        section: '3 Days Before Surgery',
        items: [
          { label: 'Start taking Medrol Dose Pack as directed', value: data.startMedrol },
          { label: 'Start taking Amoxicillin 500mg (3 times daily)', value: data.startAmoxicillin },
          { label: 'No alcohol consumption', value: data.noAlcohol3Days },
          { label: 'Confirm transportation arrangements', value: data.arrangeRide }
        ]
      },
      {
        section: 'Night Before Surgery',
        items: [
          { label: 'Take Diazepam 10mg at bedtime (if prescribed)', value: data.takeDiazepam },
          { label: 'No food or drink after midnight', value: data.noFoodAfterMidnight },
          { label: 'No water after 6:00 AM on surgery day', value: data.noWaterAfter6Am },
          { label: 'Confirm your ride for surgery day', value: data.confirmRide }
        ]
      },
      {
        section: 'Morning of Surgery',
        items: [
          { label: 'NO breakfast, food, or beverages', value: data.noBreakfast },
          { label: 'NO morning medications (unless approved)', value: data.noPills },
          { label: 'Wear comfortable, loose-fitting clothes', value: data.wearComfortable },
          { label: 'Arrive on time for your appointment', value: data.arriveOnTime }
        ]
      },
      {
        section: 'After Surgery',
        items: [
          { label: 'No alcohol for 24 hours', value: data.noAlcohol24Hrs },
          { label: 'No driving for 24 hours', value: data.noDriving24Hrs },
          { label: 'Follow all post-operative instructions', value: data.followInstructions },
          { label: 'Call office with any concerns', value: data.callIfConcerns }
        ]
      }
    ];

    // Draw timeline sections
    for (const timeline of timelineItems) {
      // Section header
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(55, 91, 220); // Blue color
      pdf.text(timeline.section, margin + 2, yPosition);
      yPosition += 5;

      // Timeline items
      for (const item of timeline.items) {
        // Add checkmark icon image if available
        if (checkmarkIconImg) {
          pdf.addImage(checkmarkIconImg, 'PNG', margin + 0.5, yPosition - 2.5, 4, 4);
        } else {
          // Fallback: Light green circle background
          pdf.setFillColor(165, 214, 167); // Light green background
          pdf.circle(margin + 3, yPosition - 1.5, 1.8, 'F');

          // Dark green checkmark
          pdf.setDrawColor(27, 94, 32); // Dark green checkmark
          pdf.setLineWidth(0.8);
          // Draw checkmark lines
          pdf.line(margin + 1.5, yPosition - 0.8, margin + 2.5, yPosition + 0.2);
          pdf.line(margin + 2.5, yPosition + 0.2, margin + 4.5, yPosition - 2);
        }

        // Item text
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(0, 0, 0);
        pdf.text(item.label, margin + 6.5, yPosition);
        yPosition += 5;
      }

      yPosition += 3;

      // Check if we need a new page
      if (yPosition > pageHeight - 20) {
        pdf.addPage();
        addWatermark(pdf, pageWidth, pageHeight, watermarkImg);
        addHeaderAndFooter(pdf, pageWidth, pageHeight, margin, data.formDate, logoImg, letterheadImg, logoHeight);
        yPosition = margin + 25;
      }
    }

    // Medication Instructions Section
    yPosition += 8;

    if (yPosition > pageHeight - 80) {
      pdf.addPage();
      addWatermark(pdf, pageWidth, pageHeight, watermarkImg);
      addHeaderAndFooter(pdf, pageWidth, pageHeight, margin, data.formDate, logoImg, letterheadImg, logoHeight);
      yPosition = margin + 25;
    }

    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(55, 91, 220); // Blue color
    pdf.text('Medication Instructions', margin, yPosition);
    yPosition += 8;

    // Medication items - 2 column layout
    const medications = [
      {
        name: 'Medrol Dose Pack',
        type: 'Corticosteroid',
        instructions: [
          'Day 1: 6 tablets',
          'Day 2: 5 tablets',
          'Day 3: 4 tablets',
          'Day 4: 3 tablets',
          'Day 5: 2 tablets',
          'Day 6: 1 tablet'
        ]
      },
      {
        name: 'Amoxicillin 500mg',
        type: 'Antibiotic',
        instructions: [
          'Take 3 times daily',
          'With or without food',
          'Continue for full course',
          'Start 3 days before surgery'
        ]
      },
      {
        name: 'Diazepam 10mg',
        type: 'Sedative (if prescribed)',
        instructions: [
          'Take night before surgery',
          'At bedtime only',
          'Do not drive after taking',
          'One dose only'
        ]
      }
    ];

    const medColWidth = (pageWidth - 2 * margin - 3) / 2; // 2 columns with small gap
    const medCol1X = margin;
    const medCol2X = margin + medColWidth + 3;
    let col1YPosition = yPosition;
    let col2YPosition = yPosition;

    // Draw medications in 2 columns
    for (let i = 0; i < medications.length; i++) {
      const med = medications[i];
      const isCol1 = i < 2; // First 2 meds in column 1, last in column 2
      const colX = isCol1 ? medCol1X : medCol2X;
      let currentY = isCol1 ? col1YPosition : col2YPosition;

      // Medication name and type
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(55, 91, 220);
      pdf.text(med.name, colX + 2, currentY);

      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'italic');
      pdf.setTextColor(100, 100, 100);
      pdf.text(med.type, colX + 2, currentY + 4);
      currentY += 8;

      // Instructions
      for (const instruction of med.instructions) {
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(0, 0, 0);
        pdf.text('• ' + instruction, colX + 4, currentY);
        currentY += 4;
      }

      currentY += 3;

      // Update column positions
      if (isCol1) {
        col1YPosition = currentY;
      } else {
        col2YPosition = currentY;
      }
    }

    // Move yPosition to the bottom of both columns
    yPosition = Math.max(col1YPosition, col2YPosition);

    // Check if we need a new page
    if (yPosition > pageHeight - 30) {
      pdf.addPage();
      addWatermark(pdf, pageWidth, pageHeight, watermarkImg);
      addHeaderAndFooter(pdf, pageWidth, pageHeight, margin, data.formDate, logoImg, letterheadImg, logoHeight);
      yPosition = margin + 25;
    }

    // Critical Safety Warning
    yPosition += 4;

    if (yPosition > pageHeight - 30) {
      pdf.addPage();
      addWatermark(pdf, pageWidth, pageHeight, watermarkImg);
      addHeaderAndFooter(pdf, pageWidth, pageHeight, margin, data.formDate, logoImg, letterheadImg, logoHeight);
      yPosition = margin + 25;
    }

    // Red border (transparent background)
    pdf.setDrawColor(220, 53, 69);
    pdf.setLineWidth(0.5);
    pdf.rect(margin, yPosition - 4, pageWidth - 2 * margin, 18, 'S');

    // Important title
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(220, 53, 69);
    pdf.text('Important', margin + 3, yPosition);

    // Warning text
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(0, 0, 0);
    const warningText = pdf.splitTextToSize(
      'Do NOT take any morning medications on surgery day unless specifically approved by our office. This includes blood pressure medications, diabetes medications, and supplements.',
      pageWidth - 2 * margin - 6
    );
    pdf.text(warningText, margin + 3, yPosition + 4);

    yPosition += 20;

    // IV Sedation Safety Information Section
    yPosition += 8;

    if (yPosition > pageHeight - 100) {
      pdf.addPage();
      addWatermark(pdf, pageWidth, pageHeight, watermarkImg);
      addHeaderAndFooter(pdf, pageWidth, pageHeight, margin, data.formDate, logoImg, letterheadImg, logoHeight);
      yPosition = margin + 25;
    }

    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(55, 91, 220); // Blue color
    pdf.text('IV Sedation Safety Information', margin, yPosition);
    yPosition += 8;

    // What to Expect
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(0, 0, 0);
    pdf.text('What to Expect', margin + 2, yPosition);
    yPosition += 5;

    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(0, 0, 0);
    const expectText = pdf.splitTextToSize(
      'IV sedation helps you relax and remain comfortable during your procedure. You will be monitored continuously and will have little to no memory of the surgery.',
      pageWidth - 2 * margin - 4
    );
    pdf.text(expectText, margin + 2, yPosition);
    yPosition += expectText.length * 4 + 5;

    // 24-Hour Restrictions
    if (yPosition > pageHeight - 50) {
      pdf.addPage();
      addWatermark(pdf, pageWidth, pageHeight, watermarkImg);
      addHeaderAndFooter(pdf, pageWidth, pageHeight, margin, data.formDate, logoImg, letterheadImg, logoHeight);
      yPosition = margin + 25;
    }

    // Red border (transparent background)
    pdf.setDrawColor(220, 53, 69);
    pdf.setLineWidth(0.5);
    pdf.rect(margin, yPosition - 4, pageWidth - 2 * margin, 28, 'S');

    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(220, 53, 69);
    pdf.text('24-Hour Restrictions After Sedation', margin + 3, yPosition);
    yPosition += 6;

    const restrictions = [
      'No driving or operating machinery',
      'No alcohol consumption',
      'No important decisions or legal documents',
      'Must have responsible adult supervision',
      'No work or strenuous activities'
    ];

    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(0, 0, 0);
    for (const restriction of restrictions) {
      pdf.text('• ' + restriction, margin + 4, yPosition);
      yPosition += 4;
    }
    yPosition += 4;

    // Possible Side Effects
    if (yPosition > pageHeight - 30) {
      pdf.addPage();
      addWatermark(pdf, pageWidth, pageHeight, watermarkImg);
      addHeaderAndFooter(pdf, pageWidth, pageHeight, margin, data.formDate, logoImg, letterheadImg, logoHeight);
      yPosition = margin + 25;
    }

    // Red border (transparent background)
    pdf.setDrawColor(220, 53, 69);
    pdf.setLineWidth(0.5);
    pdf.rect(margin, yPosition - 4, pageWidth - 2 * margin, 16, 'S');

    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(220, 53, 69);
    pdf.text('Possible Side Effects', margin + 3, yPosition);
    yPosition += 6;

    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(0, 0, 0);
    const sideEffectsText = pdf.splitTextToSize(
      'Drowsiness, dizziness, nausea, or mild confusion are normal and will resolve within 24 hours.',
      pageWidth - 2 * margin - 6
    );
    pdf.text(sideEffectsText, margin + 3, yPosition);
    yPosition += sideEffectsText.length * 4 + 10;

    // When to Seek Help Section
    if (yPosition > pageHeight - 80) {
      pdf.addPage();
      addWatermark(pdf, pageWidth, pageHeight, watermarkImg);
      addHeaderAndFooter(pdf, pageWidth, pageHeight, margin, data.formDate, logoImg, letterheadImg, logoHeight);
      yPosition = margin + 25;
    }

    yPosition += 4; // Add spacing above section

    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(55, 91, 220);
    pdf.text('When to Seek Help', margin, yPosition);
    yPosition += 8;

    // 2-column layout for emergency sections
    const emergColWidth = (pageWidth - 2 * margin - 3) / 2;
    const emergCol1X = margin;
    const emergCol2X = margin + emergColWidth + 3;
    let emergCol1Y = yPosition;
    let emergCol2Y = yPosition;

    // Call 911 Immediately If (Column 1)
    pdf.setDrawColor(220, 53, 69);
    pdf.setLineWidth(0.5);
    pdf.rect(emergCol1X, emergCol1Y - 4, emergColWidth, 32, 'S');

    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(220, 53, 69);
    pdf.text('Call 911 Immediately If:', emergCol1X + 3, emergCol1Y);
    emergCol1Y += 5;

    const emergencyItems = [
      'Difficulty breathing or swallowing',
      'Severe allergic reaction (hives, swelling)',
      'Chest pain or heart palpitations',
      'Loss of consciousness',
      'Severe bleeding that won\'t stop'
    ];

    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(0, 0, 0);
    for (const item of emergencyItems) {
      const itemText = pdf.splitTextToSize(item, emergColWidth - 6);
      pdf.text(itemText, emergCol1X + 4, emergCol1Y);
      emergCol1Y += itemText.length * 4;
    }

    // Call Our Office If (Column 2)
    pdf.setDrawColor(180, 140, 0);
    pdf.setLineWidth(0.5);
    pdf.rect(emergCol2X, emergCol2Y - 4, emergColWidth, 32, 'S');

    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(180, 140, 0);
    pdf.text('Call Our Office If:', emergCol2X + 3, emergCol2Y);
    emergCol2Y += 5;

    const officeCallItems = [
      'Persistent nausea or vomiting',
      'Excessive swelling or pain',
      'Signs of infection (fever, pus)',
      'Questions about medications',
      'Any concerns about your recovery'
    ];

    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(0, 0, 0);
    for (const item of officeCallItems) {
      const itemText = pdf.splitTextToSize(item, emergColWidth - 6);
      pdf.text(itemText, emergCol2X + 4, emergCol2Y);
      emergCol2Y += itemText.length * 4;
    }

    yPosition = Math.max(emergCol1Y, emergCol2Y) + 6;

    // Patient Acknowledgment Section
    if (yPosition > pageHeight - 100) {
      pdf.addPage();
      addWatermark(pdf, pageWidth, pageHeight, watermarkImg);
      addHeaderAndFooter(pdf, pageWidth, pageHeight, margin, data.formDate, logoImg, letterheadImg, logoHeight);
      yPosition = margin + 25;
    }

    yPosition += 4; // Add spacing above section

    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(55, 91, 220);
    pdf.text('Patient Acknowledgment', margin, yPosition);
    yPosition += 8;

    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(0, 0, 0);
    pdf.text('Please confirm your understanding by checking each item:', margin, yPosition);
    yPosition += 6;

    const acknowledgmentItems = [
      { key: 'readInstructions', text: 'I have read and understand all pre-surgery instructions' },
      { key: 'understandMedications', text: 'I understand the medication schedule and requirements' },
      { key: 'understandSedation', text: 'I understand the IV sedation process and restrictions' },
      { key: 'arrangedTransport', text: 'I have arranged transportation to and from surgery' },
      { key: 'understandRestrictions', text: 'I understand the 24-hour post-sedation restrictions' },
      { key: 'willFollowInstructions', text: 'I agree to follow all pre and post-operative instructions' },
      { key: 'understandEmergency', text: 'I understand when to seek emergency help' }
    ];

    for (const item of acknowledgmentItems) {
      if (yPosition > pageHeight - 20) {
        pdf.addPage();
        addWatermark(pdf, pageWidth, pageHeight, watermarkImg);
        addHeaderAndFooter(pdf, pageWidth, pageHeight, margin, data.formDate, logoImg, letterheadImg, logoHeight);
        yPosition = margin + 25;
      }

      // Check if item is checked in form data
      const isChecked = data[item.key as keyof typeof data];

      // Checkbox
      pdf.setDrawColor(0, 0, 0);
      pdf.setLineWidth(0.3);
      pdf.rect(margin + 1, yPosition - 2.5, 3, 3, 'S');

      // Draw checkmark if checked
      if (isChecked) {
        pdf.setDrawColor(0, 0, 0);
        pdf.setLineWidth(0.4);
        // Draw checkmark
        pdf.line(margin + 1.3, yPosition - 0.8, margin + 1.8, yPosition - 0.3);
        pdf.line(margin + 1.8, yPosition - 0.3, margin + 3.5, yPosition - 2.2);
      }

      // Item text
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(0, 0, 0);
      const itemText = pdf.splitTextToSize(item.text, pageWidth - 2 * margin - 8);
      pdf.text(itemText, margin + 5, yPosition);
      yPosition += itemText.length * 4 + 2;
    }

    yPosition += 6;

    // Patient Signature & Acknowledgment Section
    if (yPosition > pageHeight - 60) {
      pdf.addPage();
      addWatermark(pdf, pageWidth, pageHeight, watermarkImg);
      addHeaderAndFooter(pdf, pageWidth, pageHeight, margin, data.formDate, logoImg, letterheadImg, logoHeight);
      yPosition = margin + 25;
    }

    yPosition += 4; // Add spacing above section

    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(55, 91, 220);
    pdf.text('Patient Signature & Acknowledgment', margin, yPosition);
    yPosition += 8;

    // 2-column layout for signature section
    const sigColWidth = (pageWidth - 2 * margin - 3) / 2;
    const sigCol1X = margin;
    const sigCol2X = margin + sigColWidth + 3;
    let sigCol1Y = yPosition;
    let sigCol2Y = yPosition;

    // Left column - Patient Info
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(0, 0, 0);
    pdf.text('Patient Name', sigCol1X, sigCol1Y);
    sigCol1Y += 5;

    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(0, 0, 0);
    pdf.text(data.patientName || '', sigCol1X, sigCol1Y);
    sigCol1Y += 8;

    // Date and Time
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(0, 0, 0);
    pdf.text('Date', sigCol1X, sigCol1Y);
    sigCol1Y += 5;

    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(0, 0, 0);
    pdf.text(data.signatureDate || '', sigCol1X, sigCol1Y);

    // Time field
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(0, 0, 0);
    pdf.text('Time', sigCol1X + sigColWidth / 2 + 1, sigCol1Y - 5);

    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(0, 0, 0);
    pdf.text(data.signatureTime || '', sigCol1X + sigColWidth / 2 + 1, sigCol1Y);

    sigCol1Y += 10;

    // Right column - Signature
    // Add signature image if available (no box)
    if (data.patientSignature) {
      try {
        pdf.addImage(data.patientSignature, 'PNG', sigCol2X, sigCol2Y, sigColWidth - 2, 18);
      } catch (error) {
        console.warn('Could not add signature image:', error);
      }
    }

    sigCol2Y += 20;

    // Horizontal line below signature
    pdf.setDrawColor(200, 200, 200);
    pdf.setLineWidth(0.5);
    pdf.line(sigCol2X, sigCol2Y, sigCol2X + sigColWidth - 2, sigCol2Y);
    sigCol2Y += 4;

    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(100, 100, 100);
    pdf.text('Patient Signature', sigCol2X + sigColWidth / 2 - 15, sigCol2Y);

    yPosition = Math.max(sigCol1Y, sigCol2Y) + 4;

    // Add page numbers to all pages
    const totalPages = pdf.internal.pages.length - 1; // -1 because pages array has an extra element at index 0
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
    const fileName = `ThankYouPreSurgery_${data.patientName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(fileName);

    console.log('Thank You Pre-Surgery PDF generated successfully:', fileName);
    return true;
  } catch (error) {
    console.error('Error generating Thank You Pre-Surgery PDF:', error);
    throw error;
  }
};

/**
 * Add watermark to a PDF page
 */
function addWatermark(pdf: any, pageWidth: number, pageHeight: number, watermarkImg: HTMLImageElement | null) {
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
      pdf.setOpacity(0.50); // 15% opacity for subtle watermark
    }
    pdf.addImage(watermarkImg, 'PNG', xPosition, yPosition, watermarkWidth, watermarkHeight);
    if (pdf.setOpacity) {
      pdf.setOpacity(1); // Reset opacity to full
    }
  } catch (error) {
    console.warn('Could not add watermark:', error);
  }
}

