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
  
  // Switches and outlets
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
  
  // Distribution boards
  'لوحة توزيع': 'Tableau électrique',
  'صندوق توزيع': 'Boîte de dérivation',
  'فتحات': 'pôles',
  'صناعية': 'industriel',
  'منزلية': 'domestique',
  'تجارية': 'commercial',
  
  // Conduits
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
  
  // Accessories
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
  
  // Industrial equipment
  'محول': 'Transformateur',
  'مولد': 'Générateur',
  'كهربائي': 'électrique',
  'بطارية': 'Batterie',
  'شاحن': 'Chargeur',
  'شمسي': 'solaire',
  'سيارة': 'voiture',
  'محمول': 'portable',
  'سريع': 'rapide',
  
  // Automation
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
  'Keypad': 'Clavier',
  'Display': 'Affichage',
  'Communication Module': 'Module de communication',
  'Network Module': 'Module réseau',
  'I/O Module': 'Module E/S',
  'Analog Module': 'Module analogique',
  'Digital Module': 'Module numérique',
  
  // Security
  'كاميرا': 'Caméra',
  'مراقبة': 'surveillance',
  'مسجل': 'Enregistreur',
  'فيديو': 'vidéo',
  'شاشة': 'Écran',
  'نظام': 'Système',
  'إنذار': 'alarme',
  'كاشف': 'Détecteur',
  'صافرة': 'Sirène',
  'ضوء': 'Lampe',
  'لوحة تحكم': 'Tableau de contrôle',
  'مفتاح طوارئ': 'Bouton d\'urgence',
  'زر': 'Bouton',
  'قفل': 'Serrure',
  'إلكتروني': 'électronique',
  'قارئ': 'Lecteur',
  'بطاقة': 'carte',
  'بصمة': 'empreinte',
  'وجه': 'visage',
  'عين': 'iris',
  'بوابة': 'Porte',
  'أمان': 'sécurité',
  'حاجز': 'Barrière',
  'دوارة': 'tourniquet',
  'انزلاقية': 'coulissante',
  'مرفوعة': 'levante',
  'نظام صوت': 'Système audio',
  'ميكروفون': 'Microphone',
  'مكبر صوت': 'Haut-parleur',
  'سماعة': 'Écouteur',
  'جهاز اتصال داخلي': 'Interphone',
  
  // Renewable energy
  'لوح شمسي': 'Panneau solaire',
  'منظم شمسي': 'Régulateur solaire',
  'عاكس شمسي': 'Onduleur solaire',
  'بطارية شمسية': 'Batterie solaire',
  'حامل لوح شمسي': 'Support panneau solaire',
  'قاعدة لوح شمسي': 'Base panneau solaire',
  'كابل شمسي': 'Câble solaire',
  'صندوق توصيل شمسي': 'Boîte de jonction solaire',
  'صمام شمسي': 'Diode solaire'
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

// French price formatting
function formatPriceFrench(price) {
  if (isNaN(price)) return '';
  return `${Number(price).toLocaleString('fr-FR')} DA`;
}

export function generateFrenchPDF(customer, purchases, total, paidByIssamTotal, creditTotal) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Set document properties
  doc.setProperties({
    title: `Facture ${customer.name}`,
    subject: 'Facture d\'achats électriques',
    author: 'Issam Électrique'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPosition = 30;

  // Header
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Facture Issam Électrique', pageWidth / 2, yPosition, { align: 'center' });
  
  yPosition += 15;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.text(`Client: ${customer.name}`, 20, yPosition);
  
  yPosition += 10;
  doc.text(`Date: ${new Date().toLocaleDateString('fr-FR')}`, 20, yPosition);
  
  yPosition += 20;

  // Table header
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  
  const headers = ['Produit', 'Quantité', 'Prix', 'Magasin', 'Payé par'];
  const columnWidths = [70, 25, 35, 40, 30];
  let xPosition = 20;

  // Draw header
  headers.forEach((header, index) => {
    doc.rect(xPosition, yPosition - 5, columnWidths[index], 8, 'S');
    doc.text(header, xPosition + columnWidths[index] / 2, yPosition, { align: 'center' });
    xPosition += columnWidths[index];
  });

  yPosition += 10;

  // Table data
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  purchases.forEach((item) => {
    if (yPosition > pageHeight - 40) {
      doc.addPage();
      yPosition = 30;
    }

    xPosition = 20;
    
    // Product name (translated to French)
    doc.rect(xPosition, yPosition - 5, columnWidths[0], 8, 'S');
    const translatedProductName = translateToFrench(item.item_name);
    const productName = translatedProductName.length > 25 ? translatedProductName.substring(0, 25) + '...' : translatedProductName;
    doc.text(productName, xPosition + 2, yPosition);
    xPosition += columnWidths[0];

    // Quantity
    doc.rect(xPosition, yPosition - 5, columnWidths[1], 8, 'S');
    doc.text((item.quantity || 1).toString(), xPosition + columnWidths[1] / 2, yPosition, { align: 'center' });
    xPosition += columnWidths[1];

    // Price
    doc.rect(xPosition, yPosition - 5, columnWidths[2], 8, 'S');
    doc.text(formatPriceFrench(item.price), xPosition + columnWidths[2] / 2, yPosition, { align: 'center' });
    xPosition += columnWidths[2];

    // Store name (translated to French)
    doc.rect(xPosition, yPosition - 5, columnWidths[3], 8, 'S');
    const translatedStoreName = translateToFrench(item.store_name);
    const storeName = translatedStoreName.length > 15 ? translatedStoreName.substring(0, 15) + '...' : translatedStoreName;
    doc.text(storeName, xPosition + columnWidths[3] / 2, yPosition, { align: 'center' });
    xPosition += columnWidths[3];

    // Payment status
    doc.rect(xPosition, yPosition - 5, columnWidths[4], 8, 'S');
    let paymentText = 'Client';
    if (item.paymentStatus === 'issam') {
      paymentText = 'Issam';
    } else if (item.paymentStatus === 'credit') {
      paymentText = 'Crédit';
    }
    doc.text(paymentText, xPosition + columnWidths[4] / 2, yPosition, { align: 'center' });

    yPosition += 10;
  });

  // Totals
  yPosition += 10;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(`Total: ${formatPriceFrench(total)}`, 20, yPosition);

  if (paidByIssamTotal > 0) {
    yPosition += 6;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Payé par Issam: ${formatPriceFrench(paidByIssamTotal)}`, 20, yPosition);
  }

  if (creditTotal > 0) {
    yPosition += 6;
    doc.text(`Crédit: ${formatPriceFrench(creditTotal)}`, 20, yPosition);
  }

  // Signature section
  yPosition += 15;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Signature:', 20, yPosition);
  doc.text('Date:', pageWidth / 2, yPosition);
  
  yPosition += 10;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('_________________', 20, yPosition);
  doc.text('_________________', pageWidth / 2, yPosition);

  // Footer
  yPosition += 20;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'italic');
  doc.text('Merci pour votre confiance', pageWidth / 2, yPosition, { align: 'center' });

  // Save the PDF
  const fileName = `Facture_${customer.name}_${new Date().toLocaleDateString('fr-FR').replace(/\//g, '-')}.pdf`;
  doc.save(fileName);
  
  console.log('French PDF Export completed successfully');
} 