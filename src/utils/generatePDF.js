// Enhanced PDF generator with proper Arabic support
import { jsPDF } from "jspdf";

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
  
  // Page dimensions
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 20;
  const contentWidth = pageWidth - (2 * margin);
  
  // Header
  let y = margin;
  
  // Company title
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text("عصام إلكتريك", pageWidth - margin, y, { align: 'right' });
  
  y += 8;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text("فاتورة", pageWidth - margin, y, { align: 'right' });
  
  y += 10;
  
  // Customer information
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text("معلومات العميل:", pageWidth - margin, y, { align: 'right' });
  
  y += 6;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`الاسم: ${customer.name || "-"}`, pageWidth - margin, y, { align: 'right' });
  
  y += 5;
  if (customer.phone) {
    doc.text(`الهاتف: ${customer.phone}`, pageWidth - margin, y, { align: 'right' });
    y += 5;
  }
  
  if (customer.notes) {
    doc.text(`ملاحظات: ${customer.notes}`, pageWidth - margin, y, { align: 'right' });
    y += 5;
  }
  
  y += 5;
  doc.text(`التاريخ: ${new Date().toLocaleDateString('ar-SA')}`, pageWidth - margin, y, { align: 'right' });
  
  y += 10;
  
  // Table header
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  
  const colWidths = [60, 25, 30, 40, 30];
  const colPositions = [];
  let currentX = margin;
  
  // Calculate column positions from right to left
  for (let i = colWidths.length - 1; i >= 0; i--) {
    colPositions[i] = pageWidth - margin - colWidths[i];
    currentX += colWidths[i];
  }
  
  // Draw table header
  doc.text("اسم السلعة", colPositions[0] + colWidths[0] - 5, y, { align: 'right' });
  doc.text("الكمية", colPositions[1] + colWidths[1] - 5, y, { align: 'right' });
  doc.text("السعر", colPositions[2] + colWidths[2] - 5, y, { align: 'right' });
  doc.text("المحل", colPositions[3] + colWidths[3] - 5, y, { align: 'right' });
  doc.text("التاريخ", colPositions[4] + colWidths[4] - 5, y, { align: 'right' });
  
  y += 5;
  
  // Draw header line
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageWidth - margin, y);
  
  y += 5;
  
  // Table content
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
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
    
    // Check if we need a new page
    if (y > pageHeight - 40) {
      doc.addPage();
      y = margin;
    }
    
    // Truncate long text to fit in columns
    const maxItemNameLength = 25;
    const maxStoreNameLength = 20;
    const truncatedItemName = itemName.length > maxItemNameLength ? 
      itemName.substring(0, maxItemNameLength) + "..." : itemName;
    const truncatedStoreName = storeName.length > maxStoreNameLength ? 
      storeName.substring(0, maxStoreNameLength) + "..." : storeName;
    
    // Draw row content
    doc.text(truncatedItemName, colPositions[0] + colWidths[0] - 5, y, { align: 'right' });
    doc.text(quantity.toString(), colPositions[1] + colWidths[1] - 5, y, { align: 'right' });
    doc.text(price.toLocaleString(), colPositions[2] + colWidths[2] - 5, y, { align: 'right' });
    doc.text(truncatedStoreName, colPositions[3] + colWidths[3] - 5, y, { align: 'right' });
    doc.text(date, colPositions[4] + colWidths[4] - 5, y, { align: 'right' });
    
    // Add "Paid by Issam" indicator if applicable
    if (paidByIssam) {
      doc.setFontSize(8);
      doc.text("(مدفوع من عصام)", colPositions[0] + colWidths[0] - 5, y + 3, { align: 'right' });
      doc.setFontSize(10);
    }
    
    y += 6;
  });
  
  // Draw bottom line
  y += 2;
  doc.line(margin, y, pageWidth - margin, y);
  
  y += 8;
  
  // Totals section
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  
  doc.text(`المجموع الإجمالي: ${total.toLocaleString()} دج`, pageWidth - margin, y, { align: 'right' });
  
  if (paidByIssamTotal > 0) {
    y += 6;
    doc.text(`مدفوع من عصام: ${paidByIssamTotal.toLocaleString()} دج`, pageWidth - margin, y, { align: 'right' });
  }
  
  // Signature section
  if (signature) {
    y += 15;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`التوقيع: ${signature}`, pageWidth - margin, y, { align: 'right' });
  }
  
  // Footer
  if (footer) {
    y += 10;
    doc.setFontSize(10);
    doc.text(footer, pageWidth - margin, y, { align: 'right' });
  }
  
  // Company footer
  y += 15;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'italic');
  doc.text("شكراً لثقتكم بنا", pageWidth / 2, y, { align: 'center' });
  
  // Generate filename with current date
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  const filename = `فاتورة_${customer.name || "invoice"}_${dateStr}.pdf`;
  
  doc.save(filename);
} 