const express = require('express');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const fs = require('fs');

const app = express();
const port = 3001; // Changed port number

app.use(cors());

app.get('/', (req, res) => {
  res.send('Server is running');
});

// Set up storage engine
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../public/image_reported'));
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage });

app.post('/upload', upload.single('file'), (req, res) => {
  const filename = req.file.filename;
  const parts = filename.split('-');

  // Print each part
  parts.forEach((part, index) => {
    console.log(`Part ${index + 1}: ${part}`);
  });

  res.json({
    message: 'File uploaded successfully',
    file: req.file,
    parts
  });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});