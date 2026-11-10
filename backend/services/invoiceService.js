/**
 * VENDORA Invoice Generation Service
 * Produces clean, professional PDF invoices via PDFKit.
 */

const PDFDocument = require('pdfkit');

class InvoiceService {
  generateInvoice(order, res) {
    const doc = new PDFDocument({ margin: 50 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${order.orderNumber}.pdf`);

    doc.pipe(res);

    // Header
    doc.fillColor('#1e40af')
       .fontSize(24)
       .text('VENDORA', 50, 50, { bold: true })
       .fontSize(10)
       .fillColor('#64748b')
       .text('One Marketplace. Multiple Vendors. Endless Possibilities.', 50, 80);

    doc.fillColor('#0f172a')
       .fontSize(16)
       .text('TAX INVOICE', 400, 50, { align: 'right' })
       .fontSize(9)
       .fillColor('#64748b')
       .text(`Invoice No: INV-${order.orderNumber}`, 400, 75, { align: 'right' })
       .text(`Order Date: ${new Date(order.createdAt).toLocaleDateString()}`, 400, 90, { align: 'right' })
       .text(`Payment Status: ${order.paymentStatus.toUpperCase()}`, 400, 105, { align: 'right' });

    doc.moveTo(50, 130).lineTo(550, 130).strokeColor('#e2e8f0').stroke();

    // Customer & Shipping
    doc.fillColor('#0f172a').fontSize(11).text('Billed & Shipped To:', 50, 145);
    doc.fontSize(9).fillColor('#475569');
    if (order.shippingAddress) {
      doc.text(order.shippingAddress.fullName || 'Customer', 50, 165);
      doc.text(order.shippingAddress.addressLine1 || '', 50, 180);
      doc.text(`${order.shippingAddress.city || ''}, ${order.shippingAddress.state || ''} - ${order.shippingAddress.postalCode || ''}`, 50, 195);
      doc.text(`Phone: ${order.shippingAddress.phone || 'N/A'}`, 50, 210);
    }

    doc.moveTo(50, 235).lineTo(550, 235).strokeColor('#e2e8f0').stroke();

    // Table Header
    let y = 250;
    doc.fillColor('#1e293b').fontSize(10)
       .text('Item Description', 50, y, { bold: true })
       .text('Vendor', 260, y, { bold: true })
       .text('Qty', 380, y, { bold: true })
       .text('Price (INR)', 430, y, { bold: true })
       .text('Total (INR)', 490, y, { bold: true, align: 'right' });

    doc.moveTo(50, y + 15).lineTo(550, y + 15).strokeColor('#cbd5e1').stroke();

    // Items
    y += 25;
    order.items.forEach(item => {
      const vendorName = item.vendor?.storeName || (typeof item.vendor === 'string' ? 'Vendor' : 'Vendor');
      const unitPrice = (item.price / 100).toFixed(2);
      const subtotal = (item.subtotal / 100).toFixed(2);

      doc.fillColor('#334155').fontSize(9)
         .text(item.title.substring(0, 32), 50, y)
         .text(vendorName.substring(0, 20), 260, y)
         .text(item.quantity.toString(), 385, y)
         .text(`₹${unitPrice}`, 430, y)
         .text(`₹${subtotal}`, 490, y, { align: 'right' });
      y += 20;
    });

    doc.moveTo(50, y + 10).lineTo(550, y + 10).strokeColor('#e2e8f0').stroke();
    y += 25;

    // Financial Breakdown
    const subtotalFormatted = (order.subtotal / 100).toFixed(2);
    const discountFormatted = (order.discount / 100).toFixed(2);
    const taxFormatted = (order.tax / 100).toFixed(2);
    const deliveryFormatted = (order.deliveryFee / 100).toFixed(2);
    const totalFormatted = (order.totalAmount / 100).toFixed(2);

    doc.fillColor('#475569').fontSize(9)
       .text('Subtotal:', 380, y)
       .text(`₹${subtotalFormatted}`, 490, y, { align: 'right' });
    y += 18;

    if (order.discount > 0) {
      doc.text('Discount:', 380, y)
         .text(`-₹${discountFormatted}`, 490, y, { align: 'right' });
      y += 18;
    }

    doc.text('Applicable Taxes (GST 18%):', 380, y)
       .text(`₹${taxFormatted}`, 490, y, { align: 'right' });
    y += 18;

    doc.text('Shipping & Delivery:', 380, y)
       .text(order.deliveryFee === 0 ? 'FREE' : `₹${deliveryFormatted}`, 490, y, { align: 'right' });
    y += 22;

    doc.rect(370, y - 5, 180, 25).fill('#eff6ff');
    doc.fillColor('#1e40af').fontSize(11)
       .text('Grand Total:', 380, y + 2, { bold: true })
       .text(`₹${totalFormatted}`, 490, y + 2, { bold: true, align: 'right' });

    // Footer
    doc.fillColor('#94a3b8').fontSize(8)
       .text('Thank you for shopping on VENDORA Marketplace. For customer support, visit https://vendora.nexvia.in/support', 50, 720, { align: 'center' });

    doc.end();
  }
}

module.exports = new InvoiceService();
