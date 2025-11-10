/**
 * PDF Layout Configuration - LOCKED
 * 
 * This configuration defines the exact layout, positioning, and styling
 * for all PDF exports and generations. These settings are LOCKED and should
 * not be modified unless explicitly requested.
 * 
 * Last Updated: November 7, 2024
 * Status: LOCKED - Use for all future PDF exports
 */

export const PDF_LAYOUT_CONFIG = {
  // Page Settings
  page: {
    orientation: 'p' as const, // Portrait
    unit: 'mm' as const, // Millimeters
    format: 'a4' as const, // A4 size
    width: 210, // A4 width in mm
    height: 297, // A4 height in mm
  },

  // Margins
  margins: {
    left: 15, // Left margin in mm
    right: 15, // Right margin in mm
    top: 5, // Top margin for logo in mm
    bottom: 5, // Bottom margin for footer in mm
  },

  // HEADER CONFIGURATION (LOCKED)
  header: {
    // Logo Settings
    logo: {
      path: '/logo.png',
      position: {
        x: 15, // Left margin
        y: 5, // Top margin
      },
      width: 50, // Width in mm
      maintainAspectRatio: true,
      // Height is calculated dynamically based on aspect ratio
    },

    // Website Text Settings
    website: {
      text: 'www.nydentalimplants.com',
      fontSize: 12,
      fontFamily: 'Fira Sans',
      fontStyle: 'normal',
      color: {
        r: 55,
        g: 91,
        b: 220,
        hex: '#375BDC',
      },
      alignment: 'right',
      positionRelativeToLine: -5, // 5mm above the line
    },

    // Blue Horizontal Line Settings
    line: {
      color: {
        r: 55,
        g: 91,
        b: 220,
        hex: '#375BDC',
      },
      thickness: 1, // 1mm thick
      spacingAfterLogo: 1, // 1mm spacing after logo
      spacingBelow: 8, // 8mm spacing below line
    },

    // Treatment Plan Date Settings
    date: {
      label: 'Date:',
      fontSize: 10,
      fontFamily: 'Fira Sans',
      fontStyle: 'normal',
      color: {
        r: 0,
        g: 0,
        b: 0,
        hex: '#000000',
      },
      alignment: 'right',
      positionX: 'right', // Right-aligned on page
      spacingAfter: 6, // 6mm spacing after date
    },

    // Letterhead Image Settings
    letterhead: {
      path: '/letterhead.png',
      width: 180, // Full width minus margins (210 - 2*15)
      height: 60, // Height in mm
      spacingAfter: 10, // 10mm spacing after letterhead
    },
  },

  // FOOTER CONFIGURATION (LOCKED)
  footer: {
    // Footer Position
    position: {
      distanceFromBottom: 5, // 5mm from bottom (as low as possible)
    },

    // Footer Border Line
    borderLine: {
      color: {
        r: 55,
        g: 91,
        b: 220,
        hex: '#375BDC',
      },
      thickness: 0.5, // 0.5mm thick
      spacingAbove: 5, // 5mm spacing above border line
    },

    // Tagline Section (Left)
    tagline: {
      text: ['Restoring Smiles,', 'Returning Health and confidence'],
      fontSize: 9,
      fontFamily: 'Fira Sans',
      fontStyle: 'bold',
      color: {
        r: 55,
        g: 91,
        b: 220,
        hex: '#375BDC',
      },
      position: {
        x: 15, // Left margin
      },
      lineSpacing: 5, // 5mm between lines
    },

    // Vertical Separator 1 (After Tagline)
    separator1: {
      position: {
        x: 70, // margin + 55
      },
      color: {
        r: 55,
        g: 91,
        b: 220,
        hex: '#375BDC',
      },
      thickness: 0.5,
      height: 14, // Spans 14mm vertically
    },

    // Phone Section
    phone: {
      heading: 'Phone:',
      content: ['(585)-684-1149', '(585)-394-5910'],
      fontSize: 8,
      fontFamily: 'Fira Sans',
      headingFontStyle: 'bold',
      contentFontStyle: 'normal',
      color: {
        r: 55,
        g: 91,
        b: 220,
        hex: '#375BDC',
      },
      position: {
        x: 75, // margin + 60
      },
      lineSpacing: 5, // 5mm between lines
    },

    // Vertical Separator 2 (After Phone)
    separator2: {
      position: {
        x: 100, // margin + 85
      },
      color: {
        r: 55,
        g: 91,
        b: 220,
        hex: '#375BDC',
      },
      thickness: 0.5,
      height: 14, // Spans 14mm vertically
    },

    // Email Section
    email: {
      heading: 'Email:',
      content: 'contact@nydentalimplants.com',
      fontSize: 8,
      fontFamily: 'Fira Sans',
      headingFontStyle: 'bold',
      contentFontStyle: 'normal',
      color: {
        r: 55,
        g: 91,
        b: 220,
        hex: '#375BDC',
      },
      position: {
        x: 105, // margin + 90
      },
      lineSpacing: 5, // 5mm between lines
    },

    // Vertical Separator 3 (After Email)
    separator3: {
      position: {
        x: 150, // margin + 135
      },
      color: {
        r: 55,
        g: 91,
        b: 220,
        hex: '#375BDC',
      },
      thickness: 0.5,
      height: 14, // Spans 14mm vertically
    },

    // Address Section
    address: {
      heading: 'Address:',
      content: ['344 N. Main St, Canandaigua,', 'New York, 14424'],
      fontSize: 8,
      fontFamily: 'Fira Sans',
      headingFontStyle: 'bold',
      contentFontStyle: 'normal',
      color: {
        r: 55,
        g: 91,
        b: 220,
        hex: '#375BDC',
      },
      position: {
        x: 155, // margin + 140
      },
      lineSpacing: 5, // 5mm between lines
    },
  },

  // Content Area Settings
  content: {
    startYPosition: 0, // Calculated dynamically after header
    endYPosition: 0, // Calculated dynamically before footer
    maxWidth: 180, // Full width minus margins (210 - 2*15)
  },

  // Color Scheme (Brand Colors)
  colors: {
    primary: {
      r: 55,
      g: 91,
      b: 220,
      hex: '#375BDC',
      name: 'Brand Blue',
    },
    text: {
      r: 0,
      g: 0,
      b: 0,
      hex: '#000000',
      name: 'Black',
    },
  },

  // Font Configuration
  fonts: {
    header: {
      family: 'Fira Sans',
      size: 12,
      style: 'normal',
    },
    footer: {
      family: 'Fira Sans',
      size: 8,
      style: 'normal',
    },
    footerHeading: {
      family: 'Fira Sans',
      size: 8,
      style: 'bold',
    },
    footerTagline: {
      family: 'Fira Sans',
      size: 9,
      style: 'bold',
    },
  },
};

/**
 * Helper function to get calculated positions
 */
export const getCalculatedPositions = (logoHeight: number) => {
  const logoBottomY = PDF_LAYOUT_CONFIG.margins.top + logoHeight;
  const lineY = logoBottomY + PDF_LAYOUT_CONFIG.header.line.spacingAfterLogo;
  const contentStartY = lineY + PDF_LAYOUT_CONFIG.header.line.spacingBelow;
  const footerStartY = PDF_LAYOUT_CONFIG.page.height - PDF_LAYOUT_CONFIG.margins.bottom - 20;

  return {
    logoBottomY,
    lineY,
    contentStartY,
    footerStartY,
    contentHeight: footerStartY - contentStartY,
  };
};

/**
 * Layout Specifications Summary
 *
 * HEADER (LOCKED):
 * - Logo: 50mm wide, top-left corner, 5mm from top, aspect ratio maintained
 * - Spacing after logo: 1mm
 * - Website text: 12pt Fira Sans, blue (#375BDC), right-aligned, 5mm above line
 * - Blue line: 1mm thick, full width, #375BDC color
 * - Spacing below line: 8mm
 * - Treatment Plan Date: 10pt Fira Sans, black, right-aligned, below line, 6mm spacing after
 * - Letterhead: Full width (180mm), 60mm height, 10mm spacing after
 * 
 * FOOTER (LOCKED):
 * - Position: 5mm from bottom (as low as possible)
 * - Border line: 0.5mm thick, blue (#375BDC)
 * - Sections: Tagline | Phone | Email | Address
 * - Vertical separators: 3 blue dividers between sections
 * - Font: Fira Sans, 8pt (headings bold, content normal)
 * - Color: Blue (#375BDC)
 * 
 * MARGINS:
 * - Left/Right: 15mm
 * - Top: 5mm
 * - Bottom: 5mm
 * 
 * PAGE:
 * - Format: A4 (210mm x 297mm)
 * - Orientation: Portrait
 * 
 * STATUS: LOCKED - Do not modify without explicit user request
 */

