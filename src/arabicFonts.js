// Arabic Font Configuration for pdfMake
// This file contains Arabic font definitions for proper RTL text support

// Function to create a reliable Arabic font configuration
const createArabicFontConfig = () => {
  // Use a combination of fonts that support Arabic
  return {
    'Arial Unicode MS': {
      normal: 'Arial Unicode MS',
      bold: 'Arial Unicode MS',
      italics: 'Arial Unicode MS',
      bolditalics: 'Arial Unicode MS'
    },
    'Segoe UI': {
      normal: 'Segoe UI',
      bold: 'Segoe UI',
      italics: 'Segoe UI',
      bolditalics: 'Segoe UI'
    },
    'Tahoma': {
      normal: 'Tahoma',
      bold: 'Tahoma',
      italics: 'Tahoma',
      bolditalics: 'Tahoma'
    },
    'Arial': {
      normal: 'Arial',
      bold: 'Arial',
      italics: 'Arial',
      bolditalics: 'Arial'
    }
  };
};

// Arabic font configuration with multiple fallback options
export const getArabicFont = () => {
  return createArabicFontConfig();
};

// Function to get the best available Arabic font
export const getBestArabicFont = async () => {
  // For now, use the reliable fallback fonts
  // In the future, we can add CDN font loading here
  return createArabicFontConfig();
};

// PDF document configuration for Arabic
export const getArabicPDFConfig = (content) => {
  return {
    defaultStyle: {
      font: 'Arial Unicode MS',
      fontSize: 12,
      alignment: 'right'
    },
    pageSize: 'A4',
    pageMargins: [40, 60, 40, 60],
    content: content,
    styles: {
      header: {
        fontSize: 24,
        bold: true,
        alignment: 'center',
        margin: [0, 0, 0, 20]
      },
      customerInfo: {
        fontSize: 14,
        margin: [0, 0, 0, 5]
      },
      tableHeader: {
        bold: true,
        fontSize: 12,
        color: 'black',
        alignment: 'center',
        fillColor: '#f0f0f0'
      },
      tableCell: {
        fontSize: 10,
        alignment: 'right',
        preserveLeadingSpaces: true
      },
      total: {
        fontSize: 14,
        bold: true,
        alignment: 'right'
      },
      signature: {
        fontSize: 12,
        bold: true,
        alignment: 'right'
      },
      signatureLine: {
        fontSize: 12,
        alignment: 'right'
      },
      footer: {
        fontSize: 12,
        italics: true,
        alignment: 'center',
        color: 'gray'
      }
    }
  };
};

// Function to setup pdfMake with Arabic fonts
export const setupPdfMakeWithArabic = async () => {
  try {
    const pdfMake = await import('pdfmake/build/pdfmake');
    const pdfFonts = await import('pdfmake/build/vfs_fonts');
    
    // Set up virtual file system
    pdfMake.vfs = pdfFonts.pdfMake.vfs;
    
    return pdfMake;
  } catch (error) {
    console.error('Error setting up pdfMake with Arabic fonts:', error);
    throw error;
  }
}; 