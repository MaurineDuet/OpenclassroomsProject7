const express = require('express')
const auth = require('../middleware/auth')
const multer = require('../middleware/multer-config')

const router = express.Router()

const libraryCtrl = require('../controllers/library')

router.post('/', auth, multer, libraryCtrl.createBook)

router.get('/', libraryCtrl.getAllBooks);

router.get('/:id', libraryCtrl.getOneBook);

router.put('/:id', auth, multer, libraryCtrl.modifyBook);

router.delete('/:id', auth, libraryCtrl.deleteBook)

router.post('/:id/rating', auth, libraryCtrl.rateBook)

module.exports = router