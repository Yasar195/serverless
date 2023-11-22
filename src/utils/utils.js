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

const createPDF = (fetdata, res) => {
  const pdfFileName = 'output.pdf';
  const doc = new PDFDocument();
  const stream = fs.createWriteStream(pdfFileName);

  doc.pipe(res);

  function getUniqueValues(arr, prop) {
    return arr.filter((obj, index, self) =>
      index === self.findIndex((o) => o[prop] === obj[prop])
    );
  }

  const unique = getUniqueValues(fetdata, 'user_id')
  const userId = []
  unique.forEach((obj)=> userId.push({'telecaller_name': obj.user_name, 'id': obj.user_id}))

  function createTable(data, options = {}) {
    const cellPadding = options.cellPadding || 10;

    data.forEach((row, rowIndex) => {
        row.forEach((cell, colIndex) => {
            const x = colIndex * 92 + cellPadding;
            const y = rowIndex * 30 + cellPadding;

            doc.text(cell.toString(), x, y);
            if (doc.y > doc.page.height - 100) {
              // If close to the bottom, start a new page
              console.log('new')
              doc.addPage();
            }
        });
    });
  }

  console.log(userId)

  userId.forEach((tele, index)=> {
    const data = [
      ['telecaller', 'CID', 'Customer name', 'Progress', "follow up", "phone"]
    ];
    fetdata.forEach((info)=> {
      const temp = [info.user_name, info.cid, info.customer_name, info.customer_progress, info.assigned, info.customer_phone]
      // console.log(info.user_id, tele)
      if(info.user_id===tele.id){
        data.push(temp)
      }
    })
    // console.log(data)
    createTable(data)
    doc.addPage();
    if(unique.length-1===index){
      doc.end();
    }
  })
}

module.exports = {
  getDateTime,
  generateRandomString,
  createPDF
}