// Enhanced PDF generator with proper Arabic support
import { jsPDF } from "jspdf";

// French translation mapping for common electrical terms
const FRENCH_TRANSLATIONS = {
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
  'كابل طاقة': "Câble d'alimentation",
  'كابل إشارة': 'Câble signal',
  'كابل تحكم': 'Câble de contrôle',
  'كابل أرضي': 'Câble de terre',
  'كابل محايد': 'Câble neutre',
  'قاطع': 'Disjoncteur',
  'ديفرنشال': 'Différentiel',
  'فيوز': 'Fusible',
  'قاطع ثلاثي الطور': 'Disjoncteur triphasé',
  'قاطع أحادي الطور': 'Disjoncteur monophasé',
  'قاطع مزدوج': 'Disjoncteur double',
  'قاطع رباعي': 'Disjoncteur quadruple',
  'قاطع سداسي': 'Disjoncteur sextuple',
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
  'لوحة توزيع': 'Tableau électrique',
  'صندوق توزيع': 'Boîte de dérivation',
  'فتحات': 'pôles',
  'صناعية': 'industriel',
  'منزلية': 'domestique',
  'تجارية': 'commercial',
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
  'راديو': 'radio',
  'تلفاز': 'TV',
  'هاتف': 'téléphone',
  'لحام': 'Soudure',
  'كهربائي': 'électrique',
  'غاز': 'gaz',
  'مثقاب': 'Perceuse',
  'يدوي': 'manuel',
  'مطرقة': 'perforateur',
  'منشار': 'Scie',
  'دائري': 'circulaire',
  'شريطي': 'à ruban',
  'ميتري': 'à onglet',
  'محول': 'Transformateur',
  'مولد': 'Générateur',
  'كهربائي': 'électrique',
  'بطارية': 'Batterie',
  'شاحن': 'Chargeur',
  'شمسي': 'solaire',
  'سيارة': 'voiture',
  'محمول': 'portable',
  'سريع': 'rapide',
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

function translateToFrench(text) {
  if (!text || typeof text !== 'string') return text;
  let translated = text;
  Object.keys(FRENCH_TRANSLATIONS).forEach(arabic => {
    const french = FRENCH_TRANSLATIONS[arabic];
    const regex = new RegExp(arabic, 'gi');
    translated = translated.replace(regex, french);
  });
  if (translated === text && /[\u0600-\u06FF]/.test(text)) {
    return 'Matériel électrique';
  }
  return translated;
}

// Enhanced number formatting function - removes slashes and uses proper formatting
function formatNumber(number) {
  if (isNaN(number)) return '0';
  // Convert to string, remove any existing slashes, then format with commas
  const cleanNumber = String(number).replace(/\//g, '');
  const numericValue = Number(cleanNumber);
  // Use standard number formatting with commas
  return numericValue.toLocaleString('en-US');
}

export function generatePDF(customer, items = null, signature = "", footer = "") {
  // Create PDF with proper RTL support
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });
  
  // Set RTL direction for Arabic text
  doc.setR2L(true);
  
  // Use provided items or fall back to customer purchases
  const purchaseItems = items || (customer.purchases || []);
  
  // Page dimensions - OPTIMIZED FOR A4
  const pageWidth = 210; // A4 width in mm
  const pageHeight = 297; // A4 height in mm
  const margin = 20; // Professional margins
  const contentWidth = pageWidth - (2 * margin);
  
  // Header
  let y = margin;
  
  // Company title - PROFESSIONAL MONOCHROME
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0); // Pure black title
  doc.text("عصام إلكتريك", pageWidth - margin, y, { align: 'right' });
  
  y += 10;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0); // Pure black
  doc.text("فاتورة", pageWidth - margin, y, { align: 'right' });
  y += 15;
  
  // Customer information - PROFESSIONAL LAYOUT
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0); // Pure black
  doc.text("معلومات العميل:", pageWidth - margin, y, { align: 'right' });
  
  y += 8;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0); // Pure black
  // Always use French translation for customer name
  const frenchName = translateToFrench(customer.name || "-");
  doc.text(`الاسم: ${frenchName}`, pageWidth - margin, y, { align: 'right' });
  
  y += 6;
  if (customer.phone) {
    doc.setTextColor(0, 0, 0); // Pure black
    doc.text(`الهاتف: ${customer.phone}`, pageWidth - margin, y, { align: 'right' });
    y += 6;
  }

  
  if (customer.notes) {
    doc.setTextColor(0, 0, 0); // Pure black
    doc.text(`ملاحظات: ${customer.notes}`, pageWidth - margin, y, { align: 'right' });
    y += 6;
  }
  
  y += 6;
  doc.setTextColor(0, 0, 0); // Pure black
  doc.text(`التاريخ: ${new Date().toLocaleDateString('ar-SA')}`, pageWidth - margin, y, { align: 'right' });
  
  y += 12;
  
  // Table header - OPTIMIZED FOR A4
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0); // Pure black

  // Table layout - OPTIMIZED COLUMN WIDTHS
  const colGap = 2; // Gap between columns
  // Proportions: [item, qty, price, store, date] = [0.35, 0.12, 0.18, 0.20, 0.15]
  const colProps = [0.35, 0.12, 0.18, 0.20, 0.15];
  let colWidths = colProps.map(p => Math.round(contentWidth * p));
  let widthSum = colWidths.reduce((a, b) => a + b, 0) + (colGap * (colWidths.length - 1));
  if (widthSum !== contentWidth) {
    colWidths[0] += contentWidth - widthSum;
  }
  const colPositions = [];
  let colX = pageWidth - margin;
  for (let i = 0; i < colWidths.length; i++) {
    colPositions[i] = colX - colWidths[i];
    colX -= colWidths[i] + colGap;
  }

  // Draw table header background - PROFESSIONAL GRAY
  doc.setFillColor(245, 245, 245); // Very light gray for printing
  doc.rect(colPositions[4], y, contentWidth, 10, 'F');

  // Draw table header text - PROFESSIONAL
  doc.setTextColor(0, 0, 0); // Pure black
  doc.text("اسم السلعة", colPositions[0] + colWidths[0] - 4, y + 7, { align: 'right' });
  doc.text("الكمية", colPositions[1] + colWidths[1] - 4, y + 7, { align: 'right' });
  doc.text("السعر", colPositions[2] + colWidths[2] - 4, y + 7, { align: 'right' });
  doc.text("المحل", colPositions[3] + colWidths[3] - 4, y + 7, { align: 'right' });
  doc.text("التاريخ", colPositions[4] + colWidths[4] - 4, y + 7, { align: 'right' });

  y += 8;

  // Draw header line
  doc.setLineWidth(0.5);
  doc.setDrawColor(200, 200, 200); // Light gray line
  doc.line(margin, y, pageWidth - margin, y);

  y += 2;

  // Table content - OPTIMIZED FOR READABILITY
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0); // Pure black

  let total = 0;
  let paidByIssamTotal = 0;

  purchaseItems.forEach((item, index) => {
    // Ensure all values are properly converted
    const itemName = String(item.item_name || item.itemName || "");
    const quantity = parseInt(item.quantity) || 1;
    const price = parseFloat(item.price) || 0;
    const storeName = String(item.store_name || item.storeName || "");
    const date = String(item.date || "");
    const paidByIssam = Boolean(item.paidByIssam);

    const itemTotal = price * quantity;
    total += itemTotal;
    if (paidByIssam) {
      paidByIssamTotal += itemTotal;
    }

    // Check if we need a new page - BETTER PAGE BREAK HANDLING
    if (y > pageHeight - 60) {
      doc.addPage();
      y = margin;
      
      // Redraw header on new page
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.setFillColor(245, 245, 245);
      doc.rect(colPositions[4], y, contentWidth, 10, 'F');
      
      doc.text("اسم السلعة", colPositions[0] + colWidths[0] - 4, y + 7, { align: 'right' });
      doc.text("الكمية", colPositions[1] + colWidths[1] - 4, y + 7, { align: 'right' });
      doc.text("السعر", colPositions[2] + colWidths[2] - 4, y + 7, { align: 'right' });
      doc.text("المحل", colPositions[3] + colWidths[3] - 4, y + 7, { align: 'right' });
      doc.text("التاريخ", colPositions[4] + colWidths[4] - 4, y + 7, { align: 'right' });
      
      y += 8;
      doc.setDrawColor(200, 200, 200);
      doc.line(margin, y, pageWidth - margin, y);
      y += 2;
    }

    // Truncate long text to fit in columns - BETTER TEXT HANDLING
    const maxItemNameLength = Math.floor(colWidths[0] / 3.5);
    const maxStoreNameLength = Math.floor(colWidths[3] / 3.5);
    const truncatedItemName = itemName.length > maxItemNameLength ? 
      itemName.substring(0, maxItemNameLength) + "..." : itemName;
    const truncatedStoreName = storeName.length > maxStoreNameLength ? 
      storeName.substring(0, maxStoreNameLength) + "..." : storeName;

    // Draw row background (zebra striping) - SUBTLE
    if (index % 2 === 1) {
      doc.setFillColor(250, 250, 250); // Very light gray for printing
      doc.rect(colPositions[4], y, contentWidth, 8, 'F');
    }

    // Draw cell borders - PROFESSIONAL
    for (let i = 0; i < colPositions.length; i++) {
      doc.setDrawColor(200, 200, 200); // Light gray borders
      doc.rect(colPositions[i], y, colWidths[i], 8);
    }

    // Draw row content with padding - CLEAN NUMBER FORMATTING
    doc.setTextColor(0, 0, 0); // Pure black text
    doc.text(truncatedItemName, colPositions[0] + colWidths[0] - 4, y + 6, { align: 'right' });
    doc.text(quantity.toString(), colPositions[1] + colWidths[1] - 4, y + 6, { align: 'right' });
    doc.text(formatNumber(price), colPositions[2] + colWidths[2] - 4, y + 6, { align: 'right' });
    doc.text(truncatedStoreName, colPositions[3] + colWidths[3] - 4, y + 6, { align: 'right' });
    doc.text(date, colPositions[4] + colWidths[4] - 4, y + 6, { align: 'right' });

    // Add "Paid by Issam" indicator if applicable - CLEAN
    if (paidByIssam) {
      doc.setFontSize(8);
      doc.setTextColor(0, 0, 0); // Pure black text
      doc.text("(مدفوع من عصام)", colPositions[0] + colWidths[0] - 4, y + 8, { align: 'right' });
      doc.setFontSize(10);
    }

    y += 8;
  });

  // Draw bottom line
  y += 2;
  doc.setDrawColor(200, 200, 200); // Light gray line
  doc.line(margin, y, pageWidth - margin, y);

  y += 10;
  
  // Totals section - PROFESSIONAL LAYOUT
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0); // Pure black
  
  doc.text(`المجموع الإجمالي: ${formatNumber(total)} دج`, pageWidth - margin, y, { align: 'right' });
  
  if (paidByIssamTotal > 0) {
    y += 8;
    doc.setTextColor(0, 0, 0); // Pure black
    doc.text(`مدفوع من عصام: ${formatNumber(paidByIssamTotal)} دج`, pageWidth - margin, y, { align: 'right' });
  }
  
  // Show advance information after totals - PROFESSIONAL LAYOUT
  if (customer.advance && Number(customer.advance) > 0) {
    y += 12;
    
    // Draw a subtle separator line for advance section
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, y - 5, pageWidth - margin, y - 5);
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text(`تسبيق من الزبون: ${formatNumber(customer.advance)} دج`, pageWidth - margin, y, { align: 'right' });
    
    // Add advance date if available
    if (customer.advanceDate) {
      y += 6;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      const advanceDate = new Date(customer.advanceDate);
      const formattedDate = advanceDate.toLocaleDateString('ar-SA') + ' - ' + 
                           advanceDate.toLocaleTimeString('ar-SA', { 
                             hour: '2-digit', 
                             minute: '2-digit' 
                           });
      doc.text(`تاريخ التسبيق: ${formattedDate}`, pageWidth - margin, y, { align: 'right' });
    }
  }
  
  // Signature section - PROFESSIONAL ALIGNMENT
  if (signature) {
    y += 15;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0); // Pure black
    doc.text(`التوقيع: ${signature}`, pageWidth - margin, y, { align: 'right' });
  }
  
  // Footer
  if (footer) {
    y += 10;
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0); // Pure black
    doc.text(footer, pageWidth - margin, y, { align: 'right' });
  }
  
  // Company footer - PROFESSIONAL
  y += 15;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(0, 0, 0); // Pure black
  doc.text("شكراً لثقتكم بنا", pageWidth / 2, y, { align: 'center' });
  
  // Add company contact info
  y += 8;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text("عصام إلكتريك - هاتف: 0555 12 34 56", pageWidth / 2, y, { align: 'center' });
  
  // Generate filename with current date
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  const filename = `فاتورة_${frenchName || "invoice"}_${dateStr}.pdf`;
  
  doc.save(filename);
} 