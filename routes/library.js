const express = require('express')
const auth = require('../middleware/auth')
const multerMiddleware = require('../middleware/multer-config')

const router = express.Router()

const libraryCtrl = require('../controllers/library')

router.post('/', auth, multerMiddleware, libraryCtrl.createBook)

router.get('/', libraryCtrl.getAllBooks);

router.get('/:id', libraryCtrl.getOneBook);

router.put('/:id', auth, multerMiddleware, libraryCtrl.modifyBook);

router.delete('/:id', auth, libraryCtrl.deleteBook)

router.post('/:id/rating', auth, libraryCtrl.rateBook)

module.exports = router