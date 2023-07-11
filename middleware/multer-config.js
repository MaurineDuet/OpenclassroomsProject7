const multer = require('multer');
const sharp = require('sharp');
const fs = require('fs');

//Format des images acceptées sur le site en upload par un utilisateur
const MIME_TYPES = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png',
};

//Stockage d'une image dans le dossier images
const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, 'images');
  },
  filename: (req, file, callback) => {
    const name = file.originalname.split(' ').join('_');
    const extension = MIME_TYPES[file.mimetype];
    callback(null, name + Date.now() + '.' + extension);
  },
});

const upload = multer({ storage }).single('image');

//Compression de l'image pour alléger son poids
const compressImage = async (file) => {
  try {
    const tempFilePath = `images/temp_${file.filename}`; // Temporary file path
    const compressedFilePath = `images/${file.filename}`; // Final compressed file path

    // Compression de l'image dans un fichier temporaire
    await sharp(file.path).webp({ quality: 20 }).toFile(tempFilePath);

    // Remplace le fichier original par le fichier compressé
    fs.rename(tempFilePath, compressedFilePath, (error) => {
      if (error) {
        throw new Error('Image renaming failed: ' + error.message);
      }
    });

    return {
      filePath: compressedFilePath,
      originalname: file.originalname,
    };
  } catch (error) {
    throw new Error('Image compression failed: ' + error.message);
  }
};

//Upload d'une image en ligne via multer
const multerMiddleware = (req, res, next) => {
  upload(req, res, async (error) => {
    if (error) {
      return res.status(400).json({ error: error.message });
    }

    if (req.file) {
      try {
        req.file = await compressImage(req.file);
      } catch (error) {
        return res.status(500).json({ error: error.message });
      }
    }

    next();
  });
};

module.exports = multerMiddleware;





/* const multer = require('multer');
const sharp = require('sharp');
const fs = require('fs');

const MIME_TYPES = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png'
};

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, 'images');
  },
  filename: (req, file, callback) => {
    const name = file.originalname.split(' ').join('_');
    const extension = MIME_TYPES[file.mimetype];
    callback(null, name + Date.now() + '.' + extension);
  }
});

const upload = multer({ storage }).single('image');

const compressImage = async (file) => {
  try {
    const tempFilePath = `images/temp_${file.filename}`; // Temporary file path
    const compressedFilePath = `images/${file.filename}`; // Final compressed file path

    // Compress the image to the temporary file
    await sharp(file.path)
      .webp({ quality: 20 })
      .toFile(tempFilePath);

    // Replace the original file with the compressed one
    fs.renameSync(tempFilePath, compressedFilePath);

    return {
      filePath: compressedFilePath,
      originalname: file.originalname
    };
  } catch (error) {
    throw new Error('Image compression failed: ' + error.message);
  }
};

const multerMiddleware = (req, res, next) => {
  upload(req, res, async (error) => {
    if (error) {
      return res.status(400).json({ error: error.message });
    }
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }
    try {
      req.file = await compressImage(req.file);
      next();
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  });
};

module.exports = multerMiddleware;



 */