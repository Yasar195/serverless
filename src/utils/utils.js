const fs = require('fs');
const PDFDocument = require('pdfkit');

function generateRandomString(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      result += characters.charAt(randomIndex);
    }
  
    return result;
}

function getDateTime(){
  const currentDate = new Date()
  const data = {
    date: currentDate.toLocaleDateString(),
    time: currentDate.toLocaleTimeString()
  }
  return data
}

const createPDF = (data, res) => {
  const pdfFileName = 'output.pdf';
  const doc = new PDFDocument();
  const stream = fs.createWriteStream(pdfFileName);

  doc.pipe(res);

  // Add content to the PDF
  doc.fontSize(10).text('Lead and Telecaller Report', { align: 'center' });

  doc.text(`Date generated: ${new Date().toLocaleDateString()}`)
  doc.text(`Total fresh leads: ${data.leads_created}`);
  doc.text(`Total bookings: ${data.bookings_created}`);


  // Loop through telecallers
  data.telecallers.forEach((telecaller, index) => {
      doc.moveDown();
      doc.text(`Name: ${telecaller.name}`);
      doc.text(`Assigned: ${telecaller.assigned}`);
      doc.text(`Calls: ${telecaller.calls}`);
      doc.text(`Bookings: ${telecaller.bookings}`);
  });

  // Finalize the PDF
  doc.end();
}

module.exports = {
  getDateTime,
  generateRandomString,
  createPDF
}