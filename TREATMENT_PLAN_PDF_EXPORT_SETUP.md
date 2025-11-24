# Treatment Plan PDF Export Setup Guide

## Overview
The Treatment Plan form now includes a PDF export feature that generates professional PDFs with your custom office letterhead.

## Files Created/Modified

### New Files:
1. **`src/utils/treatmentPlanPdfGenerator.ts`**
   - Utility function for generating Treatment Plan PDFs
   - Handles letterhead image integration
   - Formats treatment data professionally
   - Calculates and displays cost summaries

### Modified Files:
1. **`src/components/TreatmentPlanForm.tsx`**
   - Added "Export PDF" button to the form footer
   - Integrated PDF generation handler
   - Added toast notifications for user feedback

## Setup Instructions

### Step 1: Add Your Letterhead Image
1. Save your letterhead PDF/image as a PNG file
2. Place it in the `public` folder with the name: **`letterhead.png`**
3. Path: `public/letterhead.png`

**Important Notes:**
- The image should be in PNG format for best compatibility
- Recommended dimensions: 1200px × 400px (or similar aspect ratio)
- The image will be scaled to fit the PDF width (with margins)

### Step 2: Verify Installation
The following dependencies are already installed:
- `jspdf` (^3.0.1) - PDF generation
- `html2canvas` (^1.4.1) - HTML to canvas conversion
- `sonner` (^1.5.0) - Toast notifications

No additional npm packages need to be installed.

## How to Use

### For Users:
1. Open the Create Treatment Plan form in the patient profile
2. Fill in all the treatment plan details:
   - Patient information (name, DOB)
   - Add treatments and procedures
   - Set quantities and costs
   - Apply any discounts
3. Click the **"Export PDF"** button in the footer
4. The PDF will be automatically downloaded with the filename:
   - Format: `TreatmentPlan_[FirstName]_[LastName]_[Date].pdf`
   - Example: `TreatmentPlan_John_Doe_2024-11-07.pdf`

### PDF Contents:
The exported PDF includes:
- ✅ Your office letterhead at the top
- ✅ Patient information (name, DOB, plan date)
- ✅ All treatments with nested procedures
- ✅ Individual procedures (if any)
- ✅ Detailed cost breakdown:
  - Subtotal
  - Discount/Courtesy amount
  - Final total
- ✅ Generation date in footer

## Customization

### Change Letterhead Image Path:
If you want to use a different path or filename, modify line 256 in `src/components/TreatmentPlanForm.tsx`:

```typescript
letterheadImagePath: '/letterhead.png'  // Change this path
```

### Adjust PDF Layout:
Edit `src/utils/treatmentPlanPdfGenerator.ts` to customize:
- Page margins (line 32: `const margin = 15;`)
- Letterhead height (line 48: `const letterheadHeight = 60;`)
- Font sizes and colors
- Section spacing

### Change Filename Format:
Modify line 217 in `src/utils/treatmentPlanPdfGenerator.ts`:

```typescript
const fileName = `TreatmentPlan_${data.firstName}_${data.lastName}_${new Date().toISOString().split('T')[0]}.pdf`;
```

## Troubleshooting

### Issue: Letterhead image not appearing in PDF
**Solution:**
1. Verify the image file exists at `public/letterhead.png`
2. Check browser console for error messages
3. Ensure image is in PNG format
4. Try converting your PDF to PNG using an online tool

### Issue: PDF download doesn't start
**Solution:**
1. Check browser console for JavaScript errors
2. Verify jsPDF library is properly installed
3. Check browser download settings
4. Try a different browser

### Issue: Text is cut off or overlapping
**Solution:**
1. Adjust the `letterheadHeight` value in the PDF generator
2. Modify the `yPosition` calculations
3. Adjust page margins if needed

## Technical Details

### PDF Generation Process:
1. Creates a new jsPDF document (A4 size, portrait)
2. Loads and embeds the letterhead image
3. Adds patient information section
4. Lists all treatments and procedures with costs
5. Calculates and displays cost summary
6. Adds footer with generation date
7. Triggers browser download

### Data Included:
```typescript
interface TreatmentPlanPdfData {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  planDate: string;
  treatments: any[];        // Treatment groups with procedures
  procedures: any[];        // Individual procedures
  discount: number;         // Discount/courtesy amount
  letterheadImagePath?: string;
}
```

## Future Enhancements

Potential improvements:
- [ ] Add signature fields for patient/dentist
- [ ] Include clinic contact information
- [ ] Add treatment notes/recommendations
- [ ] Support for multiple pages
- [ ] Email PDF directly to patient
- [ ] Save PDF to patient record
- [ ] Add QR code for digital verification
- [ ] Support for multiple letterhead templates

## Support

For issues or questions:
1. Check the browser console for error messages
2. Verify all files are in correct locations
3. Ensure letterhead image is properly formatted
4. Review the troubleshooting section above

