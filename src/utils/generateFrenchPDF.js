// French-only PDF generator
import { jsPDF } from "jspdf";

// French translation mapping for common electrical terms
const FRENCH_TRANSLATIONS = {
  // Cables and wires
  'كابل': 'Câble',
  'سلك': 'Fil',
  'نحاسي': 'cuivre',
  'مم': 'mm',
  'كابل الهاتف': 'Câble téléphonique',
  'كابل التلفاز': 'Câble TV',
  'كابل الشبكة': 'Câble réseau',
  'كابل الألياف البصرية': 'Fibre optique',
  'كابل HDMI': 'Câble HDMI',
  'كابل USB': 'Câble USB',
  'كابل طاقة': 'Câble d\'alimentation',
  'كابل إشارة': 'Câble signal',
  'كابل تحكم': 'Câble de contrôle',
  'كابل أرضي': 'Câble de terre',
  'كابل محايد': 'Câble neutre',
  
  // Circuit breakers
  'قاطع': 'Disjoncteur',
  'ديفرنشال': 'Différentiel',
  'فيوز': 'Fusible',
  'قاطع ثلاثي الطور': 'Disjoncteur triphasé',
  'قاطع أحادي الطور': 'Disjoncteur monophasé',
  'قاطع مزدوج': 'Disjoncteur double',
  'قاطع رباعي': 'Disjoncteur quadruple',
  'قاطع سداسي': 'Disjoncteur sextuple',
  
  // Switches
  'مفتاح': 'Interrupteur',
  'أحادي': 'simple',
  'مزدوج': 'double',
  'ثلاثي': 'triple',
  'رباعي': 'quadruple',
  'خماسي': 'quintuple',
  'سداسي': 'sextuple',
  'مفتاح مع مؤشر': 'Interrupteur avec voyant',
  'مفتاح مع إضاءة': 'Interrupteur avec éclairage',
  'مفتاح مع مؤقت': 'Interrupteur temporisé',
  'مفتاح مع مستشعر حركة': 'Interrupteur détecteur de mouvement',
  'مفتاح مع مستشعر ضوء': 'Interrupteur détecteur de lumière',
  'مفتاح خارجي': 'Interrupteur extérieur',
  'مفتاح داخلي': 'Interrupteur intérieur',
  'مفتاح مقاوم للماء': 'Interrupteur étanche',
  'مفتاح مقاوم للغبار': 'Interrupteur anti-poussière',
  'مفتاح مقاوم للانفجار': 'Interrupteur antidéflagrant',
  
  // Outlets
  'قابس': 'Prise',
  'قابس مع أرضي': 'Prise avec terre',
  'قابس بدون أرضي': 'Prise sans terre',
  'قابس خارجي': 'Prise extérieure',
  'قابس داخلي': 'Prise intérieure',
  'قابس مقاوم للماء': 'Prise étanche',
  'قابس مقاوم للغبار': 'Prise anti-poussière',
  'قابس مقاوم للانفجار': 'Prise antidéflagrante',
  'قابس USB': 'Prise USB',
  'قابس شبكة': 'Prise réseau',
  'قابس هاتف': 'Prise téléphone',
  'قابس تلفاز': 'Prise TV',
  'قابس إنترنت': 'Prise internet',
  
  // Lighting
  'مصباح': 'Ampoule',
  'LED': 'LED',
  'فلورسنت': 'Fluorescent',
  'هالوجين': 'Halogène',
  'صوديوم': 'Sodium',
  'نيون': 'Néon',
  'سبوت': 'Spot',
  'ثريا': 'Lustre',
  'إضاءة': 'Éclairage',
  'طوارئ': 'urgence',
  'أمان': 'sécurité',
  'خروج': 'sortie',
  'مسار': 'chemin',
  'حديقة': 'jardin',
  'خارجية': 'extérieur',
  
  // Distribution
  'لوحة توزيع': 'Tableau électrique',
  'صندوق توزيع': 'Boîte de dérivation',
  'فتحات': 'pôles',
  'صناعية': 'industriel',
  'منزلية': 'domestique',
  'تجارية': 'commercial',
  
  // Conduits and accessories
  'أنبوب': 'Tuyau',
  'كهرباء': 'électrique',
  'مرن': 'flexible',
  'معدني': 'métallique',
  'قناة': 'Goulotte',
  'وصل': 'Raccord',
  'كوع': 'Coude',
  'تيه': 'Té',
  'غطاء': 'Bouchon',
  'قفل': 'Collier',
  'شريط': 'Ruban',
  'عازل': 'isolant',
  'لاصق': 'adhésif',
  'كهربائي': 'électrique',
  'تفلون': 'Téflon',
  'حراري': 'thermique',
  
  // Hardware
  'مسامير': 'Vis',
  'حامل': 'Support',
  'دومينو': 'Domino',
  'مؤقت': 'Minuterie',
  'مستشعر': 'Capteur',
  'حركة': 'mouvement',
  'ضوء': 'lumière',
  'حرارة': 'température',
  'رطوبة': 'humidité',
  'دخان': 'fumée',
  
  // Tools
  'كماشة': 'Pince',
  'عادية': 'standard',
  'طويلة': 'longue',
  'قصيرة': 'courte',
  'مسطحة': 'plate',
  'مستديرة': 'ronde',
  'مفك': 'Tournevis',
  'مسطح': 'plat',
  'صليبي': 'cruciforme',
  'نجمة': 'étoile',
  'سداسي': 'hexagonal',
  'توركس': 'Torx',
  'قاطع': 'Coupe',
  'أسلاك': 'fils',
  'أنابيب': 'tuyaux',
  'قنوات': 'goulottes',
  'لوحات': 'tableaux',
  'زجاج': 'verre',
  
  // Measurement
  'مقياس': 'Multimètre',
  'كهربائي': 'électrique',
  'جهد': 'tension',
  'تيار': 'courant',
  'مقاومة': 'résistance',
  'استمرارية': 'continuité',
  'عزل': 'isolation',
  'أرضي': 'terre',
  'تردد': 'fréquence',
  'قدرة': 'puissance',
  'معامل قدرة': 'facteur de puissance',
  'اختبار': 'test',
  'مؤشر': 'indicateur',
  
  // Communication
  'راديو': 'radio',
  'تلفاز': 'TV',
  'هاتف': 'téléphone',
  
  // Welding
  'لحام': 'Soudure',
  'كهربائي': 'électrique',
  'غاز': 'gaz',
  
  // Power tools
  'مثقاب': 'Perceuse',
  'يدوي': 'manuel',
  'مطرقة': 'perforateur',
  'منشار': 'Scie',
  'دائري': 'circulaire',
  'شريطي': 'à ruban',
  'ميتري': 'à onglet',
  
  // Power equipment
  'محول': 'Transformateur',
  'مولد': 'Générateur',
  'كهربائي': 'électrique',
  'بطارية': 'Batterie',
  'شاحن': 'Chargeur',
  'شمسي': 'solaire',
  'سيارة': 'voiture',
  'محمول': 'portable',
  'سريع': 'rapide',
  
  // Industrial automation
  'PLC': 'Automate',
  'HMI': 'Interface homme-machine',
  'VFD': 'Variateur de fréquence',
  'Soft Starter': 'Démarreur progressif',
  'Contactor': 'Contacteur',
  'Relay': 'Relais',
  'Timer': 'Minuterie',
  'Counter': 'Compteur',
  'Sensor': 'Capteur',
  'Actuator': 'Actionneur',
  'Valve': 'Vanne',
  'Pump': 'Pompe',
  'Motor': 'Moteur',
  'Fan': 'Ventilateur',
  'Heater': 'Résistance',
  'Cooler': 'Refroidisseur',
  'Thermostat': 'Thermostat',
  'Humidistat': 'Hygrostat',
  'Pressure Switch': 'Pressostat',
  'Level Switch': 'Niveau',
  'Flow Switch': 'Débitmètre',
  'Temperature Sensor': 'Capteur de température',
  'Pressure Sensor': 'Capteur de pression',
  'Level Sensor': 'Capteur de niveau',
  'Flow Sensor': 'Capteur de débit',
  'Vibration Sensor': 'Capteur de vibration',
  'Control Panel': 'Tableau de commande',
  'Operator Panel': 'Pupitre opérateur',
  'Touch Screen': 'Écran tactile',
};

// Function to translate Arabic text to French
function translateToFrench(text) {
  if (!text || typeof text !== 'string') return text;
  
  let translated = text;
  
  // Replace Arabic terms with French equivalents
  Object.keys(FRENCH_TRANSLATIONS).forEach(arabic => {
    const french = FRENCH_TRANSLATIONS[arabic];
    const regex = new RegExp(arabic, 'gi');
    translated = translated.replace(regex, french);
  });
  
  // If no translation found, return a generic French term
  if (translated === text && /[\u0600-\u06FF]/.test(text)) {
    return 'Matériel électrique';
  }
  
  return translated;
}

// Enhanced French price formatting - removes slashes and uses proper formatting
function formatPriceFrench(price) {
  if (isNaN(price)) return '0 DA';
  // Convert to string, remove any existing slashes, then format with French locale
  const cleanNumber = String(price).replace(/\//g, '');
  const numericValue = Number(cleanNumber);
  // Use French locale with spaces as thousand separators
  return `${numericValue.toLocaleString('fr-FR')} DA`;
}

export function generateFrenchPDF(customer, purchases, total, paidByIssamTotal, creditTotal) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20; // Consistent margins
  const contentWidth = pageWidth - (2 * margin);
  let yPosition = 30;

  // Header - PROFESSIONAL MONOCHROME
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0); // Pure black title
  doc.text('Facture Issam Électrique', pageWidth / 2, yPosition, { align: 'center' });
  
  yPosition += 20;
  
  // Customer information - PROFESSIONAL LAYOUT
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0); // Pure black
  
  // Customer details in a clean format
  doc.text(`Client: ${customer.name}`, margin, yPosition);
  yPosition += 8;
  
  if (customer.phone) {
    doc.text(`Téléphone: ${customer.phone}`, margin, yPosition);
    yPosition += 8;
  }
  
  doc.text(`Date: ${new Date().toLocaleDateString('fr-FR')}`, margin, yPosition);
  yPosition += 15;

  // Table header - OPTIMIZED FOR A4
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0); // Pure black
  
  // Calculate optimal column widths for A4
  const headers = ['Produit', 'Qté', 'Prix', 'Magasin', 'Payé par'];
  const totalTableWidth = contentWidth;
  const columnWidths = [
    Math.round(totalTableWidth * 0.35), // Produit - 35%
    Math.round(totalTableWidth * 0.12), // Qté - 12%
    Math.round(totalTableWidth * 0.18), // Prix - 18%
    Math.round(totalTableWidth * 0.20), // Magasin - 20%
    Math.round(totalTableWidth * 0.15)  // Payé par - 15%
  ];
  
  // Adjust last column to fit exactly
  const calculatedWidth = columnWidths.reduce((a, b) => a + b, 0);
  if (calculatedWidth !== totalTableWidth) {
    columnWidths[columnWidths.length - 1] += totalTableWidth - calculatedWidth;
  }
  
  let xPosition = margin;

  // Draw header background - PROFESSIONAL GRAY
  doc.setFillColor(245, 245, 245); // Very light gray for printing
  doc.rect(xPosition, yPosition - 6, totalTableWidth, 10, 'F');

  // Draw header borders and text - CLEAN DESIGN
  headers.forEach((header, index) => {
    doc.setDrawColor(200, 200, 200); // Light gray borders
    doc.rect(xPosition, yPosition - 6, columnWidths[index], 10, 'S');
    doc.setTextColor(0, 0, 0); // Pure black text
    doc.text(header, xPosition + columnWidths[index] / 2, yPosition, { align: 'center' });
    xPosition += columnWidths[index];
  });

  yPosition += 12;

  // Table data - OPTIMIZED FOR READABILITY
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0); // Pure black
  
  purchases.forEach((item, index) => {
    // Check if we need a new page - BETTER PAGE BREAK HANDLING
    if (yPosition > pageHeight - 60) {
      doc.addPage();
      yPosition = 30;
      
      // Redraw header on new page
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      xPosition = margin;
      doc.setFillColor(245, 245, 245);
      doc.rect(xPosition, yPosition - 6, totalTableWidth, 10, 'F');
      
      headers.forEach((header, headerIndex) => {
        doc.setDrawColor(200, 200, 200);
        doc.rect(xPosition, yPosition - 6, columnWidths[headerIndex], 10, 'S');
        doc.setTextColor(0, 0, 0);
        doc.text(header, xPosition + columnWidths[headerIndex] / 2, yPosition, { align: 'center' });
        xPosition += columnWidths[headerIndex];
      });
      yPosition += 12;
    }

    xPosition = margin;
    
    // Zebra striping for better readability - SUBTLE
    if (index % 2 === 1) {
      doc.setFillColor(250, 250, 250); // Very light gray
      doc.rect(xPosition, yPosition - 4, totalTableWidth, 8, 'F');
    }
    
    // Product name (translated to French) - BETTER TEXT HANDLING
    doc.setDrawColor(200, 200, 200);
    doc.rect(xPosition, yPosition - 4, columnWidths[0], 8, 'S');
    doc.setTextColor(0, 0, 0);
    const translatedProductName = translateToFrench(item.item_name);
    const maxProductLength = Math.floor(columnWidths[0] / 3.5); // Better character calculation
    const productName = translatedProductName.length > maxProductLength ? 
      translatedProductName.substring(0, maxProductLength) + '...' : translatedProductName;
    doc.text(productName, xPosition + 3, yPosition);
    xPosition += columnWidths[0];

    // Quantity - CENTERED
    doc.rect(xPosition, yPosition - 4, columnWidths[1], 8, 'S');
    doc.setTextColor(0, 0, 0);
    doc.text((item.quantity || 1).toString(), xPosition + columnWidths[1] / 2, yPosition, { align: 'center' });
    xPosition += columnWidths[1];

    // Price - CLEAN NUMBER FORMATTING
    doc.rect(xPosition, yPosition - 4, columnWidths[2], 8, 'S');
    doc.setTextColor(0, 0, 0);
    doc.text(formatPriceFrench(item.price), xPosition + columnWidths[2] / 2, yPosition, { align: 'center' });
    xPosition += columnWidths[2];

    // Store name (translated to French) - BETTER TEXT HANDLING
    doc.rect(xPosition, yPosition - 4, columnWidths[3], 8, 'S');
    doc.setTextColor(0, 0, 0);
    const translatedStoreName = translateToFrench(item.store_name);
    const maxStoreLength = Math.floor(columnWidths[3] / 3.5);
    const storeName = translatedStoreName.length > maxStoreLength ? 
      translatedStoreName.substring(0, maxStoreLength) + '...' : translatedStoreName;
    doc.text(storeName, xPosition + columnWidths[3] / 2, yPosition, { align: 'center' });
    xPosition += columnWidths[3];

    // Payment status - CLEAN LABELS
    doc.rect(xPosition, yPosition - 4, columnWidths[4], 8, 'S');
    doc.setTextColor(0, 0, 0);
    let paymentText = 'Client';
    if (item.paymentStatus === 'issam') {
      paymentText = 'Issam';
    } else if (item.paymentStatus === 'credit') {
      paymentText = 'Crédit';
    }
    doc.text(paymentText, xPosition + columnWidths[4] / 2, yPosition, { align: 'center' });

    yPosition += 10;
  });

  // Totals section - PROFESSIONAL LAYOUT
  yPosition += 15;
  
  // Draw a separator line
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, yPosition - 5, pageWidth - margin, yPosition - 5);
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text(`Total: ${formatPriceFrench(total)}`, margin, yPosition);

  if (paidByIssamTotal > 0) {
    yPosition += 8;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    doc.text(`Payé par Issam: ${formatPriceFrench(paidByIssamTotal)}`, margin, yPosition);
  }

  if (creditTotal > 0) {
    yPosition += 8;
    doc.setTextColor(0, 0, 0);
    doc.text(`Crédit: ${formatPriceFrench(creditTotal)}`, margin, yPosition);
  }

  // Show advance information after totals - PROFESSIONAL LAYOUT
  if (customer.advance && Number(customer.advance) > 0) {
    yPosition += 12;
    
    // Draw a subtle separator line for advance section
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, yPosition - 5, pageWidth - margin, yPosition - 5);
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text(`Acompte versé par le client: ${formatPriceFrench(customer.advance)}`, margin, yPosition);
    
    // Add advance date if available
    if (customer.advanceDate) {
      yPosition += 6;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      const advanceDate = new Date(customer.advanceDate);
      const formattedDate = advanceDate.toLocaleDateString('fr-FR') + ' - ' + 
                           advanceDate.toLocaleTimeString('fr-FR', { 
                             hour: '2-digit', 
                             minute: '2-digit' 
                           });
      doc.text(`Date de l'acompte: ${formattedDate}`, margin, yPosition);
    }
  }

  // Signature section - PROFESSIONAL ALIGNMENT
  yPosition += 20;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  
  // Left side - Signature
  doc.text('Signature:', margin, yPosition);
  yPosition += 8;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('_________________', margin, yPosition);
  
  // Right side - Date
  yPosition -= 8;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Date:', pageWidth - margin - 40, yPosition);
  yPosition += 8;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('_________________', pageWidth - margin - 40, yPosition);

  // Footer - PROFESSIONAL
  yPosition += 25;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(0, 0, 0);
  doc.text('Merci pour votre confiance', pageWidth / 2, yPosition, { align: 'center' });
  
  // Add company contact info
  yPosition += 8;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Issam Électrique - Tél: 0555 12 34 56', pageWidth / 2, yPosition, { align: 'center' });

  // Save the PDF
  const fileName = `Facture_${customer.name}_${new Date().toLocaleDateString('fr-FR').replace(/\//g, '-')}.pdf`;
  doc.save(fileName);
} 