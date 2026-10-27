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

// Ensure data directory exists for server-side persistence
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}
const DATA_FILE = path.join(dataDir, 'catalogue.json');

// Helper functions for reading & writing server data
function loadCatalogueData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Error reading catalogue data from server:', err);
  }
  return null;
}

function saveCatalogueData(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error writing catalogue data to server:', err);
    return false;
  }
}

// 1. Enable CORS & parse JSON (up to 15mb for batch product sync)
app.use(cors());
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// 2. Serve static assets and images
app.use('/assets', express.static(path.join(__dirname, 'assets')));
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

// 6. POST Upload Endpoint - saves images to server disk under ./images/
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

    // Return root-relative imageUrl for cross-device compatibility (PC, mobile, Render, localhost)
    res.status(200).json({
      message: 'File uploaded successfully!',
      filename: req.file.filename,
      file: {
        filename: req.file.filename,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size
      },
      imageUrl: `/images/${req.file.filename}`,
      fullUrl: `${protocol}://${host}/images/${req.file.filename}`
    });
  });
});

// 7. Server Data Persistence Endpoints (Sync across all devices: PC, Phone, etc.)
app.get('/api/data', (req, res) => {
  const data = loadCatalogueData();
  if (!data) {
    return res.status(404).json({ error: 'No catalogue data found on server' });
  }
  res.json(data);
});

app.post('/api/data', (req, res) => {
  const payload = req.body;
  if (!payload || !Array.isArray(payload.products)) {
    return res.status(400).json({ error: 'Invalid catalogue payload. Expected { products: [...] }' });
  }

  const existing = loadCatalogueData() || {};
  const updated = {
    categories: Array.isArray(payload.categories) ? payload.categories : existing.categories || [],
    products: payload.products,
    partners: Array.isArray(payload.partners) ? payload.partners : existing.partners || [],
    heroSlides: Array.isArray(payload.heroSlides) ? payload.heroSlides : existing.heroSlides || [],
    sales: Array.isArray(payload.sales) ? payload.sales : existing.sales || []
  };

  if (saveCatalogueData(updated)) {
    console.log(`Saved ${updated.products.length} products to ${DATA_FILE}`);
    res.json({ message: 'Catalogue updated successfully', productCount: updated.products.length });
  } else {
    res.status(500).json({ error: 'Failed to write catalogue data to server disk' });
  }
});

app.get('/api/products', (req, res) => {
  const data = loadCatalogueData();
  res.json({ products: data ? data.products : [] });
});

// 8. Health check endpoint (for Render uptime monitoring)
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', uptime: process.uptime() });
});

// 9. Serve Frontend Web Page (Fixes Render hosting issue)
app.use(express.static(__dirname));

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

app.get('/Sample_hdpeduct.html', (req, res) => {
  const indexPath = path.join(__dirname, 'index.html');
  if (fs.existsSync(indexPath)) {
    return res.sendFile(indexPath);
  }
  res.sendFile(path.join(__dirname, 'Sample_hdpeduct.html'));
});

// 10. Start Server on 0.0.0.0
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
