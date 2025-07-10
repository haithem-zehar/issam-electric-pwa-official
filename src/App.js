import React, { useState, useEffect } from "react";
import "./App.css";
import { generatePDF } from "./utils/generatePDF";
import { generateFrenchPDF } from "./utils/generateFrenchPDF";
import * as XLSX from 'xlsx';
import { getBestArabicFont, getArabicPDFConfig, setupPdfMakeWithArabic } from './arabicFonts';
// Password protection configuration
const correctPassword = 'issam123';

// Database functions using localStorage
const CLIENTS_KEY = 'clients';
const PURCHASES_KEY = 'purchases';
const EMPLOYEES_KEY = 'employees';
const EXPENSES_KEY = 'expenses';

function getLocal(key) {
  return JSON.parse(localStorage.getItem(key) || '[]');
}
function setLocal(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}
function getNextId(items) {
  return items.length > 0 ? Math.max(...items.map(i => i.id)) + 1 : 1;
}

// Database functions
const addClient = async (name, phone, advance, notes = "") => {
  const clients = getLocal(CLIENTS_KEY);
  const id = getNextId(clients);
  const now = new Date();
  const advanceData = Number(advance) || 0;
  
  const newClient = { 
    id: String(id), 
    name, 
    phone, 
    advance: advanceData,
    advanceDate: advanceData > 0 ? now.toISOString() : null, // Record timestamp when advance is added
    notes: notes || "", // Add notes field
    purchases: [] 
  };
  clients.push(newClient);
  setLocal(CLIENTS_KEY, clients);
  console.log("Added client:", newClient);
  return newClient;
};

const getClients = async () => {
  return getLocal(CLIENTS_KEY) || [];
};

const updateClient = async (id, name, phone, advance, notes) => {
  const clients = getLocal(CLIENTS_KEY);
  const idx = clients.findIndex(c => c.id === id);
  if (idx !== -1) {
    const oldAdvance = clients[idx].advance || 0;
    const newAdvance = Number(advance) || 0;
    const now = new Date();
    
    // Only update advanceDate if the advance amount has changed
    let advanceDate = clients[idx].advanceDate;
    if (newAdvance !== oldAdvance) {
      advanceDate = newAdvance > 0 ? now.toISOString() : null;
    }
    
    clients[idx] = { 
      ...clients[idx], 
      name, 
      phone, 
      advance: newAdvance,
      advanceDate: advanceDate,
      notes: notes || clients[idx].notes || "" // Preserve existing notes if not provided
    };
    setLocal(CLIENTS_KEY, clients);
  }
};

const updateClientNotes = async (id, notes) => {
  const clients = getLocal(CLIENTS_KEY);
  const idx = clients.findIndex(c => c.id === id);
  if (idx !== -1) {
    clients[idx] = { 
      ...clients[idx], 
      notes: notes || ""
    };
    setLocal(CLIENTS_KEY, clients);
  }
};

const deleteClient = async (id) => {
  const clients = getLocal(CLIENTS_KEY).filter(c => c.id !== id);
  setLocal(CLIENTS_KEY, clients);
};

const addPurchase = async (client_id, item_name, quantity, price, store_name, date, paymentStatus = "customer") => {
  const purchases = getLocal(PURCHASES_KEY);
  const id = getNextId(purchases);
  const newPurchase = { 
    id, 
    client_id: String(client_id), // Ensure client_id is always a string
    item_name, 
    quantity, 
    price, 
    store_name, 
    date, 
    paymentStatus // "issam", "customer", or "credit"
  };
  purchases.push(newPurchase);
  setLocal(PURCHASES_KEY, purchases);
  console.log("Added purchase:", newPurchase);
  return newPurchase;
};

const getPurchasesByClient = async (client_id) => {
  const purchases = getLocal(PURCHASES_KEY);
  // Ensure consistent ID comparison (convert both to strings)
  const clientPurchases = purchases.filter(p => String(p.client_id) === String(client_id));
  console.log(`Found ${clientPurchases.length} purchases for client ${client_id}:`, clientPurchases);
  return clientPurchases;
};

const updatePurchase = async (id, fields) => {
  const purchases = getLocal(PURCHASES_KEY);
  const idx = purchases.findIndex(p => p.id === id);
  if (idx !== -1) {
    purchases[idx] = { ...purchases[idx], ...fields };
    setLocal(PURCHASES_KEY, purchases);
  }
};

const deletePurchase = async (id) => {
  const purchases = getLocal(PURCHASES_KEY).filter(p => p.id !== id);
  setLocal(PURCHASES_KEY, purchases);
};

const addEmployee = async (name, daily_wage, work_days) => {
  const employees = getLocal(EMPLOYEES_KEY);
  const id = getNextId(employees);
  employees.push({ id, name, daily_wage, work_days });
  setLocal(EMPLOYEES_KEY, employees);
};

const getEmployees = async () => {
  return getLocal(EMPLOYEES_KEY);
};

const updateEmployee = async (id, fields) => {
  const employees = getLocal(EMPLOYEES_KEY);
  const idx = employees.findIndex(e => e.id === id);
  if (idx !== -1) {
    employees[idx] = { ...employees[idx], ...fields };
    setLocal(EMPLOYEES_KEY, employees);
  }
};

const deleteEmployee = async (id) => {
  const employees = getLocal(EMPLOYEES_KEY).filter(e => e.id !== id);
  setLocal(EMPLOYEES_KEY, employees);
};

const addExpense = async (title, amount, date) => {
  const expenses = getLocal(EXPENSES_KEY);
  const id = getNextId(expenses);
  expenses.push({ id, title, amount, date });
  setLocal(EXPENSES_KEY, expenses);
};

const getExpenses = async () => {
  return getLocal(EXPENSES_KEY);
};

const updateExpense = async (id, fields) => {
  const expenses = getLocal(EXPENSES_KEY);
  const idx = expenses.findIndex(e => e.id === id);
  if (idx !== -1) {
    expenses[idx] = { ...expenses[idx], ...fields };
    setLocal(EXPENSES_KEY, expenses);
  }
};

const deleteExpense = async (id) => {
  const expenses = getLocal(EXPENSES_KEY).filter(e => e.id !== id);
  setLocal(EXPENSES_KEY, expenses);
};

const getTotalSalaries = async () => {
  const employees = getLocal(EMPLOYEES_KEY);
  return employees.reduce((sum, e) => sum + (e.daily_wage * e.work_days), 0);
};

const getTotalPurchases = async () => {
  const purchases = getLocal(PURCHASES_KEY);
  return purchases.reduce((sum, p) => sum + (p.price * p.quantity), 0);
};

const getClientReport = async (client_id) => {
  const clients = getLocal(CLIENTS_KEY);
  const client = clients.find(c => c.id === client_id);
  const purchases = await getPurchasesByClient(client_id);
  return { ...client, purchases };
};

const getEmployeeReport = async (employee_id) => {
  const employees = getLocal(EMPLOYEES_KEY);
  return employees.find(e => e.id === employee_id);
};

const initDatabase = async () => {
  // Migration: Convert old paidByIssam field to paymentStatus
  const purchases = getLocal(PURCHASES_KEY);
  let needsMigration = false;
  
  purchases.forEach(purchase => {
    if (purchase.paidByIssam !== undefined && purchase.paymentStatus === undefined) {
      purchase.paymentStatus = purchase.paidByIssam ? 'issam' : 'customer';
      delete purchase.paidByIssam;
      needsMigration = true;
    }
  });
  
  if (needsMigration) {
    setLocal(PURCHASES_KEY, purchases);
    console.log('Migrated purchases to new payment status format');
  }
};

const LOCAL_STORAGE_KEY = "isam_electric_customers";
const EMPLOYEE_STORAGE_KEY = "isam_electric_employees";

// --- 1. Price formatting helper ---
function formatPriceArabic(price) {
  // Enhanced number formatting - removes slashes and uses proper formatting
  if (isNaN(price)) return '0 دج';
  // Convert to string, remove any existing slashes, then format with commas
  const cleanNumber = String(price).replace(/\//g, '');
  const numericValue = Number(cleanNumber);
  // Use standard number formatting with commas
  return `${numericValue.toLocaleString('en-US')} دج`;
}

// --- 2. Advance date formatting helper ---
function formatAdvanceDate(advanceDate) {
  if (!advanceDate) return '';
  
  try {
    const date = new Date(advanceDate);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // Format: "15/12/2024 - 14:30" (DD/MM/YYYY - HH:MM)
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    const formattedDate = `${day}/${month}/${year} - ${hours}:${minutes}`;
    
    // Add relative time for recent advances (within 7 days)
    if (diffDays <= 7) {
      if (diffDays === 0) {
        return `${formattedDate} (اليوم)`;
      } else if (diffDays === 1) {
        return `${formattedDate} (أمس)`;
      } else {
        return `${formattedDate} (منذ ${diffDays} أيام)`;
      }
    }
    
    return formattedDate;
  } catch (error) {
    console.error('Error formatting advance date:', error);
    return '';
  }
}

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

const DEFAULT_USERNAME = 'issam';
const DEFAULT_PASSWORD = '123';

function App() {
  // Password protection state
  const [username, setUsername] = useState(() => localStorage.getItem('isam_username') || DEFAULT_USERNAME);
  const [password, setPassword] = useState(() => localStorage.getItem('isam_password') || DEFAULT_PASSWORD);
  const [isAuthenticated, setIsAuthenticated] = useState(() => localStorage.getItem('isam_authenticated') === 'true');
  const [passwordError, setPasswordError] = useState("");

  // Navigation state
  const [activeSection, setActiveSection] = useState("customers");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmMessage, setConfirmMessage] = useState("");

  // Offline status
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [showOfflineNotification, setShowOfflineNotification] = useState(false);
  
  // PWA installation
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  // Customer management
  const [customers, setCustomers] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [newCustomer, setNewCustomer] = useState({ name: "", phone: "", advance: "", notes: "" });

  // Purchase management (per customer)
  const [itemName, setItemName] = useState("");
  const [price, setPrice] = useState("");
  const [storeName, setStoreName] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [paymentStatus, setPaymentStatus] = useState("customer"); // "issam", "customer", "credit"
  const [formError, setFormError] = useState("");
  const [selectedPurchaseClientId, setSelectedPurchaseClientId] = useState("");
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [invoiceItems, setInvoiceItems] = useState([]);
  const [invoiceSignature, setInvoiceSignature] = useState("");
  const [invoiceFooter, setInvoiceFooter] = useState("");
  const [purchaseFilter, setPurchaseFilter] = useState("all"); // all, client, issam, credit
  const [date, setDate] = useState(new Date().toLocaleDateString('en-GB'));

  // Employee management with enhanced state
  const [employees, setEmployees] = useState([
    { id: "1", name: "عمران", dailyWage: 2000, workDays: 0, isPaid: false, jobType: "electrician" },
    { id: "2", name: "محفوظ", dailyWage: 2000, workDays: 0, isPaid: false, jobType: "electrician" },
    { id: "3", name: "عبد الرحيم", dailyWage: 2000, workDays: 0, isPaid: false, jobType: "electrician" }
  ]);
  const [newEmployee, setNewEmployee] = useState({ 
    name: "", 
    dailyWage: 2000
  });

  // Add state for search
  const [customerSearch, setCustomerSearch] = useState("");
  
  // Add state for editing client notes
  const [editingNotes, setEditingNotes] = useState({});
  const [showNotesEditor, setShowNotesEditor] = useState({});
  
  // Add state for advance payments
  const [showAdvanceModal, setShowAdvanceModal] = useState({});
  const [advanceAmount, setAdvanceAmount] = useState({});

  // Comprehensive electrical materials list for residential and industrial work
  const ELECTRICAL_MATERIALS = [
    // === CABLES & WIRES (كابلات وأسلاك) ===
    "كابل 1.5 مم", "كابل 2.5 مم", "كابل 4 مم", "كابل 6 مم", "كابل 10 مم", "كابل 16 مم", "كابل 25 مم", "كابل 35 مم",
    "كابل 50 مم", "كابل 70 مم", "كابل 95 مم", "كابل 120 مم", "كابل 150 مم", "كابل 185 مم", "كابل 240 مم",
    "سلك نحاسي 1.5", "سلك نحاسي 2.5", "سلك نحاسي 4", "سلك نحاسي 6", "سلك نحاسي 10",
    "كابل الهاتف", "كابل التلفاز", "كابل الشبكة", "كابل الألياف البصرية", "كابل HDMI", "كابل USB",
    "كابل طاقة", "كابل إشارة", "كابل تحكم", "كابل أرضي", "كابل محايد",
    // === CIRCUIT BREAKERS & PROTECTION (قواطع وحماية) ===
    "قاطع 6A", "قاطع 10A", "قاطع 16A", "قاطع 20A", "قاطع 25A", "قاطع 32A", "قاطع 40A", "قاطع 50A", "قاطع 63A",
    "قاطع 80A", "قاطع 100A", "قاطع 125A", "قاطع 160A", "قاطع 200A", "قاطع 250A", "قاطع 315A", "قاطع 400A",
    "ديفرنشال 25A", "ديفرنشال 32A", "ديفرنشال 40A", "ديفرنشال 63A", "ديفرنشال 80A", "ديفرنشال 100A",
    "قاطع ثلاثي الطور", "قاطع أحادي الطور", "قاطع مزدوج", "قاطع رباعي", "قاطع سداسي",
    "فيوز 6A", "فيوز 10A", "فيوز 16A", "فيوز 20A", "فيوز 25A", "فيوز 32A", "فيوز 40A", "فيوز 50A",
    "حامي من زيادة الجهد", "حامي من الصواعق", "حامي من التيار الزائد", "حامي من التسريب الأرضي",
    // === SWITCHES & OUTLETS (مفاتيح وقوابس) ===
    "مفتاح أحادي", "مفتاح مزدوج", "مفتاح ثلاثي", "مفتاح رباعي", "مفتاح خماسي", "مفتاح سداسي",
    "مفتاح مع مؤشر", "مفتاح مع إضاءة", "مفتاح مع مؤقت", "مفتاح مع مستشعر حركة", "مفتاح مع مستشعر ضوء",
    "مفتاح خارجي", "مفتاح داخلي", "مفتاح مقاوم للماء", "مفتاح مقاوم للغبار", "مفتاح مقاوم للانفجار",
    "قابس أحادي", "قابس مزدوج", "قابس ثلاثي", "قابس رباعي", "قابس مع أرضي", "قابس بدون أرضي",
    "قابس خارجي", "قابس داخلي", "قابس مقاوم للماء", "قابس مقاوم للغبار", "قابس مقاوم للانفجار",
    "قابس USB", "قابس شبكة", "قابس هاتف", "قابس تلفاز", "قابس إنترنت",
    // === LIGHTING (إضاءة) ===
    "مصباح LED 3W", "مصباح LED 5W", "مصباح LED 7W", "مصباح LED 9W", "مصباح LED 12W", "مصباح LED 15W", "مصباح LED 18W", "مصباح LED 20W",
    "مصباح LED 24W", "مصباح LED 30W", "مصباح LED 36W", "مصباح LED 40W", "مصباح LED 50W", "مصباح LED 60W", "مصباح LED 80W", "مصباح LED 100W",
    "مصباح فلورسنت 18W", "مصباح فلورسنت 36W", "مصباح فلورسنت 58W", "مصباح هالوجين 50W", "مصباح هالوجين 100W",
    "مصباح صوديوم 70W", "مصباح صوديوم 150W", "مصباح صوديوم 250W", "مصباح صوديوم 400W",
    "نيون أحمر", "نيون أخضر", "نيون أزرق", "نيون أصفر", "نيون أبيض", "نيون وردي", "نيون برتقالي",
    "سبوت LED", "سبوت هالوجين", "سبوت فلورسنت", "سبوت صوديوم",
    "ثريا LED", "ثريا هالوجين", "ثريا فلورسنت", "ثريا كلاسيكية", "ثريا حديثة",
    "LED panel 30x30", "LED panel 60x60", "LED panel 60x120", "LED panel 30x120",
    "إضاءة طوارئ", "إضاءة أمان", "إضاءة خروج", "إضاءة مسار", "إضاءة حديقة", "إضاءة خارجية",
    // === DISTRIBUTION BOARDS & PANELS (لوحات توزيع) ===
    "لوحة توزيع 4 قواطع", "لوحة توزيع 6 قواطع", "لوحة توزيع 8 قواطع", "لوحة توزيع 12 قواطع", "لوحة توزيع 16 قواطع",
    "لوحة توزيع 20 قواطع", "لوحة توزيع 24 قواطع", "لوحة توزيع 32 قواطع", "لوحة توزيع 40 قواطع",
    "لوحة توزيع خارجية", "لوحة توزيع داخلية", "لوحة توزيع مقاومة للماء", "لوحة توزيع مقاومة للغبار",
    "لوحة توزيع مقاومة للانفجار", "لوحة توزيع صناعية", "لوحة توزيع منزلية", "لوحة توزيع تجارية",
    "صندوق توزيع 4 فتحات", "صندوق توزيع 6 فتحات", "صندوق توزيع 8 فتحات", "صندوق توزيع 12 فتحة",
    "صندوق توزيع 16 فتحة", "صندوق توزيع 20 فتحة", "صندوق توزيع 24 فتحة", "صندوق توزيع 32 فتحة",
    "صندوق توزيع خارجي", "صندوق توزيع داخلي", "صندوق توزيع مقاوم للماء", "صندوق توزيع مقاوم للغبار",
    // === CONDUITS & TRUNKING (أنابيب وقنوات) ===
    "أنبوب كهرباء 20 مم", "أنبوب كهرباء 25 مم", "أنبوب كهرباء 32 مم", "أنبوب كهرباء 40 مم", "أنبوب كهرباء 50 مم",
    "أنبوب كهرباء 63 مم", "أنبوب كهرباء 75 مم", "أنبوب كهرباء 90 مم", "أنبوب كهرباء 110 مم",
    "أنبوب مرن 20 مم", "أنبوب مرن 25 مم", "أنبوب مرن 32 مم", "أنبوب مرن 40 مم", "أنبوب مرن 50 مم",
    "أنبوب معدني 20 مم", "أنبوب معدني 25 مم", "أنبوب معدني 32 مم", "أنبوب معدني 40 مم", "أنبوب معدني 50 مم",
    "قناة كهرباء 50x50", "قناة كهرباء 75x50", "قناة كهرباء 100x50", "قناة كهرباء 150x50", "قناة كهرباء 200x50",
    "قناة كهرباء 50x75", "قناة كهرباء 75x75", "قناة كهرباء 100x75", "قناة كهرباء 150x75", "قناة كهرباء 200x75",
    "قناة كهرباء 50x100", "قناة كهرباء 75x100", "قناة كهرباء 100x100", "قناة كهرباء 150x100", "قناة كهرباء 200x100",
    "قناة مرنة 50x50", "قناة مرنة 75x50", "قناة مرنة 100x50", "قناة مرنة 150x50", "قناة مرنة 200x50",
    // === ACCESSORIES & FITTINGS (ملحقات وتركيبات) ===
    "شريط عازل", "شريط لاصق", "شريط كهربائي", "شريط تفلون", "شريط حراري",
    "مسامير كهرباء", "مسامير أنابيب", "مسامير لوحات", "مسامير قنوات", "مسامير ثريا",
    "حامل ثريا", "حامل مصباح", "حامل سبوت", "حامل لوحة", "حامل أنبوب",
    "دومينو 2 فتحة", "دومينو 3 فتحة", "دومينو 4 فتحة", "دومينو 5 فتحة", "دومينو 6 فتحة",
    "دومينو 8 فتحة", "دومينو 10 فتحة", "دومينو 12 فتحة", "دومينو 16 فتحة", "دومينو 20 فتحة",
    "وصل أنبوب", "كوع أنبوب", "تيه أنبوب", "غطاء أنبوب", "قفل أنبوب",
    "وصل قناة", "كوع قناة", "تيه قناة", "غطاء قناة", "قفل قناة",
    "مؤقت إضاءة", "مؤقت مفتاح", "مؤقت قابس", "مؤقت لوحة", "مؤقت نظام",
    "مستشعر حركة", "مستشعر ضوء", "مستشعر حرارة", "مستشعر رطوبة", "مستشعر دخان",
    // === TOOLS & EQUIPMENT (أدوات ومعدات) ===
    "كماشة عادية", "كماشة طويلة", "كماشة قصيرة", "كماشة مسطحة", "كماشة مستديرة",
    "مفك مسطح", "مفك صليبي", "مفك نجمة", "مفك سداسي", "مفك توركس",
    "قاطع أسلاك", "قاطع أنابيب", "قاطع قنوات", "قاطع لوحات", "قاطع زجاج",
    "مقياس كهربائي", "مقياس جهد", "مقياس تيار", "مقياس مقاومة", "مقياس استمرارية",
    "مقياس عزل", "مقياس أرضي", "مقياس تردد", "مقياس قدرة", "مقياس معامل قدرة",
    "مفك اختبار", "مفك مؤشر", "مفك راديو", "مفك تلفاز", "مفك هاتف",
    "لحام كهربائي", "لحام غاز", "لحام لحام", "لحام لحام", "لحام لحام",
    "مثقاب كهربائي", "مثقاب يدوي", "مثقاب مطرقة", "مثقاب مطرقة", "مثقاب مطرقة",
    "منشار كهربائي", "منشار يدوي", "منشار دائري", "منشار شريطي", "منشار ميتري",
    // === INDUSTRIAL EQUIPMENT (معدات صناعية) ===
    "محول 220V/12V", "محول 220V/24V", "محول 220V/48V", "محول 380V/220V", "محول 380V/110V",
    "محول 1KVA", "محول 2KVA", "محول 3KVA", "محول 5KVA", "محول 10KVA", "محول 15KVA", "محول 20KVA",
    "محول 25KVA", "محول 30KVA", "محول 40KVA", "محول 50KVA", "محول 63KVA", "محول 80KVA",
    "محول 100KVA", "محول 125KVA", "محول 160KVA", "محول 200KVA", "محول 250KVA", "محول 315KVA",
    "مولد كهربائي 5KVA", "مولد كهربائي 10KVA", "مولد كهربائي 15KVA", "مولد كهربائي 20KVA",
    "مولد كهربائي 25KVA", "مولد كهربائي 30KVA", "مولد كهربائي 40KVA", "مولد كهربائي 50KVA",
    "مولد كهربائي 60KVA", "مولد كهربائي 80KVA", "مولد كهربائي 100KVA", "مولد كهربائي 125KVA",
    "UPS 500VA", "UPS 1000VA", "UPS 1500VA", "UPS 2000VA", "UPS 3000VA", "UPS 5000VA",
    "بطارية 12V 7Ah", "بطارية 12V 12Ah", "بطارية 12V 18Ah", "بطارية 12V 24Ah", "بطارية 12V 35Ah",
    "بطارية 12V 50Ah", "بطارية 12V 65Ah", "بطارية 12V 100Ah", "بطارية 12V 150Ah", "بطارية 12V 200Ah",
    "شاحن بطارية", "شاحن شمسي", "شاحن سيارة", "شاحن محمول", "شاحن سريع",
    // === AUTOMATION & CONTROL (أتمتة وتحكم) ===
    "PLC", "HMI", "VFD", "Soft Starter", "Contactor", "Relay", "Timer", "Counter",
    "Sensor", "Actuator", "Valve", "Pump", "Motor", "Fan", "Heater", "Cooler",
    "Thermostat", "Humidistat", "Pressure Switch", "Level Switch", "Flow Switch",
    "Temperature Sensor", "Pressure Sensor", "Level Sensor", "Flow Sensor", "Vibration Sensor",
    "Control Panel", "Operator Panel", "Touch Screen", "Keypad", "Display",
    "Communication Module", "Network Module", "I/O Module", "Analog Module", "Digital Module",
    // === SECURITY & ACCESS CONTROL (أمان ومراقبة) ===
    "كاميرا مراقبة", "مسجل فيديو", "شاشة مراقبة", "كابل كاميرا", "محول كاميرا",
    "نظام إنذار", "كاشف دخان", "كاشف حرارة", "كاشف حركة", "كاشف كسر زجاج",
    "صافرة إنذار", "ضوء إنذار", "لوحة تحكم إنذار", "مفتاح طوارئ", "زر إنذار",
    "قفل إلكتروني", "قارئ بطاقة", "قارئ بصمة", "قارئ وجه", "قارئ عين",
    "بوابة أمان", "حاجز أمان", "بوابة دوارة", "بوابة انزلاقية", "بوابة مرفوعة",
    "نظام صوت", "ميكروفون", "مكبر صوت", "سماعة", "جهاز اتصال داخلي",
    // === RENEWABLE ENERGY (طاقة متجددة) ===
    "لوح شمسي 100W", "لوح شمسي 200W", "لوح شمسي 300W", "لوح شمسي 400W", "لوح شمسي 500W",
    "لوح شمسي 600W", "لوح شمسي 700W", "لوح شمسي 800W", "لوح شمسي 900W", "لوح شمسي 1000W",
    "منظم شمسي 10A", "منظم شمسي 20A", "منظم شمسي 30A", "منظم شمسي 40A", "منظم شمسي 50A",
    "منظم شمسي 60A", "منظم شمسي 80A", "منظم شمسي 100A", "منظم شمسي 150A", "منظم شمسي 200A",
    "عاكس شمسي 500W", "عاكس شمسي 1000W", "عاكس شمسي 1500W", "عاكس شمسي 2000W", "عاكس شمسي 3000W",
    "عاكس شمسي 5000W", "عاكس شمسي 8000W", "عاكس شمسي 10000W", "عاكس شمسي 15000W", "عاكس شمسي 20000W",
    "بطارية شمسية 12V 100Ah", "بطارية شمسية 12V 150Ah", "بطارية شمسية 12V 200Ah", "بطارية شمسية 24V 100Ah",
    "بطارية شمسية 24V 150Ah", "بطارية شمسية 24V 200Ah", "بطارية شمسية 48V 100Ah", "بطارية شمسية 48V 150Ah",
    "حامل لوح شمسي", "قاعدة لوح شمسي", "كابل شمسي", "صندوق توصيل شمسي", "صمام شمسي"
  ];

  // Add autocomplete state
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);

  // Password protection functions
  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (username === DEFAULT_USERNAME && password === DEFAULT_PASSWORD) {
      setIsAuthenticated(true);
      setPasswordError("");
      localStorage.setItem('isam_authenticated', 'true');
      localStorage.setItem('isam_username', username);
      localStorage.setItem('isam_password', password);
    } else {
      setPasswordError("اسم المستخدم أو كلمة المرور غير صحيحة. يرجى المحاولة مرة أخرى.");
    }
  };
  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
    if (passwordError) setPasswordError("");
  };
  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (passwordError) setPasswordError("");
  };
  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('isam_authenticated');
    localStorage.removeItem('isam_username');
    localStorage.removeItem('isam_password');
    setUsername(DEFAULT_USERNAME);
    setPassword(DEFAULT_PASSWORD);
  };

  // Load from localStorage
  useEffect(() => {
    (async () => {
      await initDatabase();
      const dbClients = await getClients();
      setCustomers(dbClients);
      if (Array.isArray(dbClients) && dbClients.length > 0) setSelectedCustomerId(dbClients[0].id);
      const dbEmployees = await getEmployees();
      setEmployees(dbEmployees);
    })();
  }, []);

  // Handle online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      setShowOfflineNotification(false);
    };

    const handleOffline = () => {
      setIsOffline(true);
      setShowOfflineNotification(true);
      // Hide notification after 5 seconds
      setTimeout(() => setShowOfflineNotification(false), 5000);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Handle PWA installation
  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
    };

    const handleAppInstalled = () => {
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
      console.log('PWA was installed');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallPWA = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
      setDeferredPrompt(null);
      setShowInstallPrompt(false);
    }
  };

  // Initialize default workers on first load
  useEffect(() => {
    const initializeDefaultWorkers = async () => {
      const existingEmployees = await getEmployees();
      if (existingEmployees.length === 0) {
        // Add default workers
        const defaultWorkers = [
          { name: "عبد الرحيم", dailyWage: 2000, workDays: 0, isPaid: false },
          { name: "محفوظ", dailyWage: 2000, workDays: 0, isPaid: false },
          { name: "عمران", dailyWage: 2000, workDays: 0, isPaid: false }
        ];
        
        for (const worker of defaultWorkers) {
          await addEmployee(worker.name, worker.dailyWage, worker.workDays);
        }
        
        // Refresh the employees list
        const updatedEmployees = await getEmployees();
        setEmployees(updatedEmployees);
      }
    };
    
    initializeDefaultWorkers();
  }, []);

  // Save to localStorage
  useEffect(() => {
    // No longer needed as data is saved to DB
  }, [customers]);

  useEffect(() => {
    // No longer needed as data is saved to DB
  }, [employees]);

  // Backup data weekly
  useEffect(() => {
    // No longer needed as data is saved to DB
  }, [customers, employees]);

  // Replace customer and employee state initialization and CRUD with async DB calls
  const handleAddCustomer = async (e) => {
    e.preventDefault();
    if (!newCustomer.name) return setFormError("يرجى إدخال اسم الزبون");
    try {
      const newClient = await addClient(newCustomer.name, newCustomer.phone, newCustomer.advance, newCustomer.notes);
      setCustomers(await getClients());
      setSelectedCustomerId(newClient.id);
      setNewCustomer({ name: "", phone: "", advance: "", notes: "" });
      console.log("Customer added successfully:", newClient);
    } catch (error) {
      setFormError("حدث خطأ أثناء إضافة الزبون");
    }
  };

  // Handle notes editing
  const handleEditNotes = (clientId) => {
    const client = customers.find(c => c.id === clientId);
    setEditingNotes({ ...editingNotes, [clientId]: client.notes || "" });
    setShowNotesEditor({ ...showNotesEditor, [clientId]: true });
  };

  const handleSaveNotes = async (clientId) => {
    try {
      await updateClientNotes(clientId, editingNotes[clientId]);
      setCustomers(await getClients());
      setShowNotesEditor({ ...showNotesEditor, [clientId]: false });
      setEditingNotes({ ...editingNotes, [clientId]: "" });
    } catch (error) {
      console.error("Error updating notes:", error);
    }
  };

  const handleCancelNotes = (clientId) => {
    setShowNotesEditor({ ...showNotesEditor, [clientId]: false });
    setEditingNotes({ ...editingNotes, [clientId]: "" });
  };

  // Handle advance payments
  const handleAddAdvance = (clientId) => {
    const client = customers.find(c => c.id === clientId);
    setAdvanceAmount({ ...advanceAmount, [clientId]: "" });
    setShowAdvanceModal({ ...showAdvanceModal, [clientId]: true });
  };

  const handleSaveAdvance = async (clientId) => {
    const amount = parseFloat(advanceAmount[clientId]);
    if (isNaN(amount) || amount <= 0) {
      alert("يرجى إدخال مبلغ صحيح");
      return;
    }

    try {
      const client = customers.find(c => c.id === clientId);
      const currentAdvance = parseFloat(client.advance) || 0;
      const newTotalAdvance = currentAdvance + amount;
      
      // Update client with new advance amount and timestamp
      await updateClient(clientId, client.name, client.phone, newTotalAdvance.toString(), client.notes);
      
      // Refresh customers list
      setCustomers(await getClients());
      
      // Close modal and reset
      setShowAdvanceModal({ ...showAdvanceModal, [clientId]: false });
      setAdvanceAmount({ ...advanceAmount, [clientId]: "" });
      
      // Show success message
      const successMessage = `تم إضافة تسبيق بقيمة ${formatPriceArabic(amount)} للزبون ${client.name}\nإجمالي التسبيق: ${formatPriceArabic(newTotalAdvance)}`;
      alert(successMessage);
      
      console.log(`Advance payment of ${amount} added for client ${client.name}`);
    } catch (error) {
      console.error("Error adding advance payment:", error);
      alert("حدث خطأ أثناء إضافة التسبيق");
    }
  };

  const handleCancelAdvance = (clientId) => {
    setShowAdvanceModal({ ...showAdvanceModal, [clientId]: false });
    setAdvanceAmount({ ...advanceAmount, [clientId]: "" });
  };

  // Clean purchase handling with client selection
  const handleAdd = async (e) => {
    e.preventDefault();
    setFormError("");
    
    if (!itemName || !price || !storeName || !selectedCustomerId) {
      setFormError("يرجى ملء جميع الحقول المطلوبة.");
      return;
    }
    if (isNaN(price) || Number(price) <= 0) {
      setFormError("أدخل سعر صحيح.");
      return;
    }
    if (isNaN(quantity) || Number(quantity) < 1) {
      setFormError("الكمية يجب أن تكون 1 على الأقل.");
      return;
    }
    
    try {
      // Add purchase with payment status
      await addPurchase(selectedCustomerId, itemName, parseInt(quantity), parseFloat(price), storeName, new Date().toLocaleDateString('en-GB'), paymentStatus);
      
      // Refresh purchases for the selected customer
      const purchases = await getPurchasesByClient(selectedCustomerId);
      setSelectedCustomerPurchases(purchases);
      
      // Reset form
      setItemName("");
      setPrice("");
      setStoreName("");
      setQuantity(1);
      setPaymentStatus("customer");
      setDate(new Date().toLocaleDateString('en-GB'));
      
      // Clear any errors
      setFormError("");
    } catch (error) {
      console.error("Error adding purchase:", error);
      setFormError("حدث خطأ أثناء إضافة السلعة. يرجى المحاولة مرة أخرى.");
    }
  };

  // French Excel export function
  const handleExportToExcel = (customer) => {
    if (!customer || !selectedCustomerPurchases?.length) return;
    
    const workbook = {
      SheetNames: ['Facture'],
      Sheets: {
        'Facture': {
          '!ref': 'A1:G' + (selectedCustomerPurchases.length + 12),
          // Header styling
          A1: { v: 'Facture Issam Électrique', t: 's', s: { font: { bold: true, size: 16 } } },
          A2: { v: 'Client: ' + customer.name, t: 's', s: { font: { bold: true, size: 12 } } },
          A3: { v: 'Date: ' + new Date().toLocaleDateString('fr-FR'), t: 's' },
          A4: { v: '', t: 's' },
          // Table headers
          A6: { v: 'Produit', t: 's', s: { font: { bold: true }, fill: { fgColor: { rgb: "4472C4" } }, font: { color: { rgb: "FFFFFF" } } } },
          B6: { v: 'Quantité', t: 's', s: { font: { bold: true }, fill: { fgColor: { rgb: "4472C4" } }, font: { color: { rgb: "FFFFFF" } } } },
          C6: { v: 'Prix unitaire', t: 's', s: { font: { bold: true }, fill: { fgColor: { rgb: "4472C4" } }, font: { color: { rgb: "FFFFFF" } } } },
          D6: { v: 'Total', t: 's', s: { font: { bold: true }, fill: { fgColor: { rgb: "4472C4" } }, font: { color: { rgb: "FFFFFF" } } } },
          E6: { v: 'Magasin', t: 's', s: { font: { bold: true }, fill: { fgColor: { rgb: "4472C4" } }, font: { color: { rgb: "FFFFFF" } } } },
          F6: { v: 'Payé par', t: 's', s: { font: { bold: true }, fill: { fgColor: { rgb: "4472C4" } }, font: { color: { rgb: "FFFFFF" } } } }
        }
      }
    };

    // Add purchase data
    selectedCustomerPurchases.forEach((item, index) => {
      const row = index + 7;
      const total = parseFloat(item.price) * (parseInt(item.quantity) || 1);
      
      // Translate product name to French
      const translatedProductName = translateToFrench(item.item_name);
      const translatedStoreName = translateToFrench(item.store_name);
      
      workbook.Sheets['Facture'][`A${row}`] = { v: translatedProductName, t: 's' };
      workbook.Sheets['Facture'][`B${row}`] = { v: item.quantity || 1, t: 'n' };
      workbook.Sheets['Facture'][`C${row}`] = { v: parseFloat(item.price), t: 'n' };
      workbook.Sheets['Facture'][`D${row}`] = { v: total, t: 'n' };
      workbook.Sheets['Facture'][`E${row}`] = { v: translatedStoreName, t: 's' };
      
      // Handle payment status display
      let paymentText = 'Client';
      if (item.paymentStatus === 'issam') {
        paymentText = 'Issam';
      } else if (item.paymentStatus === 'credit') {
        paymentText = 'Crédit';
      }
      
      workbook.Sheets['Facture'][`F${row}`] = { v: paymentText, t: 's' };
    });

    // Add totals
    const totalRow = selectedCustomerPurchases.length + 8;
    const grandTotal = selectedCustomerPurchases.reduce((sum, item) => 
      sum + (parseFloat(item.price) * (parseInt(item.quantity) || 1)), 0
    );
    
    workbook.Sheets['Facture'][`A${totalRow}`] = { v: 'Total général:', t: 's', s: { font: { bold: true } } };
    workbook.Sheets['Facture'][`D${totalRow}`] = { v: grandTotal, t: 'n', s: { font: { bold: true } } };
    
    const paidByIssamTotal = selectedCustomerPurchases
      .filter(item => item.paymentStatus === 'issam')
      .reduce((sum, item) => sum + (parseFloat(item.price) * (parseInt(item.quantity) || 1)), 0);
    
    if (paidByIssamTotal > 0) {
      workbook.Sheets['Facture'][`A${totalRow + 1}`] = { v: 'Payé par Issam:', t: 's' };
      workbook.Sheets['Facture'][`D${totalRow + 1}`] = { v: paidByIssamTotal, t: 'n' };
    }
    
    const creditTotal = selectedCustomerPurchases
      .filter(item => item.paymentStatus === 'credit')
      .reduce((sum, item) => sum + (parseFloat(item.price) * (parseInt(item.quantity) || 1)), 0);
    
    if (creditTotal > 0) {
      workbook.Sheets['Facture'][`A${totalRow + 2}`] = { v: 'Crédit:', t: 's' };
      workbook.Sheets['Facture'][`D${totalRow + 2}`] = { v: creditTotal, t: 'n' };
    }

    // Add signature section
    const signatureRow = totalRow + 3;
    workbook.Sheets['Facture'][`A${signatureRow}`] = { v: 'Signature:', t: 's', s: { font: { bold: true } } };
    workbook.Sheets['Facture'][`A${signatureRow + 1}`] = { v: '_________________', t: 's' };
    workbook.Sheets['Facture'][`D${signatureRow}`] = { v: 'Date:', t: 's', s: { font: { bold: true } } };
    workbook.Sheets['Facture'][`D${signatureRow + 1}`] = { v: '_________________', t: 's' };

    // Add footer
    workbook.Sheets['Facture'][`A${signatureRow + 3}`] = { v: 'Merci pour votre confiance', t: 's', s: { font: { italic: true } } };

    // Convert to blob and download
    const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'binary' });
    const blob = new Blob([s2ab(wbout)], { type: 'application/octet-stream' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Facture_${customer.name}_${new Date().toLocaleDateString('fr-FR').replace(/\//g, '-')}.xlsx`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Helper function for Excel export
  const s2ab = (s) => {
    const buf = new ArrayBuffer(s.length);
    const view = new Uint8Array(buf);
    for (let i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xFF;
    return buf;
  };

  // Update handleDeletePurchase to use deletePurchase
  const handleDeletePurchase = async (itemId) => {
    const purchase = selectedCustomerPurchases.find(p => p.id === itemId);
    if (!purchase) return;
    
    setConfirmMessage(`هل أنت متأكد من حذف السلعة "${purchase.item_name}"؟`);
    setConfirmAction(() => async () => {
      try {
        await deletePurchase(itemId);
        const purchases = await getPurchasesByClient(selectedCustomerId);
        setSelectedCustomerPurchases(purchases);
        setShowConfirmModal(false);
      } catch (error) {
        console.error("Error deleting purchase:", error);
        setFormError("حدث خطأ أثناء حذف السلعة.");
      }
    });
    setShowConfirmModal(true);
  };

  // Update employee CRUD to use DB
  const updateEmployeeWorkDays = async (employeeId, workDays) => {
    const value = workDays === '' ? 0 : Math.max(0, parseInt(workDays) || 0);
    
    // Update local state immediately for live calculation
    setEmployees(prevEmployees => 
      prevEmployees.map(emp => 
        emp.id === employeeId 
          ? { ...emp, workDays: value }
          : emp
      )
    );
    
    // Update database
    await updateEmployee(employeeId, { work_days: value });
  };
  
  const updateEmployeeWage = async (employeeId, dailyWage) => {
    const value = dailyWage === '' ? 0 : Math.max(0, parseInt(dailyWage) || 0);
    
    // Update local state immediately for live calculation
    setEmployees(prevEmployees => 
      prevEmployees.map(emp => 
        emp.id === employeeId 
          ? { ...emp, dailyWage: value }
          : emp
      )
    );
    
    // Update database
    await updateEmployee(employeeId, { daily_wage: value });
  };
  const toggleEmployeePayment = async (employeeId) => {
    const currentEmployee = employees.find(emp => emp.id === employeeId);
    if (!currentEmployee) return;

    // If marking as paid, show professional confirmation modal
    if (!currentEmployee.isPaid) {
      setConfirmMessage(`هل تريد تأكيد دفع الراتب للعامل "${currentEmployee.name}"؟\n\nسيتم إعادة تعيين عدد أيام العمل إلى 0.`);
      setConfirmAction(() => async () => {
        // Update local state immediately for live calculation
        setEmployees(prevEmployees => 
          prevEmployees.map(emp => 
            emp.id === employeeId 
              ? { ...emp, isPaid: true, workDays: 0 }
              : emp
          )
        );
        
        // Update database
        await updateEmployee(employeeId, { is_paid: true, work_days: 0 });
        setShowConfirmModal(false);
      });
      setShowConfirmModal(true);
    } else {
      // If unmarking as paid, just toggle the status
      setEmployees(prevEmployees => 
        prevEmployees.map(emp => 
          emp.id === employeeId 
            ? { ...emp, isPaid: false }
            : emp
        )
      );
      
      await updateEmployee(employeeId, { is_paid: false });
    }
  };
  const addEmployeeHandler = async (e) => {
    e.preventDefault();
    
    if (!newEmployee.name.trim()) {
      alert("يرجى إدخال اسم العامل");
      return;
    }
    
    try {
      const employeeData = {
        name: newEmployee.name.trim(),
        dailyWage: parseFloat(newEmployee.dailyWage) || 2000,
        workDays: 0
      };
      
      // Add to database
      await addEmployee(employeeData.name, employeeData.dailyWage, employeeData.workDays);
      
      // Get updated list and update state immediately
      const dbEmployees = await getEmployees();
      setEmployees(dbEmployees);
      
      // Reset form
      setNewEmployee({ 
        name: "", 
        dailyWage: 2000
      });
      
    } catch (error) {
      console.error("Error adding employee:", error);
      alert("حدث خطأ أثناء إضافة العامل");
    }
  };
  const deleteEmployeeHandler = async (employeeId) => {
    const employee = employees.find(emp => emp.id === employeeId);
    if (!employee) return;
    
    if (confirm(`هل أنت متأكد من حذف العامل "${employee.name}"؟`)) {
      try {
        // Remove from database
        await deleteEmployee(employeeId);
        
        // Update local state immediately
        setEmployees(prevEmployees => 
          prevEmployees.filter(emp => emp.id !== employeeId)
        );
        
      } catch (error) {
        console.error("Error deleting employee:", error);
        alert("حدث خطأ أثناء حذف العامل");
      }
    }
  };

  const handleDeleteClient = async (clientId) => {
    const client = customers.find(c => c.id === clientId);
    if (!client) return;
    
    setConfirmMessage(`هل أنت متأكد من حذف الزبون "${client.name}"؟ سيتم حذف جميع مشترياته أيضاً.`);
    setConfirmAction(() => async () => {
      await deleteClient(clientId);
      const dbClients = await getClients();
      setCustomers(dbClients);
      if (selectedCustomerId === clientId) setSelectedCustomerId("");
      setShowConfirmModal(false);
    });
    setShowConfirmModal(true);
  };

  // French-only PDF export function
  const handlePDF = async () => {
    console.log('French PDF Export - Debug Info:');
    console.log('Selected Customer ID:', selectedCustomerId);
    console.log('Selected Customer Purchases:', selectedCustomerPurchases);
    console.log('Selected Customer Purchases Length:', selectedCustomerPurchases?.length);
    
    if (!selectedCustomerId || !selectedCustomerPurchases?.length) {
      alert('Veuillez sélectionner un client et afficher ses achats d\'abord');
      return;
    }

    const customer = customers.find(c => c.id === selectedCustomerId);
    if (!customer) return;

    // Capture data at the beginning to avoid state changes during PDF generation
    const purchasesData = [...selectedCustomerPurchases];
    const customerData = { ...customer };
    const totalAmount = purchasesData.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
    const paidByIssamAmount = purchasesData
      .filter(item => item.paymentStatus === 'issam')
      .reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
    const creditAmount = purchasesData
      .filter(item => item.paymentStatus === 'credit')
      .reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);

    try {
      // Use the French PDF generator
      generateFrenchPDF(customerData, purchasesData, totalAmount, paidByIssamAmount, creditAmount);
      console.log('French PDF Export completed successfully');
      
    } catch (error) {
      console.error('Error generating French PDF:', error);
      alert('Erreur lors de la génération du PDF. Veuillez réessayer.');
    }
  };



  // Invoice generation functions
  const openInvoiceModal = () => {
    const customer = customers.find((c) => c.id === selectedCustomerId);
    if (customer) {
      setInvoiceItems(selectedCustomerPurchases || []);
      setInvoiceSignature("عصام إلكتريك");
      setInvoiceFooter("شكراً لثقتكم بنا - للتواصل: 0555 12 34 56");
      setShowInvoiceModal(true);
    }
  };

  const generateInvoicePDF = () => {
    const customer = customers.find((c) => c.id === selectedCustomerId);
    if (customer && invoiceItems.length > 0) {
      generatePDF(customer, invoiceItems, invoiceSignature, invoiceFooter);
      setShowInvoiceModal(false);
    }
  };

  const sendInvoiceEmail = () => {
    const customer = customers.find((c) => c.id === selectedCustomerId);
    if (customer && customer.phone) {
      const message = generateWhatsAppMessage(customer);
      const url = `https://wa.me/${customer.phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
      window.open(url, "_blank");
    }
  };

  // WhatsApp message
  const generateWhatsAppMessage = (customer) => {
    let message = `الزبون: ${customer.name || "-"}`;
    if (customer.phone) message += `\nالهاتف: ${customer.phone}`;
    if (customer.advance) {
      message += `\nتسبيق من طرف الزبون (دج): ${formatPriceArabic(customer.advance)}`;
      if (customer.advanceDate) {
        message += `\nتاريخ التسبيق: ${formatAdvanceDate(customer.advanceDate)}`;
        message += `\nوقت التسبيق: ${new Date(customer.advanceDate).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}`;
      }
    }
    if (customer.notes) {
      message += `\nملاحظات: ${customer.notes}`;
    }
    message += "\n\nالمشتريات:";
    
    // Get live data from database
    const customerPurchases = getLocal(PURCHASES_KEY).filter(p => String(p.client_id) === String(customer.id));
    
    customerPurchases.forEach((item, idx) => {
      let paymentText = "";
      if (item.paymentStatus === 'issam') {
        paymentText = " (مدفوع من طرف عصام)";
      } else if (item.paymentStatus === 'credit') {
        paymentText = " (كريدي)";
      }
      message += `\n${idx + 1}. ${item.item_name} x${item.quantity || 1} - ${formatPriceArabic(item.price)} (${item.store_name})${paymentText}`;
    });
    
    const total = customerPurchases.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
    const paidByIssamTotal = customerPurchases
      .filter(item => item.paymentStatus === 'issam')
      .reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
    const creditTotal = customerPurchases
      .filter(item => item.paymentStatus === 'credit')
      .reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
      
    message += `\n\nالمجموع: ${formatPriceArabic(total)}`;
    if (paidByIssamTotal > 0) {
      message += `\nمدفوع من طرف عصام: ${formatPriceArabic(paidByIssamTotal)}`;
    }
    if (creditTotal > 0) {
      message += `\nكريدي: ${formatPriceArabic(creditTotal)}`;
    }
    return message;
  };

  const handleSendWhatsApp = (customer) => {
    const message = generateWhatsAppMessage(customer);
    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  // For purchases, always fetch from DB
  const [selectedCustomerPurchases, setSelectedCustomerPurchases] = useState([]);
  useEffect(() => {
    console.log("useEffect triggered - selectedCustomerId:", selectedCustomerId);
    if (selectedCustomerId) {
      (async () => {
        try {
          console.log("Loading purchases for client:", selectedCustomerId);
          const purchases = await getPurchasesByClient(selectedCustomerId);
          console.log("Loaded purchases:", purchases);
          setSelectedCustomerPurchases(purchases);
        } catch (error) {
          console.error("Error loading purchases:", error);
          setSelectedCustomerPurchases([]);
        }
      })();
    } else {
      console.log("No selectedCustomerId, clearing purchases");
      setSelectedCustomerPurchases([]);
    }
  }, [selectedCustomerId]);

  const total = selectedCustomerPurchases
    ? selectedCustomerPurchases.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0)
    : 0;
  const paidByIssamTotal = selectedCustomerPurchases
    ? selectedCustomerPurchases
        .filter(item => item.paymentStatus === 'issam')
        .reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0)
    : 0;
  const creditTotal = selectedCustomerPurchases
    ? selectedCustomerPurchases
        .filter(item => item.paymentStatus === 'credit')
        .reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0)
    : 0;
  const itemCount = selectedCustomerPurchases ? selectedCustomerPurchases.length : 0;

  // Add a helper function to check for unpaid purchases older than X days
  const UNPAID_ALERT_DAYS = 7;
  const hasUnpaidOverdue = (customer) => {
    if (!customer.purchases || customer.purchases.length === 0) return false;
    if (customer.paymentStatus !== 'Unpaid') return false;
    const now = new Date();
    return customer.purchases.some(item => {
      const [day, month, year] = item.date.split('/').map(Number);
      const itemDate = new Date(year, month - 1, day);
      const diffDays = (now - itemDate) / (1000 * 60 * 60 * 24);
      return diffDays > UNPAID_ALERT_DAYS;
    });
  };

  // Helper to group purchases by month
  const groupPurchasesByMonth = (purchases) => {
    return purchases.reduce((acc, item) => {
      const [day, month, year] = item.date.split('/');
      const key = `${year}-${month}`;
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    }, {});
  };

  // Enhanced calculation functions with live updates
  const calculateEmployeeSalary = (employee) => {
    const workDays = parseInt(employee.workDays) || 0;
    const dailyWage = parseFloat(employee.dailyWage) || 0;
    return workDays * dailyWage;
  };

  const totalEmployeeWages = employees.reduce((sum, emp) => {
    return sum + calculateEmployeeSalary(emp);
  }, 0);
  
  const totalUnpaidWages = employees.filter(emp => !emp.isPaid).reduce((sum, emp) => {
    return sum + calculateEmployeeSalary(emp);
  }, 0);

  const totalPaidWages = employees.filter(emp => emp.isPaid).reduce((sum, emp) => {
    return sum + calculateEmployeeSalary(emp);
  }, 0);

  // Enhanced client calculations
  const calculateClientTotal = (client) => {
    const clientPurchases = client.purchases || [];
    return clientPurchases.reduce((sum, item) => {
      const price = parseFloat(item.price) || 0;
      const quantity = parseInt(item.quantity) || 1;
      return sum + (price * quantity);
    }, 0);
  };

  // Calculate unpaid balances (only purchases, not worker salaries)
  const totalUnpaidBalances = customers.reduce((sum, c) => {
    // Get all purchases for this client from the database
    const clientPurchases = getLocal(PURCHASES_KEY).filter(p => String(p.client_id) === String(c.id));
    
    // Only count unpaid purchases (customer or credit payments)
    const unpaidPurchases = clientPurchases.filter(item => 
      item.paymentStatus === 'customer' || item.paymentStatus === 'credit'
    );
    
    return sum + unpaidPurchases.reduce((purchaseSum, item) => {
      const price = parseFloat(item.price) || 0;
      const quantity = parseInt(item.quantity) || 1;
      return purchaseSum + (price * quantity);
    }, 0);
  }, 0);
  
  const clientsServed = customers.length;
  
  const totalPurchasesThisMonth = customers.reduce((sum, c) => {
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    const customerPurchases = c.purchases || [];
    return sum + customerPurchases.filter(item => {
      const [day, month, year] = item.date.split('/').map(Number);
      return month === currentMonth && year === currentYear;
    }).length;
  }, 0);
  
  const totalPaidByIssam = getLocal(PURCHASES_KEY)
    .filter(item => item.paymentStatus === 'issam')
    .reduce((sum, item) => sum + (parseFloat(item.price) * (parseInt(item.quantity) || 1)), 0);

  // Debug function to check localStorage state
  const debugLocalStorage = () => {
    console.log("=== DEBUG: LocalStorage State ===");
    console.log("Clients:", getLocal(CLIENTS_KEY));
    console.log("Purchases:", getLocal(PURCHASES_KEY));
    console.log("Selected Customer ID:", selectedCustomerId);
    console.log("Selected Customer Purchases:", selectedCustomerPurchases);
    console.log("================================");
  };

  // Enhanced autocomplete with fuzzy search
  const handleItemNameChange = (e) => {
    const value = e.target.value;
    setItemName(value);
    
    if (value.trim() === '') {
      setFilteredSuggestions([]);
      setShowSuggestions(false);
      setSelectedSuggestionIndex(-1);
      return;
    }
    
    // Fuzzy search implementation
    const filtered = ELECTRICAL_MATERIALS.filter(item => {
      const searchTerm = value.toLowerCase();
      const itemText = item.toLowerCase();
      
      // Exact match
      if (itemText.includes(searchTerm)) return true;
      
      // Partial word match
      const searchWords = searchTerm.split(' ');
      return searchWords.some(word => 
        word.length > 1 && itemText.includes(word)
      );
    });
    
    setFilteredSuggestions(filtered.slice(0, 8)); // Limit to 8 suggestions
    setShowSuggestions(filtered.length > 0);
    setSelectedSuggestionIndex(-1);
  };

  const handleItemNameKeyDown = (e) => {
    if (!showSuggestions) return;
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => 
          prev < filteredSuggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedSuggestionIndex >= 0) {
          setItemName(filteredSuggestions[selectedSuggestionIndex]);
          setShowSuggestions(false);
          setSelectedSuggestionIndex(-1);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedSuggestionIndex(-1);
        break;
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setItemName(suggestion);
    setShowSuggestions(false);
    setSelectedSuggestionIndex(-1);
  };

  const handleItemNameBlur = () => {
    setTimeout(() => {
      setShowSuggestions(false);
      setSelectedSuggestionIndex(-1);
    }, 200);
  };

  // Navigation component
  const Navigation = () => (
    <nav className="app-nav">
      <button 
        key="customers-nav"
        className={`nav-btn ${activeSection === 'customers' ? 'active' : ''}`}
        onClick={() => setActiveSection('customers')}
      >
        الزبائن
      </button>
      <button 
        key="purchases-nav"
        className={`nav-btn ${activeSection === 'purchases' ? 'active' : ''}`}
        onClick={() => setActiveSection('purchases')}
      >
        المشتريات
      </button>
      <button 
        key="employees-nav"
        className={`nav-btn ${activeSection === 'employees' ? 'active' : ''}`}
        onClick={() => setActiveSection('employees')}
      >
        العمال
      </button>
      <button 
        key="reports-nav"
        className={`nav-btn ${activeSection === 'reports' ? 'active' : ''}`}
        onClick={() => setActiveSection('reports')}
      >
        التقارير
      </button>
    </nav>
  );

  // Professional Header Component
  const AppHeader = () => (
    <header className="app-header">
      <div className="header-container">
        <div className="header-logo-section">
          <img 
            src="/issam-logo.png" 
            alt="عصام إلكتريك" 
            className="header-logo"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'block';
            }}
          />
          <div className="header-logo-fallback" style={{ display: 'none' }}>
            ⚡
          </div>
        </div>
        <div className="header-content">
          <h1 className="header-title">عصام إلكتريك</h1>
          <p className="header-subtitle">نظام إدارة الأعمال الكهربائية</p>
        </div>
        <div className="header-actions">
          <button 
            className="header-logout-btn"
            onClick={handleLogout}
            title="تسجيل الخروج"
          >
            <span className="logout-icon">🚪</span>
            <span className="logout-text">خروج</span>
          </button>
        </div>
      </div>
    </header>
  );

  // Render active section
  const renderSection = () => {
    switch (activeSection) {
      case 'customers':
        return (
          <section className="customer-section card">
            <h2>إدارة الزبائن</h2>
            <form className="customer-form" onSubmit={handleAddCustomer} autoComplete="off">
              <input
                key="customer-name-input"
                type="text"
                placeholder="مثال: أحمد بن علي"
                value={newCustomer.name}
                onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                required
              />
              <input
                key="customer-phone-input"
                type="text"
                placeholder="مثال: 0555 12 34 56"
                value={newCustomer.phone}
                onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
              />
              <input
                key="customer-advance-input"
                type="number"
                placeholder="تسبيق من طرف الزبون (دج)"
                value={newCustomer.advance}
                onChange={(e) => setNewCustomer({ ...newCustomer, advance: e.target.value })}
                min="0"
                step="0.01"
              />
              <textarea
                key="customer-notes-input"
                placeholder="ملاحظات خاصة بالزبون (اختياري)"
                value={newCustomer.notes}
                onChange={(e) => setNewCustomer({ ...newCustomer, notes: e.target.value })}
                rows="3"
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                  minHeight: '80px'
                }}
              />
              <button className="main-btn" type="submit">إضافة زبون</button>
            </form>
            {Array.isArray(customers) && customers.length > 0 && (
              <div className="customer-switcher">
                <input
                  type="text"
                  placeholder="البحث في الزبائن"
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                />
                {customers
                  .filter(c => c.name.toLowerCase().includes(customerSearch.toLowerCase()))
                  .map((c) => (
                    <div key={c.id} className="customer-entry">
                      <div className="customer-info">
                        <span className="customer-name">{c.name} {c.phone ? `(${c.phone})` : ""}</span>
                        {c.notes && (
                          <div className="customer-notes-preview">
                            <span className="notes-preview-text">{c.notes.length > 50 ? c.notes.substring(0, 50) + '...' : c.notes}</span>
                          </div>
                        )}
                      </div>
                      <div className="customer-actions">
                        {hasUnpaidOverdue(c) && <span className="unpaid-badge">غير مدفوع</span>}
                        <button
                          className="edit-notes-btn"
                          onClick={() => handleEditNotes(c.id)}
                          style={{
                            padding: '4px 8px',
                            backgroundColor: '#2196F3',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '0.7rem',
                            marginRight: '8px'
                          }}
                        >
                          ملاحظات
                        </button>
                        <button
                          className="add-advance-btn"
                          onClick={() => handleAddAdvance(c.id)}
                          style={{
                            padding: '4px 8px',
                            backgroundColor: '#ff9800',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '0.7rem',
                            marginRight: '8px'
                          }}
                        >
                          تسبيق
                        </button>
                        <button
                          className="delete-btn"
                          onClick={async (e) => {
                            e.preventDefault();
                            await handleDeleteClient(c.id);
                          }}
                          type="button"
                        >
                          حذف
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </section>
        );

      case 'purchases':
        return (
          <>
            {/* Clean Purchase Header */}
            <section className="purchase-header card fade-in">
              <h2 className="section-title">🛒 إدارة المشتريات</h2>
              
              {/* Simple Client Selector */}
              <div className="client-selector-container">
                <label className="form-label">اختر العميل لعرض مشترياته:</label>
                <select 
                  className="form-select"
                  value={selectedCustomerId} 
                                              onChange={(e) => {
                              console.log("Customer selection changed to:", e.target.value);
                              setSelectedCustomerId(e.target.value);
                            }}
                >
                  <option value="">-- اختر عميل --</option>
                  {customers.map(customer => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name} {customer.phone ? `(${customer.phone})` : ""}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Debug button - remove in production */}
              <button 
                className="btn btn-secondary" 
                onClick={debugLocalStorage}
                style={{ marginTop: '10px', fontSize: '12px' }}
              >
                Debug Data
              </button>
            </section>
            
            {/* Modern Purchase Form - Only show when client is selected */}
            {selectedCustomerId && customers.find((c) => c.id === selectedCustomerId) && (
              <section className="modern-purchase-form-section">
                <h3>إضافة مشتريات جديدة لـ {customers.find((c) => c.id === selectedCustomerId)?.name}</h3>
                
                <form className="modern-purchase-form" onSubmit={handleAdd} autoComplete="off">
                  <div className="form-grid-modern">
                    <div className="form-group-modern">
                      <label className="form-label-modern">اسم السلعة *</label>
                      <div className="autocomplete-container-modern">
                        <input
                          type="text"
                          className="form-input-modern"
                          placeholder="مثال: كابل 2.5 مم"
                          value={itemName}
                          onChange={handleItemNameChange}
                          onKeyDown={handleItemNameKeyDown}
                          onBlur={handleItemNameBlur}
                          onFocus={() => setShowSuggestions(true)}
                          required
                        />
                        {showSuggestions && filteredSuggestions.length > 0 && (
                          <div className="suggestions-list-modern">
                            {filteredSuggestions.map((suggestion, index) => (
                              <div
                                key={`suggestion-${suggestion}-${index}`}
                                className={`suggestion-item-modern ${index === selectedSuggestionIndex ? 'selected' : ''}`}
                                onClick={() => handleSuggestionClick(suggestion)}
                              >
                                {suggestion}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="form-group-modern">
                      <label className="form-label-modern">الكمية</label>
                      <input
                        type="number"
                        className="form-input-modern"
                        placeholder="1"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        min="1"
                        required
                      />
                    </div>
                    
                    <div className="form-group-modern">
                      <label className="form-label-modern">سعر الوحدة (دج) *</label>
                      <input
                        type="number"
                        className="form-input-modern"
                        placeholder="0"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        min="0"
                        step="0.01"
                        required
                      />
                    </div>
                    
                    <div className="form-group-modern">
                      <label className="form-label-modern">اسم المحل</label>
                      <input
                        type="text"
                        className="form-input-modern"
                        placeholder="مثال: الأمين"
                        value={storeName}
                        onChange={(e) => setStoreName(e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="form-group-modern">
                      <label className="form-label-modern">المدفوع من طرف *</label>
                      <select
                        className="form-input-modern"
                        value={paymentStatus}
                        onChange={(e) => setPaymentStatus(e.target.value)}
                        required
                      >
                        <option value="customer">الزبون</option>
                        <option value="issam">عصام</option>
                        <option value="credit">كريدي</option>
                      </select>
                    </div>
                  </div>
                  
                  {formError && <div className="form-error-modern">{formError}</div>}
                  
                  <button className="btn btn-primary-modern" type="submit">
                    <span className="icon icon-plus"></span>
                    إضافة السلعة
                  </button>
                </form>
              </section>
            )}
            
            {/* Simplified Purchases List */}
            <section className="simple-purchases-section">
              {!selectedCustomerId ? (
                <div className="empty-state-simple">
                  <div className="icon icon-shopping"></div>
                  <h3>اختر عميل لعرض مشترياته</h3>
                  <p>قم باختيار عميل من القائمة أعلاه لعرض وإدارة مشترياته</p>
                </div>
              ) : (
                <>
                  <div className="purchases-header-simple">
                    <h3>مشتريات {customers.find((c) => c.id === selectedCustomerId)?.name}</h3>
                    <div className="purchases-actions-simple">
                      <span className="item-count-simple">{itemCount} سلعة{itemCount !== 1 ? "ات" : ""}</span>
                      {itemCount > 0 && (
                        <div className="export-buttons-compact">
                          <button
                            className="btn-export-compact"
                            onClick={() => handleExportToExcel(customers.find((c) => c.id === selectedCustomerId))}
                            title="تصدير إلى Excel"
                          >
                            <span className="icon icon-excel"></span>
                            Excel
                          </button>
                          <button
                            className="btn-export-compact"
                            onClick={handlePDF}
                            title="تصدير إلى PDF"
                          >
                            <span className="icon icon-pdf"></span>
                            PDF
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {!selectedCustomerPurchases?.length ? (
                    <div className="empty-state-simple">
                      <div className="icon icon-shopping"></div>
                      <h3>لا توجد مشتريات</h3>
                      <p>لم يتم إضافة أي مشتريات لهذا العميل بعد</p>
                    </div>
                  ) : (
                    <>
                      <div className="table-container-simple">
                        <table className="simple-table">
                          <thead>
                            <tr>
                              <th>اسم السلعة</th>
                              <th>الكمية</th>
                              <th>السعر</th>
                              <th>المتجر</th>
                              <th>المدفوع من طرف</th>
                              <th></th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedCustomerPurchases.map((item, index) => (
                              <tr key={item.id} className={`simple-table-row ${item.paymentStatus === 'issam' ? 'issam-paid-simple' : item.paymentStatus === 'credit' ? 'credit-paid-simple' : ''}`}>
                                <td className="item-name-simple">{item.item_name}</td>
                                <td className="item-quantity-simple">{item.quantity || 1}</td>
                                <td className="item-price-simple">{formatPriceArabic(item.price)}</td>
                                <td className="item-store-simple">{item.store_name}</td>
                                <td className="item-payer-simple">
                                  <span className={`payer-tag ${item.paymentStatus === 'issam' ? 'issam' : item.paymentStatus === 'credit' ? 'credit' : 'customer'}`}>
                                    {item.paymentStatus === 'issam' ? 'عصام' : item.paymentStatus === 'credit' ? 'كريدي' : 'الزبون'}
                                  </span>
                                </td>
                                <td className="item-actions-simple">
                                  <button 
                                    className="delete-btn-simple"
                                    onClick={() => handleDeletePurchase(item.id)}
                                    title="حذف السلعة"
                                  >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                      <path d="M3 6h18"></path>
                                      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                                      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                                      <line x1="10" y1="11" x2="10" y2="17"></line>
                                      <line x1="14" y1="11" x2="14" y2="17"></line>
                                    </svg>
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      
                      {/* Simple Summary */}
                      <div className="summary-simple">
                        <div className="summary-item-simple">
                          <span className="summary-label">المجموع الإجمالي:</span>
                          <span className="summary-value">{formatPriceArabic(total)}</span>
                        </div>
                        {paidByIssamTotal > 0 && (
                          <div className="summary-item-simple">
                            <span className="summary-label">مدفوع من عصام:</span>
                            <span className="summary-value">{formatPriceArabic(paidByIssamTotal)}</span>
                          </div>
                        )}
                        {creditTotal > 0 && (
                          <div className="summary-item-simple">
                            <span className="summary-label">كريدي:</span>
                            <span className="summary-value">{formatPriceArabic(creditTotal)}</span>
                          </div>
                        )}
                      </div>

                      {/* Export Buttons at Bottom */}
                      <div className="export-buttons-bottom">
                        <h4>تصدير البيانات</h4>
                        <div className="export-buttons-compact">
                          <button
                            className="btn-export-compact"
                            onClick={() => handleExportToExcel(customers.find((c) => c.id === selectedCustomerId))}
                            title="تصدير إلى Excel"
                          >
                            <span className="icon icon-excel"></span>
                            Excel
                          </button>
                          <button
                            className="btn-export-compact"
                            onClick={handlePDF}
                            title="تصدير إلى PDF"
                          >
                            <span className="icon icon-pdf"></span>
                            PDF
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </>
              )}
            </section>
          </>
        );

      case 'employees':
        return (
          <section className="employees-section card fade-in">
            <h2 className="section-title">👷 إدارة العمال</h2>
            
            {/* Workers List - First Section */}
            <div className="simple-table-section">
              <div className="table-header-simple">
                <h3>قائمة العمال</h3>
                <span className="employee-count-simple">{employees.length} عامل</span>
              </div>
              
              {employees.length === 0 ? (
                <div className="empty-state-simple">
                  <div className="icon icon-user"></div>
                  <h3>لا يوجد عمال</h3>
                  <p>قم بإضافة عامل جديد للبدء</p>
                </div>
              ) : (
                <div className="table-container-simple">
                  <table className="simple-table">
                    <thead>
                      <tr>
                        <th>الاسم</th>
                        <th>الأجر اليومي</th>
                        <th>عدد الأيام</th>
                        <th>الراتب الإجمالي</th>
                        <th>حالة الدفع</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {employees.map((employee, index) => (
                        <tr key={employee.id} className="simple-table-row">
                          <td className="employee-name-simple">{employee.name}</td>
                          <td className="employee-wage-simple">
                            <input
                              type="number"
                              className="form-input-simple"
                              value={employee.dailyWage}
                              onChange={(e) => updateEmployeeWage(employee.id, e.target.value)}
                              min="0"
                            />
                          </td>
                          <td className="employee-days-simple">
                            <input
                              type="number"
                              className="form-input-simple"
                              value={employee.workDays}
                              onChange={(e) => updateEmployeeWorkDays(employee.id, e.target.value)}
                              min="0"
                            />
                          </td>
                          <td className="employee-total-simple">
                            <span className="salary-amount-simple">{formatPriceArabic(calculateEmployeeSalary(employee))}</span>
                          </td>
                          <td className="employee-status-simple">
                            <button 
                              className={`status-toggle-simple ${employee.isPaid ? 'paid' : 'unpaid'}`}
                              onClick={() => toggleEmployeePayment(employee.id)}
                              title={employee.isPaid ? 'إلغاء الدفع' : 'تأكيد الدفع'}
                            >
                              {employee.isPaid ? 'مدفوع' : 'غير مدفوع'}
                            </button>
                          </td>
                          <td className="employee-actions-simple">
                            <button 
                              className="delete-btn-simple"
                              onClick={() => deleteEmployeeHandler(employee.id)}
                              title="حذف العامل"
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M3 6h18"></path>
                                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                                <line x1="10" y1="11" x2="10" y2="17"></line>
                                <line x1="14" y1="11" x2="14" y2="17"></line>
                              </svg>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Modern Summary Cards */}
            <div className="summary-grid-modern">
              <div className="summary-card-modern total">
                <div className="summary-icon">💰</div>
                <div className="summary-content">
                  <h4>إجمالي الرواتب</h4>
                  <div className="value">{formatPriceArabic(totalEmployeeWages)}</div>
                </div>
              </div>
              <div className="summary-card-modern unpaid">
                <div className="summary-icon">❌</div>
                <div className="summary-content">
                  <h4>الرواتب غير المدفوعة</h4>
                  <div className="value">{formatPriceArabic(totalUnpaidWages)}</div>
                </div>
              </div>
            </div>

            {/* Separator */}
            <div className="section-separator">
              <hr />
            </div>

            {/* Add New Worker Form - Second Section */}
            <div className="modern-form-card">
              <h3>إضافة عامل جديد</h3>
              <form className="modern-employee-form" onSubmit={addEmployeeHandler}>
                <div className="form-row-modern">
                  <div className="form-group-modern">
                    <label className="form-label-modern">اسم العامل *</label>
                    <input
                      type="text"
                      className="form-input-modern"
                      placeholder="أدخل اسم العامل"
                      value={newEmployee.name}
                      onChange={(e) => setNewEmployee({...newEmployee, name: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div className="form-group-modern">
                    <label className="form-label-modern">الراتب اليومي (دج) *</label>
                    <input
                      type="number"
                      className="form-input-modern"
                      placeholder="2000"
                      value={newEmployee.dailyWage}
                      onChange={(e) => setNewEmployee({...newEmployee, dailyWage: e.target.value})}
                      min="0"
                      required
                    />
                  </div>
                  
                  <div className="form-group-modern">
                    <button className="btn btn-primary-modern" type="submit">
                      <span className="icon icon-plus"></span>
                      إضافة عامل
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </section>
        );

      case 'reports':
        // Calculate total advances
        const totalAdvances = customers.reduce((sum, c) => sum + (Number(c.advance) || 0), 0);
        return (
          <section className="reports-section card">
            <div className="customer-reports">
              <h2 className="section-title">تقارير الزبائن</h2>
              
              {/* Customer Reports Grid - Moved to top */}
              <div className="customer-reports-grid">
                {customers.map(customer => {
                  // Get live data from database
                  const customerPurchases = getLocal(PURCHASES_KEY).filter(p => String(p.client_id) === String(customer.id));
                  const customerTotal = customerPurchases.reduce((sum, item) => sum + (parseFloat(item.price) * (parseInt(item.quantity) || 1)), 0);
                  const customerPaidByIssam = customerPurchases
                    .filter(item => item.paymentStatus === 'issam')
                    .reduce((sum, item) => sum + (parseFloat(item.price) * (parseInt(item.quantity) || 1)), 0);
                  const customerCredit = customerPurchases
                    .filter(item => item.paymentStatus === 'credit')
                    .reduce((sum, item) => sum + (parseFloat(item.price) * (parseInt(item.quantity) || 1)), 0);
                  const customerPaid = customerPurchases
                    .filter(item => item.paymentStatus === 'customer')
                    .reduce((sum, item) => sum + (parseFloat(item.price) * (parseInt(item.quantity) || 1)), 0);
                  
                  const remainingBalance = customerTotal - customerPaid - (Number(customer.advance) || 0);
                  
                  return (
                    <div key={customer.id} className="customer-report modern-customer-report">
                      <div className="customer-report-header">
                        <div className="customer-info">
                          <span className="customer-report-name">{customer.name}</span>
                          {customer.phone && <span className="customer-report-phone">{customer.phone}</span>}
                        </div>
                        <div className="customer-status">
                          {remainingBalance > 0 ? (
                            <span className="status-badge unpaid">معلق</span>
                          ) : (
                            <span className="status-badge paid">مكتمل</span>
                          )}
                        </div>
                      </div>
                      
                      <div className="report-details">
                        <div className="detail-row">
                          <span className="detail-label">إجمالي المشتريات:</span>
                          <span className="detail-value">{formatPriceArabic(customerTotal)}</span>
                        </div>
                        
                        {customerPaidByIssam > 0 && (
                          <div className="detail-row issam-paid">
                            <span className="detail-label">مدفوع من عصام:</span>
                            <span className="detail-value">{formatPriceArabic(customerPaidByIssam)}</span>
                          </div>
                        )}
                        
                        {customerCredit > 0 && (
                          <div className="detail-row credit">
                            <span className="detail-label">كريدي:</span>
                            <span className="detail-value">{formatPriceArabic(customerCredit)}</span>
                          </div>
                        )}
                        
                        {customerPaid > 0 && (
                          <div className="detail-row customer-paid">
                            <span className="detail-label">مدفوع من الزبون:</span>
                            <span className="detail-value">{formatPriceArabic(customerPaid)}</span>
                          </div>
                        )}
                        
                        {customer.advance && Number(customer.advance) > 0 && (
                          <div className="detail-row advance">
                            <span className="detail-label">تسبيق من الزبون:</span>
                            <div className="detail-value-container">
                              <span className="detail-value">{formatPriceArabic(customer.advance)}</span>
                              {customer.advanceDate && (
                                <div className="advance-date-info">
                                  <span className="advance-date">{formatAdvanceDate(customer.advanceDate)}</span>
                                  <span className="advance-time">{new Date(customer.advanceDate).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                        
                        {remainingBalance > 0 && (
                          <div className="detail-row remaining">
                            <span className="detail-label">المبلغ المتبقي:</span>
                            <span className="detail-value remaining-amount">{formatPriceArabic(remainingBalance)}</span>
                          </div>
                        )}
                        
                        {/* Notes Section */}
                        <div className="detail-row notes-section">
                          <span className="detail-label">ملاحظات:</span>
                          <div className="notes-content">
                            {showNotesEditor[customer.id] ? (
                              <div className="notes-editor">
                                <textarea
                                  value={editingNotes[customer.id] || ""}
                                  onChange={(e) => setEditingNotes({ ...editingNotes, [customer.id]: e.target.value })}
                                  placeholder="أضف ملاحظات خاصة بالزبون..."
                                  rows="3"
                                  style={{
                                    width: '100%',
                                    padding: '8px',
                                    border: '1px solid #ddd',
                                    borderRadius: '6px',
                                    fontFamily: 'inherit',
                                    resize: 'vertical',
                                    minHeight: '60px',
                                    fontSize: '0.9rem'
                                  }}
                                />
                                <div className="notes-actions" style={{ marginTop: '8px', display: 'flex', gap: '8px' }}>
                                  <button
                                    onClick={() => handleSaveNotes(customer.id)}
                                    style={{
                                      padding: '4px 12px',
                                      backgroundColor: '#4CAF50',
                                      color: 'white',
                                      border: 'none',
                                      borderRadius: '4px',
                                      cursor: 'pointer',
                                      fontSize: '0.8rem'
                                    }}
                                  >
                                    حفظ
                                  </button>
                                  <button
                                    onClick={() => handleCancelNotes(customer.id)}
                                    style={{
                                      padding: '4px 12px',
                                      backgroundColor: '#f44336',
                                      color: 'white',
                                      border: 'none',
                                      borderRadius: '4px',
                                      cursor: 'pointer',
                                      fontSize: '0.8rem'
                                    }}
                                  >
                                    إلغاء
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="notes-display">
                                {customer.notes ? (
                                  <span className="notes-text" style={{ color: '#666', fontStyle: 'italic' }}>
                                    {customer.notes}
                                  </span>
                                ) : (
                                  <span className="no-notes" style={{ color: '#999', fontStyle: 'italic' }}>
                                    لا توجد ملاحظات
                                  </span>
                                )}
                                <button
                                  onClick={() => handleEditNotes(customer.id)}
                                  style={{
                                    marginRight: '8px',
                                    padding: '2px 8px',
                                    backgroundColor: '#2196F3',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '0.7rem'
                                  }}
                                >
                                  {customer.notes ? 'تعديل' : 'إضافة'}
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Action Buttons - Only WhatsApp, removed PDF export */}
                      <div className="customer-actions">
                        <button 
                          className="action-btn btn-success"
                          onClick={() => handleSendWhatsApp(customer)}
                        >
                          📱 واتساب
                        </button>
                        <button 
                          className="action-btn btn-advance"
                          onClick={() => handleAddAdvance(customer.id)}
                          style={{
                            backgroundColor: '#ff9800',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '8px 12px',
                            cursor: 'pointer',
                            fontSize: '0.85rem',
                            fontWeight: '500',
                            transition: 'all 0.2s'
                          }}
                        >
                          💰 إضافة تسبيق
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* Summary Statistics - Moved to bottom */}
              <div className="reports-summary-stats">
                <div className="stat-card">
                  <div className="stat-icon">👥</div>
                  <div className="stat-content">
                    <div className="stat-value">{customers.length}</div>
                    <div className="stat-label">إجمالي الزبائن</div>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">💰</div>
                  <div className="stat-content">
                    <div className="stat-value">{formatPriceArabic(totalAdvances)}</div>
                    <div className="stat-label">إجمالي التسبيقات</div>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">📊</div>
                  <div className="stat-content">
                    <div className="stat-value">{formatPriceArabic(totalUnpaidBalances)}</div>
                    <div className="stat-label">المبالغ المعلقة</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Financial Overview */}
            <div className="financial-overview">
              <h2 className="section-title">نظرة عامة مالية</h2>
              <div className="dashboard-grid">
                <div key="unpaid-balances" className="dashboard-item">
                  <div className="dashboard-icon">⚠️</div>
                  <div className="dashboard-content">
                    <strong>إجمالي المبالغ غير المدفوعة:</strong>
                    <span>{formatPriceArabic(totalUnpaidBalances)}</span>
                  </div>
                </div>
                <div key="employee-wages" className="dashboard-item">
                  <div className="dashboard-icon">👷</div>
                  <div className="dashboard-content">
                    <strong>إجمالي رواتب العمال:</strong>
                    <span>{formatPriceArabic(totalEmployeeWages)}</span>
                  </div>
                </div>
                <div key="unpaid-wages" className="dashboard-item">
                  <div className="dashboard-icon">❌</div>
                  <div className="dashboard-content">
                    <strong>الرواتب غير المدفوعة:</strong>
                    <span>{formatPriceArabic(totalUnpaidWages)}</span>
                  </div>
                </div>
                <div key="clients-served" className="dashboard-item">
                  <div className="dashboard-icon">✅</div>
                  <div className="dashboard-content">
                    <strong>عدد الزبائن:</strong>
                    <span>{clientsServed}</span>
                  </div>
                </div>
                <div key="purchases-month" className="dashboard-item">
                  <div className="dashboard-icon">📦</div>
                  <div className="dashboard-content">
                    <strong>المشتريات هذا الشهر:</strong>
                    <span>{totalPurchasesThisMonth}</span>
                  </div>
                </div>
                <div key="paid-by-issam" className="dashboard-item">
                  <div className="dashboard-icon">💰</div>
                  <div className="dashboard-content">
                    <strong>مدفوع من عصام:</strong>
                    <span>{formatPriceArabic(totalPaidByIssam)}</span>
                  </div>
                </div>
                <div key="advance-total" className="dashboard-item">
                  <div className="dashboard-icon">💵</div>
                  <div className="dashboard-content">
                    <strong>تسبيقات الزبائن:</strong>
                    <span>{formatPriceArabic(totalAdvances)}</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        );

      default:
        return null;
    }
  };

  // Password protection screen
  if (!isAuthenticated) {
    return (
      <div className="app-bg" dir="rtl">
        <div className="password-screen">
          <div className="password-container">
            <div className="password-header">
              <div className="app-logo">⚡</div>
              <h1>عصام إلكتريك</h1>
              <p>نظام إدارة الأعمال الكهربائية</p>
            </div>
            <form onSubmit={handlePasswordSubmit} className="password-form">
              <div className="form-group">
                <label>اسم المستخدم:</label>
                <input
                  type="text"
                  value={username}
                  onChange={handleUsernameChange}
                  className="password-input"
                  required
                />
              </div>
              <div className="form-group">
                <label>كلمة المرور:</label>
                <input
                  type="password"
                  value={password}
                  onChange={handlePasswordChange}
                  className="password-input"
                  required
                />
              </div>
              {passwordError && <div className="password-error">{passwordError}</div>}
              <button type="submit" className="password-submit-btn">دخول</button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-bg" dir="rtl">
      {/* Offline Notification */}
      {showOfflineNotification && (
        <div className="offline-notification">
          <div className="offline-content">
            <span className="offline-icon">📶</span>
            <span className="offline-text">أنت في وضع عدم الاتصال - التطبيق يعمل محلياً</span>
            <button 
              className="offline-close"
              onClick={() => setShowOfflineNotification(false)}
            >
              ×
            </button>
          </div>
        </div>
      )}
      
      {/* PWA Installation Prompt */}
      {showInstallPrompt && (
        <div className="install-prompt">
          <div className="install-content">
            <span className="install-icon">📱</span>
            <span className="install-text">ثبت التطبيق للوصول السريع</span>
            <div className="install-actions">
              <button 
                className="install-btn"
                onClick={handleInstallPWA}
              >
                تثبيت
              </button>
              <button 
                className="install-dismiss"
                onClick={() => setShowInstallPrompt(false)}
              >
                لاحقاً
              </button>
            </div>
          </div>
        </div>
      )}
      
      <AppHeader />
      <Navigation />
      <div className="app-container">
        {renderSection()}
      </div>
      
      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>تأكيد</h3>
            <p>{confirmMessage}</p>
            <div className="modal-actions">
              <button onClick={() => setShowConfirmModal(false)} className="btn btn-secondary">إلغاء</button>
              <button onClick={confirmAction} className="btn btn-danger">تأكيد</button>
            </div>
          </div>
        </div>
      )}
      
      {/* Notes Editing Modal */}
      {Object.keys(showNotesEditor).some(key => showNotesEditor[key]) && (
        <div className="modal-overlay">
          <div className="modal-content notes-modal">
            <h3>تعديل الملاحظات</h3>
            {customers.map(customer => 
              showNotesEditor[customer.id] && (
                <div key={customer.id} className="notes-modal-content">
                  <p className="customer-name-modal">{customer.name}</p>
                  <textarea
                    value={editingNotes[customer.id] || ""}
                    onChange={(e) => setEditingNotes({ ...editingNotes, [customer.id]: e.target.value })}
                    placeholder="أضف ملاحظات خاصة بالزبون..."
                    rows="6"
                    className="notes-modal-textarea"
                  />
                  <div className="modal-actions">
                    <button 
                      onClick={() => handleCancelNotes(customer.id)} 
                      className="btn btn-secondary"
                    >
                      إلغاء
                    </button>
                    <button 
                      onClick={() => handleSaveNotes(customer.id)} 
                      className="btn btn-primary"
                    >
                      حفظ
                    </button>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      )}
      
      {/* Advance Payment Modal */}
      {Object.keys(showAdvanceModal).some(key => showAdvanceModal[key]) && (
        <div className="modal-overlay">
          <div className="modal-content advance-modal">
            <h3>إضافة تسبيق للزبون</h3>
            {customers.map(customer => 
              showAdvanceModal[customer.id] && (
                <div key={customer.id} className="advance-modal-content">
                  <div className="customer-info-advance">
                    <p className="customer-name-advance">{customer.name}</p>
                    <p className="current-advance">
                      التسبيق الحالي: {formatPriceArabic(customer.advance || 0)}
                    </p>
                  </div>
                  <div className="advance-input-group">
                    <label>مبلغ التسبيق الجديد (دج):</label>
                    <input
                      type="number"
                      value={advanceAmount[customer.id] || ""}
                      onChange={(e) => setAdvanceAmount({ ...advanceAmount, [customer.id]: e.target.value })}
                      placeholder="أدخل المبلغ"
                      min="0"
                      step="0.01"
                      className="advance-input"
                    />
                  </div>
                  <div className="advance-preview">
                    {advanceAmount[customer.id] && !isNaN(parseFloat(advanceAmount[customer.id])) && (
                      <p className="total-advance">
                        إجمالي التسبيق بعد الإضافة: {formatPriceArabic((parseFloat(customer.advance) || 0) + parseFloat(advanceAmount[customer.id]))}
                      </p>
                    )}
                  </div>
                  <div className="modal-actions">
                    <button 
                      onClick={() => handleCancelAdvance(customer.id)} 
                      className="btn btn-secondary"
                    >
                      إلغاء
                    </button>
                    <button 
                      onClick={() => handleSaveAdvance(customer.id)} 
                      className="btn btn-advance-save"
                      disabled={!advanceAmount[customer.id] || isNaN(parseFloat(advanceAmount[customer.id])) || parseFloat(advanceAmount[customer.id]) <= 0}
                    >
                      إضافة التسبيق
                    </button>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App; 