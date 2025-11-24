# Letterhead Setup Instructions

## Overview
Your Treatment Plan PDF export feature is ready to use! You just need to add your office letterhead image to the project.

## Step-by-Step Setup

### Step 1: Convert Your Letterhead to PNG Format

**If you have a PDF:**
1. Go to an online PDF to PNG converter (e.g., CloudConvert, Zamzar, or ILovePDF)
2. Upload your letterhead PDF
3. Convert to PNG format
4. Download the PNG file

**If you have a Word document:**
1. Open the Word document
2. Take a screenshot of the letterhead section
3. Save as PNG image
4. Or export as PDF first, then convert to PNG

**If you already have an image:**
- Ensure it's in PNG format
- If it's JPG, convert to PNG using an online tool

### Step 2: Prepare the Image

**Recommended specifications:**
- **Format**: PNG (with transparency support)
- **Width**: 1200 pixels (or wider)
- **Height**: 400 pixels (or proportional)
- **File size**: Under 500KB
- **Quality**: High resolution (300 DPI equivalent)

**Why PNG?**
- Supports transparency
- Better quality than JPG
- Smaller file size than PDF
- Works perfectly with jsPDF

### Step 3: Add Image to Project

1. **Locate the public folder:**
   ```
   C:\Users\RV1\Desktop\devv\dental-lab-management\public\
   ```

2. **Place your letterhead image:**
   - Copy your `letterhead.png` file
   - Paste it into the `public/` folder
   - Final path: `public/letterhead.png`

3. **Verify the file:**
   - File name: `letterhead.png` (exact match)
   - Location: `public/` folder
   - Format: PNG

### Step 4: Test the Feature

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Navigate to patient profile:**
   - Go to a patient's profile
   - Open the "Forms" section
   - Click "Create Treatment Plan"

3. **Create a test treatment plan:**
   - Fill in patient name
   - Add at least one treatment/procedure
   - Add some costs

4. **Export to PDF:**
   - Click the "Export PDF" button
   - Check if the letterhead appears at the top
   - Verify all data is correct

5. **Check the PDF:**
   - Open the downloaded PDF
   - Verify letterhead is visible
   - Check formatting and layout
   - Ensure all data is included

### Step 5: Adjust if Needed

**If letterhead is too tall/short:**
1. Edit `src/utils/treatmentPlanPdfGenerator.ts`
2. Find line 48: `const letterheadHeight = 60;`
3. Adjust the number:
   - Increase to make more space (e.g., 70, 80)
   - Decrease to make less space (e.g., 50, 40)
4. Test again

**If letterhead is cut off:**
1. Check image dimensions
2. Ensure image width is at least 1200px
3. Try reducing letterheadHeight value

**If letterhead doesn't appear:**
1. Check browser console (F12 → Console tab)
2. Look for error messages
3. Verify file is at `public/letterhead.png`
4. Ensure file is PNG format
5. Try refreshing the page (Ctrl+F5)

---

## File Locations Reference

### Your Project Structure:
```
C:\Users\RV1\Desktop\devv\dental-lab-management\
├── public/
│   ├── logo-wide.png          (existing)
│   └── letterhead.png         ← ADD YOUR FILE HERE
├── src/
│   ├── components/
│   │   └── TreatmentPlanForm.tsx
│   └── utils/
│       └── treatmentPlanPdfGenerator.ts
└── ...
```

### Key Files Modified:
- `src/components/TreatmentPlanForm.tsx` - Added export button
- `src/utils/treatmentPlanPdfGenerator.ts` - PDF generation logic

---

## Troubleshooting

### Problem: "Could not load letterhead image" in console

**Solution:**
1. Verify file exists at `public/letterhead.png`
2. Check file name is exactly `letterhead.png` (case-sensitive)
3. Ensure it's PNG format (not JPG or PDF)
4. Try refreshing the page with Ctrl+F5 (hard refresh)

### Problem: Letterhead appears but is blurry

**Solution:**
1. Use a higher resolution image (at least 1200px wide)
2. Ensure image quality is good
3. Try a different PNG conversion tool

### Problem: Letterhead is cut off at edges

**Solution:**
1. Check image dimensions
2. Reduce letterheadHeight value in code
3. Ensure image has proper margins

### Problem: PDF downloads but letterhead is missing

**Solution:**
1. Check browser console for errors
2. Verify image file exists and is accessible
3. Try a different browser
4. Clear browser cache and try again

### Problem: Text overlaps with letterhead

**Solution:**
1. Increase letterheadHeight value in code
2. Adjust yPosition calculations
3. Increase top margin value

---

## Image Conversion Tools

**Free Online Tools:**
- **CloudConvert**: https://cloudconvert.com/pdf-to-png
- **Zamzar**: https://www.zamzar.com/convert/pdf-to-png/
- **ILovePDF**: https://www.ilovepdf.com/pdf_to_image
- **Online-Convert**: https://image.online-convert.com/convert-to-png

**Desktop Tools:**
- **ImageMagick** (free, command-line)
- **GIMP** (free, open-source)
- **Adobe Acrobat** (paid)
- **Preview** (Mac built-in)

---

## Verification Checklist

Before considering setup complete:

- [ ] Letterhead image is PNG format
- [ ] File is named exactly `letterhead.png`
- [ ] File is in `public/` folder
- [ ] Development server is running
- [ ] Can create a treatment plan
- [ ] "Export PDF" button is visible
- [ ] PDF downloads successfully
- [ ] Letterhead appears in PDF
- [ ] All data is correctly formatted
- [ ] No console errors

---

## Next Steps

Once letterhead is set up:

1. **Test with real data:**
   - Create actual treatment plans
   - Export multiple PDFs
   - Verify consistency

2. **Share with team:**
   - Show users the new feature
   - Explain how to use it
   - Gather feedback

3. **Customize further (optional):**
   - Adjust colors/fonts
   - Add signature fields
   - Include additional sections

4. **Deploy to production:**
   - Commit changes
   - Push to repository
   - Deploy to live server

---

## Support

If you encounter any issues:

1. **Check the console:**
   - Press F12 in browser
   - Go to Console tab
   - Look for error messages

2. **Review the setup guide:**
   - See `TREATMENT_PLAN_PDF_EXPORT_SETUP.md`

3. **Verify file locations:**
   - Ensure letterhead.png is in public/
   - Check file name spelling

4. **Try a different image:**
   - Use a simpler letterhead
   - Test with a basic PNG image
   - Verify the feature works

---

## Questions?

Refer to these documents for more information:
- **Setup Details**: `TREATMENT_PLAN_PDF_EXPORT_SETUP.md`
- **Implementation Summary**: `TREATMENT_PLAN_PDF_EXPORT_SUMMARY.md`
- **Code Files**: 
  - `src/utils/treatmentPlanPdfGenerator.ts`
  - `src/components/TreatmentPlanForm.tsx`

