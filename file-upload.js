const express = require('express');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const fs = require('fs');

const app = express();

// Use the port Render assigns via process.env.PORT, or default to 3000 locally
const PORT = process.env.PORT || 3000;

// Ensure upload directory exists (using lowercase 'images')
const uploadDir = path.join(__dirname, 'images');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 1. Enable CORS & parse JSON
app.use(cors());
app.use(express.json());

// 2. Serve static assets and images
// Serve assets folder (logos, graphics)
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// Serve images folder (uploads and product images)
app.use('/images', express.static(uploadDir));

// Fallback for uppercase 'Images' path for case-insensitive compatibility on Linux/Render
const uppercaseImagesDir = path.join(__dirname, 'Images');
if (fs.existsSync(uppercaseImagesDir)) {
  app.use('/Images', express.static(uppercaseImagesDir));
  app.use('/images', express.static(uppercaseImagesDir));
}

// 3. Define Multer Storage Engine
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// 4. File Filter (images only)
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp|gif/;
  const extName = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimeType = allowedTypes.test(file.mimetype);

  if (extName && mimeType) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files (jpeg, jpg, png, webp, gif) are allowed!'));
  }
};

// 5. Initialize Multer (5 MB max)
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: fileFilter
});

// 6. POST Upload Endpoint
app.post('/upload', (req, res) => {
  upload.single('image')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ error: err.message });
    } else if (err) {
      return res.status(400).json({ error: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const protocol = req.protocol;
    const host = req.get('host');

    // Return filename, file object, and full imageUrl to support all client formats
    res.status(200).json({
      message: 'File uploaded successfully!',
      filename: req.file.filename,
      file: {
        filename: req.file.filename,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size
      },
      imageUrl: `${protocol}://${host}/images/${req.file.filename}`
    });
  });
});

// 7. Health check endpoint (useful for Render health checks and uptime monitoring)
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', uptime: process.uptime() });
});

// 8. Serve Frontend Web Page (Fixes Render hosting issue)
// Serve static files from root directory
app.use(express.static(__dirname));

// Root route: Serve the primary website index.html
app.get('/', (req, res) => {
  const indexPath = path.join(__dirname, 'index.html');
  const samplePath = path.join(__dirname, 'Sample_hdpeduct.html');
  if (fs.existsSync(indexPath)) {
    return res.sendFile(indexPath);
  } else if (fs.existsSync(samplePath)) {
    return res.sendFile(samplePath);
  }
  res.send('Hdpeduct server running. Place index.html in the project root.');
});

// Alias for Sample_hdpeduct.html
app.get('/Sample_hdpeduct.html', (req, res) => {
  const indexPath = path.join(__dirname, 'index.html');
  if (fs.existsSync(indexPath)) {
    return res.sendFile(indexPath);
  }
  res.sendFile(path.join(__dirname, 'Sample_hdpeduct.html'));
});

// 9. Start Server
// Listening on 0.0.0.0 is essential for container and cloud environments like Render
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
