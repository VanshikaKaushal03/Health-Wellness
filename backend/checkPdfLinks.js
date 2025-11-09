// backend/checkFile.js
const path = require('path');
const fs = require('fs');

const filePath = path.join(__dirname, 'uploads/reports/prescription_690e5a30b0d66876c4920e61.pdf');
console.log('File exists?', fs.existsSync(filePath)); // should log true
