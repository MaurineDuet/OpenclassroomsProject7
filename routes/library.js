const express = require('express')
const router = express.Router()

const libraryCtrl = require('../controllers/library')

router.post('/', libraryCtrl.createBook)

router.get('/', libraryCtrl.getAllBooks);

router.get('/:id', libraryCtrl.getOneBook);

router.put('/:id', libraryCtrl.modifyBook);

router.delete('/:id', libraryCtrl.deleteBook)

module.exports = router