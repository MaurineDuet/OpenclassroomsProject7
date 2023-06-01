const express = require('express')
const auth = require('../middleware/auth')

const router = express.Router()

const libraryCtrl = require('../controllers/library')

router.post('/', auth, libraryCtrl.createBook)

router.get('/', libraryCtrl.getAllBooks);

router.get('/:id', libraryCtrl.getOneBook);

router.put('/:id', auth, libraryCtrl.modifyBook);

router.delete('/:id', auth, libraryCtrl.deleteBook)

module.exports = router